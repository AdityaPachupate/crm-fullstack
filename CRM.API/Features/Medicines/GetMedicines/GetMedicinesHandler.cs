using CRM.API.Infrastructure.Persistence;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Medicines.GetMedicines
{
    public class GetMedicinesHandler(AppDbContext db) : IRequestHandler<GetMedicinesQuery, List<GetMedicinesResponse>>
    {
        public async Task<List<GetMedicinesResponse>> Handle(GetMedicinesQuery request, CancellationToken ct)
        {
            return await db.Medicines
                .AsNoTracking()
                .Where(m => m.IsDeleted == request.IsTrash)
                .OrderBy(m => m.Name)
                .Select(m => new GetMedicinesResponse(
                    m.Id,
                    m.Name,
                    m.Price,
                    m.IsActive,
                    m.CreatedAt
                ))
                .ToListAsync(ct);
        }
    }
}
