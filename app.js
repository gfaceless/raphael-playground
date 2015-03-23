var paper = Raphael(document.querySelector('.container'), 500, 500);

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

function createSection(row, col, opts) {
    opts = $.extend(defaults, opts || {});

    var cx, cy;
    var r = opts.r,
        dist = opts.d,
        p = opts.p;

    var w = col * 2 * r + dist * (col - 1) + 2 * p;
    var h = row * 2 * r + dist * (row - 1) + 2 * p;

    paper.setStart();
    paper.rect(0, 0, w, h).attr('fill', '#fff');

    for (var i = 0; i < row; i++) {
        for (var j = 0; j < col; j++) {

            cx = j * (r * 2 + dist) + r + p
            cy = i * (r * 2 + dist) + r + p
                // TODO: use event delegation (maybe)
            paper.circle(cx, cy, r).seatStyle().click(function() {

                this.data('selected', !this.data('selected'))
                this.seatStyle(this.data('selected'))
            });
        }
    }
    var st = paper.setFinish();
    opts.w = w;
    opts.h = h;

    st.info = opts
    paper.freeTransform(st);
    return st;
}

function curvify(st, rate) {

    var r = (140 / rate);
    var info = st.info;
    // half of end to end distance 
    var d = (info.w - 2 * info.p) / 2;
    // first seat's cx
    var xa = info.p + info.r;
    var xb = info.w - (info.p + info.r);
    // var arcStr = "M 40 40 a "+ r +' , ' + r + " 0 0 1 "+" 240 0" 


    st.forEach(function(circ, i) {
        var x0 = circ.attr('cx');
        // dist between current seat to nearest end:
        var d2 = x0 - xa > d ? xb - x0 : x0 - xa;
        var a = Math.sqrt(r * r - Math.pow(d - d2, 2)) - Math.sqrt(r * r - d * d)

        circ.animate({'transform': 't 0 ' + "-" + a}, 1000, 'bounce');
        // circ.transform('t 0 ' + "-" + a);

    })
}


var hey;
$("form").submit(function(e) {
    e.preventDefault();

    hey = createSection(+$('.i1').val() || 5, +$('.i2').val() || 5)
})

setTimeout(function() {

    hey = createSection(5, 5);
    setTimeout(function () {
    	curvify(hey, .5);
    }, 500)
     
}, 200)
