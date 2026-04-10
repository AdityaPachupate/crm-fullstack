using FluentValidation;

namespace CRM.API.Features.Medicines.GetMedicineById
{
    public class GetMedicineByIdValidator : AbstractValidator<GetMedicineByIdQuery>
    {
        public GetMedicineByIdValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Medicine ID is required.");
        }
    }
}
