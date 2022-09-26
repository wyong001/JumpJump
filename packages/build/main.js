'use strict';

var path = require('path');
var fs = require('fs');

module.exports = {
  load () {
    // 当 package 被正确加载的时候执行
    Editor.Builder.on('build-finished', onBuildFinished);
  },

  unload () {
    // 当 package 被正确卸载的时候执行
  },
};

function onBuildFinished (options, callback) {
    var manifestContent = fs.readFileSync(path.join(options.project, '/build-templates/web-mobile/manifest.json'), 'utf8');
    var manifestJsonPath = path.join(options.dest, 'manifest.json');
    fs.writeFileSync(manifestJsonPath, manifestContent);
    callback();
}