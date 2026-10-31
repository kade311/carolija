using carolijaAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace carolijaAPI.Controllers;

[ApiController]
[Authorize]
[Route("api/profile")]
public class ProfileController : ControllerBase
{
    private readonly AppDbContext _context;

    public ProfileController(AppDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> Get(CancellationToken cancellationToken)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var profile = await _context.UserProfiles.AsNoTracking()
            .FirstOrDefaultAsync(item => item.UserID == userId, cancellationToken);
        return Ok(new
        {
            fullName = profile?.FullName ?? string.Empty,
            address = profile?.Address ?? string.Empty,
            phone = profile?.Phone ?? string.Empty
        });
    }

    [HttpPut]
    public async Task<IActionResult> Update([FromBody] ProfileRequest request, CancellationToken cancellationToken)
    {
        if (!ModelState.IsValid) return ValidationProblem(ModelState);
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var profile = await _context.UserProfiles.FirstOrDefaultAsync(item => item.UserID == userId, cancellationToken);
        if (profile is null)
        {
            profile = new UserProfile { UserID = userId };
            _context.UserProfiles.Add(profile);
        }

        profile.FullName = request.FullName.Trim();
        profile.Address = request.Address.Trim();
        profile.Phone = request.Phone.Trim();
        await _context.SaveChangesAsync(cancellationToken);
        return Ok(new { profile.FullName, profile.Address, profile.Phone });
    }
}
