import puppeteer = require('puppeteer');

const baseUrl = "http://www.tigerdirect.com/applications/searchtools/item-details.asp?EdpNo=";

export async function getAllReviews(productId) {
    let data = [];
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    await page.goto(baseUrl + productId, { timeout: 60000 });
    await page.waitForSelector('.tabs');

    let reviewTab = await page.$('#reviewtab');
    if (!reviewTab) {
        return data;
    }
    await reviewTab.click();
    await page.waitForSelector('#review');

    let reviews = await page.$$('#review #customerReviews > #customerReviews');
    for (const review of reviews) {
        let obj: any = { detailedRating: [] };

        //Rating
        let ratingReviewerElem = await review.$('.leftCol');

        let ratingElem = await ratingReviewerElem.$('.itemReview');
        let keys = await ratingElem.$$('dt');
        let values = await ratingElem.$$('dd');
        for (let i = 0; i < keys.length; i++) {
            let key = await (await keys[i].getProperty('innerText')).jsonValue();
            let value = await (await values[i].getProperty('innerText')).jsonValue();
            if (i == 0) {
                obj[key] = value;
            } else {
                obj.detailedRating.push({ [key]: value });
            }
        }

        let reviewerElem = await ratingReviewerElem.$('.reviewer');
        let reviewerNameDate = await reviewerElem.$$('dd');
        obj.reviewerName = await (await reviewerNameDate[0].getProperty('innerText')).jsonValue();
        obj.reviewDate = await (await reviewerNameDate[1].getProperty('innerText')).jsonValue();

        // Review
        let reviewElem = await review.$('.rightCol');
        obj.heading = await reviewElem.$eval('h6', h6 => h6.innerText);
        obj.content = await reviewElem.$eval('p', p => p.innerText);
        data.push(obj);
    }

    await browser.close();
    return data;
}