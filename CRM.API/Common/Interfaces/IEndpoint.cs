using Microsoft.AspNetCore.Routing;

namespace CRM.API.Common.Interfaces
{
    public interface IEndpoint
    {
        void MapEndpoint(IEndpointRouteBuilder app);
    }
}
