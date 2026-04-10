using FluentValidation;

namespace CRM.API.Features.Medicines.UpdateMedicine
{
    public class UpdateMedicineValidator : AbstractValidator<UpdateMedicineCommand>
    {
        public UpdateMedicineValidator()
        {
            RuleFor(x => x.Request.Id).NotEmpty().WithMessage("Medicine ID is required.");

            RuleFor(x => x.Request.Name)
                .MaximumLength(100).WithMessage("Name cannot exceed 100 characters.")
                .When(x => !string.IsNullOrEmpty(x.Request.Name));

            RuleFor(x => x.Request.Price)
                .GreaterThan(0).WithMessage("Price must be greater than 0.")
                .When(x => x.Request.Price.HasValue);
        }
    }
}
