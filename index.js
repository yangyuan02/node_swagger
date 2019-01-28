const request = require("request");
const fs = require("fs");
const staticPath = "ajax";
const utils = require("./utils");
const createControllerJs = function(res) {
  const data = res.map(item => {
    item.name = utils.tranformStr(item.name);
    return item;
  });
  return data;
};

const createUrl = function(params) {
  const urls = [];
  for (const key in params) {
    const obj = {
      key,
      controller:
        params[key].post && params[key].post.tags[0]
          ? utils.tranformStr(params[key].post.tags[0])
          : ""

    };
    urls.push(obj);
  }
  return urls;
};

const mergeUrl = function(params) {
  const data = createUrl(params);
  const hash = {};
  const res = [];
  data.forEach(function(item) {
    !hash[item.controller]
      ? (hash[item.controller] = [item])
      : hash[item.controller].push(item);
  });
  for (const key in hash) {
    res.push({
      controller: key,
      urls: hash[key]
    });
  }
  return res;
};

const contentJs = function (params, key) {
    console.log(params)
    const data = mergeUrl(params);
    
    let content = '';
    data.forEach(item => {
        if (item.controller === key) {
            content = item && item.urls ? JSON.stringify(item.urls): ''
        };
    })
    return content
}
request("http://101.231.154.154:18050/v2/api-docs", (error, response, res) => {
  const data = JSON.parse(res);
  const paths = data.paths;
  createControllerJs(data.tags).forEach(item => { // 创建conTroller.js
      fs.writeFileSync(`${staticPath}/${item.name}.js`, `${JSON.stringify(contentJs(paths,item.name))}`, err => {
          if (err) {
              throw err
          }
          console.log(`${item.name}写入成功`)
      })
  });
});
