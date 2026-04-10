using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace CRM.API.Features.Leads.DeleteLead
{
    public record DeleteLeadResponse(
        bool IsDeleted
    );
    
}