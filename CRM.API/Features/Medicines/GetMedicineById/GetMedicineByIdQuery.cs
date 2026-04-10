using System;
using MediatR;

namespace CRM.API.Features.Medicines.GetMedicineById
{
    public record GetMedicineByIdQuery(Guid Id) : IRequest<GetMedicineByIdResponse>;
}
