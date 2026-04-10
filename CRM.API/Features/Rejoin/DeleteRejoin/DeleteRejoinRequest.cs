namespace CRM.API.Features.Rejoin.DeleteRejoin
{
    public record DeleteRejoinRequest(Guid Id, bool IsPermanent = false);
}
