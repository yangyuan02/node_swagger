const request = require("request");
const fs = require("fs");
const staticPath = "ajax";
const utils = require("./utils");
const isRef = function (key) {
  if (!key || key !== '$ref') {
    return;
  } else {
    isRef(key)
  }
}
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
          : "",
      description:params[key].post && params[key].post.description ? params[key].post.description : '请后台添加接口说明'

    };
    urls.push(obj);
  }
  return urls;
};

const mergeUrl = function(data) {
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
const annotationTemp = function (params) {
  const content =
  `/** 
  ${params.description}
   */`;
  return content
}
const FunContent = function (funName) {
  // const contents = [];
  const content = `function ${funName}() {
    
  }`;
  return content
}
const contentJs = function (data, key) {    
    let content = '';
    data.forEach(item => {
        if (item.controller === key) {
          console.log(item)
          content = `const baseUrl = '${item.urls[0].key.substr(0, item.urls[0].key.lastIndexOf('/')+1)}';\n`
            // item && item.urls ? (content = FunContent(item.controller)) : (content = '')
            if (item && item.urls) {
              item.urls.forEach(item => {
                let str = item.key.toString()
                content += `${annotationTemp(item)} \n ${FunContent(str.substr(str.lastIndexOf('/')+1))} \n`;
              })
            }
        };
    })
    return content
}
request("http://192.168.1.43:9101/v2/api-docs", (error, response, res) => {
  const data = JSON.parse(res);
  const paths = data.paths;
  const createUrlData = createUrl(paths);
  const mergeUrlData = mergeUrl(createUrlData);
  createControllerJs(data.tags).forEach(item => { // 创建conTroller.js
      fs.writeFileSync(`${staticPath}/${item.name}.js`, `/**${item.description}*/\n${contentJs(mergeUrlData,item.name)}`, err => {
          if (err) {
              throw err
          }
          console.log(`${item.name}写入成功`)
      })
  });
});
