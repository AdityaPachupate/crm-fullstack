using MediatR;

namespace CRM.API.Features.Enrollments.GetEnrollmentById
{
    public record GetEnrollmentByIdQuery(Guid Id) : IRequest<GetEnrollmentByIdResponse>;
}
