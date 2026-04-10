using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net;

namespace CRM.API.Features.Medicines.UpdateMedicine
{
    public class UpdateMedicineHandler(AppDbContext db, ILogger<UpdateMedicineHandler> logger) : IRequestHandler<UpdateMedicineCommand, UpdateMedicineResponse>
    {
        public async Task<UpdateMedicineResponse> Handle(UpdateMedicineCommand command, CancellationToken ct)
        {
            var medicine = await db.Medicines
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(m => m.Id == command.Request.Id, ct);

            if (medicine == null)
            {
                logger.LogWarning("{Message}: Updating Medicine with ID {MedicineId} not found", LoggingMessages.NotFound, command.Request.Id);
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Fetching medicine with ID {command.Request.Id}",
                    HttpStatusCode.NotFound
                );
            }

            if (!string.IsNullOrWhiteSpace(command.Request.Name))
            {
                medicine.Name = command.Request.Name;
            }

            if (command.Request.Price.HasValue)
            {
                medicine.Price = command.Request.Price.Value;
            }

            if (command.Request.IsActive.HasValue)
            {
                medicine.IsActive = command.Request.IsActive.Value;
            }

            await db.SaveChangesAsync(ct);
            logger.LogInformation("{Message}: Medicine {MedicineId} updated", LoggingMessages.ResourceUpdated, medicine.Id);
            return medicine.Adapt<UpdateMedicineResponse>();
        }
    }
}
