using MediatR;

namespace CRM.API.Features.Medicines.UpdateMedicine
{
    public record UpdateMedicineCommand(System.Guid Id, UpdateMedicineRequest Request) : IRequest<UpdateMedicineResponse>;
}
