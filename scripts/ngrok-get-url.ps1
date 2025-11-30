# PowerShell script to get the current ngrok URL

try {
    $response = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -Method Get
    $httpsUrl = ($response.tunnels | Where-Object { $_.proto -eq "https" } | Select-Object -First 1).public_url
    
    if ($httpsUrl) {
        Write-Host $httpsUrl
        exit 0
    } else {
        Write-Host "No ngrok tunnel found. Start ngrok first with: ngrok http 3000" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: ngrok is not running or not accessible" -ForegroundColor Red
    exit 1
}
