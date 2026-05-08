using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.API.Features.Medicines.RestoreMedicine
{
    public class RestoreMedicineHandler(
        AppDbContext db,
        ILogger<RestoreMedicineHandler> logger
    ) : IRequestHandler<RestoreMedicineCommand, bool>
    {
        public async Task<bool> Handle(RestoreMedicineCommand command, CancellationToken ct)
        {
            var medicine = await db.Medicines
                .IgnoreQueryFilters()
                .FirstOrDefaultAsync(m => m.Id == command.Id, ct);

            if (medicine == null)
            {
                logger.LogWarning("Restore Medicine failed: ID {MedicineId} not found", command.Id);
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Medicine with ID {command.Id} not found.",
                    System.Net.HttpStatusCode.NotFound
                );
            }

            if (!medicine.IsDeleted)
            {
                return true;
            }

            medicine.IsDeleted = false;
            medicine.DeletedAt = null;

            await db.SaveChangesAsync(ct);
            logger.LogInformation("Medicine {MedicineId} restored successfully", command.Id);
            
            return true;
        }
    }
}
