namespace CRM.API.Common.Helpers
{
    public static class StringHelpers
    {
        public static string MaskPhone(this string phone)
        {
            if (string.IsNullOrEmpty(phone)) return "****";
            if (phone.Length < 4) return "****";
            return $"****{phone[^4..]}";
        }
    }
}
