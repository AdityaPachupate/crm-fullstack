using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;

namespace CRM.API.Features.Bills.DeleteBill
{
    public record DeleteBillCommand(
        DeleteBillRequest Request,
         bool IsPermanent = false
    ) : IRequest<DeleteBillResponse>
    {

    }
}