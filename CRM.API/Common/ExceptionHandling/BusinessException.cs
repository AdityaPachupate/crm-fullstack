using System.Net;

namespace CRM.API.Common.ExceptionHandling
{
    public class BusinessException(
        string message, 
        string actionDescription, 
        HttpStatusCode statusCode = HttpStatusCode.Conflict) : Exception(message)
    {
        public string ActionDescription { get; } = actionDescription;
        public HttpStatusCode StatusCode { get; } = statusCode;
    }
}
