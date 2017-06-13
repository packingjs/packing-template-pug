import { existsSync } from 'fs';
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
    if (existsSync(templatePath)) {
      const context = await getContext(req, res, pageDataPath, globalDataPath);
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
