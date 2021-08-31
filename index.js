import { exec, spawn } from 'child_process';
import { search, extractAsset } from './opensea.js';

const configs = {
    lambduh_alpha: {
        url: 'https://opensea.io/collection/lambduhs?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Tier&search[stringTraits][0][values][0]=Omega&search[stringTraits][0][values][1]=Alpha',
        threshold: 0.1
    },
    lambduh_beta: {
        url: 'https://opensea.io/collection/lambduhs?search[sortAscending]=true&search[sortBy]=PRICE&search[stringTraits][0][name]=Tier&search[stringTraits][0][values][0]=Omega&search[stringTraits][0][values][1]=Alpha&search[stringTraits][0][values][2]=Beta',
        threshold: 0.03
    }
}

for (const key in configs) {
    console.log(`Checking ${key}...`);
    const config = configs[key];
    const searchResults = await search(config.url);

    console.log('Top results:', searchResults.map(extractAsset));

    const [asset] = searchResults;
    const { url, price } = extractAsset(asset);
    if (price < config.threshold) {
        console.log('Threshold triggered, sending desktop notification...')
        console.log('Asset URL:', url);
        spawn('firefox-nightly', [url], { detached: true });
        exec(`notify-send --urgency=critical --app-name="OpenSea Monitor" --icon="org.ethereum.Mist" "OpenSea NFT Asset Alert ${key}" "Filtered NFT (${asset.collection.name} / ${asset.name}) is now below price threshold (${price} ETH) [${url}]"`);
    }
}
