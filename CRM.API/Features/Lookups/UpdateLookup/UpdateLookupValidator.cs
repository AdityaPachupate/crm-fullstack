using FluentValidation;

namespace CRM.API.Features.Lookups.UpdateLookup
{
    public class UpdateLookupValidator : AbstractValidator<UpdateLookupCommand>
    {
        public UpdateLookupValidator()
        {
            RuleFor(x => x.Request.Id)
                .NotEmpty().WithMessage("Lookup ID is required.");

            RuleFor(x => x.Request.DisplayName)
                .NotEmpty().WithMessage("DisplayName is required to update.")
                .MaximumLength(100).WithMessage("DisplayName cannot exceed 100 characters.");
        }
    }
}
