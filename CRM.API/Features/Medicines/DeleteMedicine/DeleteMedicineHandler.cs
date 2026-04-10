using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.API.Features.Medicines.DeleteMedicine
{
    public class DeleteMedicineHandler(
        AppDbContext db,
        ILogger<DeleteMedicineHandler> logger
    ) : IRequestHandler<DeleteMedicineCommand, DeleteMedicineResponse>
    {
        public async Task<DeleteMedicineResponse> Handle(DeleteMedicineCommand command, CancellationToken ct)
        {
            var medicine = await db.Medicines
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(m => m.Id == command.Id, ct);

            if (medicine == null)
            {
                logger.LogWarning("{Message}: Deleting Medicine with ID {MedicineId} not found", LoggingMessages.NotFound, command.Id);
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Medicine with ID {command.Id} not found.",
                    System.Net.HttpStatusCode.NotFound
                );
            }

            if (command.IsPermanent)
            {
                logger.LogWarning("Permanently deleting Medicine {MedicineId}", command.Id);
                db.Medicines.Remove(medicine);
            }
            else
            {
                logger.LogInformation("Soft-deleting Medicine {MedicineId}", command.Id);
                medicine.IsDeleted = true;
                medicine.DeletedAt = DateTime.UtcNow;
            }

            await db.SaveChangesAsync(ct);
            return new DeleteMedicineResponse(true);
        }
    }
}
