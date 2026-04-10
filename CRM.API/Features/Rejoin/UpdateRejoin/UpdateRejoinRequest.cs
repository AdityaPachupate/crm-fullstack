using System;

namespace CRM.API.Features.Rejoin.UpdateRejoin;

public record UpdateRejoinRequest(
    Guid Id,
    Guid? LeadId = null,
    Guid? PackageId = null,
    DateOnly? StartDate = null,
    DateOnly? EndDate = null,
    decimal? PackageCostSnapshot = null,
    int? PackageDurationSnapshot = null
);
