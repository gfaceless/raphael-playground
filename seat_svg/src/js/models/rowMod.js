//行单元单元
define(['raphael','./unitsMod'],function(raphael,unitsMod) {

    return function(paper,rowId,rowNum,col,opts){
        //行id
        var _rowId = rowId;
        //类型
        var type = "row";
        //显示标签
        var label = "";
        //单元数据
        var unitsList = [];
        //相对坐标
        var cx,cy;
        //单元id
        var unitsId;
        //装在数据
        var unistsData;
        if(arguments.length==2){
            unistsData = arguments[1];
            for (var j = 0; j < unistsData.units.length; j++) {
                unitsList.push(new unitsMod(paper,unistsData.units[j].id,unistsData.units[j].cx, unistsData.units[j].cy, unistsData.units[j].r));
            }
        }else{
            cy = rowNum * (opts.r * 2 + opts.d) + opts.r + opts.p
            for (var j = 0; j < col; j++) {
                cx = j * (opts.r * 2 + opts.d) + opts.r + opts.p
                unitsId = rowId+":"+j;
                unitsList.push(new unitsMod(paper,unitsId,cx, cy, opts.r));
            }
        }


        return {
            id:_rowId, //id
            type:type,  //类型
            //获取数据
            getData:function(){
                var unitsData = [];
                for(var i=0;i<unitsList.length;i++){
                    unitsData.push(unitsList[i].getData());
                }
                return {
                    id:_rowId,
                    type:type,
                    units:unitsData
                }
            }
        };
    }
});