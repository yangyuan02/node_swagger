const request = require('request');
const fs = require('fs');
const staticPath = 'ajax';
const utils = require('./utils');
const isRef = function(key) {
  if (!key || key !== '$ref') {
    return;
  } else {
    isRef(key);
  }
};
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
      controller: params[key].post && params[key].post.tags[0] ? utils.tranformStr(params[key].post.tags[0]) : '',
      description: params[key].post && params[key].post.description ? params[key].post.description : '请后台添加接口说明'
    };
    urls.push(obj);
  }
  return urls;
};

const mergeUrl = function(data) {
  const hash = {};
  const res = [];
  data.forEach(function(item) {
    !hash[item.controller] ? (hash[item.controller] = [item]) : hash[item.controller].push(item);
  });
  for (const key in hash) {
    res.push({
      controller: key,
      urls: hash[key]
    });
  }
  return res;
};
const annotationTemp = function(params) {
  const content = `/** 
  ${params.description}
   */`;
  return content;
};
const FunContent = function(funName, type) {
  // const contents = [];
  const content = `function ${funName}() {
    fetchResource.post({type:'${type + funName}'})
  }`;
  return content;
};
const contentJs = function(data, key) {
  let content = '';
  const funcName = [];
  let type = '';
  data.forEach(item => {
    if (item.controller === key) {
      console.log(item);
      content = "import { fetchResource } from './fetchapi';\n\n";
      type = '';
      type = item.urls[0].key.substr(0, item.urls[0].key.lastIndexOf('/') + 1);
      content += `const baseUrl = '${type}';\n`;
      // item && item.urls ? (content = FunContent(item.controller)) : (content = '')
      if (item && item.urls) {
        item.urls.forEach(item => {
          let str = item.key.toString();
          funcName.push(str.substr(str.lastIndexOf('/') + 1));
          content += `${annotationTemp(item)} \n ${FunContent(str.substr(str.lastIndexOf('/') + 1), type)} \n`;
        });
      }
      content += `export { ${funcName.join(',')} }`;
    }
  });
  return content;
};
request('http://101.231.154.154:18050/v2/api-docs', (error, response, res) => {
  const data = JSON.parse(res);
  const paths = data.paths;
  const createUrlData = createUrl(paths);
  const mergeUrlData = mergeUrl(createUrlData);
  createControllerJs(data.tags).forEach(item => {
    // 创建conTroller.js
    fs.writeFileSync(`${staticPath}/${item.name}.js`, `/**${item.description}*/\n${contentJs(mergeUrlData, item.name)}`, err => {
      if (err) {
        throw err;
      }
      console.log(`${item.name}写入成功`);
    });
  });
});
