using FluentValidation;

namespace CRM.API.Features.FollowUps.CreateFollowUp;

public class CreateFollowUpValidator : AbstractValidator<CreateFollowUpCommand>
{
    public CreateFollowUpValidator()
    {
        RuleFor(x => x.Request.LeadId)
            .NotEmpty().WithMessage("LeadId is required.");

        RuleFor(x => x.Request.FollowUpDate)
            .NotEmpty().WithMessage("Follow-up date is required.")
            .Must(date => date >= DateOnly.FromDateTime(DateTime.UtcNow.Date))
            .WithMessage("Follow-up date cannot be in the past.");

        RuleFor(x => x.Request.Source)
            .NotEmpty().WithMessage("Source (contact medium) is required.");

        RuleFor(x => x.Request.Priority)
            .IsInEnum().WithMessage("Priority must be a valid level (Low, Medium, High).");
            
        RuleFor(x => x.Request.Notes)
            .MaximumLength(1000).WithMessage("Notes cannot exceed 1000 characters.");
    }
}
