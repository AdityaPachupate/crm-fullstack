using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Features.FollowUps.DeleteFollowUp
{
    public record DeleteFollowUpResponse(
        bool IsDeleted
    )
    {

    }
}