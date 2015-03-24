//区域单元
define(['raphael','free_transform','./rowMod'],function(Raphael,free_transform,rowMod) {

    return function (paper,col,row,areaId) {
        //区域id
        var _areaId;
        //类型
        var type = "area";
        // 显示
        var label = "";
        //行数据
        var rowList = [];
        //option
        var opts = {
            r: 20,  //半径
            d: 20,  // inner-margin:distance between two adjacent seats
            p: 20   // padding:
        }
        //边框的大小
        opts.w = col * 2 * opts.r + opts.d * (col - 1) + 2 * opts.p;
        opts.h = row * 2 * opts.r + opts.d * (row - 1) + 2 * opts.p;
        //对象装入
        var areaData;
        if(arguments.length==2){
            areaData = arguments[1];
            opts = $.extend(opts, areaData.option || {});
        }
        //set 开始
        paper.setStart();
        //画边框
        paper.rect(0, 0, opts.w, opts.h).attr('fill', '#fff');
        //行id
        var rowId;
        //读取数据
        if(arguments.length==2){
            _areaId = areaData.id;
            //添加行数据
            for (var i = 0; i < areaData.row.length; i++) {
                rowList.push(new rowMod(paper,areaData.row[i]));
            }
        }
        //初始化数据
        else{
            _areaId = areaId;
            //添加行数据
            for (var i = 0; i < row; i++) {
                rowId = areaId+"-"+i;
                rowList.push(new rowMod(paper,rowId,i,col,opts));
            }
        }

        //finish set
        var st = paper.setFinish();
        st.info = opts;
        paper.freeTransform(st, {scale: false});
        if(arguments.length==2){
            st.freeTransform.attrs =areaData.transform;
            st.freeTransform.apply()
        }
        //返回值
        return {
            id:_areaId, //id
            type:type,  //类型
            //获取数据
            getData:function(){
                var rowData = [];
                for(var i=0;i<rowList.length;i++){
                    rowData.push(rowList[i].getData());
                }
                return {
                    id:_areaId,
                    type:type,
                    row:rowData,
                    option:opts,
                    transform:st.freeTransform.attrs
                }
            }
        };
    }
});