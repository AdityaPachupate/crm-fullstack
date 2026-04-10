using MediatR;

namespace CRM.API.Features.Packages.GetPackage
{
    public record GetPackageQuery(Guid Id, bool IsTrash) : IRequest<GetPackageResponse>;
}
