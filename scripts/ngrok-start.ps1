# PowerShell script to start ngrok and display setup instructions
# Usage: npm run ngrok (or manually run this script)

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  ngrok Setup for Instagram Development" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting ngrok tunnel on port 3000..." -ForegroundColor Yellow
Write-Host ""
Write-Host "After ngrok starts, you'll see a URL like: https://abc123.ngrok-free.app" -ForegroundColor White
Write-Host ""
Write-Host "Then you need to:" -ForegroundColor Cyan
Write-Host "1. Copy the HTTPS URL from ngrok" -ForegroundColor White
Write-Host "2. Update .env.local: NEXT_PUBLIC_SITE_URL=<ngrok-url>" -ForegroundColor White
Write-Host "3. Update Facebook App redirect URI to: <ngrok-url>/api/social/callback/instagram" -ForegroundColor White
Write-Host "4. Restart your Next.js dev server" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop ngrok" -ForegroundColor Gray
Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""

# Start ngrok - it will display in this terminal
& ngrok http 3000
