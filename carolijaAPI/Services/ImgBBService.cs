using System.Text.Json;
using carolijaAPI.Models;

namespace carolijaAPI.Services
{
    public class ImgBBService
    {
        private readonly HttpClient _httpClient;
        private readonly IConfiguration _configuration;

        public ImgBBService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _configuration = configuration;
        }

        public async Task<ImgBbUploadResult?> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
            {
                return null;
            }

            var apiKey = _configuration["ImgBB:ApiKey"];
            if (string.IsNullOrWhiteSpace(apiKey))
            {
                throw new InvalidOperationException("ImgBB API key is not configured.");
            }

            using var content = new MultipartFormDataContent();
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileBytes = ms.ToArray();

            var imageContent = new ByteArrayContent(fileBytes);
            imageContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(
                string.IsNullOrWhiteSpace(file.ContentType) ? "application/octet-stream" : file.ContentType);
            content.Add(imageContent, "image", file.FileName);

            var response = await _httpClient.PostAsync($"https://api.imgbb.com/1/upload?key={apiKey}", content);
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                throw new InvalidOperationException($"ImgBB upload nije uspio ({(int)response.StatusCode}): {errorBody}");
            }

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<ImgBBResponse>(jsonResponse, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (result?.Data is null || string.IsNullOrWhiteSpace(result.Data.Url))
            {
                throw new InvalidOperationException("ImgBB nije vratio URL slike.");
            }

            return new ImgBbUploadResult
            {
                Url = result.Data.Url
            };
        }
    }

    public class ImgBBResponse
    {
        public ImgBBData? Data { get; set; }
        public bool Success { get; set; }
    }

    public class ImgBBData
    {
        public string Url { get; set; } = string.Empty;
    }
}
