namespace CRM.API.Features.Medicines.GetMedicines
{
    public record GetMedicinesResponse(
        Guid Id,
        string Name,
        decimal Price,
        bool IsActive,
        DateTime CreatedAt
    );
}
