# Run this script from mobile/assets/ after placing icon.png here
$src = ".\icon.png"
if (-not (Test-Path $src)) {
    Write-Error "icon.png not found! Place it in mobile/assets/ first."
    exit 1
}
Copy-Item $src ".\adaptive-icon.png" -Force
Copy-Item $src ".\splash.png" -Force
Copy-Item $src ".\favicon.png" -Force
Write-Host "Assets created successfully:" -ForegroundColor Green
Get-ChildItem . | Where-Object { $_.Extension -eq ".png" } | Format-Table Name, Length
