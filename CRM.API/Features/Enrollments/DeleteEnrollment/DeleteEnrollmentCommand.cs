using MediatR;

namespace CRM.API.Features.Enrollments.DeleteEnrollment
{
    public record DeleteEnrollmentCommand(DeleteEnrollmentRequest Request, bool IsPermanent = false) : IRequest<DeleteEnrollmentResponse>;
}
