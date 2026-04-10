using System;
using FluentValidation;

namespace CRM.API.Features.Lookups.DeleteLookup
{
    public class DeleteLookupValidator : AbstractValidator<DeleteLookupCommand>
    {
        public DeleteLookupValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Lookup ID is required.");
        }
    }
}
