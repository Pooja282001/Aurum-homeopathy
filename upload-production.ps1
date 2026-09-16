# PowerShell FTP Upload Script for Aurum Homeopathy

$ftpServer = "ftp.aurumhomeopathy.com"
$ftpUser = "u15438479"
$ftpPassword = "Aurum2025"
$ftpUploadPath = "/public_html"
$localDistPath = "d:\Aurum-homeopathy\dist"

Write-Host "╔═════════════════════════════════════════╗"
Write-Host "║   FTP UPLOAD TO PRODUCTION              ║"
Write-Host "╚═════════════════════════════════════════╝`n"

Write-Host "🔌 FTP Server: $ftpServer"
Write-Host "📂 Local Path: $localDistPath"
Write-Host "📤 Upload Path: $ftpUploadPath`n"

# Function to upload via FTP
function Upload-FileViaFTP {
    param(
        [string]$FilePath,
        [string]$FileName,
        [string]$FTPUrl
    )
    
    $credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassword)
    $ftpRequest = [System.Net.FtpWebRequest]::Create($FTPUrl)
    $ftpRequest.Credentials = $credentials
    $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
    
    $fileContent = [System.IO.File]::ReadAllBytes($FilePath)
    $ftpRequest.ContentLength = $fileContent.Length
    
    $requestStream = $ftpRequest.GetRequestStream()
    $requestStream.Write($fileContent, 0, $fileContent.Length)
    $requestStream.Close()
    
    $response = $ftpRequest.GetResponse()
    Write-Host "✅ Uploaded: $FileName (Status: $($response.StatusCode))"
    $response.Close()
}

# Upload index.html
Write-Host "📝 Uploading HTML files..."
$htmlFiles = Get-ChildItem -Path $localDistPath -Filter "*.html" -File
foreach ($file in $htmlFiles) {
    $ftpUrl = "ftp://${ftpServer}${ftpUploadPath}/$($file.Name)"
    Upload-FileViaFTP -FilePath $file.FullName -FileName $file.Name -FTPUrl $ftpUrl
}

# Upload all files from assets
Write-Host "`n📦 Uploading assets..."
$assetsPath = Join-Path $localDistPath "assets"
if (Test-Path $assetsPath) {
    $assetFiles = Get-ChildItem -Path $assetsPath -Recurse -File
    foreach ($file in $assetFiles) {
        $relativePath = $file.FullName.Replace($localDistPath, "").Replace("\", "/")
        $ftpUrl = "ftp://${ftpServer}${ftpUploadPath}$relativePath"
        Upload-FileViaFTP -FilePath $file.FullName -FileName $file.Name -FTPUrl $ftpUrl
    }
}

Write-Host "`n✅ FTP upload complete!"
Write-Host "🌐 Visit https://aurumhomeopathy.com/ to verify deployment`n"
