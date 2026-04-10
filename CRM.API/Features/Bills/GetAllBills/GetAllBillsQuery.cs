using CRM.API.Common.Models;
using MediatR;

namespace CRM.API.Features.Bills.GetAllBills;

public record GetAllBillsQuery(GetAllBillsRequest Request) : IRequest<PagedResult<GetAllBillsResponse>>;