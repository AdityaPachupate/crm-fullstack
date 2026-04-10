using MediatR;

namespace CRM.API.Features.Enrollments.UpdateEnrollment
{
    public record UpdateEnrollmentCommand(UpdateEnrollmentRequest Request) : IRequest<UpdateEnrollmentResponse>;
}