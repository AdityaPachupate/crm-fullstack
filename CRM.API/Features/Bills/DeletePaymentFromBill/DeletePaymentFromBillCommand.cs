using MediatR;
using System;

namespace CRM.API.Features.Bills.DeletePaymentFromBill;

public record DeletePaymentFromBillCommand(Guid BillId, Guid PaymentId) : IRequest<DeletePaymentFromBillResponse>;

public record DeletePaymentFromBillResponse(bool Success, string Message = "");
