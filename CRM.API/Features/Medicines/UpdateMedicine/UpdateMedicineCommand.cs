using MediatR;

namespace CRM.API.Features.Medicines.UpdateMedicine
{
    public record UpdateMedicineCommand(UpdateMedicineRequest Request) : IRequest<UpdateMedicineResponse>;
}
