using Microsoft.AspNetCore.Http;

namespace carolijaAPI.Services
{
    public static class ImageValidation
    {
        public const long MaxFileSizeBytes = 5 * 1024 * 1024;

        private static readonly HashSet<string> AllowedContentTypes = new(StringComparer.OrdinalIgnoreCase)
        {
            "image/jpeg",
            "image/png",
            "image/webp"
        };

        private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
        {
            ".jpg",
            ".jpeg",
            ".png",
            ".webp"
        };

        public static string? Validate(IFormFile? file)
        {
            if (file is null || file.Length == 0)
            {
                return "Slika je obavezna.";
            }

            if (file.Length > MaxFileSizeBytes)
            {
                return "Maksimalna veličina slike je 5 MB.";
            }

            var extension = Path.GetExtension(file.FileName);
            if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
            {
                return "Dozvoljeni formati su JPG, PNG i WEBP.";
            }

            if (!AllowedContentTypes.Contains(file.ContentType))
            {
                return "Dozvoljeni MIME tipovi su image/jpeg, image/png i image/webp.";
            }

            return null;
        }
    }
}
