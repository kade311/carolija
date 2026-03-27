using carolijaAPI.Models;
using carolijaAPI.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace carolijaAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IConfiguration _configuration;
        private readonly TurnstileService _turnstileService;

        public AuthController(
            UserManager<IdentityUser> userManager,
            IConfiguration configuration,
            RoleManager<IdentityRole> roleManager,
            TurnstileService turnstileService)
        {
            _userManager = userManager;
            _configuration = configuration;
            _roleManager = roleManager;
            _turnstileService = turnstileService;
        }

        [HttpGet("turnstile-site-key")]
        public IActionResult GetTurnstileSiteKey()
        {
            var siteKey = _turnstileService.GetSiteKey();
            if (string.IsNullOrWhiteSpace(siteKey))
            {
                return NotFound();
            }

            return Ok(new { siteKey });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthModels.LoginModel model)
        {
            var isHuman = await _turnstileService.VerifyTokenAsync(
                model.TurnstileToken,
                HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!isHuman)
            {
                return BadRequest(new { message = "Turnstile provjera nije uspjela." });
            }

            var user = await _userManager.FindByEmailAsync(model.Email);

            if (user != null && await _userManager.CheckPasswordAsync(user, model.Password))
            {
                var userRoles = await _userManager.GetRolesAsync(user);

                var authClaims = new List<Claim>
                {
                    new Claim(ClaimTypes.Name, user.Email!),
                    new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                };

                foreach (var userRole in userRoles)
                {
                    authClaims.Add(new Claim(ClaimTypes.Role, userRole));
                }

                var authSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["JWT:Secret"]!));
                var credentials = new SigningCredentials(authSigningKey, SecurityAlgorithms.HmacSha256);

                var token = new JwtSecurityToken(
                    issuer: _configuration["JWT:ValidIssuer"],
                    audience: _configuration["JWT:ValidAudience"],
                    expires: DateTime.UtcNow.AddHours(3),
                    claims: authClaims,
                    signingCredentials: credentials
                );

                return Ok(new
                {
                    token = new JwtSecurityTokenHandler().WriteToken(token),
                    expiration = token.ValidTo,
                });
            }

            return Unauthorized();
        }

        [HttpPost("register")]
        [EnableRateLimiting("register")]
        public async Task<IActionResult> Register([FromBody] AuthModels.RegisterModel model)
        {
            var isHuman = await _turnstileService.VerifyTokenAsync(
                model.TurnstileToken,
                HttpContext.Connection.RemoteIpAddress?.ToString());

            if (!isHuman)
            {
                return BadRequest(new { message = "Turnstile provjera nije uspjela." });
            }

            var userExists = await _userManager.FindByEmailAsync(model.Email);
            if (userExists != null)
            {
                return BadRequest(new { message = "Korisnik s ovim mailom vec postoji!" });
            }

            IdentityUser user = new()
            {
                Email = model.Email,
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Email
            };

            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            if (await _roleManager.RoleExistsAsync("User"))
            {
                await _userManager.AddToRoleAsync(user, "User");
            }

            return Ok(new { message = "Uspjesno ste registrovani!" });
        }
    }
}
