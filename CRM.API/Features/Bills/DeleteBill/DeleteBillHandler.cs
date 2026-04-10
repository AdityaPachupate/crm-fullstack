using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Bills.DeleteBill
{
    public class DeleteBillHandler(
        AppDbContext db,
        ILogger<DeleteBillHandler> logger
    ) : IRequestHandler<DeleteBillCommand, DeleteBillResponse>
    {
        public async Task<DeleteBillResponse> Handle(DeleteBillCommand command, CancellationToken cancellationToken)
        {
            var bill = await db.Bills
                        .IgnoreQueryFilters()
                        .FirstOrDefaultAsync(b => b.Id == command.Request.Id, cancellationToken);

            if (bill == null)
            {
                logger.LogWarning("{Message}: Deleting Bill with ID {BillId} not found", LoggingMessages.NotFound, command.Request.Id);
                throw new BusinessException(
                  LoggingMessages.NotFound,
                  $"Deleting Bill with ID {command.Request.Id}",
                  System.Net.HttpStatusCode.NotFound
              );
            }

            if (command.IsPermanent)
            {
                db.Bills.Remove(bill);
                logger.LogInformation(
               "Bill with ID {BillId} deleted successfully",
               command.Request.Id);

            }
            else
            {
                bill.IsDeleted = true;
                bill.DeletedAt = DateTime.UtcNow;
                logger.LogInformation(
               "Bill with ID {BillId} moved to Trash",
               command.Request.Id);
            }

            await db.SaveChangesAsync(cancellationToken);
            return new DeleteBillResponse(true);
        }
    }
}