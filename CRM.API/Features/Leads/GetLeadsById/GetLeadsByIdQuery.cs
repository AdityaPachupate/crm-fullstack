using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CRM.API.Common.Enums;
using CRM.API.Common.Models;
using MediatR;

namespace CRM.API.Features.Leads.GetLeadsById
{
    public record GetLeadsByIdQuery(Guid Id) : IRequest<GetLeadsByIdResponse>
    {
    }
}