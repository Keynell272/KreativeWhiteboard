using KreativeWhiteboard.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KreativeWhiteboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ConnectionsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ConnectionsController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/connections?boardId={boardId}
    [HttpGet]
    public async Task<IActionResult> GetByBoard([FromQuery] Guid boardId)
    {
        var connections = await _db.Connections
            .Where(c => c.BoardId == boardId)
            .ToListAsync();
        return Ok(connections);
    }

    // POST api/connections
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Connection connection)
    {
        connection.Id = Guid.NewGuid();
        connection.CreatedAt = DateTime.UtcNow;

        _db.Connections.Add(connection);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetByBoard), new { boardId = connection.BoardId }, connection);
    }

    // DELETE api/connections/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var connection = await _db.Connections.FindAsync(id);
        if (connection is null) return NotFound();

        _db.Connections.Remove(connection);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}