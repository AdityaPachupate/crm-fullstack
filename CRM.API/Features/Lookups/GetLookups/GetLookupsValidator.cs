using CRM.API.Common.Constants;
using FluentValidation;
using System.Linq;

namespace CRM.API.Features.Lookups.GetLookups
{
    public class GetLookupsValidator : AbstractValidator<GetLookupsQuery>
    {
        public GetLookupsValidator()
        {
            RuleFor(x => x.Category)
                .Must(c => string.IsNullOrEmpty(c) || LookupCategories.All.Contains(c))
                .WithMessage($"Category must be one of the following: {string.Join(", ", LookupCategories.All)}");
        }
    }
}
