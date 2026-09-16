# Hostinger FTP Upload Script
# Uploads API files and dist folder to production

$ftpHost = "ftp://46.202.161.61"
$ftpUser = "u15438479"
$ftpPass = Read-Host "Enter your FTP password" -AsSecureString
$ftpPassPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToCoTaskMemUnicode($ftpPass))

$localPath = "d:\Aurum-homeopathy"
$remotePath = "public_html"

function Upload-FileViaFTP {
    param(
        [string]$LocalFile,
        [string]$RemoteFile
    )
    
    try {
        $uri = "$ftpHost/$remotePath/$RemoteFile"
        Write-Host "⬆️  Uploading: $LocalFile → $uri"
        
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassPlain)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::UploadFile
        
        $fileStream = [System.IO.File]::OpenRead($LocalFile)
        $uploadStream = $ftpRequest.GetRequestStream()
        $fileStream.CopyTo($uploadStream)
        $uploadStream.Close()
        $fileStream.Close()
        
        $response = $ftpRequest.GetResponse()
        Write-Host "✅ Success: $RemoteFile" -ForegroundColor Green
        $response.Close()
    }
    catch {
        Write-Host "❌ Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Create-FTPDirectory {
    param([string]$DirPath)
    
    try {
        $uri = "$ftpHost/$remotePath/$DirPath"
        Write-Host "📁 Creating directory: $uri"
        
        $ftpRequest = [System.Net.FtpWebRequest]::Create($uri)
        $ftpRequest.Credentials = New-Object System.Net.NetworkCredential($ftpUser, $ftpPassPlain)
        $ftpRequest.Method = [System.Net.WebRequestMethods+Ftp]::MakeDirectory
        
        $response = $ftpRequest.GetResponse()
        Write-Host "✅ Directory created: $DirPath" -ForegroundColor Green
        $response.Close()
    }
    catch {
        $errorMsg = $_.Exception.Message
        if ($errorMsg -like "*550*") {
            Write-Host "ℹ️  Directory already exists: $DirPath"
        } else {
            Write-Host "⚠️  Error: $errorMsg"
        }
    }
}

Write-Host "`n🚀 Starting Hostinger FTP Upload..." -ForegroundColor Cyan
Write-Host "Host: $ftpHost"
Write-Host "User: $ftpUser`n"

# Step 1: Create api directory
Create-FTPDirectory "api"

# Step 2: Upload API files
Write-Host "`n📦 Uploading API files..." -ForegroundColor Yellow
Upload-FileViaFTP "$localPath\api\index.php" "api/index.php"
Upload-FileViaFTP "$localPath\api\config.php" "api/config.php"
Upload-FileViaFTP "$localPath\api\.htaccess" "api/.htaccess"
Upload-FileViaFTP "$localPath\api\diagnose.php" "api/diagnose.php"

# Step 3: Upload dist files
Write-Host "`n📦 Uploading frontend dist files..." -ForegroundColor Yellow

# Create dist directories
Create-FTPDirectory "dist"
Create-FTPDirectory "dist/assets"

# Upload index.html
Upload-FileViaFTP "$localPath\dist\index.html" "dist/index.html"

# Upload all files in dist/assets
$assetsPath = "$localPath\dist\assets"
if (Test-Path $assetsPath) {
    Get-ChildItem $assetsPath -File | ForEach-Object {
        Upload-FileViaFTP $_.FullName "dist/assets/$($_.Name)"
    }
}

Write-Host "`n✅ Upload Complete!" -ForegroundColor Green
Write-Host "`nTest endpoints:"
Write-Host "  Health check: https://aurumhomeopathy.com/api/index.php?action=health"
Write-Host "  Diagnose: https://aurumhomeopathy.com/api/diagnose.php"
Write-Host "  Frontend: https://aurumhomeopathy.com/"
