using MediatR;

namespace CRM.API.Features.Enrollments.CreateEnrollment
{
    public record CreateEnrollmentCommand(CreateEnrollmentRequest Request) : IRequest<CreateEnrollmentResponse>;
}