// 引用包
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// 请求头通用配置
const headers = {
  "accept": "*/*",
  "accept-language": "zh-CN,zh;q=0.9",
  "accept-encoding": "identity",
  "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "empty",
  "sec-fetch-mode": "cors",
  "sec-fetch-site": "cross-site",
  "Origin": "https://www.bilibili.com",
  "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
};
const headersPage = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "zh-CN,zh;q=0.9",
  "accept-encoding": "gzip, deflate, br, zstd",
  "Cache-Control": "max-age=0",
  "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "same-origin",
  "Sec-Fetch-User": "?1",
  "Upgrade-Insecure-Requests": "1",
  "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
};

// 下载单个分P视频
async function downloadPage(name, url, downloadADD, cookie, partial){
  const result = await axios({
    url,
    headers: {
        ...headersPage,
        cookie,
    }
  });
  const regex = /<script>window.__playinfo__=(.*?)<\/script>/;
  const playinfo = JSON.parse(regex.exec(result.data)[1]);
  const videoPath = path.join(downloadADD, `${name}_video`);
  const audioPath = path.join(downloadADD, `${name}_audio`);
  const outputPath = path.join(downloadADD, `${name}.mp4`);
  const videoSrc = playinfo.data.dash.video[0];
  const videoUrl = [videoSrc.baseUrl, ...videoSrc.backupUrl];
  const audioSrc = playinfo.data.dash.audio[0];
  const audioUrl = [audioSrc.baseUrl, ...audioSrc.backupUrl];
  // video only
  if(partial === 0){
    const vd = await download(path.join(downloadADD, `${name}.mp4`), videoUrl, url);
    console.log(vd);
    return;
  }
  // audio only
  if(partial === 1){
    const ad = await download(path.join(downloadADD, `${name}.mp3`), audioUrl, url);
    console.log(ad);
    return;
  }

  // default
  const vd = await download(videoPath, videoUrl, url);
  console.log(vd);

  const ad = await download(audioPath, audioUrl, url);
  console.log(ad);

  console.log(`等待合并文件：${name}`);
  try {
    await exec(`ffmpeg -i "${videoPath}" -i "${audioPath}" -vcodec copy -acodec copy "${outputPath}"`);
    console.log(`文件合并完成，保存为：${outputPath}`);
  } catch (err) {
    console.log('合并文件异常');
    return;
  }
  fs.unlinkSync(videoPath, err => {console.dir(err)});
  fs.unlinkSync(audioPath, err => {console.dir(err)});
}

// url 测速并返回最快的；
async function getFasterUrl(urls, headers) {
  let fasterUrl = null;
  let fasterTime = Infinity;
  for(const url of urls){
    const controller = new AbortController();
    const timer = setTimeout(() => {controller.abort()}, 1000)
    const start = Date.now();
    try {
      await axios.head(url, {
        signal: controller.signal,
        headers,
      });
    } catch (err) {
      continue;
    }
    const end = Date.now();
    const speed = end - start;
    if(speed < fasterTime){
      fasterTime = speed;
      fasterUrl = url;
    }
    clearTimeout(timer);
  }
  if(!fasterUrl){ throw new Error ('没有测速通过的源') }
  return fasterUrl;
}

// 将资源下载到指定路径
async function download(path, urls, referer) {
  let url = await getFasterUrl(urls, {
    ...headers,
    'Referer': referer,
  });
  let retry = 0;
  while(retry < 3){
    try {
      const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
        headers: {
          ...headers, 
          'Referer': referer,
        }
      })
      const writer = fs.createWriteStream(path);

      response.data.pipe(writer);
    
      return new Promise((resolve, reject) => {
        console.log(`资源开始下载，保存为: ${path}`)
        writer.on('finish', () => {
          let msg = `资源下载完成，保存为: ${path}`
          resolve(msg);
        });
        writer.on('error', (err) => {
          let msg = `资源下载失败, 错误：${err}`
          console.dir(err);
          reject(msg);
        });
      })
    } catch (error) {      
      retry++;
      if(retry > 2){
        return `资源下载失败, 错误：${error}`;
      }
      console.log(`资源${path}下载失败，重试`);
      // console.dir(error);
    }
  }
}

// 获取分P视频名称列表
async function getList(bvid) {
  const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const result = await axios({
    url,
  });
  const pages = result.data.data.pages;
  if (pages.length == 1) {
    return [pages[0].part];
  }
  let li = [];
  for(let i = 0; i < pages.length; i++){
    li.push(`P${i+1} ${pages[i].part}`);
  }
  return li;
}

// 主函数
async function bilibiliDownloader(config) {
  const {bvid, downloadADD, start = 1, end = undefined, cookie = '', partial = undefined} = config;
  const li = await getList(bvid)
  const BaseURL = `https://www.bilibili.com/video/${bvid}`;
  if (li.length == 1){
    await downloadPage(li[0], BaseURL, downloadADD, cookie, partial);
    return;
  }
  let cnt = 0;
  for (let i = start-1; i < (end || li.length); i++) {
    const url = `${BaseURL}?p=${i+1}`;
    cnt++;
    await downloadPage(li[i], url, downloadADD, cookie, partial);
  }
  console.log(`全部视频下载完成，共下载${cnt}个`);
  return;
}

module.exports = bilibiliDownloader;