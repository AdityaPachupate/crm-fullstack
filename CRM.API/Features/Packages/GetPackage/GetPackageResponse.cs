using System;

namespace CRM.API.Features.Packages.GetPackage
{
    public record GetPackageResponse(
        Guid Id,
        string Name,
        int DurationInDays,
        decimal Cost,
        DateTime CreatedAt,
        DateTime? UpdatedAt,
        bool IsDeleted
    );
}
