using CRM.API.Common.Constants;
using CRM.API.Common.ExceptionHandling;
using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Net;

namespace CRM.API.Features.Enrollments.GetEnrollmentById
{
    public class GetEnrollmentByIdHandler(AppDbContext db, ILogger<GetEnrollmentByIdHandler> logger) : IRequestHandler<GetEnrollmentByIdQuery, GetEnrollmentByIdResponse>
    {
        public async Task<GetEnrollmentByIdResponse> Handle(GetEnrollmentByIdQuery query, CancellationToken cancellationToken)
        {
            // Use manual projection to flatten the response and include Bill data efficiently
            var response = await db.Enrollments
                .AsNoTracking()
                .IgnoreQueryFilters() 
                .TagWith("Historical Enrollment Search")
                .Where(e => e.Id == query.Id)
                .Select(e => new GetEnrollmentByIdResponse(
                    e.Id,
                    e.LeadId,
                    e.Lead.Name,
                    e.PackageId,
                    e.Package.Name,
                    e.StartDate,
                    e.EndDate,
                    e.PackageCostSnapshot,
                    e.PackageDurationSnapshot,
                    e.IsDeleted,
                    e.DeletedAt,
                    e.CreatedAt,
                    e.Bill != null ? e.Bill.Id : null,
                    
                    // Bill data (handling potential nulls for historical data)
                    e.Bill != null ? e.Bill.InitialAmount : 0,
                    e.Bill != null ? e.Bill.MedicineBillingAmount : 0,
                    e.Bill != null ? e.Bill.AmountPaid : 0,
                    e.Bill != null ? e.Bill.PendingAmount : 0,
                    e.Bill != null ? e.Bill.PaymentHistoryJson : "[]",
                    e.Bill != null 
                        ? e.Bill.Items.Select(i => new EnrollmentMedicineItem(i.Medicine.Name, i.Quantity, i.UnitPriceSnapshot)).ToList() 
                        : new List<EnrollmentMedicineItem>()
                ))
                .FirstOrDefaultAsync(cancellationToken);

            if (response == null)
            {
                logger.LogWarning("{Message}: Fetching enrollment {EnrollmentId} not found", LoggingMessages.NotFound, query.Id);
                throw new BusinessException(
                    LoggingMessages.NotFound,
                    $"Fetching enrollment {query.Id}",
                    HttpStatusCode.NotFound
                );
            }

            return response;
        }
    }
}
