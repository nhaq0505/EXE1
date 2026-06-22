using GreenSolution.Core.DTOs.Auth;

namespace GreenSolution.Core.Interfaces
{
    public interface IAuthService
    {
        Task<AuthResponse> RegisterAsync(RegisterRequest request);
        Task<AuthResponse> LoginAsync(LoginRequest request);
        Task<AuthResponse> RefreshTokenAsync(string accessToken, string refreshToken);
        Task<UserResponse> GetMeAsync(Guid userId);
        Task<UserResponse> UpdateMeAsync(Guid userId, UpdateProfileRequest request);
    }
}
