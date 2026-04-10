using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Features.Packages.CreatePackage
{
    public record CreatePackageResponse(
        Guid Id,
        string Name,
        int DurationInDays,
        decimal Cost
    );
}