using FluentValidation;

namespace CRM.API.Features.Enrollments.CreateEnrollment
{
    public class CreateEnrollmentValidator : AbstractValidator<CreateEnrollmentCommand>
    {
        public CreateEnrollmentValidator()
        {
            RuleFor(x => x.Request.LeadId).NotEmpty();
            RuleFor(x => x.Request.PackageId).NotEmpty();
            RuleFor(x => x.Request.StartDate).NotEmpty();
        }
    }
}