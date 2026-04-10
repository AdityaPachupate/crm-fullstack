using FluentValidation;

namespace CRM.API.Features.Rejoin.CreateRejoin;

public class CreateRejoinValidator : AbstractValidator<CreateRejoinCommand>
{
    public CreateRejoinValidator()
    {
        RuleFor(x => x.Request.LeadId).NotEmpty();
        RuleFor(x => x.Request.PackageId).NotEmpty();
        RuleFor(x => x.Request.StartDate).NotEmpty();
    }
}
