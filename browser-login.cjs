const { chromium } = require('playwright');
(async()=>{
 const browser=await chromium.launch({headless:true});
 const page=await browser.newPage({viewport:{width:1440,height:1000}, deviceScaleFactor:1});
 await page.goto('http://localhost:5173',{waitUntil:'networkidle'});
 await page.locator('input[type="email"], input[name="email"]').first().fill('superadmin@test.com');
 await page.locator('input[type="password"], input[name="password"]').first().fill('super123');
 await page.getByRole('button',{name:/sign in/i}).click();
 await page.waitForLoadState('networkidle');
 await page.waitForTimeout(1500);
 await page.screenshot({path:'admin-dashboard.png',fullPage:true});
 console.log('URL='+page.url()); console.log('TITLE='+await page.title()); console.log('SCREENSHOT=admin-dashboard.png');
 await browser.close();
})().catch(e=>{console.error(e);process.exit(1)});
