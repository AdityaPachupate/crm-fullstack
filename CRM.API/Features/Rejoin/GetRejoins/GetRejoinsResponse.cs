using System;

namespace CRM.API.Features.Rejoin.GetRejoins;

public record GetRejoinsResponse(
    Guid Id,
    Guid LeadId,
    string LeadName,
    Guid PackageId,
    string PackageName,
    decimal PackageCostSnapshot,
    int PackageDurationSnapshot,
    DateOnly StartDate,
    DateOnly EndDate,
    DateTime CreatedAt,
    bool IsDeleted
);
