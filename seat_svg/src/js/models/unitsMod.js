//座位的最小单元
define(function() {
    Raphael.el.seatStyle = function(selected) {
        return this.attr({
            fill: selected ? "#c21" : '#fff',
            stroke: "#333"
        })
    }
    return function(paper,unitsId,cx, cy,r){
        //单元id
        var _unitsId = unitsId;
        //类型
        var type= "units"
        //cx
        var _cx = cx;
        //cy
        var _cy = cy;
        //半径
        var _r =r;

        paper.circle(_cx, _cy, _r).seatStyle().click(function() {
            this.data('selected', !this.data('selected'));
            this.seatStyle(this.data('selected'));
        });
        return {
            id:_unitsId, //id
            type:type,  //类型
            //获取数据
            getData:function(){
                return {
                    id:_unitsId,
                    type:type,
                    cx:_cx,
                    cy:_cy,
                    r:_r
                }
            }
        };
    }
});