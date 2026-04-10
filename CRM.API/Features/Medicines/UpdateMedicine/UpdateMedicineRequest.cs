using System;

namespace CRM.API.Features.Medicines.UpdateMedicine
{
    public record UpdateMedicineRequest(Guid Id, string? Name, decimal? Price, bool? IsActive);
}
