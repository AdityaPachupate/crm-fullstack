using MediatR;

namespace CRM.API.Features.Packages.RestorePackage
{
    public record RestorePackageCommand(Guid Id) : IRequest<RestorePackageResponse>;
}
