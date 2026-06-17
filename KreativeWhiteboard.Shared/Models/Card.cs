namespace KreativeWhiteboard.Shared.Models;

public class Card
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public CardType Type { get; set; }
    public string Title { get; set; } = string.Empty;
    public double X { get; set; }  // posición en el board
    public double Y { get; set; }
    public int Width { get; set; } = 280;
    public int Height { get; set; } = 200;
    public string? Color { get; set; }
    public string? Content { get; set; } // JSON según el tipo
    public Guid? LinkedBoardId { get; set; } // solo para tipo Board
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}