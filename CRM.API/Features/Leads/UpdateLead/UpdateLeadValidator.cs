using CRM.API.Common.Constants;
using CRM.API.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Leads.UpdateLead
{
    public class UpdateLeadValidator : AbstractValidator<UpdateLeadCommand>
    {
        public UpdateLeadValidator(AppDbContext db)
        {
            RuleFor(x => x.UpdateLeadRequest.Id).NotEmpty();

            RuleFor(x => x.UpdateLeadRequest.Name)
                .MaximumLength(100)
                .When(x => !string.IsNullOrEmpty(x.UpdateLeadRequest.Name));

            RuleFor(x => x.UpdateLeadRequest.Phone)
                .Matches(@"^\+?[0-9]{7,15}$")
                .When(x => !string.IsNullOrEmpty(x.UpdateLeadRequest.Phone));

            RuleFor(x => x.UpdateLeadRequest.Status)
                .IsInEnum()
                .When(x => x.UpdateLeadRequest.Status.HasValue);

            // Validate Source exists as an active lookup value if provided
            RuleFor(x => x.UpdateLeadRequest.Source)
                .MustAsync(async (source, ct) =>
                    await db.LookupValues.AnyAsync(l =>
                        l.Category == LookupCategories.LeadSource &&
                        l.Code == source && !l.IsDeleted, ct))
                .WithMessage(x => $"'{x.UpdateLeadRequest.Source}' is not a valid lead source.")
                .When(x => !string.IsNullOrEmpty(x.UpdateLeadRequest.Source));

            // Validate Reason exists as an active lookup value if provided
            RuleFor(x => x.UpdateLeadRequest.Reason)
                .MustAsync(async (reason, ct) =>
                    await db.LookupValues.AnyAsync(l =>
                        l.Category == LookupCategories.LeadReason &&
                        l.Code == reason && !l.IsDeleted, ct))
                .WithMessage(x => $"'{x.UpdateLeadRequest.Reason}' is not a valid lead reason.")
                .When(x => !string.IsNullOrEmpty(x.UpdateLeadRequest.Reason));
        }
    }
}
