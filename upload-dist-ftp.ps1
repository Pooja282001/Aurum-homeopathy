# FTP Upload Script for Hostinger
# Uploads dist/ folder to /public_html/

$FtpHost = "ftp.aurumhomeopathy.com"
$FtpUser = "u15438479"
$FtpPass = "Aurum2025"
$LocalDir = "d:\Aurum-homeopathy\dist"
$RemoteDir = "/public_html"

Write-Host ""
Write-Host "============================================================"
Write-Host "🚀 UPLOADING TO HOSTINGER"
Write-Host "============================================================"
Write-Host ""
Write-Host "📂 Local: $LocalDir"
Write-Host "📍 Remote: $RemoteDir"
Write-Host ""

# Create FTP connection
try {
    Write-Host "🔌 Connecting to Hostinger FTP..."
    
    $FtpUrl = "ftp://$FtpHost$RemoteDir"
    $WebClient = New-Object System.Net.WebClient
    $WebClient.Credentials = New-Object System.Net.NetworkCredential($FtpUser, $FtpPass)
    
    Write-Host "✅ Connected to $FtpHost`n"
    
    # Upload index.html
    Write-Host "📤 Uploading files..."
    $IndexLocalPath = Join-Path $LocalDir "index.html"
    if (Test-Path $IndexLocalPath) {
        $WebClient.UploadFile("$FtpUrl/index.html", "STOR", $IndexLocalPath)
        Write-Host "✅ index.html uploaded"
    }
    
    # Upload all files from assets folder
    $AssetsDir = Join-Path $LocalDir "assets"
    if (Test-Path $AssetsDir) {
        Get-ChildItem $AssetsDir -Recurse -File | ForEach-Object {
            $RelativePath = $_.FullName.Substring($AssetsDir.Length).Replace("\", "/")
            $RemotePath = "$FtpUrl/assets$RelativePath"
            
            try {
                $WebClient.UploadFile($RemotePath, "STOR", $_.FullName)
                Write-Host "✅ assets$RelativePath"
            }
            catch {
                Write-Host "⚠️  Failed to upload: assets$RelativePath - $_"
            }
        }
    }
    
    Write-Host ""
    Write-Host "============================================================"
    Write-Host "✅ UPLOAD COMPLETE!"
    Write-Host "============================================================"
    Write-Host ""
    Write-Host "🌐 Visit: https://aurumhomeopathy.com/"
    Write-Host "🔄 Refresh: Press Ctrl+Shift+R (hard refresh)"
    Write-Host "⏱️  Wait 1-2 minutes for site to update"
    Write-Host ""
    
}
catch {
    Write-Host "❌ Error: $_"
    exit 1
}
