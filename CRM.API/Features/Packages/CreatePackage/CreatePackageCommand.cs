using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace CRM.API.Features.Packages.CreatePackage
{
    public record CreatePackageCommand(CreatePackageRequest Request) : IRequest<CreatePackageResponse>
    {

    }
}