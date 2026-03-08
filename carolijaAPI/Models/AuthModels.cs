namespace carolijaAPI.Models
{
    public class AuthModels
    {
        public class RegisterModel
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
        public class LoginModel
        {
            public string Email { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
        }
        public class AuthResponse
        {
            public string Token { get; set; } = string.Empty;
            public DateTime Expiration { get; set; }
        }
    }
}
