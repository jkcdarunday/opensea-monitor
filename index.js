import { exec, spawn } from 'child_process';
import { getBrowser, search } from './opensea.js';
import _ from "lodash";

const configs = {
    lambduh_omega: {
        url: 'https://opensea.io/collection/lambduhs?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Tier&search[stringTraits][0][values][0]=Omega&search[toggles][0]=BUY_NOW',
        threshold: 0.2,
    },
    lambduh_alpha: {
        url: 'https://opensea.io/collection/lambduhs?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Tier&search[stringTraits][0][values][0]=Omega&search[stringTraits][0][values][1]=Alpha&search[toggles][0]=BUY_NOW',
        threshold: 0.05,
    },
    lambduh_beta: {
        url: 'https://opensea.io/collection/lambduhs?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Tier&search[stringTraits][0][values][0]=Omega&search[stringTraits][0][values][1]=Alpha&search[stringTraits][0][values][2]=Beta&search[toggles][0]=BUY_NOW',
        threshold: 0.02,
    },
    dailydust: {
        url: 'https://opensea.io/collection/dailydust-collection?collectionSlug=dailydust-collection&search[sortAscending]=true&search[sortBy]=PRICE&search[toggles][0]=BUY_NOW',
        threshold: 0.1,
    },
    axolittles: {
        url: 'https://opensea.io/collection/axolittles?collectionSlug=axolittles&search[sortBy]=PRICE&search[sortAscending]=true&search[toggles][0]=BUY_NOW',
        threshold: 0.1,
    },
};

const browser = await getBrowser();

// TODO: Use the async library if this grows too much to prevent getting blocked
const promises = _.map(configs, async (config, key) => {
    console.log(`Checking ${key}...`);
    const searchResults = await search(config.url, browser);

    console.log('Top results:', searchResults.splice(0, 3));

    const [asset] = searchResults;
    const { url, price } = asset;
    if (price < config.threshold) {
        console.log('Threshold triggered, sending desktop notification...');
        console.log('Asset URL:', url);
        spawn('firefox-nightly', [url], { detached: true });
        exec(`notify-send --urgency=critical --app-name="OpenSea Monitor" --icon="org.ethereum.Mist" "OpenSea NFT Asset Alert ${key}" "Filtered NFT (${asset.collection.name} / ${asset.name}) is now below price threshold (${price} ETH) [${url}]"`);
    }
});

await Promise.allSettled(promises);
browser.close();
