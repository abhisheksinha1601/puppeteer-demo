import puppeteer = require('puppeteer');

const baseUrl = "http://www.tigerdirect.com/applications/searchtools/item-details.asp?EdpNo=";

export async function getAllReviews(productId) {
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    await page.goto(baseUrl + productId);
    await page.waitForSelector('.tabs');

    let reviewTab = await page.$('#reviewtab');
    if (!reviewTab) {
        return [];
    }
    await reviewTab.click();
    await page.waitForSelector('#review');

    let reviews = await page.$$('#review #customerReviews > #customerReviews');
    for (const review of reviews) {
        let ratingElem = review.$('leftCol');
        
    }

    await browser.close();
    return true;
}