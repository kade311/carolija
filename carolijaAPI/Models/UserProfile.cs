using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace carolijaAPI.Models;

public class UserProfile
{
    [Key]
    public string UserID { get; set; } = string.Empty;

    [ForeignKey(nameof(UserID))]
    public IdentityUser User { get; set; } = default!;

    [MaxLength(150)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(250)]
    public string Address { get; set; } = string.Empty;

    [MaxLength(30)]
    public string Phone { get; set; } = string.Empty;
}
