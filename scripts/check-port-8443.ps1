# Check what's using port 8443
# Usage: .\scripts\check-port-8443.ps1

Write-Host "🔍 Checking port 8443 usage..." -ForegroundColor Cyan
Write-Host ""

# Check if running in WSL
if ($env:WSL_DISTRO_NAME) {
    Write-Host "Running in WSL: $env:WSL_DISTRO_NAME" -ForegroundColor Yellow
    Write-Host ""
    
    # Use WSL commands
    Write-Host "Process details:" -ForegroundColor Green
    wsl ss -tlnp | Select-String ":8443"
    
    Write-Host ""
    Write-Host "Full process information:" -ForegroundColor Green
    wsl ps aux | Select-String "sw-cp-serverd"
    
    Write-Host ""
    Write-Host "Service status:" -ForegroundColor Green
    wsl systemctl status sw-cp-serverd 2>&1 | Select-Object -First 20
    
    Write-Host ""
    Write-Host "Package information:" -ForegroundColor Green
    wsl dpkg -l | Select-String "plesk\|siteworx" -CaseSensitive:$false
    
} else {
    Write-Host "Not in WSL - checking local system..." -ForegroundColor Yellow
    Write-Host ""
    
    # Windows netstat
    Write-Host "Port 8443 listeners:" -ForegroundColor Green
    netstat -ano | Select-String ":8443"
}

Write-Host ""
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "  Port 8443 Information" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Port 8443 is typically used by:" -ForegroundColor White
Write-Host "  • Plesk Control Panel (sw-cp-serverd)" -ForegroundColor Yellow
Write-Host "  • SiteWorx Control Panel" -ForegroundColor Yellow
Write-Host "  • Alternative HTTPS port (non-standard)" -ForegroundColor Yellow
Write-Host ""
Write-Host "sw-cp-serverd is the Plesk/SiteWorx control panel daemon." -ForegroundColor White
Write-Host "It provides the web-based hosting control panel interface." -ForegroundColor White
Write-Host ""
Write-Host "If you need to:" -ForegroundColor Cyan
Write-Host "  • Access Plesk: https://your-server-ip:8443" -ForegroundColor White
Write-Host "  • Stop it: sudo systemctl stop sw-cp-serverd" -ForegroundColor White
Write-Host "  • Disable it: sudo systemctl disable sw-cp-serverd" -ForegroundColor White
Write-Host "  • Check config: /etc/sw-cp-server/ or /usr/local/psa/" -ForegroundColor White
Write-Host ""

