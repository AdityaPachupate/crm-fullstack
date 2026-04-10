using MediatR;

namespace CRM.API.Features.Enrollments.RestoreEnrollment
{
    public record RestoreEnrollmentCommand(RestoreEnrollmentRequest Request) : IRequest<RestoreEnrollmentResponse>;
}
