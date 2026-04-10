using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace CRM.API.Features.FollowUps.GetTodayFollowUps
{
    public record GetTodayFollowUpsQuery() : IRequest<List<GetTodayFollowUpsResponse>>;
}