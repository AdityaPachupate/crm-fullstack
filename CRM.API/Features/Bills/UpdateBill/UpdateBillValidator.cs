using FluentValidation;

namespace CRM.API.Features.Bills.UpdateBill
{
    public class UpdateBillValidator : AbstractValidator<UpdateBillCommand>
    {
        public UpdateBillValidator()
        {
            RuleFor(x => x.Id).NotEmpty().WithMessage("Bill ID is required.");

            RuleFor(x => x.Request.InitialAmount)
                .GreaterThanOrEqualTo(0).WithMessage("Initial amount cannot be negative.")
                .When(x => x.Request.InitialAmount.HasValue);

            RuleFor(x => x.Request.AmountPaid)
                .GreaterThanOrEqualTo(0).WithMessage("Amount paid cannot be negative.")
                .When(x => x.Request.AmountPaid.HasValue);

            RuleForEach(x => x.Request.Items).ChildRules(item =>
            {
                item.RuleFor(i => i.MedicineId).NotEmpty().WithMessage("Medicine ID is required.");
                item.RuleFor(i => i.Quantity).GreaterThan(0).WithMessage("Quantity must be greater than 0.");
            });
        }
    }
}
