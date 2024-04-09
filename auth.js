const axios = require('axios');

const headers = {
  "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
  "accept-language": "zh-CN,zh;q=0.9",
  "cache-control": "max-age=0",
  "sec-ch-ua": "\"Google Chrome\";v=\"123\", \"Not:A-Brand\";v=\"8\", \"Chromium\";v=\"123\"",
  "sec-ch-ua-mobile": "?0",
  "sec-ch-ua-platform": "\"Windows\"",
  "sec-fetch-dest": "document",
  "sec-fetch-mode": "navigate",
  "sec-fetch-site": "none",
  "sec-fetch-user": "?1",
  "upgrade-insecure-requests": "1",
  "cookie": "buvid3=51CF7EC3-6521-B084-85A6-F47ED1B29FE923110infoc; b_nut=1696838123; CURRENT_FNVAL=4048; _uuid=107737D77-E147-CF35-D5C10-D46648CDDCD624168infoc; buvid4=83080AE5-C155-C480-0F9B-3DB77604FB8624880-023100915-6IWPbw7AywvNfqq1GqtrPw%3D%3D; rpdid=|(k||km~|~J)0J'uYmY)J)ukl; DedeUserID=405529290; DedeUserID__ckMd5=0200e9a8fdb220a8; enable_web_push=DISABLE; header_theme_version=CLOSE; home_feed_column=5; buvid_fp_plain=undefined; PVID=5; FEED_LIVE_VERSION=V8; CURRENT_QUALITY=80; fingerprint=2e7246031c4432316281fc8f8934090c; buvid_fp=2e7246031c4432316281fc8f8934090c; SESSDATA=0f60683b%2C1728028199%2C68c12%2A42CjCu14D7UVOs_SEhNnHvtnnDvAssFlURv1Am-9gEdj0X3c4VugdwX5UdTARRyRyBMnISVkJJeGVWenAyXzMxdlhTVHRFY29LTDdpSUtra0xTLVEtWTRfc2FndXJrVFAxeXZXeXFLM0FsVVBERGRQUHdpY0tTb0xOZ09YSDlvWWpwX0tpSlZDMGtBIIEC; bili_jct=e088e0a450f860208add6691f0baf083; sid=gtoxek9y; bili_ticket=eyJhbGciOiJIUzI1NiIsImtpZCI6InMwMyIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3MTI3OTk0NTYsImlhdCI6MTcxMjU0MDE5NiwicGx0IjotMX0.OKDiX1101SCB6YUYMvZvp_eZKH2aWoB4wrRZwBKAylQ; bili_ticket_expires=1712799396; bsource=search_google; b_lsid=31103F4ED_18EBD138A1E; bmg_af_switch=1; bmg_src_def_domain=i0.hdslb.com; browser_resolution=1920-232"
};

// 配置axios
axios.interceptors.request.use(config => {
  config.headers = headers;
  return config;
});

module.exports = axios;