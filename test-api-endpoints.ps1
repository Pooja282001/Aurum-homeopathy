# Test System Status API Endpoints

$apiUrl = "http://localhost:3001"

function Test-API {
    param([string]$endpoint, [string]$method = "GET", [object]$body = $null)
    
    try {
        $uri = "$apiUrl$endpoint"
        
        $params = @{
            Uri = $uri
            Method = $method
            ContentType = "application/json"
            UseBasicParsing = $true
            ErrorAction = "Stop"
        }
        
        if ($body) {
            $params.Body = $body | ConvertTo-Json
        }
        
        $response = Invoke-WebRequest @params
        return @{
            Success = $true
            StatusCode = $response.StatusCode
            Content = $response.Content | ConvertFrom-Json
        }
    } catch {
        return @{
            Success = $false
            Error = $_.Exception.Message
            StatusCode = $_.Exception.Response.StatusCode
        }
    }
}

Write-Host "`n" + "="*70 -ForegroundColor Cyan
Write-Host "  API ENDPOINT TESTS" -ForegroundColor Cyan
Write-Host "="*70 -ForegroundColor Cyan

# Test 1: Health check
Write-Host "`nTEST 1: GET /health" -ForegroundColor Yellow
$result = Test-API "/health"
if ($result.Success) {
    Write-Host "✅ Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($result.Content | ConvertTo-Json)"
} else {
    Write-Host "❌ Failed: $($result.Error)" -ForegroundColor Red
}

# Test 2: Get system status
Write-Host "`nTEST 2: GET /system-status" -ForegroundColor Yellow
$result = Test-API "/system-status"
if ($result.Success) {
    Write-Host "✅ Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response:"
    Write-Host "  - isOnline: $($result.Content.isOnline)"
    Write-Host "  - maintenanceMode: $($result.Content.maintenanceMode)"
    Write-Host "  - comment: '$($result.Content.comment)'"
} else {
    Write-Host "❌ Failed: $($result.Error)" -ForegroundColor Red
}

# Test 3: Update system status (offline)
Write-Host "`nTEST 3: PUT /system-status (Toggle Offline)" -ForegroundColor Yellow
$updateBody = @{
    isOnline = $false
    maintenanceMode = $false
    comment = "Test: Database backup in progress. ETA: 30 minutes"
    userId = 1
}
$result = Test-API "/system-status" "PUT" $updateBody
if ($result.Success) {
    Write-Host "✅ Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response:"
    Write-Host "  - isOnline: $($result.Content.isOnline)"
    Write-Host "  - comment: '$($result.Content.comment)'"
} else {
    Write-Host "❌ Failed: $($result.Error)" -ForegroundColor Red
}

# Test 4: Verify database update
Write-Host "`nTEST 4: GET /system-status (Verify Update)" -ForegroundColor Yellow
Start-Sleep -Milliseconds 500
$result = Test-API "/system-status"
if ($result.Success) {
    Write-Host "✅ Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response:"
    Write-Host "  - isOnline: $($result.Content.isOnline)" -ForegroundColor $(if ($result.Content.isOnline) { "Red" } else { "Green" })
    Write-Host "  - comment: '$($result.Content.comment)'"
} else {
    Write-Host "❌ Failed: $($result.Error)" -ForegroundColor Red
}

# Test 5: Update to maintenance mode
Write-Host "`nTEST 5: PUT /system-status (Enable Maintenance)" -ForegroundColor Yellow
$updateBody = @{
    isOnline = $true
    maintenanceMode = $true
    comment = "Test: Server maintenance in progress. ETA: 15 minutes"
    userId = 1
}
$result = Test-API "/system-status" "PUT" $updateBody
if ($result.Success) {
    Write-Host "✅ Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response:"
    Write-Host "  - isOnline: $($result.Content.isOnline)"
    Write-Host "  - maintenanceMode: $($result.Content.maintenanceMode)"
    Write-Host "  - comment: '$($result.Content.comment)'"
} else {
    Write-Host "❌ Failed: $($result.Error)" -ForegroundColor Red
}

# Test 6: Return to online
Write-Host "`nTEST 6: PUT /system-status (Return to Online)" -ForegroundColor Yellow
$updateBody = @{
    isOnline = $true
    maintenanceMode = $false
    comment = ""
    userId = 1
}
$result = Test-API "/system-status" "PUT" $updateBody
if ($result.Success) {
    Write-Host "✅ Success (Status: $($result.StatusCode))" -ForegroundColor Green
    Write-Host "Response:"
    Write-Host "  - isOnline: $($result.Content.isOnline)" -ForegroundColor Green
    Write-Host "  - maintenanceMode: $($result.Content.maintenanceMode)"
    Write-Host "  - comment: '$($result.Content.comment)'"
} else {
    Write-Host "❌ Failed: $($result.Error)" -ForegroundColor Red
}

Write-Host "`n" + "="*70 -ForegroundColor Cyan
Write-Host "  TESTS COMPLETE" -ForegroundColor Cyan
Write-Host "="*70 -ForegroundColor Cyan + "`n"
