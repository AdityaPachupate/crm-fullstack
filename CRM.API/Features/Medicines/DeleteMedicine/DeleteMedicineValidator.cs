using FluentValidation;

namespace CRM.API.Features.Medicines.DeleteMedicine
{
    public class DeleteMedicineValidator : AbstractValidator<DeleteMedicineCommand>
    {
        public DeleteMedicineValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Medicine ID is required.");
        }
    }
}
