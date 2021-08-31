import puppeteer from 'puppeteer-extra';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import sleep from 'sleep';

puppeteer.use(StealthPlugin());

export async function search(url) {
    const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    const dataPromise = new Promise((resolve, reject) => {
        page.on('response', async response => {
            try {
                const request = response.request();
                if (request.url().includes('/graphql')
                    && request.method() === 'POST'
                    && request.postData().includes('AssetSearchQuery')) {
                    const json = await response.json();
                    resolve(json.data.query.search.edges.slice(0, 3)
                        .map(asset => asset.node.asset));
                }
            } catch (error) {
                reject(error);
            }
        });
    });

    console.log('Loading page...');
    await page.goto(url);
    sleep.sleep(1);

    console.log('Toggling "Buy Now"...');
    const [buyNowButton] = await page.$x("//div[contains(@class, 'FeaturedFilter--items')]/div[@class='FeaturedFilter--item' and contains(., 'Buy Now')]");
    await buyNowButton.click();

    console.log('Awaiting response...');
    const response = await dataPromise;
    await browser.close();

    console.log(`Data loaded (size: ${response.length})`);
    return response;
}

export function extractAsset(asset) {
    return {
        price: asset.orderData.bestAsk.paymentAssetQuantity.quantity / 1000000000000000000,
        url: `https://opensea.io/assets/${asset.assetContract.address}/${asset.tokenId}`,
    };
}

export function extractPrice(asset) {
    return asset.orderData.bestAsk.paymentAssetQuantity.quantity / 1000000000000000000;
}
