using MediatR;

namespace CRM.API.Features.Packages.GetPackages
{
    public record GetPackagesQuery(bool IsTrash = false) : IRequest<List<GetPackagesResponse>>;
}
