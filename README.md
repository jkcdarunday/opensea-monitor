# OpenSea Monitor
A personal script that monitors OpenSea prices and notifies when the lowest price of specific collections go below a certain price threshold.

## Setup
#### Install dependencies
```shell
npm ci
```
#### Change configuration
```shell
vim index.js
```

## Usage
#### Running once
```shell
npm start
```
#### Running scheduled using cron
```shell
 */5 * * * * export DISPLAY=:0 && export XDG_RUNTIME_DIR=/run/user/$(id -u) && cd /path/to/opensea-monitor && node index.js
```
