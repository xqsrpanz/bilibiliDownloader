# BilibiliDownloader

A simple script to download a series videos divided to **Pages** on [bilibili.com](https://www.bilibili.com/).

It can also download single video or its audio/video only.

**It can't download compilation of videos in batchs.**

## Requirements

axios

ffmpeg

## Usage

You can easily use this script by creating an `index.js` file like this and then run `npm run start` in your CLI.

```js
const bilibiliDownloader = require("./bilibiliDownloader");

const config = {
    bvid: "... bvid of the video you want to donwload",
    downloadADD: "... path of your target folder",
    cookie: `... your own cookie on bilibili.com`,
}

bilibiliDownloader(config);
```

If you want to control the **range of pages** you want to get, config the property `start` and `end` like this.

``` js
const bilibiliDownloader = require("./bilibiliDownloader");

const config = {
    bvid: "... bvid of the video you want to donwload",
    downloadADD: "... path of your target folder",
    start: 1,	// default set to 1
    end: 5,		// default set to undefined, which represents downloading all the pages.
    cookie: `... your own cookie on bilibili.com`,
}

bilibiliDownloader(config);
```

if you want to get video without audio or get audio only, config the property `partial`.

``` js
const bilibiliDownloader = require("./bilibiliDownloader");

const config = {
    bvid: "... bvid of the video you want to donwload",
    downloadADD: "... path of your target folder",
    cookie: `... your own cookie on bilibili.com`,
    partial: 1,		// default set to undefined to get full, 0 represents video only, and 1 represents audio only
}

bilibiliDownloader(config);
```

## Parameters

All the parameters are wrapped in `config`:

| Option      | Meaning                                                      |
| ----------- | :----------------------------------------------------------- |
| bvid        | bvid of the video you want to donwload                       |
| downloadADD | path of your target folder                                   |
| start       | the start page you want to download, default set to 1        |
| end         | the last page you want to download, default set to undefined to download all |
| cookie      | your own cookie on bilibili.com, default set to ''           |
| partial     | default set to undefined to get full resource, 0 represents video only, and 1 represents audio only |

