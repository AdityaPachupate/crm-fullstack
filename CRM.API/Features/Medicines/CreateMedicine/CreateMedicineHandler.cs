using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Domain;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net;

namespace CRM.API.Features.Medicines.CreateMedicine
{
    public class CreateMedicineHandler(AppDbContext db, ILogger<CreateMedicineHandler> logger) : IRequestHandler<CreateMedicineCommand, CreateMedicineResponse>
    {
        public async Task<CreateMedicineResponse> Handle(CreateMedicineCommand command, CancellationToken ct)
        {
            // Uniqueness check by name
            if (await db.Medicines.AnyAsync(m => m.Name == command.Request.Name && !m.IsDeleted, ct))
            {
                logger.LogWarning("{Message}: Medicine with name {Name} already exists", LoggingMessages.Conflict, command.Request.Name);
                throw new BusinessException(
                    LoggingMessages.Conflict,
                    $"A medicine with name '{command.Request.Name}' already exists.",
                    HttpStatusCode.Conflict
                );
            }

            var medicine = new Medicine
            {
                Id = Guid.NewGuid(),
                Name = command.Request.Name,
                Price = command.Request.Price,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            db.Medicines.Add(medicine);
            await db.SaveChangesAsync(ct);

            logger.LogInformation("{Message}: Medicine {MedicineId} created", LoggingMessages.ResourceCreated, medicine.Id);
            return medicine.Adapt<CreateMedicineResponse>();
        }
    }
}
