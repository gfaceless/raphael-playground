var paper = Raphael(document.querySelector('.container'), 1000, 1000);




Raphael.fn.pannable = function() {
	var paper = this;

	var w = paper.width;
	var h = paper.height;

	paper.rect(-10000,-10000, w*100, h*100)
	.attr({"fill": "#f00", "fill-opacity": .2, cursor: "move"})
	.drag(onmove, onstart, onend)


	var _tmpViewBox;
	// 我本来想扩展，但发现Raphael本身有_viewBox属性，就用他的了。
	// _viewBox属性很重要，若干viewport有关的扩展方法需依赖其同步状态。
	// 注意：只有在setViewBox called之后该属性才会有值
	paper._viewBox = paper._viewBox || [0, 0, w, h];
	function onmove (dx, dy) {
		// TODO: throttle it?
		
		paper.setViewBox(_tmpViewBox.x-dx, _tmpViewBox.y-dy, _tmpViewBox.w, _tmpViewBox.h);

	
	}
	function onstart () {
		
		var vb = paper._viewBox;
		// when start, make a snapshot of viewBox. will be used by `onmove`
		_tmpViewBox = {
			x:vb[0],
			y:vb[1],
			w:vb[2],
			h:vb[3]
		}
	}
	function onend (e) {

	}
	return this;
}

// eventbrite的zoom也不专业。没有取得用户鼠标的位置，只以画布中心做为zoom基准
// 并不是我们平常期待的zoom (also it has no animation)
// for now, we do the same

Raphael.fn.zoomify = function() {
	var paper = this;

	// zoom比例。可以理解为每次zoom out, viewBox将缩小为原来的0.9倍
	var ratio = .9;
	

	paper._viewBox = paper._viewBox || [0, 0, paper.width, paper.height];

	$(paper.canvas).mousewheel (function(e) {
			e.preventDefault();
			var vb = paper._viewBox;
			var x = vb[0], y=vb[1], w=vb[2], h=vb[3]
			
			var _ratio =  e.deltaY > 0 ? ratio : 1/ratio;
			
			var _vb =  {
				x: x + (1- _ratio) * w / 2,
				y: y + (1- _ratio) * h / 2,
				w:  _ratio * w,
				h:  _ratio * h
			}
			
			paper.setViewBox( _vb.x, _vb.y, _vb.w, _vb.h);
		
	})

}


paper.pannable().zoomify();


var defaults = {
    r: 20,
    // inner-margin:
    // distance between two adjacent seats 
    d: 20,
    // padding:
    p: 20
}

Raphael.el.seatStyle = function(selected) {
    return this.attr({
        fill: selected ? "#c21" : '#fff',
        stroke: "#333"
    })
}


var generateId = (function() {
    var i = 0;
    return function() {
        return "id" + i++;
    }
})();

// TODO: move it to a single file
var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

function generateLabel(id) {
    if (!id) throw new Error("should have id");
    generateLabel[id] = generateLabel[id] || 0;
    return letters[generateLabel[id]++];
}

function createSection(row, col, opts) {
    // how I miss lodash.defaults
    opts = $.extend({}, defaults, opts || {});

    a = opts;
    var cx, cy;
    var r = opts.r,
        dist = opts.d,
        p = opts.p;

    var w = col * 2 * r + dist * (col - 1) + 2 * p;
    var h = row * 2 * r + dist * (row - 1) + 2 * p;
    var id = generateId();
    paper.setStart();


    for (var i = 0; i < row; i++) {

        cy = i * (r * 2 + dist) + r + p
        paper.text(-dist - r + p, cy, generateLabel(id));


        for (var j = 0; j < col; j++) {

            cx = j * (r * 2 + dist) + r + p
                // TODO: use event delegation (maybe)
            paper.circle(cx, cy, r).seatStyle().click(function() {

                this.data('selected', !this.data('selected'))
                this.seatStyle(this.data('selected'))
            });

            paper.text(cx, cy, j + 1);
        }
    }
    // this is the area that recieve all the events
    // a workaround?
    var pathStr = Raphael.format("M 0 0h{0}v{1}h{2}z", w, h, -w);
    paper.path(pathStr).attr({
        'cursor': 'move',
        'fill': '#fff',
        "fill-opacity": 0,
        stroke: "#ccc"
    });

    var st = paper.setFinish();
    opts.w = w;
    opts.h = h;
    opts.col = col
    opts.row = row

    st.info = opts;
    paper.freeTransform(st, {
        scale: false
    });
    return st;
}

// get set's transform as an array(or string?)
function getSetFT(st) {

    var ft = st.freeTransform;
    if (!ft) return [];

    var
        center = {
            x: ft.attrs.center.x + ft.offset.translate.x,
            y: ft.attrs.center.y + ft.offset.translate.y
        },
        rotate = ft.attrs.rotate - ft.offset.rotate,
        scale = {
            x: ft.attrs.scale.x / ft.offset.scale.x,
            y: ft.attrs.scale.y / ft.offset.scale.y
        },
        translate = {
            x: ft.attrs.translate.x - ft.offset.translate.x,
            y: ft.attrs.translate.y - ft.offset.translate.y
        };

    return [
        'R', rotate, center.x, center.y,
        'S', scale.x, scale.y, center.x, center.y,
        'T', translate.x, translate.y
    ];

}

/*curvify only applies to set*/
Raphael.st.curvify = function(level) {
    var st = this;
    var info = st.info;
    level = +level;
    console.log(st.info);
    // 凸1 凹0
    var dir = level >= 0 ? 1 : 0;
    level = Math.abs(level);
    // restore:
    if (level === 0) {
        st.forEach(function(item, i) {

            if (item.type == 'path') {
                var arcStr = Raphael.format("M 0 0h{0}v{1}h{2}z", info.w, info.h, -info.w);
                item.attr('path', arcStr);
                return;
            }
            item.transform('t 0 0', st, 'curvify');
        })

        return;
    }
    // 从这微调弧度效果
    var modifier = .7;

    // distance between the first circle's center and the last circle's center (of the same row)
    var e2e = (info.w);
    // half of end to end distance 
    var d = e2e / 2;
    // 虚拟弧线的半径 越小弯曲的程度越明显
    var r = d / (level / 3) / modifier;

    // 弧线的起終
    var xa = 0,
        xb = info.w;

    st.forEach(function(item, i) {

        if (item.type == 'path') {
            var arcStr = Raphael.fullfill("M0 0a{r} {r} 0 0 {dir} {w} 0v{h}a{r} {r} 0 0 {dir2} -{w} 0z", {
                w: info.w,
                h: info.h,
                r: r,
                dir: dir,
                dir2: Math.abs(dir - 1)
            });
            item.attr('path', arcStr);

            return;
        }

        var attr = item.type == "circle" ? "cx" : "x";
        var x0 = item.attr(attr);
        // dist between current seat to nearest end:
        var d2 = x0 - xa > d ? xb - x0 : x0 - xa;
        var translateY = Math.sqrt(r * r - Math.pow(d - d2, 2)) - Math.sqrt(r * r - d * d)


        item.transform('t 0 ' + (dir ? -translateY : translateY), st, 'curvify');

    })
    return st;
};

Raphael.st.shear = function(lvl) {
    var st = this;
    var info = st.info;

    // 微调用参数
    var modifier = .8;
    var theta = lvl / 3 * (35 * Math.PI / 180) * modifier;

    st.forEach(function(el) {

        var x0, y0; // original coordinate
        if (el.type == 'circle') {
            x0 = el.attr('cx');
            y0 = el.attr('cy');
        } else if (el.type == "path") {
            y0 = st.info.h;

        } else {
            x0 = el.attr('x');
            y0 = el.attr('y');
        }


        // horizontal translate:
        var translateX = -Math.tan(theta) * y0;

        if (el.type == "path") {
            var pStr = Raphael.fullfill("M0 0h{w}l{translateX} {h} h-{w}z", {
                w: info.w,
                h: info.h,
                translateX: translateX
            });
            console.log(pStr);
            el.attr("path", pStr);
        } else {
            el.transform('t' + translateX + " 0 ", st, "shear");

        }

    })
}

var hey;
$("form").submit(function(e) {
    e.preventDefault();

    hey = createSection(+$('.i1').val() || 5, +$('.i2').val() || 5)
})

$('.btn-tmp').click(function() {
    curvify(hey, Math.random());

})

setTimeout(function() {

    hey = createSection(5, 10);

    // curvify(hey, .5);

}, 200)




$("#skew").change(function() {
    hey.curvify(this.value);
})
$("#shear").change(function() {
    hey.shear(this.value);
})


/*var panZoom = paper.panzoom({
    initialZoom: 1,
    initialPosition: {
        x: 120,
        y: 70
    }
});
panZoom.enable();

var overlay = paper.rect(0, 0, paper.width, paper.height);
    overlay.attr({ fill: '#ffffff', 'fill-opacity': 0, "stroke-width": 0, stroke: '#FFFFFF' });*/
