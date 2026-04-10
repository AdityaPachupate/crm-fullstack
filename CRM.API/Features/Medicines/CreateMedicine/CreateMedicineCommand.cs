using MediatR;

namespace CRM.API.Features.Medicines.CreateMedicine
{
    public record CreateMedicineCommand(CreateMedicineRequest Request) : IRequest<CreateMedicineResponse>;
}
