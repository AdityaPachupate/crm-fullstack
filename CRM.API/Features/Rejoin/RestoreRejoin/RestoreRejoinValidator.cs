using FluentValidation;

namespace CRM.API.Features.Rejoin.RestoreRejoin;

public class RestoreRejoinValidator : AbstractValidator<RestoreRejoinCommand>
{
    public RestoreRejoinValidator()
    {
        RuleFor(x => x.Request.Id).NotEmpty();
    }
}
