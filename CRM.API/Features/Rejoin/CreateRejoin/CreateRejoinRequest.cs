namespace CRM.API.Features.Rejoin.CreateRejoin;

public record CreateRejoinRequest(
    Guid LeadId,
    Guid PackageId,
    DateOnly StartDate
);
