using CRM.API.Infrastructure.Persistence;
using FluentValidation;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Packages.CreatePackage
{
    public class CreatePackageValidator : AbstractValidator<CreatePackageCommand>
    {
        public CreatePackageValidator(AppDbContext db)
        {
            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Name is required")
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters");

            RuleFor(x => x.Request.DurationInDays)
                .NotEmpty().WithMessage("DurationInDays is required")
                .GreaterThan(0).WithMessage("Duration must be at least 1 day");

            RuleFor(x => x.Request.Cost)
                .NotEmpty().WithMessage("Cost is required")
                .GreaterThanOrEqualTo(0).WithMessage("Cost cannot be negative");
        }
    }
}