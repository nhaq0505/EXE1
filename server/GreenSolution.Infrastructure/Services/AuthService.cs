using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BCrypt.Net;
using GreenSolution.Core.DTOs.Auth;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Enums;
using GreenSolution.Core.Exceptions;
using GreenSolution.Core.Interfaces;
using GreenSolution.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace GreenSolution.Infrastructure.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Check duplicate email
            var emailExists = await _context.Users.AnyAsync(u => u.Email == request.Email);
            if (emailExists)
            {
                throw new BadRequestException("Email already exists.");
            }

            var passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

            var newUser = new User
            {
                Id = Guid.NewGuid().ToString(),
                Email = request.Email,
                FullName = request.Name,
                PasswordHash = passwordHash,
                Phone = request.Phone,
                Address = request.Address,
                Role = UserRole.User,
                CreatedAt = DateTime.UtcNow
            };

            // Seed user with a Cart as required by relationships
            var newCart = new Cart
            {
                Id = Guid.NewGuid().ToString(),
                UserId = newUser.Id
            };
            newUser.Cart = newCart;

            await _context.Users.AddAsync(newUser);
            await _context.Carts.AddAsync(newCart);
            await _context.SaveChangesAsync();

            // Generate tokens
            var accessToken = GenerateAccessToken(newUser);
            var refreshToken = GenerateRefreshToken();

            int.TryParse(_configuration["JwtSettings:RefreshTokenExpiryDays"], out var refreshExpiryDays);
            newUser.RefreshToken = refreshToken;
            newUser.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays == 0 ? 7 : refreshExpiryDays);

            _context.Users.Update(newUser);
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = MapToUserResponse(newUser)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
            if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            {
                throw new UnauthorizedException("Invalid email or password.");
            }

            var accessToken = GenerateAccessToken(user);
            var refreshToken = GenerateRefreshToken();

            int.TryParse(_configuration["JwtSettings:RefreshTokenExpiryDays"], out var refreshExpiryDays);
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays == 0 ? 7 : refreshExpiryDays);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                User = MapToUserResponse(user)
            };
        }

        public async Task<AuthResponse> RefreshTokenAsync(string accessToken, string refreshToken)
        {
            var secret = _configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured.");
            var principal = GetPrincipalFromExpiredToken(accessToken, secret);
            
            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedException("Invalid access token claims.");
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
            {
                throw new UnauthorizedException("Invalid or expired refresh token.");
            }

            var newAccessToken = GenerateAccessToken(user);
            var newRefreshToken = GenerateRefreshToken();

            int.TryParse(_configuration["JwtSettings:RefreshTokenExpiryDays"], out var refreshExpiryDays);
            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(refreshExpiryDays == 0 ? 7 : refreshExpiryDays);

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return new AuthResponse
            {
                AccessToken = newAccessToken,
                RefreshToken = newRefreshToken,
                User = MapToUserResponse(user)
            };
        }

        public async Task<UserResponse> GetMeAsync(Guid userId)
        {
            var userIdStr = userId.ToString();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userIdStr);
            if (user == null)
            {
                throw new NotFoundException("User not found.");
            }

            return MapToUserResponse(user);
        }

        public async Task<UserResponse> UpdateMeAsync(Guid userId, UpdateProfileRequest request)
        {
            var userIdStr = userId.ToString();
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userIdStr);
            if (user == null)
            {
                throw new NotFoundException("User not found.");
            }

            user.FullName = request.Name;
            user.Phone = request.Phone;
            user.Address = request.Address;

            _context.Users.Update(user);
            await _context.SaveChangesAsync();

            return MapToUserResponse(user);
        }

        #region Helper Methods

        private string GenerateAccessToken(User user)
        {
            var secret = _configuration["JwtSettings:Secret"] ?? throw new InvalidOperationException("JWT Secret is not configured.");
            var issuer = _configuration["JwtSettings:Issuer"];
            var audience = _configuration["JwtSettings:Audience"];
            int.TryParse(_configuration["JwtSettings:ExpiryMinutes"], out var expiryMinutes);

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(secret);

            var claims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(expiryMinutes == 0 ? 15 : expiryMinutes),
                Issuer = issuer,
                Audience = audience,
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private ClaimsPrincipal GetPrincipalFromExpiredToken(string token, string secret)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret)),
                ValidateLifetime = false // Disable expiry check for refreshing
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out var securityToken);

            if (securityToken is not JwtSecurityToken jwtSecurityToken || 
                !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                throw new UnauthorizedException("Invalid access token signature.");
            }

            return principal;
        }

        private UserResponse MapToUserResponse(User user)
        {
            return new UserResponse
            {
                Id = user.Id,
                Email = user.Email,
                Name = user.FullName,
                Phone = user.Phone,
                Address = user.Address,
                Role = user.Role.ToString()
            };
        }

        #endregion
    }
}
