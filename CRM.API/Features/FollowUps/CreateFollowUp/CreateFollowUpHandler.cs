using CRM.API.Common.Constants;
using CRM.API.Common.Enums;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CRM.API.Features.FollowUps.CreateFollowUp;

public class CreateFollowUpHandler(AppDbContext db, ILogger<CreateFollowUpHandler> logger) 
    : IRequestHandler<CreateFollowUpCommand, CreateFollowUpResponse>
{
    public async Task<CreateFollowUpResponse> Handle(CreateFollowUpCommand command, CancellationToken cancellationToken)
    {
        // 1. Verify lead exists and get it
        var lead = await db.Leads
            .FirstOrDefaultAsync(l => l.Id == command.Request.LeadId, cancellationToken);
            
        if (lead == null)
        {
            logger.LogWarning("{Message}: Creating FollowUp failed - Lead {LeadId} not found", LoggingMessages.NotFound, command.Request.LeadId);
            throw new BusinessException(LoggingMessages.NotFound, $"Lead with ID {command.Request.LeadId} not found", HttpStatusCode.NotFound);
        }

        // 2. Prevent duplicate pending follow-ups for the same day
        var duplicateExists = await db.FollowUps
            .AnyAsync(f => f.LeadId == command.Request.LeadId 
                           && f.Status == FollowUpStatus.Pending 
                           && f.FollowUpDate == command.Request.FollowUpDate, cancellationToken);

        if (duplicateExists)
        {
            logger.LogWarning("{Message}: Creating FollowUp failed - Pending follow-up already exists for Lead {LeadId} on {Date}", LoggingMessages.Conflict, command.Request.LeadId, command.Request.FollowUpDate);
            throw new BusinessException(LoggingMessages.Conflict, "Creating FollowUp", HttpStatusCode.Conflict);
        }

        // 3. Map request to domain entity
        var followUp = command.Request.Adapt<FollowUp>();
        followUp.Id = Guid.NewGuid();
        followUp.Status = FollowUpStatus.Pending;
        followUp.CreatedAt = DateTime.UtcNow;

        // 4. Bubble Up: Update Lead's UpdatedAt
        lead.UpdatedAt = DateTime.UtcNow;

        // 5. Save to database
        await db.FollowUps.AddAsync(followUp, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Follow-up created for Lead {LeadId} and Lead UpdatedAt refreshed.", followUp.LeadId);

        // 6. Return response
        return followUp.Adapt<CreateFollowUpResponse>();
    }
}
