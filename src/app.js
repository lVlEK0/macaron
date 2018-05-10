const images = {
    "<sakura>":"image/sakura.png",
    "<fish>":"image/fish.png",
    "<star>":"image/star.png",
    "<arrow>":"image/arrow.png",
    "<triangle>":"image/triangle.png",
    "<rocket>":"image/rocket.png"
};
const motype = {
    IMAGE: 1,
    NUMBER: 2,
    STRING: 3
};

const objh = 64;
const objw = 64;
var objPos = [0,0];

function nextPos (){
    if(objPos[0] + objw <= cvsw){
        objPos[0] = objPos[0] + objw;
    }else{
        objPos[0] = 0;
        objPos[1] = objPos[1] + objh;
    }
}

class MObject {
    constructor() {
        this.x = objPos[0];
        this.y = objPos[1];
        nextPos();
        this.h = objh;
        this.w = objw;
        this.a = 0;
        this.ix = this.x;
        this.iy = this.y;
        this.ih = this.h;
        this.iw = this.w;
        this.ia = this.a;
    }

    init(){
        this.x = this.ix;
        this.y = this.iy;
        this.h = this.ih;
        this.w = this.iw;
        this.a = this.ia;
    }
}
class MImage extends MObject {
    constructor(input) {
        super();
        this.img = new Image();
        this.img.src = images[input];
        this.value = input.replace(/<(.*)>/g,'$1');
        this.type = motype.IMAGE;
    }
}
class MNumber extends MObject {
    constructor(input) {
        super();
        this.value = input;
        this.type = motype.NUMBER;
    }
}
class MString extends MObject {
    constructor(input) {
        super();
        this.value = input;
        this.type = motype.STRING;
    }
}
class Transition {
    constructor(target, dx, dy, dsizew, dsizeh, dangle) {
        this.target = target;
        this.dx = dx;
        this.dy = dy;
        this.dsizew = dsizew;
        this.dsizeh = dsizeh;
        this.dangle = dangle;
    }
}
var MObjects = [];
var MObjectCount = 0;
var svariableCount = 0;
var source;
function createMObject(input) {
    var mobj;
    if(images[input]){
        mobj =  new MImage(input);
    }else if(isNaN(input)){
        mobj = new MString(input);
    }else{
        mobj = new MNumber(input);
    }
    MObjects.push(mobj);
    MObjectCount++;
    return mobj;
}
function exec(input) {
    MObjects = [];
    MObjectCount = 0;
    source = input;
    var inputs = input.split(";");
    for(var statement of inputs){
        for(key in images){
            if(statement.indexOf(key) >= 0){
                eval(statement.split("=")[0].trim() + " = createMObject(key);");
            }
        }
        for(key of initFuncs){
            if(statement.indexOf(key) >= 0){
                eval(statement);
            }
        }
    }
    init();
}

var canvas = document.getElementById("cvs");
var ctx = canvas.getContext("2d");
var cvsw = 900;
var cvsh = 900;
var cos = 0;
var sin = 0;
var rad = Math.PI / 180;
var timeCounter = 0;
var timer;
function plot() {
    ctx.clearRect(0, 0, cvsw, cvsh);
    for (var i = 0; i < MObjectCount; i++) {
        cos = Math.cos(MObjects[i].a * rad);
        sin = Math.sin(MObjects[i].a * rad);
        ctx.setTransform(cos, sin, -1 * sin, cos, MObjects[i].x, MObjects[i].y);
        ctx.drawImage(MObjects[i].img, 0, 0, MObjects[i].w, MObjects[i].h);
        ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}
const initFuncs = ["POS", "RAND", "CENTER"];
function flow() {
    var input = source;
    input = input.replace(/.*<.*>.*/g,'');
    input = input.replace(/\$/g,'');
    for(f of initFuncs){
        input = input.replace(new RegExp(f + ".*;", 'g'), '');
    }
    eval(input);
    for (var i = 0; i < MObjectCount; i++) {
        if(MObjects[i].x > cvsw) MObjects[i].x -= cvsw;
        if(MObjects[i].x < 0) MObjects[i].x += cvsw;
        if(MObjects[i].y > cvsh) MObjects[i].y -= cvsh;
        if(MObjects[i].y < 0) MObjects[i].y += cvsh;
        if(MObjects[i].a > 360) MObjects[i].a -= 360;
        if(MObjects[i].a < 0) MObjects[i].a += 360;
    }
    plot();
    $(function(){
        $("#time-counter").text(++timeCounter);
    });
}
function flowStart() {
    timer = setInterval(flow, 20);
}
function flowPause() {
    clearInterval(timer);
}
function incrementFrame() {
    flow();
}
function init() {
    for (var i = 0; i < MObjectCount; i++) {
        MObjects[i].init();
    }
    plot();
    timeCounter = 0;
    $(function(){
        $("#time-counter").text(timeCounter);
    });
}

$(function () {
    cvsw = $('#mapping-area').width();
    cvsh = $('#mapping-area').height();
    $('#cvs').attr('width', cvsw);
    $('#cvs').attr('height', cvsh);
    var timer = false;
    $(window).resize(function() {
        if (timer !== false) {
            clearTimeout(timer);
        }
        timer = setTimeout(function() {
            console.log('resized');
            cvsw = $('#mapping-area').width();
            cvsh = $('#mapping-area').height();
            $('#cvs').attr('width', cvsw);
            $('#cvs').attr('height', cvsh);
        }, 200);
    });
    $('#apply-source').click(function() {
        jsEditor.save();
        objPos = [0,0];
        var input = $('#source-text').val().toString();
        console.log(input);
        exec(input);
    });
    $('#start-plot').click(function () {
        console.log("start");
        $(this).removeClass("active");
        $($(this).attr("switch-link")).addClass("active");
        flowStart();
    });
    $('#pause-plot').click(function (){
        console.log("pause");
        $(this).removeClass("active");
        $($(this).attr("switch-link")).addClass("active");
        flowPause();
    });
    $('#increment-frame').click(function () {
        console.log("increment-frame");
        incrementFrame();
    });
    $('#reset').click(function () {
        console.log("reset");
        init();
    });
});

(function(){

    //要素の取得
    var elements = document.getElementsByClassName("drag-and-drop");

    //要素内のクリックされた位置を取得するグローバル（のような）変数
    var x;
    var y;

    //マウスが要素内で押されたとき、又はタッチされたとき発火
    for(var i = 0; i < elements.length; i++) {
        elements[i].addEventListener("mousedown", mdown, false);
        elements[i].addEventListener("touchstart", mdown, false);
    }

    //マウスが押された際の関数
    function mdown(e) {

        //クラス名に .drag を追加
        this.classList.add("drag");

        //タッチデイベントとマウスのイベントの差異を吸収
        if(e.type === "mousedown") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }

        //要素内の相対座標を取得
        x = event.pageX - this.offsetLeft;
        y = event.pageY - this.offsetTop;

        //ムーブイベントにコールバック
        document.body.addEventListener("mousemove", mmove, false);
        document.body.addEventListener("touchmove", mmove, false);
    }

    //マウスカーソルが動いたときに発火
    function mmove(e) {

        //ドラッグしている要素を取得
        var drag = document.getElementsByClassName("drag")[0];

        //同様にマウスとタッチの差異を吸収
        if(e.type === "mousemove") {
            var event = e;
        } else {
            var event = e.changedTouches[0];
        }

        //フリックしたときに画面を動かさないようにデフォルト動作を抑制
        e.preventDefault();

        //マウスが動いた場所に要素を動かす
        drag.style.top = event.pageY - y + "px";
        drag.style.left = event.pageX - x + "px";

        //マウスボタンが離されたとき、またはカーソルが外れたとき発火
        drag.addEventListener("mouseup", mup, false);
        document.body.addEventListener("mouseleave", mup, false);
        drag.addEventListener("touchend", mup, false);
        document.body.addEventListener("touchleave", mup, false);

    }

    //マウスボタンが上がったら発火
    function mup(e) {
        var drag = document.getElementsByClassName("drag")[0];

        //ムーブベントハンドラの消去
        document.body.removeEventListener("mousemove", mmove, false);
        drag.removeEventListener("mouseup", mup, false);
        document.body.removeEventListener("touchmove", mmove, false);
        drag.removeEventListener("touchend", mup, false);

        //クラス名 .drag も消す
        drag.classList.remove("drag");
    }

})()

var jsEditor = CodeMirror.fromTextArea(document.getElementById("source-text"), {
    mode: "javascript",
    lineNumbers: false,
    indentUnit: 4
});

function POS(posx,posy,obj){
    obj.x = posx;
    obj.y = posy;
    obj.ix = obj.x;
    obj.iy = obj.y;
}

function RAND(){
    for(obj of arguments){
        POS(Math.random()*cvsw, Math.random()*cvsh, obj);
    }
}

function CENTER(){
    var ys = [];
    for(obj of arguments){
        if(ys.indexOf(obj.y) < 0){
            ys.push(obj.y);
        }
    }
    for(posy of ys){
        var sumw = 0;
        for(obj of arguments){
            if(posy == obj.y){
                sumw = sumw + obj.w;
            }
            
        }
        var posx = (cvsw - sumw) / 2;
        for(obj of arguments){
            if(posy == obj.y){
                POS(posx, posy, obj);
                posx = posx + obj.w;
            }
        }
    }
}