using System;

namespace CRM.API.Features.Rejoin.UpdateRejoin;

public record UpdateRejoinResponse(
    Guid Id,
    Guid LeadId,
    Guid PackageId,
    DateOnly StartDate,
    DateOnly EndDate,
    decimal PackageCostSnapshot,
    int PackageDurationSnapshot,
    DateTime CreatedAt
);
