using MediatR;

namespace CRM.API.Features.Medicines.GetMedicines
{
    public record GetMedicinesQuery(bool IsTrash = false) : IRequest<List<GetMedicinesResponse>>;
}
