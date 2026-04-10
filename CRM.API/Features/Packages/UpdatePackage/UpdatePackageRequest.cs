namespace CRM.API.Features.Packages.UpdatePackage
{
    public record UpdatePackageRequest(
        string Name,
        int DurationInDays,
        decimal Cost
    );
}
