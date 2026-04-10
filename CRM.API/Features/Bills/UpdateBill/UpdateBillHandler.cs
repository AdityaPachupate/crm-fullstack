using CRM.API.Common.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;
using CRM.API.Common.Constants;

namespace CRM.API.Features.Bills.UpdateBill;

public class UpdateBillHandler(IBillRepository billRepository, ILogger<UpdateBillHandler> logger) : IRequestHandler<UpdateBillCommand, UpdateBillResponse>
{
    public async Task<UpdateBillResponse> Handle(UpdateBillCommand command, CancellationToken ct)
    {
        var request = command.Request;
        
        await billRepository.UpdateBillWithItemsAsync(
            command.Id,
            request.InitialAmount,
            request.AmountPaid,
            request.Items?.Select(i => (i.MedicineId, i.Quantity)),
            ct
        );

        logger.LogInformation("{Message}: Bill {BillId} updated", LoggingMessages.ResourceUpdated, command.Id);
        return new UpdateBillResponse(true);
    }
}
