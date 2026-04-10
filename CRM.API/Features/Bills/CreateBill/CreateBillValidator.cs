using FluentValidation;

namespace CRM.API.Features.Bills.CreateBill
{
    public class CreateBillValidator : AbstractValidator<CreateBillCommand>
    {
        public CreateBillValidator()
        {
            RuleFor(x => x.Request).Must(HaveSomeValue)
                .WithMessage("A bill must contain either a Package Amount or at least one Medicine Item.");

            RuleFor(x => x.Request.LeadId).NotEmpty();
            RuleFor(x => x.Request.PackageAmount).GreaterThanOrEqualTo(0);
            RuleFor(x => x.Request.AmountPaid).GreaterThanOrEqualTo(0);

            RuleForEach(x => x.Request.MedicineItems).ChildRules(item =>
            {
                item.RuleFor(i => i.MedicineId).NotEmpty();
                item.RuleFor(i => i.Quantity).GreaterThan(0);
            });
        }

        private bool HaveSomeValue(CreateBillRequest request)
        {
            return request.PackageAmount > 0 || (request.MedicineItems != null && request.MedicineItems.Count > 0);
        }
    }
}
