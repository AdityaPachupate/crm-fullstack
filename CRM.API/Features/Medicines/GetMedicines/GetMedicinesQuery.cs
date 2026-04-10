using CRM.API.Common.Models;
using MediatR;

namespace CRM.API.Features.Medicines.GetMedicines
{
    public record GetMedicinesQuery(
        int PageNumber = 1,
        int PageSize = 10,
        string? SearchTerm = null
    ) : IRequest<PagedResult<GetMedicinesResponse>>;
}
