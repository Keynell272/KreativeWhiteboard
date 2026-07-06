using Microsoft.AspNetCore.Mvc;
using System.Text.RegularExpressions;

namespace KreativeWhiteboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PreviewController : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetPreview([FromQuery] string url)
    {
        if (string.IsNullOrWhiteSpace(url))
            return BadRequest("URL requerida");

        try
        {
            using var http = new HttpClient();
            http.Timeout = TimeSpan.FromSeconds(5);
            http.DefaultRequestHeaders.Add("User-Agent", "Mozilla/5.0");
            
            var html = await http.GetStringAsync(url);

            var title = GetMetaTag(html, "og:title") ?? GetTitle(html) ?? url;
            var description = GetMetaTag(html, "og:description") ?? GetMetaTag(html, "description") ?? "";
            var image = GetMetaTag(html, "og:image") ?? "";

            return Ok(new { title, description, image, url });
        }
        catch
        {
            return Ok(new { title = url, description = "", image = "", url });
        }
    }

    private string? GetMetaTag(string html, string property)
    {
        var match = Regex.Match(html,
            $@"<meta[^>]*(?:property|name)=[""']{Regex.Escape(property)}[""'][^>]*content=[""']([^""']*)[""']",
            RegexOptions.IgnoreCase);
        if (match.Success) return match.Groups[1].Value;

        match = Regex.Match(html,
            $@"<meta[^>]*content=[""']([^""']*)[""'][^>]*(?:property|name)=[""']{Regex.Escape(property)}[""']",
            RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value : null;
    }

    private string? GetTitle(string html)
    {
        var match = Regex.Match(html, @"<title[^>]*>([^<]*)</title>", RegexOptions.IgnoreCase);
        return match.Success ? match.Groups[1].Value.Trim() : null;
    }
}