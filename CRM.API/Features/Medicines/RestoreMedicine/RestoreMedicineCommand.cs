using MediatR;
using System;

namespace CRM.API.Features.Medicines.RestoreMedicine
{
    public record RestoreMedicineCommand(Guid Id) : IRequest<bool>;
}
