export async function onRequestPost({ request }) {
  const { text, pms } = await request.json();
  const body = `接下来的回答请使用中文，我的问题是：${text}`
  const res = await fetch("https://yesnotarot.org/", {
    "headers": {
      ...request.headers,
      "accept": "text/x-component",
      "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,es;q=0.7,ja;q=0.6,fr;q=0.5,id;q=0.4,ar;q=0.3,hi;q=0.2,ko;q=0.1,th;q=0.1,fil;q=0.1,vi;q=0.1,ru;q=0.1,zh-TW;q=0.1",
      "content-type": "text/plain;charset=UTF-8",
      "next-action": "c24aaf341eb96d9ae49d7f969287623fd7998239",
      "next-router-state-tree": "%5B%22%22%2C%7B%22children%22%3A%5B%5B%22locale%22%2C%22zh%22%2C%22d%22%5D%2C%7B%22children%22%3A%5B%22__PAGE__%3F%7B%5C%22locale%5C%22%3A%5C%22zh%5C%22%7D%22%2C%7B%7D%5D%7D%5D%7D%2Cnull%2Cnull%2Ctrue%5D",
      "priority": "u=1, i",
      "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": "\"Windows\"",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "Referer": "https://yesnotarot.org/",
      "Referrer-Policy": "strict-origin-when-cross-origin"
    },
    "body": `["${body}",${JSON.stringify(pms)}]`,
    "method": "POST"
  });
  const JSON_TEXT = await res.text();
  // 正则表达式: 匹配数字后面的内容，直到换行符
  const regex = /^(\d+):([^\n]+)/gm;
  // 用正则提取匹配的内容
  const RES_ARR = []
  let TEMP_JSON = {};
  let match;
  while ((match = regex.exec(JSON_TEXT)) !== null) {
    TEMP_JSON = JSON.parse(match[2])
    TEMP_JSON = String(TEMP_JSON.diff ? TEMP_JSON.diff[1] : TEMP_JSON.curr || '')
    // eslint-disable-next-line @typescript-eslint/no-unused-expressions
    TEMP_JSON && RES_ARR.push(TEMP_JSON)
  }
  return new Response(RES_ARR.join(''));
}
