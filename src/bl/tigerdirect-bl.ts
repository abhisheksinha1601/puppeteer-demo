import puppeteer = require('puppeteer');
import { getNewPage } from './common';

const baseUrl = "http://www.tigerdirect.com";

export async function getAllReviews(productId) {
    let data = [];
    let page = await getNewPage();
    await page.goto(baseUrl + "/applications/searchtools/item-details.asp?EdpNo=" + productId, { timeout: 60000 });

    await page.waitForSelector('#mainC');
    if (await page.$('#st404msg')) {
        throw new Error('Invalid Product Id');
    }
    try {
        await page.waitForSelector('.tabs');        // For being sure that tabs have rendered

        let reviewTab = await page.$('#reviewtab');
        if (!reviewTab) {
            return data;        // No reviews yet
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
            await nextPageLink.click();         // Goto next page
        }

        await page.close();
    } catch (e) {
        console.log(e);
    }
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
