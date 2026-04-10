using CRM.API.Common.Constants;
using CRM.API.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Leads.CreateLead
{
    public class CreateLeadValidator : AbstractValidator<CreateLeadCommand>
    {
        public CreateLeadValidator(AppDbContext db)
        {
            RuleFor(x => x.Request.Name).NotEmpty().MaximumLength(100);
            RuleFor(x => x.Request.Phone).NotEmpty().Matches(@"^\+?[0-9]{7,15}$");
            RuleFor(x => x.Request.Status).IsInEnum();

            // Validate Source exists as an active lookup value
            RuleFor(x => x.Request.Source)
                .NotEmpty()
                .MustAsync(async (source, ct) =>
                    await db.LookupValues.AnyAsync(l =>
                        l.Category == LookupCategories.LeadSource &&
                        l.Code == source && !l.IsDeleted, ct))
                .WithMessage(x => $"'{x.Request.Source}' is not a valid lead source.");

            // Validate Reason exists as an active lookup value
            RuleFor(x => x.Request.Reason)
                .NotEmpty()
                .MustAsync(async (reason, ct) =>
                    await db.LookupValues.AnyAsync(l =>
                        l.Category == LookupCategories.LeadReason &&
                        l.Code == reason && !l.IsDeleted, ct))
                .WithMessage(x => $"'{x.Request.Reason}' is not a valid lead reason.");
        }
    }
}
