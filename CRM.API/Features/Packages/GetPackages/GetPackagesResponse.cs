namespace CRM.API.Features.Packages.GetPackages
{
    public record GetPackagesResponse(
        Guid Id,
        string Name,
        decimal Cost,
        int DurationInDays,
        DateTime CreatedAt
    );
}
