using MediatR;
using System;

namespace CRM.API.Features.Bills.DeletePaymentFromBill;

public record DeletePaymentFromBillCommand(Guid BillId, Guid PaymentId, bool IsHardDelete = false) : IRequest<DeletePaymentFromBillResponse>;

public record DeletePaymentFromBillResponse(bool Success, string Message = "");
