using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace CRM.API.Features.FollowUps.DeleteFollowUp
{
    public record DeleteFollowUpCommand(
        DeleteFollowUpRequest Request,
        bool IsPermanent = false
    ) : IRequest<DeleteFollowUpResponse>
    {

    }


}