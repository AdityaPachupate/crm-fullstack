using MediatR;

namespace CRM.API.Features.Bills.UpdateBill;

public record UpdateBillCommand(Guid Id, UpdateBillRequest Request) : IRequest<UpdateBillResponse>;
