
using System.Text.Json;

namespace ENOVAC.API.Services;

public class MessageCentralService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<MessageCentralService> _logger;

    public MessageCentralService(
        HttpClient httpClient,
        IConfiguration configuration,
        ILogger<MessageCentralService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    // SEND OTP
    public async Task<(bool Success, string Message, string? VerificationId)>
        SendOtpAsync(string mobileNumber)
    {
        var customerId = _configuration["MessageCentral:CustomerId"];
        var authToken = _configuration["MessageCentral:AuthToken"];

        if (string.IsNullOrWhiteSpace(customerId) ||
            string.IsNullOrWhiteSpace(authToken))
        {
            return (false, "Message Central credentials are missing.", null);
        }

        var url = "https://cpaas.messagecentral.com/verification/v3/send"
            + $"?customerId={Uri.EscapeDataString(customerId)}"
            + "&countryCode=91"
            + "&flowType=SMS"
            + $"&mobileNumber={Uri.EscapeDataString(mobileNumber)}"
            + "&otpLength=6";

        using var request = new HttpRequestMessage(HttpMethod.Post, url);

        request.Headers.Add("authToken", authToken);
        request.Headers.Add("accept", "*/*");

        var response = await _httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        _logger.LogInformation(
            "Message Central Send HTTP Status: {Status}",
            (int)response.StatusCode);

        try
        {
            using var json = JsonDocument.Parse(content);
            var root = json.RootElement;

            if (!response.IsSuccessStatusCode ||
                !root.TryGetProperty("responseCode", out var code) ||
                code.ToString() != "200")
            {
                return (false, $"OTP sending failed: {content}", null);
            }

            if (!root.TryGetProperty("data", out var data) ||
                !data.TryGetProperty("verificationId", out var verificationId))
            {
                return (false, "Verification ID missing in response.", null);
            }

            return (
                true,
                "OTP sent successfully.",
                verificationId.ToString()
            );
        }
        catch (JsonException)
        {
            return (
                false,
                $"Invalid Message Central response. HTTP {(int)response.StatusCode}: {content}",
                null
            );
        }
    }

    // VERIFY OTP

    public async Task<(bool Success, string Message)> VerifyOtpAsync(
        string verificationId,
        string otp)
    {
        var authToken = _configuration["MessageCentral:AuthToken"];
        var customerId = _configuration["MessageCentral:CustomerId"];

        if (string.IsNullOrWhiteSpace(authToken) ||
            string.IsNullOrWhiteSpace(customerId))
        {
            return (false, "Message Central credentials are missing.");
        }

        var url = "https://cpaas.messagecentral.com/verification/v3/validateOtp"
            + $"?verificationId={Uri.EscapeDataString(verificationId)}"
            + $"&code={Uri.EscapeDataString(otp)}"
            + $"&customerId={Uri.EscapeDataString(customerId)}"
            + "&countryCode=91"
            + "&flowType=SMS";

        using var request = new HttpRequestMessage(HttpMethod.Get, url);

        request.Headers.Add("authToken", authToken);
        request.Headers.Add("accept", "*/*");

        var response = await _httpClient.SendAsync(request);
        var content = await response.Content.ReadAsStringAsync();

        _logger.LogInformation(
            "Message Central Verify HTTP Status: {Status}",
            (int)response.StatusCode);

        _logger.LogInformation(
            "Message Central Verify Response: {Response}",
            content);

        if (!response.IsSuccessStatusCode)
        {
            return (false,
                $"OTP verification failed. HTTP {(int)response.StatusCode}: {content}");
        }

        try
        {
            using var json = JsonDocument.Parse(content);
            var root = json.RootElement;

            if (!root.TryGetProperty("responseCode", out var code) ||
                code.ToString() != "200")
            {
                return (false, $"OTP verification failed: {content}");
            }

            if (!root.TryGetProperty("data", out var data) ||
                !data.TryGetProperty("verificationStatus", out var status))
            {
                return (false, $"Verification status missing: {content}");
            }

            if (status.GetString() != "VERIFICATION_COMPLETED")
            {
                return (false, "OTP verification was not completed.");
            }

            return (true, "OTP verified successfully.");
        }
        catch (JsonException)
        {
            return (false, $"Invalid response: {content}");
        }
    }

}
