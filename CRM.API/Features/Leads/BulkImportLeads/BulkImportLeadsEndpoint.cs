using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Leads.BulkImportLeads
{
    public class BulkImportLeadsEndpoint : IEndpoint
    {
        public void MapEndpoint(IEndpointRouteBuilder app)
        {
            app.MapPost("/leads/bulk-import", async (HttpRequest request, IMediator mediator) =>
            {
                if (!request.HasFormContentType)
                {
                    return Results.BadRequest("Invalid content type. Expected multipart/form-data.");
                }

                var form = await request.ReadFormAsync();
                var file = form.Files.GetFile("file");

                if (file == null || file.Length == 0)
                {
                    return Results.BadRequest("No file uploaded.");
                }

                var command = new BulkImportLeadsCommand(file);
                var result = await mediator.Send(command);

                return Results.Ok(result);
            })
            .WithName("BulkImportLeads")
            .WithTags("Leads")
            .DisableAntiforgery();
        }
    }
}
