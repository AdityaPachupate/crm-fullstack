using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Threading;
using System.Threading.Tasks;

namespace CRM.API.Features.Medicines.GetMedicineById
{
    public class GetMedicineByIdHandler(AppDbContext db, ILogger<GetMedicineByIdHandler> logger) : IRequestHandler<GetMedicineByIdQuery, GetMedicineByIdResponse>
    {
        public async Task<GetMedicineByIdResponse> Handle(GetMedicineByIdQuery query, CancellationToken ct)
        {
            var medicine = await db.Medicines
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == query.Id, ct);

            if (medicine == null)
            {
                logger.LogWarning("{Message}: Fetching Medicine with ID {MedicineId} not found", LoggingMessages.NotFound, query.Id);
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Medicine with ID {query.Id} not found.",
                    System.Net.HttpStatusCode.NotFound
                );
            }

            return medicine.Adapt<GetMedicineByIdResponse>();
        }
    }
}
