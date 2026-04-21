using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace CRM.API.Features.Bills.DeletePaymentFromBill;

public class DeletePaymentFromBillEndpoint : IEndpoint
{
    public void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/bills/{id}/payments/{paymentId}", async (Guid id, Guid paymentId, bool? hard, ISender sender) =>
        {
            var command = new DeletePaymentFromBillCommand(id, paymentId, hard ?? false);
            var result = await sender.Send(command);
            
            return result.Success 
                ? Results.Ok(result) 
                : Results.BadRequest(result);
        })
        .WithName("DeletePaymentFromBill")
        .WithTags("Bills")
        .Produces<DeletePaymentFromBillResponse>(StatusCodes.Status200OK)
        .Produces<DeletePaymentFromBillResponse>(StatusCodes.Status400BadRequest);
    }
}
