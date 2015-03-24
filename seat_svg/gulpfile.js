var gulp = require('gulp');
var browserSync = require('browser-sync');
var util = require('../build/util');
var pcSrcPath = "./src";
var pcDistPath = "./dist";
var pcRemotePath = "/usr/hxj/docker/OpenResty/work/www/op/seat_svg";


//===================pc============================//
gulp.task('pc-clean',function(){
    return util.cleanDist(pcDistPath);
});
gulp.task('pc-dist',['pc-clean'],function(){
    util.htmlReplace(pcSrcPath,pcDistPath);
    util.concatCss(pcSrcPath,pcDistPath);
    util.imageMin(pcSrcPath,pcDistPath);
    util.jsDest(pcSrcPath,pcDistPath);
});
gulp.task('pc-sftp', function () {
    util.distftp(pcDistPath,pcRemotePath);
});

//=========================================================//

gulp.task('browser', function () {
    var path = "src";
    //var path = "dist";
    var files = [
        './src/*.html',
        './src/css/*.css',
        './src/js/**/*.js'
    ];
    browserSync.init(files, {
        server: {
            baseDir:'./'
        },
        port: 80,
        browser: ["firefox"],
        open: "external",
        startPath:'/'+path+'/index.html'
    });
});
