// 手动配置常量，start从1开始，表示P1，end如果为undefined表示下载到最后一个分P为止
const bvid = "BV1HV4y1a7n4";
const downloadADD = "D:\\vue2+vue3全套";
const start = 66;
const end = 75;
// 需要安装的包：
// npm i axios
// ffmpeg

// 引用包
const axios = require('./auth.js');
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const exec = promisify(require('child_process').exec);

// 下载单个分P视频
async function downloadPage(name, url){
  const result = await axios({url});
  const regex = /<script>window.__playinfo__=(.*?)<\/script>/;
  const playinfo = JSON.parse(regex.exec(result.data)[1]);
  const videoPath = path.join(downloadADD, `${name}_video`);
  const audioPath = path.join(downloadADD, `${name}_audio`);
  const outputPath = path.join(downloadADD, `${name}.mp4`);
  videoUrl = playinfo.data.dash.video[0].baseUrl;
  const vd = await download(videoPath, videoUrl);
  console.log(vd);
  audioUrl = playinfo.data.dash.audio[0].baseUrl;
  const ad = await download(audioPath, audioUrl);
  console.log(ad);
  console.log(`等待合并文件：${name}`);
  await exec(`ffmpeg -i "${videoPath}" -i "${audioPath}" -vcodec copy -acodec copy "${outputPath}"`);
  console.log(`文件合并完成，保存为：${outputPath}`);
  fs.unlinkSync(videoPath, err => {console.dir(err)});
  fs.unlinkSync(audioPath, err => {console.dir(err)});
}

// 将资源下载到指定路径
async function download(path, url) {

  let response = null;
  let retry = 0;
  
  while(retry < 3){
    try {
      response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
      })
      break;
    } catch (error) {      
      retry++;
      if(retry > 3){
        console.log(`资源下载失败, 错误：${error}`);
        return;
      }
      console.log(`资源${path}下载失败，重试`);
    }
  }

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
      reject(msg);
    });
  })
}

// 获取分P视频名称列表
async function getList() {
  const url = `https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`;
  const result = await axios({url});
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