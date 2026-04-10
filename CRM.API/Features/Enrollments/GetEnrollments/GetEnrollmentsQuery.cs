using CRM.API.Common.Models;
using MediatR;

namespace CRM.API.Features.Enrollments.GetEnrollments
{
    public record GetEnrollmentsQuery(
        int PageNumber = 1,
        int PageSize = 10,
        bool IsTrash = false,
        DateOnly? StartDateFrom = null,
        DateOnly? StartDateTo = null,
        DateTime? CreatedAtFrom = null,
        DateTime? CreatedAtTo = null,
        bool? IsActive = null
    ) : IRequest<PagedResult<GetEnrollmentsResponse>>;
}
