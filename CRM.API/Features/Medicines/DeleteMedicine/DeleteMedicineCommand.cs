using MediatR;
using System;

namespace CRM.API.Features.Medicines.DeleteMedicine
{
    public record DeleteMedicineCommand(Guid Id, bool IsPermanent = false) : IRequest<DeleteMedicineResponse>;
}
