using FluentValidation;

namespace CRM.API.Features.Rejoin.UpdateRejoin;

public class UpdateRejoinValidator : AbstractValidator<UpdateRejoinCommand>
{
    public UpdateRejoinValidator()
    {
        RuleFor(x => x.Request.Id).NotEmpty();
    }
}
