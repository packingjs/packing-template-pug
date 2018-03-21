import { existsSync } from 'fs';
import { join, dirname } from 'path';
import assign from 'object-assign-deep';
import pug from 'pug';
import { getPath, getContext } from 'packing-template-util';

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
    const { templatePath, pageDataPath, globalDataPath } = getPath(req, options);
    const context = await getContext(req, res, pageDataPath, globalDataPath);
    const { template, filename } = res;
    if (template) {
      try {
        const output = pug.render(template, assign(options, context, {
          filename
        }));
        res.end(output);
      } catch (e) {
        console.log(e);
        next();
      }
    } else if (existsSync(templatePath)) {
      try {
        const output = pug.renderFile(templatePath, assign(options, context));
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
