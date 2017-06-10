var fs = require('fs');
var path = require('path');
var url = require('url');
var util = require('util');
var assign = require('object-assign-deep');
var clearRequire = require('clear-require');
var pug = require('pug');

module.exports = function(options) {
  options = assign({
    encoding: 'utf-8',
    extension: '.pug',
    templates: '.',
    mockData: '.',
    globalData: '__global.js',
    rewriteRules: {},
    pretty: false // 是否输出带缩进格式的html
  }, options);
  return async (req, res, next) => {
    var urlObject = url.parse(req.url);
    var pathname = options.rewriteRules[urlObject.pathname] || urlObject.pathname;
    var templateAbsPath = path.resolve(path.join(options.templates, pathname));
    var dataAbsPath = path.resolve(path.join(options.mockData, pathname.replace(options.extension, '.js')));
    var globalDataPath = path.resolve(path.join(options.mockData, options.globalData));
    if (fs.existsSync(templateAbsPath)) {
      var globalContext = {};
      if (fs.existsSync(globalDataPath)) {
        var gcontext = require(globalDataPath);
        if (util.isFunction(gcontext)) {
          globalContext = gcontext(req, res);
          if (globalContext instanceof Promise) {
            await globalContext.then((data) => {
              globalContext = data;
            }, (error) => {
              console.error(error);
            });
          }
        } else {
          globalContext = gcontext;
        }
      }
      var pageContext = {};
      if (fs.existsSync(dataAbsPath)) {
        var pcontext = require(dataAbsPath);
        if (util.isFunction(pcontext)) {
          pageContext = pcontext(req, res);
          if (pageContext instanceof Promise) {
            await pageContext.then((data) => {
              pageContext = data;
            }, (error) => {
              console.error(error);
            });
          }
        } else {
          pageContext = pcontext;
        }
      }
      try {
        var output = pug.renderFile(templateAbsPath, assign(options, globalContext, pageContext));
        res.end(output);
      } catch (e) {
        console.log(e);
        next();
      }
    } else {
      next();
    }
  };
};
