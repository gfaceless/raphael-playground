define(['raphael','../models/areaMod'], function (Raphael,areaMod) {
    /**
     * 构造函数
     * canvasId 画布id
     * width 画布宽度
     * height 画布高度
     */
    return function (canvasId, width, height) {
        //区域id
        var areaId=0;
        //所有的区域数组
        var areaList = [];
        //生成paper 对象
        var paper = Raphael(canvasId, width, height);
        //添加默认area
        //areaList.push(new areaMod(paper,5,5,areaId++));
        return {
            //画布对象
            paper: paper,
            //添加区域
            btnOnClick: function (btnId) {
                document.getElementById(btnId).onclick = function(){
                    areaList.push(new areaMod(paper,$("#col").val(),$("#row").val(),areaId++));
                };
            },
            //返回当前数据 测试用
            getAreaList:function(){
                var areaDataList = [];
                for(var i=0;i<areaList.length;i++){
                    areaDataList.push(areaList[i].getData());
                }
                return areaDataList;
            },
            //点击按钮 写入 storage
            getDataClick:function(btnId){
                document.getElementById(btnId).onclick = function(){
                    var areaDataList = [];
                    for(var i=0;i<areaList.length;i++){
                        areaDataList.push(areaList[i].getData());
                    }
                    console.log(areaDataList);
                    localStorage.setItem("areaList", JSON.stringify(areaDataList));
                    alert("保存")
                };
            },
            //读取storage
            loadDataClick:function(btnId){
                document.getElementById(btnId).onclick = function(){
                    var areaData = localStorage.getItem("areaList")
                    var listData = JSON.parse(areaData);
                    for(var i=0;i<listData.length;i++){
                        areaList.push(new areaMod(paper,listData[i]));
                    }
                    console.log(listData);
                }
            }
        }
    }
});