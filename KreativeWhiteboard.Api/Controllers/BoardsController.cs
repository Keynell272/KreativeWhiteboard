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
        var board = await _db.Boards.FirstOrDefaultAsync(b => b.Id == id);
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

    // GET api/boards/root?ownerId={ownerId}
    [HttpGet("root")]
    public async Task<IActionResult> GetOrCreateRoot([FromQuery] Guid ownerId)
    {
        var root = await _db.Boards
            .FirstOrDefaultAsync(b => b.OwnerId == ownerId && b.ParentCardId == null);

        if (root is not null)
            return Ok(root);

        // Crear board raíz si no existe
        root = new Board
        {
            Id = Guid.NewGuid(),
            Title = "Inicio",
            OwnerId = ownerId,
            ParentCardId = null,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Boards.Add(root);
        await _db.SaveChangesAsync();

        return Ok(root);
    }
    
    // GET api/boards/{id}/breadcrumb
    [HttpGet("{id}/breadcrumb")]
    public async Task<IActionResult> GetBreadcrumb(Guid id)
    {
        var breadcrumb = new List<object>();
        var current = await _db.Boards.FirstOrDefaultAsync(b => b.Id == id);

        while (current is not null)
        {
            breadcrumb.Insert(0, new { current.Id, current.Title });

            if (current.ParentCardId is null)
                break;

            var parentCard = await _db.Cards.FirstOrDefaultAsync(c => c.Id == current.ParentCardId);
            if (parentCard is null) break;

            current = await _db.Boards.FirstOrDefaultAsync(b => b.Id == parentCard.BoardId);
        }

        return Ok(breadcrumb);
    }


    // PUT api/boards/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Board board)
    {
        var existing = await _db.Boards.FirstOrDefaultAsync(b => b.Id == id);
        if (existing is null) return NotFound();

        existing.Title = board.Title;
        existing.Description = board.Description;
        existing.ParentCardId = board.ParentCardId;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }
    
}