using MediatR;
using Microsoft.AspNetCore.Http;

namespace CRM.API.Features.Leads.BulkImportLeads
{
    public record BulkImportLeadsCommand(IFormFile File) : IRequest<BulkImportLeadsResponse>;

    public record BulkImportLeadsResponse(int TotalProcessed, int SuccessCount, int DuplicateCount, List<string> Errors);
}
