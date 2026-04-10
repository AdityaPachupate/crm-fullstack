using System;

namespace CRM.API.Features.Packages.UpdatePackage
{
    public record UpdatePackageResponse(
        Guid Id,
        string Name,
        int DurationInDays,
        decimal Cost,
        DateTime UpdatedAt
    );
}
