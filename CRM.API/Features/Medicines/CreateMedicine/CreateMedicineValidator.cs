using FluentValidation;

namespace CRM.API.Features.Medicines.CreateMedicine
{
    public class CreateMedicineValidator : AbstractValidator<CreateMedicineCommand>
    {
        public CreateMedicineValidator()
        {
            RuleFor(x => x.Request.Name)
                .NotEmpty().WithMessage("Medicine name is required.")
                .MaximumLength(100).WithMessage("Medicine name cannot exceed 100 characters.");

            RuleFor(x => x.Request.Price)
                .GreaterThan(0).WithMessage("Medicine price must be greater than 0.");
        }
    }
}
