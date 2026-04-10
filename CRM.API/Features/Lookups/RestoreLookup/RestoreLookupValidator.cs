using FluentValidation;

namespace CRM.API.Features.Lookups.RestoreLookup
{
    public class RestoreLookupValidator : AbstractValidator<RestoreLookupCommand>
    {
        public RestoreLookupValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Lookup ID is required for restoration.");
        }
    }
}
