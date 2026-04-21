using MediatR;
using System;

namespace CRM.API.Features.Bills.AddPaymentToBill;

public record AddPaymentToBillRequest(decimal Amount);

public record AddPaymentToBillCommand(Guid Id, AddPaymentToBillRequest Request) : IRequest<AddPaymentToBillResponse>;

public record AddPaymentToBillResponse(bool Success, string Message = "");
