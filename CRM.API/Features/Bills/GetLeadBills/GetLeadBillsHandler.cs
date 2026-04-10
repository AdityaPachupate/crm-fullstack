using CRM.API.Common.Interfaces;
using MediatR;

namespace CRM.API.Features.Bills.GetLeadBills
{
    public class GetLeadBillsHandler(IBillRepository billRepository) 
        : IRequestHandler<GetLeadBillsQuery, List<GetLeadBillsResponse>>
    {
        public async Task<List<GetLeadBillsResponse>> Handle(GetLeadBillsQuery query, CancellationToken ct)
        {
            var bills = await billRepository.GetLeadBillsAsync(query.LeadId, ct);

            return bills.Select(b => new GetLeadBillsResponse(
                b.Id,
                b.InitialAmount,
                b.AmountPaid,
                b.PendingAmount,
                b.MedicineBillingAmount,
                b.CreatedAt,
                b.Items.Select(i => new BillItemResponse(
                    i.MedicineId, 
                    i.Medicine?.Name ?? "Unknown Product", 
                    i.Quantity, 
                    i.UnitPriceSnapshot
                )).ToList()
            )).ToList();
        }
    }
}
