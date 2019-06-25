import puppeteer = require('puppeteer');

const baseUrl = "http://www.tigerdirect.com";

export async function getAllReviews(productId) {
    let data = [];
    let browser = await puppeteer.launch({ headless: true });
    let page = await browser.newPage();
    page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.169 Safari/537.36")
    
    await page.goto(baseUrl + "/applications/searchtools/item-details.asp?EdpNo=" + productId, { timeout: 60000 });
    await page.waitForSelector('.tabs');

    let reviewTab = await page.$('#reviewtab');
    if (!reviewTab) {
        return data;
    }
    await reviewTab.click();

    while (true) {
        await page.waitForSelector('#review');
        let reviewsElems = await page.$$('#review #customerReviews > #customerReviews');

        // Get reviews for current page
        await extractReviews(reviewsElems, data);

        let paginationElem = await page.$('#review #customerReviews > .reviewsPagination');
        let nextPrevLinkElems = await paginationElem.$$('.reviewPage dd > a');
        let nextPageLink: puppeteer.ElementHandle<any>;
        for (let i = 0; i < nextPrevLinkElems.length; i++) {
            let linkText = await (await nextPrevLinkElems[i].getProperty('innerText')).jsonValue();
            if (linkText && linkText.includes('Next')) {
                nextPageLink = nextPrevLinkElems[i];
                break;
            }
        }
        if (!nextPageLink) {
            break;
        }
        await nextPageLink.click();
    }

    await page.close();
    await browser.close();
    return data;
}

async function extractReviews(reviews: puppeteer.ElementHandle<any>[], data: any[]) {
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
            }
            else {
                obj.detailedRating.push({ [key]: value });
            }
        }

        //Reviewer
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
}
