import puppeteer from 'puppeteer-extra';
import _ from 'lodash';

import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

export async function getBrowser() {
    return puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium',
        args: [],
    });
}

export async function search(url, browser = getBrowser()) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1366, height: 768 });

    await page.setRequestInterception(true);
    page.on('request', async req => (
        _.includes(['stylesheet', 'font', 'image'], req.resourceType())
            ? req.abort()
            : req.continue()
    ));

    console.log('Loading page...');
    await page.goto(url);

    const wiredRecords = JSON.parse(await page.evaluate(() => JSON.stringify(window.__wired__))).records;
    await page.close();

    const searchResult = _(wiredRecords).values()
        .find(wiredRecord => _.startsWith(wiredRecord.__id, 'client:root:query:search')
            && wiredRecord.__typename === 'SearchTypeConnection');

    const assets = _(searchResult.edges.__refs)
        .map(edgeId => _.get(wiredRecords, edgeId))
        .map(edge => _.get(wiredRecords, edge.node.__ref))
        .map(edgeNode => _.get(wiredRecords, edgeNode.asset.__ref))
        .map(asset => {
            const orderData = _.get(wiredRecords, asset.orderData.__ref);
            const bestAsk = _.get(wiredRecords, orderData.bestAsk.__ref);
            const paymentAssetQuantity = _.get(wiredRecords, bestAsk.paymentAssetQuantity.__ref);

            const contract = _.get(wiredRecords, asset.assetContract.__ref);

            const collection = _.get(wiredRecords, asset.collection.__ref);

            return {
                name: asset.name,
                price: paymentAssetQuantity.quantity / 1_000_000_000_000_000_000,
                collection: { name: collection.name },
                url: `https://opensea.io/assets/${contract.address}/${asset.tokenId}`,
            };
        })
        .value();

    return assets;
}
