namespace GreenSolution.Core.DTOs.Auth
{
    public class AuthResponse
    {
        public string AccessToken { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public UserResponse User { get; set; } = null!;
    }
}
