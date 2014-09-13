var config = {
        // 전체 화면 좌표
        width : 520,
        height : 720,

        // 카드 유형
        totalTypes: 8,
        // types:  ["purple", "emerald", "blue", "green", "pink", "brown", "orange", "darkgreen" ],
        colors: ["#800080", "#55D43F", "#0000FF", "#00FF00", "#F4A460","#FF69B4", "#FFA500", "#006400"],

        // 화면 배치 설정
        boardWidth: 10,
        boardHeight: 10,
        chrWidth: 50,
        chrHeight: 50,
        offsetY: 210,

        // 점수 설정
        matchPoint: 1, // match point
        timePoint: 2, // 10 point per 1s

        // 시간 설정
        totalTime: 63000 // 60s
    },

    // 10 X 10 map
    // 0 : road
    // 1 : character
    // 2 : block
    mapDB = [
        [
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,1,1,1,1,0,0,0,
            0,0,0,1,0,0,1,0,0,0,
            0,0,0,1,0,0,1,0,0,0,
            0,0,0,1,1,1,1,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0
        ],
        [
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,0,2,2,0,1,0,0,
            0,0,1,0,2,2,0,1,0,0,
            0,0,1,0,2,2,0,1,0,0,
            0,0,1,0,2,2,0,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0
        ],
        [
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0
        ],
        [
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,0,2,2,0,1,0,0,
            0,0,1,0,2,2,0,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0
        ],
        [
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,1,2,2,2,2,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,0,0,0,0,1,0,0,
            0,0,1,2,2,2,2,1,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0
        ],
        [
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,1,2,2,2,2,1,0,0,
            0,0,1,2,2,2,2,1,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,1,1,1,1,1,1,0,0,
            0,0,0,0,0,0,0,0,0,0,
            0,0,0,0,0,0,0,0,0,0
        ]
    ],

    gameStatus = {
        score : 0,
        crntStage : null,
        startTime : null,
        crntTime : null
    };


// Background
var BackGround = function() {
};

BackGround.prototype.draw = function( ctx ) {
    // 배경 화면

    var time = Math.floor((config.totalTime - gameStatus.crntTime)/1000);
    time = time > 60 ? 60 : time;

    // 시간 숫자
    ctx.fillStyle = "#3385FF";
    ctx.font = "40px Verdana";
    ctx.fillText("Time : " + time + " s", 260, 50);

    // 시간 막대
    ctx.fillStyle = "#FF9900";
    ctx.fillRect( 10, 60, 500 * time/config.totalTime*1000, 5);

    // 점수
    ctx.fillStyle = "rgb(200, 0, 50)";
    ctx.fillText("Score : " + gameStatus.score, 10, 50);


};

// Card Object
var Card = function(data) {
    this.x = data.x;
    this.y = data.y;
    this.w = data.w;
    this.h = data.h;
    this.i = data.i;
    this.j = data.j;
    this.type = data.type;
    this.selectable = data.selectable;
};

Card.prototype.draw = function( ctx ) {
    ctx.strokeStyle = "#FFBB00";
    for (var i=0 ; i < config.boardHeight ; i ++ ){
        ctx.beginPath();
        ctx.moveTo( 35, 235 + config.chrHeight*i);
        ctx.lineTo( 485, 235 + config.chrHeight*i);
        ctx.closePath();
        ctx.stroke();
    }

    for (var i=0 ; i < config.boardWidth ; i ++ ){
        ctx.beginPath();
        ctx.moveTo( 35 + config.chrWidth*i, 235 );
        ctx.lineTo( 35 + config.chrWidth*i, 685 );
        ctx.closePath();
        ctx.stroke();
    }

    ctx.fillStyle = config.colors[this.type];
    ctx.beginPath();
    ctx.arc( this.x+this.w/2, this.y+this.h/2, this.w/2, 0, Math.PI*2, false);
    ctx.closePath();
    ctx.fill();

    if ( this.selected === true ) {
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc( this.x+this.w/2, this.y+this.h/2, this.w/4, 0, Math.PI*2, false);
        ctx.closePath();
        ctx.fill();
    }
};

// Block Object
var Block = function(data) {
    this.x = data.x;
    this.y = data.y;
    this.w = data.w;
    this.h = data.h;
    this.i = data.i;
    this.j = data.j;
    this.selectable = data.selectable;
};

Block.prototype.draw = function( ctx ) {
    ctx.fillStyle = "#333333";
    ctx.fillRect( this.x, this.y, this.w, this.h );
};