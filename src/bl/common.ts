import puppeteer = require('puppeteer');

let browser: puppeteer.Browser;

/**
 * - Launches a new browser instance, shuld be called only once
 */
async function launchBrowserInstance() {
    if (!browser) {
        browser = await puppeteer.launch({ headless: true, timeout: 60000 });
    }
    return browser;
}

/**
 * - Returns a new browser page with specific user agent
 */
export async function getNewPage() {
    await launchBrowserInstance();
    let page = await browser.newPage();
    page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36");
    return page;
}