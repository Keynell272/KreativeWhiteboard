using KreativeWhiteboard.Shared.Models;
using Microsoft.EntityFrameworkCore;

namespace KreativeWhiteboard.Api;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Board> Boards => Set<Board>();
    public DbSet<Card> Cards => Set<Card>();
    public DbSet<Connection> Connections => Set<Connection>();
}