using KreativeWhiteboard.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KreativeWhiteboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BoardsController : ControllerBase
{
    private readonly AppDbContext _db;

    public BoardsController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/boards
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var boards = await _db.Boards.ToListAsync();
        return Ok(boards);
    }

    // GET api/boards/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var board = await _db.Boards.FindAsync(id);
        if (board is null) return NotFound();
        return Ok(board);
    }

    // POST api/boards
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Board board)
    {
        board.Id = Guid.NewGuid();
        board.CreatedAt = DateTime.UtcNow;
        board.UpdatedAt = DateTime.UtcNow;

        _db.Boards.Add(board);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = board.Id }, board);
    }

    // DELETE api/boards/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var board = await _db.Boards.FindAsync(id);
        if (board is null) return NotFound();

        _db.Boards.Remove(board);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}