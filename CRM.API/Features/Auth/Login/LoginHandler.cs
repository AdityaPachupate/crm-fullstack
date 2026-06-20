using CRM.API.Common.ExceptionHandling;
using MediatR;
using System.Net;

namespace CRM.API.Features.Auth.Login
{
    public class LoginHandler(IConfiguration configuration, ILogger<LoginHandler> logger) : IRequestHandler<LoginCommand, LoginResponse>
    {
        public Task<LoginResponse> Handle(LoginCommand command, CancellationToken cancellationToken)
        {
            var expectedUsername = configuration["AUTH_USERNAME"];
            var expectedPassword = configuration["AUTH_PASSWORD"];

            if (string.IsNullOrEmpty(expectedUsername) || string.IsNullOrEmpty(expectedPassword))
            {
                logger.LogError("Authentication credentials are not configured on the server.");
                throw new BusinessException("Server misconfiguration.", "User Login", HttpStatusCode.InternalServerError);
            }

            if (command.Request.Username != expectedUsername || command.Request.Password != expectedPassword)
            {
                logger.LogWarning("Failed login attempt for username: {Username}", command.Request.Username);
                throw new BusinessException("Invalid username or password.", "User Login", HttpStatusCode.Unauthorized);
            }

            logger.LogInformation("Successful login for username: {Username}", command.Request.Username);
            
            // For this simple implementation, we return a dummy token.
            // In a full implementation, you would generate and return a JWT here.
            var token = Guid.NewGuid().ToString("N");
            
            return Task.FromResult(new LoginResponse(token, command.Request.Username));
        }
    }
}
