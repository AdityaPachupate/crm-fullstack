using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using FluentValidation;

namespace CRM.API.Features.Enrollments.UpdateEnrollment
{
    public class UpdateEnrollmentValidator : AbstractValidator<UpdateEnrollmentCommand>
    {
        public UpdateEnrollmentValidator()
        {
            RuleFor(x => x.Request.Id).NotEmpty();
            
            RuleFor(x => x.Request.PackageCostSnapshot)
                .GreaterThanOrEqualTo(0)
                .When(x => x.Request.PackageCostSnapshot.HasValue);

            RuleFor(x => x.Request.PackageDurationSnapshot)
                .GreaterThan(0)
                .When(x => x.Request.PackageDurationSnapshot.HasValue);
        }
    }
}