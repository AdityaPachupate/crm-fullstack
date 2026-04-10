using FluentValidation;
using CRM.API.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Packages.UpdatePackage
{
    public class UpdatePackageValidator : AbstractValidator<UpdatePackageCommand>
    {
        public UpdatePackageValidator(AppDbContext db)
        {
            RuleFor(x => x.Id)
                .NotEmpty().WithMessage("Package ID is required");

            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters");

            RuleFor(x => x.Request.DurationInDays)
                .GreaterThan(0).WithMessage("Duration must be at least 1 day");

            RuleFor(x => x.Request.Cost)
                .GreaterThanOrEqualTo(0).WithMessage("Cost cannot be negative");
        }
    }
}
