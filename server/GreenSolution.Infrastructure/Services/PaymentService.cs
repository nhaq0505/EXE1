using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using GreenSolution.Core.Entities;
using GreenSolution.Core.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace GreenSolution.Infrastructure.Services
{
    public class PaymentService : IPaymentService
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(IConfiguration configuration, ILogger<PaymentService> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<string> CreatePaymentLinkAsync(Order order)
        {
            string clientId = _configuration["PayOS:ClientId"] ?? "YOUR_CLIENT_ID";
            string apiKey = _configuration["PayOS:ApiKey"] ?? "YOUR_API_KEY";
            string checksumKey = _configuration["PayOS:ChecksumKey"] ?? "YOUR_CHECKSUM_KEY";

            long orderCode = order.OrderCode;
            int amount = (int)order.TotalAmount;
            string description = $"Thanh toan don hang {orderCode}";
            string cancelUrl = _configuration["PayOS:CancelUrl"] ?? "http://localhost:5173/payment/cancel";
            string returnUrl = _configuration["PayOS:ReturnUrl"] ?? "http://localhost:5173/payment/success";

            // If configuration is placeholder or mock, return mock checkout link directly
            if (clientId == "YOUR_CLIENT_ID" || apiKey == "YOUR_API_KEY" || checksumKey == "YOUR_CHECKSUM_KEY")
            {
                _logger.LogInformation("Using mock payment link generation for order {OrderCode} due to mock PayOS configurations.", orderCode);
                return $"https://pay.payos.vn/web/mock-payment?orderCode={orderCode}";
            }

            try
            {
                // alphabet sorting parameters: amount, cancelUrl, description, orderCode, returnUrl
                // data format: amount={amount}&cancelUrl={cancelUrl}&description={description}&orderCode={orderCode}&returnUrl={returnUrl}
                string rawData = $"amount={amount}&cancelUrl={cancelUrl}&description={description}&orderCode={orderCode}&returnUrl={returnUrl}";
                string signature = ComputeHmacSha256(rawData, checksumKey);

                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Add("x-client-id", clientId);
                httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);

                var payload = new
                {
                    orderCode = orderCode,
                    amount = amount,
                    description = description,
                    cancelUrl = cancelUrl,
                    returnUrl = returnUrl,
                    signature = signature
                };

                string jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                _logger.LogInformation("Calling PayOS API to create payment link for order {OrderCode}.", orderCode);
                var response = await httpClient.PostAsync("https://api-merchant.payos.vn/v2/payment-requests", content);
                
                if (response.IsSuccessStatusCode)
                {
                    string jsonResponse = await response.Content.ReadAsStringAsync();
                    using var doc = JsonDocument.Parse(jsonResponse);
                    var root = doc.RootElement;
                    if (root.TryGetProperty("data", out var dataElement) && dataElement.TryGetProperty("checkoutUrl", out var checkoutUrlElement))
                    {
                        return checkoutUrlElement.GetString() ?? $"https://pay.payos.vn/web/mock-payment?orderCode={orderCode}";
                    }
                }

                string errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("PayOS API returned failure status code {StatusCode}: {ErrorResponse}. Falling back to mock link.", response.StatusCode, errorResponse);
                return $"https://pay.payos.vn/web/mock-payment?orderCode={orderCode}";
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to call PayOS API for order {OrderCode}. Falling back to mock link.", orderCode);
                return $"https://pay.payos.vn/web/mock-payment?orderCode={orderCode}";
            }
        }

        public async Task<bool> CancelPaymentLinkAsync(long orderCode, string reason)
        {
            string clientId = _configuration["PayOS:ClientId"] ?? "YOUR_CLIENT_ID";
            string apiKey = _configuration["PayOS:ApiKey"] ?? "YOUR_API_KEY";

            if (clientId == "YOUR_CLIENT_ID" || apiKey == "YOUR_API_KEY")
            {
                _logger.LogInformation("Using mock payment link cancellation for order {OrderCode}.", orderCode);
                return true;
            }

            try
            {
                using var httpClient = new HttpClient();
                httpClient.DefaultRequestHeaders.Add("x-client-id", clientId);
                httpClient.DefaultRequestHeaders.Add("x-api-key", apiKey);

                var payload = new { cancellationReason = reason };
                string jsonPayload = JsonSerializer.Serialize(payload);
                var content = new StringContent(jsonPayload, Encoding.UTF8, "application/json");

                _logger.LogInformation("Calling PayOS API to cancel payment link for order {OrderCode}.", orderCode);
                var response = await httpClient.PostAsync($"https://api-merchant.payos.vn/v2/payment-requests/{orderCode}/cancel", content);
                
                if (response.IsSuccessStatusCode)
                {
                    return true;
                }

                string errorResponse = await response.Content.ReadAsStringAsync();
                _logger.LogWarning("PayOS API returned failure status code {StatusCode} on cancellation: {ErrorResponse}.", response.StatusCode, errorResponse);
                return true; // Return true as a fallback so that local cancellation is not blocked
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to call PayOS cancellation API for order {OrderCode}. Falling back to true.", orderCode);
                return true;
            }
        }

        private string ComputeHmacSha256(string data, string key)
        {
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(key));
            byte[] hash = hmac.ComputeHash(Encoding.UTF8.GetBytes(data));
            return BitConverter.ToString(hash).Replace("-", "").ToLower();
        }
    }
}
