using CRM.API.Infrastructure.Persistence;
using Mapster;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CRM.API.Features.Packages.GetPackages
{
    public class GetPackagesHandler(AppDbContext db) : IRequestHandler<GetPackagesQuery, List<GetPackagesResponse>>
    {
        public async Task<List<GetPackagesResponse>> Handle(GetPackagesQuery query, CancellationToken ct)
        {
            return await db.Packages
                .AsNoTracking()
                .Where(p => p.IsDeleted == query.IsTrash)
                .OrderBy(p => p.Name)
                .Select(p => new GetPackagesResponse(
                    p.Id,
                    p.Name,
                    p.Cost,
                    p.DurationInDays,
                    p.CreatedAt
                ))
                .ToListAsync(ct);
        }
    }
}
