var paper = Raphael(document.querySelector('.container'), 1000, 1000);

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

// move to a single file
var letters = "ABCDEFGHIJKLMN";

function generateLabel(id) {
    if (!id) throw new Error("should have id");
    generateLabel[id] = generateLabel[id] || 0;
    return letters[generateLabel[id]++];
}

function createSection(row, col, opts) {
    opts = $.extend(defaults, opts || {});

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



function curvify(st, level) {
    var info = st.info;
    level = +level;
    // restore:
    if (level === 0) {
        st.forEach(function(item, i) {
            
            if (item.type == 'path') {
                var arcStr = Raphael.format("M 0 0h{0}v{1}h{2}z", info.w, info.h, -info.w);
                item.attr('path', arcStr);
                return;
            }
            st.childTransform(item, 't 0 0');
        })

        return;
    }
    // 从这微调弧度效果
    var modifier = .7;

    // distance between the first circle's center and the last circle's center (of the same row)
    var e2e = (info.w - 2 * info.p - 2 * info.r);
    // half of end to end distance 
    var d = e2e / 2;
    // 虚拟弧线的半径 越小弯曲的程度越明显
    var r = d / (level / 3) / modifier;
    // first seat's cx
    var xa = info.p + info.r;
    var xb = info.w - (info.p + info.r);


    st.forEach(function(item, i) {
        // if (i === 0) return;
        if (item.type == 'path') {
            var arcStr = Raphael.fullfill("M0 0a{r} {r} 0 0 1 {w} 0v{h}a{r} {r} 0 0 0 -{w} 0z", {
                w: info.w,
                h: info.h,
                r: r
            });
            item.attr('path', arcStr);

            return;
        }

        var attr = item.type == "circle" ? "cx" : "x";
        var x0 = item.attr(attr);
        // dist between current seat to nearest end:
        var d2 = x0 - xa > d ? xb - x0 : x0 - xa;
        var translateY = Math.sqrt(r * r - Math.pow(d - d2, 2)) - Math.sqrt(r * r - d * d)

        // 基本上curvify、skew等都是在set上的，而且已经freeTransform过
        st.childTransform(item, 't 0 ' + -translateY);

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




$("#we").change(function() {
    curvify(hey, this.value)
})
