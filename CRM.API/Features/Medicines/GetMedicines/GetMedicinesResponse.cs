namespace CRM.API.Features.Medicines.GetMedicines
{
    public record GetMedicinesResponse(
        Guid Id,
        string Name,
        decimal Price,
        bool Active,
        DateTime CreatedAt
    );
}
