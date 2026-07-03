using Microsoft.AspNetCore.Mvc;

namespace KreativeWhiteboard.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class StorageController : ControllerBase
{
    private readonly IConfiguration _config;

    public StorageController(IConfiguration config)
    {
        _config = config;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] IFormFile file)
    {

        if (file is null || file.Length == 0)
            return BadRequest("No file provided");

        var url = _config.GetValue<string>("Supabase:Url");
        var key = _config.GetValue<string>("Supabase:AnonKey");
        var bucket = _config.GetValue<string>("Supabase:Bucket");

        if (url is null || key is null || bucket is null)
            return StatusCode(500, "Supabase configuration missing");

        var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName)}";

        using var stream = file.OpenReadStream();
        using var content = new StreamContent(stream);
        content.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(file.ContentType);

        using var http = new HttpClient();
        http.BaseAddress = new Uri(url);
        http.DefaultRequestHeaders.Add("Authorization", $"Bearer {key}");
        http.DefaultRequestHeaders.Add("apikey", key);

        var response = await http.PostAsync(
            $"/storage/v1/object/{bucket}/{fileName}",
            content);

        if (!response.IsSuccessStatusCode)
        {
            var err = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Supabase error: {response.StatusCode} - {err}");
            return StatusCode(500, $"Upload failed: {err}");
        }

        var publicUrl = $"{url}/storage/v1/object/public/{bucket}/{fileName}";
        return Ok(new { url = publicUrl });
    }

    
    [HttpGet("config-test")]
    public IActionResult ConfigTest()
    {
        var url = _config.GetValue<string>("Supabase:Url");
        var allSupabase = _config.GetSection("Supabase").GetChildren().Select(x => $"{x.Key}={x.Value}").ToList();
        var contentRoot = Directory.GetCurrentDirectory();
        return Ok(new { url, allSupabase, contentRoot });
    }
}