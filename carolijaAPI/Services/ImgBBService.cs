using System.Net.Http;
using Newtonsoft.Json;

namespace carolijaAPI.Services
{
    public class ImgBBService
    {
        private readonly HttpClient _httpClient;
        private const string ApiKey = "c4e2c0e06528635c7f32418d26a8d91a";

        public ImgBBService(HttpClient httpClient) {  _httpClient = httpClient; }

        public async Task<(string Url, string DeleteHash)> UploadImageAsync(IFormFile file)
        {
            if(file==null || file.Length == 0)
            {
                return (null, null);
            }

            using var content = new MultipartFormDataContent();
            using var ms = new MemoryStream();
            await file.CopyToAsync(ms);
            var fileBytes = ms.ToArray();

            content.Add(new ByteArrayContent(fileBytes), "image", file.FileName);

            var response = await _httpClient.PostAsync($"https://api.imgbb.com/1/upload?key={ApiKey}", content);

            if (!response.IsSuccessStatusCode) return (null, null);

            var jsonResponse = await response.Content.ReadAsStringAsync();
            var result = JsonConvert.DeserializeObject<ImgBBResponse>(jsonResponse);

            string deleteHash = result.Data.Delete_Url;

            return (result.Data.Url, deleteHash);
        }

    }

    public class ImgBBResponse
    {
        public ImgBBData Data { get; set; }
        public bool Success { get; set; }
    }

    public class ImgBBData
    {
        public string Url { get; set; }
        public string Delete_Url { get; set; }
    }
}
