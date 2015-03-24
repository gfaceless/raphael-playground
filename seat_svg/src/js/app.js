//当DOM结构加载完成后
/**
 * bootstraps angular onto the window.document node
 */
define(['jquery','domReady','raphael','./controllers/mainCtrl'], function($, domReady,Raphael,mainCtrl) {
    require(['domReady!'], function (document) {
        var main = mainCtrl("canvas", 640, 480);
        console.log(main.getAreaList());
        main.btnOnClick("run");
        main.getDataClick("getdata");
        main.loadDataClick("loaddata");
    });
});