namespace CRM.API.Features.Packages.CreatePackage
{
    public record CreatePackageRequest(
        string Name,
        int DurationInDays,
        decimal Cost
    );
}