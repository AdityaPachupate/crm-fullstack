using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Common.Helpers;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using System.Net;

namespace CRM.API.Features.Leads.CreateLead
{
    public class CreateLeadHandler(AppDbContext db, ILogger<CreateLeadHandler> logger) : IRequestHandler<CreateLeadCommand, CreateLeadResponse>
    {
        public async Task<CreateLeadResponse> Handle(CreateLeadCommand command, CancellationToken cancellationToken)
        {
            var alreadyExists = await db.Leads.AnyAsync(x => x.Phone == command.Request.Phone, cancellationToken);
            if (alreadyExists)
            {
                logger.LogInformation("{Message}: {Phone}", LoggingMessages.ResourceExists, command.Request.Phone);
                throw new BusinessException(LoggingMessages.ResourceExists, "Adding New Lead", HttpStatusCode.Conflict);
            }

            Lead lead = command.Request.Adapt<Lead>();
            await db.Leads.AddAsync(lead, cancellationToken);
            await db.SaveChangesAsync(cancellationToken);

            logger.LogInformation(
                "{Message}: {LeadId}, Phone: {Phone}",
                LoggingMessages.ResourceCreated,
                lead.Id,
                lead.Phone.MaskPhone()
            );

            return lead.Adapt<CreateLeadResponse>();
        }
    }
}