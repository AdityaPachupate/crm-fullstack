namespace CRM.API.Features.Medicines.CreateMedicine
{
    public record CreateMedicineResponse(Guid Id, string Name, decimal Price, bool IsActive, DateTime CreatedAt);
}
