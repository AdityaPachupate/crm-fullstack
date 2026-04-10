using MediatR;

namespace CRM.API.Features.Bills.RestoreBill;

public record RestoreBillCommand(RestoreBillRequest Request) : IRequest<RestoreBillResponse>;
