using CRM.API.Common.Enums;
using CRM.API.Common.Models;
using CRM.API.Domain;
using MediatR;

namespace CRM.API.Features.Leads.GetLeads
{
    public record GetLeadsQuery(
        LeadStatus? Status, 
        string? Search,
        string? Source, 
        string? Reason,
        bool IsTrash = false, 
        int PageNumber = 1, 
        int PageSize = 10,
        bool? HasEnrollment = null,
        bool? HasMedicine = null
    ) : IRequest<PagedResult<GetLeadsResponse>>
    {
    }
}
