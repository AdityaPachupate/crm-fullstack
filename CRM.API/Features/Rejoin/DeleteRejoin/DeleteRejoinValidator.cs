using FluentValidation;

namespace CRM.API.Features.Rejoin.DeleteRejoin;

public class DeleteRejoinValidator : AbstractValidator<DeleteRejoinCommand>
{
    public DeleteRejoinValidator()
    {
        RuleFor(x => x.Request.Id).NotEmpty();
    }
}
