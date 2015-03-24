require.config({
    paths: {
        'domReady': '../lib/requirejs-domready/domReady',
        'jquery': '../lib/jquery-1.11.2/jquery.min',
        'raphael':'../lib/raphael-2.1.4/raphael',
        'free_transform':'../lib/raphael.free_transform/raphael.free_transform'
    },
    shim: {
        'free_transform': {
            deps: ['raphael']
        }
    },
    deps: [
        // kick start application... see bootstrap.js
        './app'
    ]
    ,urlArgs: "bust=" + (new Date()).getTime()  //防止读取缓存，调试用
});