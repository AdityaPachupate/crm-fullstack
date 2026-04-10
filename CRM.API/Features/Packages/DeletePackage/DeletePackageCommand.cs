using MediatR;

namespace CRM.API.Features.Packages.DeletePackage
{
    public record DeletePackageCommand(Guid Id, bool IsPermanent = false) : IRequest<DeletePackageResponse>;
}
