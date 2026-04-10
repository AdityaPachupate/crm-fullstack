using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CRM.API.Features.Leads.UpdateLead
{
    public class UpdateLeadHandler(AppDbContext db, ILogger<UpdateLeadHandler> logger) : IRequestHandler<UpdateLeadCommand, UpdateLeadResponse>
    {
        public async Task<UpdateLeadResponse> Handle(UpdateLeadCommand command, CancellationToken cancellationToken)
        {
            var request = command.UpdateLeadRequest;
            
            var lead = await db.Leads
                .FirstOrDefaultAsync(l => l.Id == request.Id, cancellationToken);
                
            if (lead == null)
            {
                throw new BusinessException(LoggingMessages.NotFound, $"Updating lead with ID {request.Id}", HttpStatusCode.NotFound);
            }

            // Check for phone conflict if phone is being changed
            if (!string.IsNullOrEmpty(request.Phone) && request.Phone != lead.Phone)
            {
                var phoneExists = await db.Leads
                    .AnyAsync(l => l.Phone == request.Phone && l.Id != request.Id, cancellationToken);
                    
                if (phoneExists)
                {
                    throw new BusinessException(LoggingMessages.ResourceExists, "Updating lead phone number", HttpStatusCode.Conflict);
                }
                lead.Phone = request.Phone;
            }

            // Update other fields if provided
            lead.Name = request.Name ?? lead.Name;
            lead.Status = request.Status ?? lead.Status;
            lead.Source = request.Source ?? lead.Source;
            lead.Reason = request.Reason ?? lead.Reason;
            
            lead.UpdatedAt = DateTime.UtcNow;

            await db.SaveChangesAsync(cancellationToken);

            logger.LogInformation("{Message}: {LeadId}", LoggingMessages.ResourceUpdated, lead.Id);

            return lead.Adapt<UpdateLeadResponse>();
        }
    }
}
