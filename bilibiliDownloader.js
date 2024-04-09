// 手动配置常量，start从1开始，表示P1，end如果为undefined表示下载到最后一个分P为止
const bvid = "BV1HV4y1a7n4";
const downloadADD = "D:\\vue2+vue3全套";
const start = 66;
const end = 71;
const cookie = `buvid3=BCB94AE8-4069-235B-5809-CE543B437A3905969infoc; b_nut=1710061805; CURRENT_FNVAL=4048; _uuid=C6A6FB21-D1028-DA1C-8254-16A9ADE28B6486402infoc; buvid4=C7153E06-AC24-086C-7B24-69FCBAB0D2F906866-024031009-h5Ft%2Fs0PjKMrCt1aoYpdYA%3D%3D; rpdid=|(RlRkl~))R0J'u~u||Yu)|m; DedeUserID=405529290; DedeUserID__ckMd5=0200e9a8fdb220a8; CURRENT_QUALITY=80; enable_web_push=DISABLE; FEED_LIVE_VERSION=V8; header_theme_version=CLOSE; home_feed_column=5; PVID=1; buvid_fp_plain=undefined; hit-dyn-v2=1; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTI3NjIwNTQsImlhdCI6MTcxMjUwMjc5NCwicGx0IjotMX0.BaYd8F-93n7JF1uDAT2Pwbogrbhx35cuv9Z0n7wHTOo; bili_ticket_expires=1712761994; SESSDATA=ae279ae2%2C1728139803%2Cc0995%2A42CjC2lnH0Z3wBkQs3pRZFayNdTdCxNTRsR8wnGWL2bHMkajxpBa_UxU-jHj8fwMBGQxESVlRQZG9OMFN6YkhkbjQ4MnU3R25FX0hGQndGQmh2RDJsd0dYNUhtb2Y0VEpxb2FTRkozUlNjLXozM0pLNVdYWGJ2UDBzbnUxeV9xNFhuaDFpbXlmUER3IIEC; bili_jct=f50e6754a000b2f0dc73a6fa9f27bcc2; fingerprint=94bbf71890666cb0573375bb79c54bf7; buvid_fp=94bbf71890666cb0573375bb79c54bf7; bp_video_offset_405529290=918376776564998161; b_lsid=52FA2857_18EC312AAD2; bmg_af_switch=1; bmg_src_def_domain=i1.hdslb.com; browser_resolution=1707-150`;

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
async function downloadPage(name, url){
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
  videoUrl = playinfo.data.dash.video[0].baseUrl;
  const vd = await download(videoPath, videoUrl, url);
  console.log(vd);
  audioUrl = playinfo.data.dash.audio[0].baseUrl;
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

// 将资源下载到指定路径
async function download(path, url, referer) {
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
async function getList() {
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
async function main() {
  const li = await getList()
  const BaseURL = `https://www.bilibili.com/video/${bvid}`;
  if (li.length == 1){
    await downloadPage(li[0], BaseURL);
    return;
  }
  let cnt = 0;
  for (let i = start-1; i < (end || li.length); i++) {
    const url = `${BaseURL}?p=${i+1}`;
    cnt++;
    await downloadPage(li[i], url);
  }
  console.log(`全部视频下载完成，共下载${cnt}个`);
  return;
}

main();