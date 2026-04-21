using CRM.API.Common.Interfaces;
using CRM.API.Domain;
using MediatR;

namespace CRM.API.Features.Bills.GetLeadBills
{
    public class GetLeadBillsHandler(IBillRepository billRepository) 
        : IRequestHandler<GetLeadBillsQuery, List<GetLeadBillsResponse>>
    {
        public async Task<List<GetLeadBillsResponse>> Handle(GetLeadBillsQuery query, CancellationToken ct)
        {
            var bills = await billRepository.GetLeadBillsAsync(query.LeadId, ct);

            return bills.Select(b => {
                string packageName = "Medicine Bill";
                if (b.Enrollment?.Package != null)
                {
                    packageName = b.Enrollment.Package.Name;
                }
                else if (b.RejoinRecord?.Package != null)
                {
                    packageName = b.RejoinRecord.Package.Name;
                }

                var itemsList = (b.Items ?? new List<BillItem>()).Select(i => new BillItemResponse(
                    i.MedicineId, 
                    i.Medicine?.Name ?? "Unknown Product", 
                    i.Quantity, 
                    i.UnitPriceSnapshot
                )).ToList();

                var paymentsList = (b.Payments ?? new List<BillPayment>()).Select(p => new BillPaymentResponse(
                    p.Id,
                    p.Amount,
                    p.DatePaid,
                    p.IsDeleted
                )).OrderBy(p => p.DatePaid).ToList();

                return new GetLeadBillsResponse(
                    b.Id,
                    b.InitialAmount,
                    b.AmountPaid,
                    b.PendingAmount,
                    b.MedicineBillingAmount,
                    b.CreatedAt,
                    packageName,
                    itemsList,
                    paymentsList
                );
            }).ToList();
        }
    }
}
