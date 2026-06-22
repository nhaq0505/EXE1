namespace GreenSolution.Core.DTOs.Auth
{
    public class RefreshRequest
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
    }
}
