using System.Text.Json;

namespace carolijaAPI.Services
{
    public class TurnstileService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public TurnstileService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public string? GetSiteKey()
        {
            return _configuration["Turnstile:SiteKey"];
        }

        public async Task<bool> VerifyTokenAsync(string token, string? remoteIp = null)
        {
            if (string.IsNullOrWhiteSpace(token))
            {
                return false;
            }

            var secretKey = _configuration["Turnstile:SecretKey"];
            if (string.IsNullOrWhiteSpace(secretKey))
            {
                throw new InvalidOperationException("Turnstile secret key is not configured.");
            }

            using var content = new FormUrlEncodedContent(new Dictionary<string, string>
            {
                ["secret"] = secretKey,
                ["response"] = token,
                ["remoteip"] = remoteIp ?? string.Empty
            });

            var response = await _httpClient.PostAsync("https://challenges.cloudflare.com/turnstile/v0/siteverify", content);
            if (!response.IsSuccessStatusCode)
            {
                return false;
            }

            var json = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<TurnstileVerifyResponse>(json, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            return result?.Success == true;
        }
    }

    public class TurnstileVerifyResponse
    {
        public bool Success { get; set; }
    }
}
