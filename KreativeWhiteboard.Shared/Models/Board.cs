namespace KreativeWhiteboard.Shared.Models;

public class Board
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public Guid OwnerId { get; set; }
    public Guid? ParentCardId { get; set; } // board dentro de board
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}