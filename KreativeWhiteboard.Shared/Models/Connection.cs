namespace KreativeWhiteboard.Shared.Models;

public class Connection
{
    public Guid Id { get; set; }
    public Guid BoardId { get; set; }
    public Guid SourceCardId { get; set; }
    public Guid TargetCardId { get; set; }
    public string? Label { get; set; }
    public string? Color { get; set; }
    public DateTime CreatedAt { get; set; }
}