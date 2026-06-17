using KreativeWhiteboard.Shared.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace KreativeWhiteboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CardsController : ControllerBase
{
    private readonly AppDbContext _db;

    public CardsController(AppDbContext db)
    {
        _db = db;
    }

    // GET api/cards?boardId={boardId}
    [HttpGet]
    public async Task<IActionResult> GetByBoard([FromQuery] Guid boardId)
    {
        var cards = await _db.Cards
            .Where(c => c.BoardId == boardId)
            .ToListAsync();
        return Ok(cards);
    }

    // GET api/cards/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        var card = await _db.Cards.FindAsync(id);
        if (card is null) return NotFound();
        return Ok(card);
    }

    // POST api/cards
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Card card)
    {
        card.Id = Guid.NewGuid();
        card.CreatedAt = DateTime.UtcNow;
        card.UpdatedAt = DateTime.UtcNow;

        _db.Cards.Add(card);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = card.Id }, card);
    }

    // PUT api/cards/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(Guid id, [FromBody] Card card)
    {
        var existing = await _db.Cards.FindAsync(id);
        if (existing is null) return NotFound();

        existing.Title = card.Title;
        existing.Content = card.Content;
        existing.Color = card.Color;
        existing.X = card.X;
        existing.Y = card.Y;
        existing.Width = card.Width;
        existing.Height = card.Height;
        existing.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return Ok(existing);
    }

    // DELETE api/cards/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var card = await _db.Cards.FindAsync(id);
        if (card is null) return NotFound();

        _db.Cards.Remove(card);
        await _db.SaveChangesAsync();

        return NoContent();
    }
}