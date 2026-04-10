using System;

namespace CRM.API.Features.Medicines.UpdateMedicine
{
    public record UpdateMedicineResponse(Guid Id, string Name, decimal Price, bool IsActive, DateTime CreatedAt);
}
