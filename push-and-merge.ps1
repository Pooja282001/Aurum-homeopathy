# Push to dev and merge to main
Set-Location 'D:\Aurum-homeopathy'

Write-Host "=== CURRENT STATUS ===" -ForegroundColor Cyan
git status --short

Write-Host "`n=== PUSH TO DEV ===" -ForegroundColor Cyan
git push origin dev

Write-Host "`n=== CHECKOUT MAIN ===" -ForegroundColor Cyan
git checkout main

Write-Host "`n=== MERGE DEV TO MAIN ===" -ForegroundColor Cyan
git merge dev -m "Merge dev into main: Direct database queries implementation complete"

Write-Host "`n=== PUSH MAIN ===" -ForegroundColor Cyan
git push origin main

Write-Host "`n=== FINAL STATUS ===" -ForegroundColor Cyan
git log --oneline -3
git branch -a

Write-Host "`n✅ Push to dev and merge to main completed!" -ForegroundColor Green
