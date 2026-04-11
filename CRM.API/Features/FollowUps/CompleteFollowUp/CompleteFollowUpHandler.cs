using CRM.API.Common.Constants;
using CRM.API.Common.Enums;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CRM.API.Features.FollowUps.CompleteFollowUp;

public class CompleteFollowUpHandler(AppDbContext db, ILogger<CompleteFollowUpHandler> logger)
    : IRequestHandler<CompleteFollowUpCommand, CompleteFollowUpResponse>
{
    public async Task<CompleteFollowUpResponse> Handle(CompleteFollowUpCommand command, CancellationToken cancellationToken)
    {
        var request = command.Request;

        // 1. Fetch FollowUp with Lead
        var followUp = await db.FollowUps
            .Include(f => f.Lead)
            .FirstOrDefaultAsync(f => f.Id == request.FollowUpId, cancellationToken);

        if (followUp == null)
        {
            logger.LogWarning("{Message}: Completing FollowUp failed - FollowUp {FollowUpId} not found", LoggingMessages.NotFound, request.FollowUpId);
            throw new BusinessException(LoggingMessages.NotFound, $"FollowUp with ID {request.FollowUpId} not found", HttpStatusCode.NotFound);
        }

        if (followUp.Status != FollowUpStatus.Pending)
        {
            logger.LogWarning("{Message}: Completing FollowUp failed - Only pending follow-ups can be completed", LoggingMessages.ValidationFailed);
            throw new BusinessException("Only pending follow-ups can be completed.", "Completing FollowUp", HttpStatusCode.BadRequest);
        }

        var lead = followUp.Lead;
        Guid? nextFollowUpId = null;

        // 2. Handle Outcome (Reschedule vs Complete)
        if (request.Outcome == FollowUpOutcome.Busy || request.Outcome == FollowUpOutcome.CallbackRequested)
        {
            // RESCHEDULE logic: Update existing record date and keep it pending
            followUp.FollowUpDate = request.NextFollowUpDate ?? DateOnly.FromDateTime(DateTime.UtcNow.AddDays(1));
            followUp.Priority = request.NextFollowUpPriority ?? followUp.Priority;
            followUp.Outcome = request.Outcome; // Record the last attempt reason
            
            var attemptLog = $"[Attempted {DateTime.UtcNow:g}: {request.Outcome}]";
            var combinedNotes = string.Empty;

            // Preserve old notes, add new notes if any, and add attempt log
            if (!string.IsNullOrEmpty(followUp.Notes)) combinedNotes = followUp.Notes + "\n";
            if (!string.IsNullOrEmpty(request.Notes)) combinedNotes += request.Notes + " ";
            combinedNotes += attemptLog;

            followUp.Notes = combinedNotes;

            logger.LogInformation("Follow-up {FollowUpId} rescheduled to {NextDate} due to {Outcome}", 
                followUp.Id, followUp.FollowUpDate, request.Outcome);
        }
        else
        {
            // COMPLETE logic: Close current and potentially create next
            followUp.Status = FollowUpStatus.Completed;
            followUp.Outcome = request.Outcome;
            
            // For completion, we also want to preserve history but mark it clearly
            var completionNotes = string.IsNullOrEmpty(request.Notes) ? "" : request.Notes;
            if (!string.IsNullOrEmpty(followUp.Notes)) 
                followUp.Notes = $"{followUp.Notes}\n--- Completed ---\n{completionNotes}";
            else
                followUp.Notes = completionNotes;

            followUp.CompletedAt = DateTime.UtcNow;

            // 4. Auto-Task Trigger (Precedence Rules)
            if (ShouldScheduleNextFollowUp(lead, request))
            {
                var nextFollowUp = CreateNextFollowUp(lead, request);
                await db.FollowUps.AddAsync(nextFollowUp, cancellationToken);
                nextFollowUpId = nextFollowUp.Id;
            }

            logger.LogInformation("Follow-up {FollowUpId} completed with outcome {Outcome}. Next task: {NextFollowUpId}", 
                followUp.Id, followUp.Outcome, nextFollowUpId);
        }

        // 3. Lead Qualification (Precedence Rules)
        UpdateLeadStatus(lead, request.Outcome, request.NewLeadStatus);
        lead.UpdatedAt = DateTime.UtcNow;

        // 5. Save Changes (Atomic)
        await db.SaveChangesAsync(cancellationToken);

        return new CompleteFollowUpResponse(followUp.Id, followUp.Status, followUp.Outcome, nextFollowUpId);
    }

    private void UpdateLeadStatus(Lead lead, FollowUpOutcome outcome, LeadStatus? requestedStatus)
    {
        // Rule 1: Outcome Overrides
        if (outcome == FollowUpOutcome.NotInterested || outcome == FollowUpOutcome.WrongNumber || outcome == FollowUpOutcome.Disconnected)
        {
            lead.Status = LeadStatus.Lost;
            return;
        }

        if (outcome == FollowUpOutcome.Converted)
        {
            lead.Status = LeadStatus.Converted;
            return;
        }

        // Rule 2: Manual Update
        if (requestedStatus.HasValue)
        {
            lead.Status = requestedStatus.Value;
        }
    }

    private bool ShouldScheduleNextFollowUp(Lead lead, CompleteFollowUpRequest request)
    {
        // Don't schedule if lead is already closed
        if (lead.Status == LeadStatus.Lost || lead.Status == LeadStatus.Converted)
        {
            return false;
        }

        // Manual override
        if (request.NextFollowUpDate.HasValue)
        {
            return true;
        }

        // Auto-trigger for busy/callback
        if (request.Outcome == FollowUpOutcome.CallbackRequested || request.Outcome == FollowUpOutcome.Busy)
        {
            return true;
        }

        return false;
    }

    private FollowUp CreateNextFollowUp(Lead lead, CompleteFollowUpRequest request)
    {
        var nextDate = request.NextFollowUpDate ?? DateOnly.FromDateTime(DateTime.Today.AddDays(1));
        var nextPriority = request.NextFollowUpPriority ?? FollowUpPriority.Medium;

        // If outcome is Busy/Disconnected, might want to boost priority or add specific notes
        var notes = request.NextFollowUpDate.HasValue 
            ? "Scheduled during previous follow-up." 
            : $"Auto-scheduled due to {request.Outcome} outcome.";

        return new FollowUp
        {
            Id = Guid.NewGuid(),
            LeadId = lead.Id,
            FollowUpDate = nextDate,
            Priority = nextPriority,
            Status = FollowUpStatus.Pending,
            Notes = notes,
            Source = "System-Automation",
            CreatedAt = DateTime.UtcNow
        };
    }
}
