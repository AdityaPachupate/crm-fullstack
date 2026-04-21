using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Bills.AddPaymentToBill;

public class AddPaymentToBillEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/bills/{id}/payments", async (Guid id, AddPaymentToBillRequest request, ISender sender) =>
        {
            var command = new AddPaymentToBillCommand(id, request);
            var result = await sender.Send(command);
            
            return result.Success 
                ? Results.Ok(result) 
                : Results.BadRequest(result);
        })
        .WithName("AddPaymentToBill")
        .WithTags("Bills")
        .Produces<AddPaymentToBillResponse>(StatusCodes.Status200OK)
        .Produces<AddPaymentToBillResponse>(StatusCodes.Status400BadRequest);
    }
}
