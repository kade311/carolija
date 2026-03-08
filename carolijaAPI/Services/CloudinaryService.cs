using CloudinaryDotNet;
using CloudinaryDotNet.Actions;

namespace carolijaAPI.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;

        public CloudinaryService()
        {
            var account = new Account("dmldkdfkk", "372263718112154", "KdOqs13NlFgqdVEFAeGUbMptPXI");

            _cloudinary = new Cloudinary(account);
            _cloudinary.Api.Secure = true;
        }

        public string UploadImage(IFormFile file)
        {

            using (var stream = file.OpenReadStream()) 
            { 
            var uploadParams = new ImageUploadParams()
            {
                File = new FileDescription(file.FileName, stream)
            };

            var uploadResult = _cloudinary.Upload(uploadParams);

            return uploadResult.SecureUrl.AbsoluteUri;
                
            }
        }
    }
}
