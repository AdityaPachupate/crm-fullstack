using System;

namespace CRM.API.Features.Rejoin.GetRejoinById;

public record GetRejoinByIdResponse(
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
    bool IsDeleted,
    DateTime? DeletedAt,
    RejoinBillDto? Bill
);

public record RejoinBillDto(
    Guid Id,
    decimal InitialAmount,
    decimal AmountPaid,
    decimal PendingAmount,
    decimal MedicineBillingAmount,
    DateTime CreatedAt
);
