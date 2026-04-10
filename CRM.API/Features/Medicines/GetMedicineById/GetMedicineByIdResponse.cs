using System;

namespace CRM.API.Features.Medicines.GetMedicineById
{
    public record GetMedicineByIdResponse(Guid Id, string Name, decimal Price, bool IsActive, DateTime CreatedAt);
}
