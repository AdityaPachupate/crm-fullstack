namespace CRM.API.Features.Bills.GetAllBills;

public record GetAllBillsRequest(
    int PageNumber = 1,
    int PageSize = 10,
    bool IsTrash = false,
    Guid? LeadId = null
);