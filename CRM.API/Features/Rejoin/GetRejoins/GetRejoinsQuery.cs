using CRM.API.Common.Models;
using MediatR;

namespace CRM.API.Features.Rejoin.GetRejoins;

public record GetRejoinsQuery(
    int PageNumber = 1,
    int PageSize = 10,
    bool IsTrash = false
) : IRequest<PagedResult<GetRejoinsResponse>>;
