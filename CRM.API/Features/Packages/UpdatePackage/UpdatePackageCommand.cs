using System;
using MediatR;

namespace CRM.API.Features.Packages.UpdatePackage
{
    public record UpdatePackageCommand(Guid Id, UpdatePackageRequest Request) : IRequest<UpdatePackageResponse>;
}
