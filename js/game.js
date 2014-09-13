var ctx,
    crntMap,
    mapToBoard,
    board,
    block,
    bg,
    firstChoice = false;


function init( stage ) {
    var i, j, type, chrNum = 0;

    ctx = document.getElementById('canvas').getContext('2d');
    document.getElementById('canvas').addEventListener('ontouchstart' in window ? 'touchstart' : 'mousedown', onTouchstart, false);

    // 스테이지 설정
    gameStatus.crntStage = stage;

    // 맵 설정
    crntMap = [];
    for ( i=0 ; i< config.boardWidth*config.boardHeight; i++ ){
        crntMap.push( mapDB[stage][i] );
    }

    // 배경 생성
    bg = new BackGround();

    // 캐릭터 생성
    mapToBoard = [];
    board = [];
    block = [];
    for (j=0 ; j<config.boardHeight ; j++) {
        for (i=0 ; i<config.boardWidth; i++) {
            // character 생성
            if (crntMap[i+config.boardWidth*j] === 1) {
                type = Math.floor(chrNum/2) % config.totalTypes;
                board.push( new Card({
                    x: i * config.chrWidth,
                    y: j * config.chrHeight + config.offsetY,
                    w: config.chrWidth,
                    h: config.chrHeight,
                    i: i,
                    j: j,
                    type: type,
                    selectable: true,
                    selected : false
                }));
                mapToBoard.push(chrNum);
                chrNum ++;
            }
            // block
            else if (crntMap[i+config.boardWidth*j] === 2) {
                block.push( new Block({
                    x: i * config.chrWidth,
                    y: j * config.chrHeight + config.offsetY,
                    w: config.chrWidth,
                    h: config.chrHeight,
                    i: i,
                    j: j,
                    selectable: false
                }));
                mapToBoard.push(-1);
            }
            // road
            else {
                mapToBoard.push(-1);
            }
        }
    }

    // randomizing characters' location
    do {
        shuffle();
    } while(!canSolve());


    gameStatus.startTime = +new Date();
    loop();
}

// 카드를 뒤석는 기능을 함
function shuffle() {
    var tmp, m, n;

    for (m=0; m<board.length ; m++) {
        n = Math.floor(Math.random()*board.length);

        // changing m-th and n-th location
        if ( board[m] !== null && board[n] !== null && board[m].selectable && board[n].selectable ) {
            tmp = board[m].type ;
            board[m].type = board[n].type;
            board[n].type = tmp;
        }
    }
}

// 모든 카드를 다 매칭 시켜서 게임이 끝났는지 체크함
function isFinish() {
    var m, map = crntMap;

    for (m=0; m<map.length ; m++) {
        if ( map[m] === 1 ) {
            return false;
        }
    }
    return true;
}

// 매칭이 될 수 있는지 체크함
function canSolve() {
    var i, j,
        m, n,
        path;

    for ( i=0 ; i<crntMap.length ; i++ ){
        if ( crntMap[i]===1 ) {
            for ( j=i+1; j<crntMap.length ; j++ ){
                if ( crntMap[j]===1 ) {
                    m = getIJfromIdx(i);
                    n = getIJfromIdx(j);
                    path = isPath(m.i, m.j, n.i, n.j);
                    if( isSameType(m.i, m.j, n.i, n.j) && path ) {
                        return path;
                    }
                }
            }
        }
    }

    return false;
}

// 같은 종류의 카드인지 비교함
function isSameType(fromI, fromJ, toI, toJ) {
    if ( !getChrAt(fromI, fromJ) || !getChrAt(toI, toJ) || !getChrAt(fromI, fromJ).selectable || !getChrAt(toI, toJ).selectable) {
        return;
    }
    return (getChrType(fromI, fromJ) === getChrType(toI, toJ));
}

// 매칭되는 카드 사이에 경로가 존재하는지 체크함
function isPath(fromI, fromJ, toI, toJ) {
    var i, j,
        m, n,
        map = crntMap;

    if ( getChrAt(fromI, fromJ) === null || getChrAt(toI, toJ) === null || !getChrAt(fromI, fromJ).selectable || !getChrAt(toI, toJ).selectable) {
        return false;
    }

    // 1 line
    if ( isLine(fromI, fromJ, toI, toJ) ){
        //alert( '('+fromI+', ' + fromJ + ') -> (' + toI + ', ' + toJ +')' );
        return [ {i: fromI, j: fromJ}, {i: toI, j: toJ} ];
    }

    // 2 ㄱ (horizontal first) line
    if ( map[toI + fromJ*config.boardWidth]===0 && isLine(fromI, fromJ, toI, fromJ) && isLine(toI, fromJ, toI, toJ) ) {
        //alert( '('+fromI+', ' + fromJ + ') -> (' + toI + ', '+fromJ + ') -> (' + toI + ', ' + toJ +')' );
        return [ {i: fromI, j: fromJ}, {i: toI, j: fromJ}, {i: toI, j: toJ} ];
    }

    // 2 ㄴ (vertical first) line
    if ( map[fromI + toJ*config.boardWidth]===0 && isLine(fromI, fromJ, fromI, toJ) && isLine(fromI, toJ, toI, toJ) ) {
        //alert( '('+fromI+', ' + fromJ + ') -> (' + fromI + ', ' + toJ +') -> (' + toI + ', ' + toJ +')' );
        return [ {i: fromI, j: fromJ}, {i: fromI, j: toJ}, {i: toI, j: toJ} ];
    }

    // 3 ㄱ+ㄴ (horizontal - vertical - horizontal)line
    for (m=1; m<config.boardWidth ; m++) {
        i = fromI - m;
        if ( 0 <= i && i < config.boardWidth && map[i + fromJ*config.boardWidth]===0 && map[i + toJ*config.boardWidth]===0 && isLine(fromI, fromJ, i, fromJ) && isLine(i, fromJ, i, toJ) && isLine(i, toJ, toI, toJ) ) {
            //alert( '('+fromI+', ' + fromJ + ') -> (' + i + ', '+fromJ+') -> ( '+ i + ', ' + toJ + ') -> (' + toI + ', ' + toJ +')' );
            return [ {i: fromI, j: fromJ}, {i: i, j: fromJ}, {i: i, j: toJ}, {i: toI, j: toJ} ];
        }

        i = fromI + m;
        if ( 0 <= i && i < config.boardWidth && map[i + fromJ*config.boardWidth]===0 && map[i + toJ*config.boardWidth]===0 && isLine(fromI, fromJ, i, fromJ) && isLine(i, fromJ, i, toJ) && isLine(i, toJ, toI, toJ) ) {
            //alert( '('+fromI+', ' + fromJ + ') -> (' + i + ', '+fromJ+') -> ( '+ i + ', ' + toJ + ') -> (' + toI + ', ' + toJ +')' );
            return [ {i: fromI, j: fromJ}, {i: i, j: fromJ}, {i: i, j: toJ}, {i: toI, j: toJ} ];
        }
    }

    // 3 ㄴ+ㄱ (vertical - horizontal - vertical) line
    for (n=1; n<config.boardHeight; n++) {
        j = fromJ - n;
        if ( 0 <= j && j < config.boardHeight && map[fromI + j*config.boardWidth]===0 && map[toI + j*config.boardWidth]===0 && isLine(fromI, fromJ, fromI, j) && isLine(fromI, j, toI, j) && isLine(toI, j, toI, toJ) ) {
            //alert( '('+fromI+', ' + fromJ + ') -> (' + fromI + ', '+j+') -> ( '+ toI + ', ' + j + ') -> (' + toI + ', ' + toJ +')' );
            return [ {i: fromI, j: fromJ}, {i: fromI, j: j}, {i: toI, j: j}, {i: toI, j: toJ} ];
        }

        j = fromJ + n;
        if ( 0 <= j && j < config.boardHeight && map[fromI + j*config.boardWidth]===0 && map[toI + j*config.boardWidth]===0 && isLine(fromI, fromJ, fromI, j) && isLine(fromI, j, toI, j) && isLine(toI, j, toI, toJ) ) {
            //alert( '('+fromI+', ' + fromJ + ') -> (' + fromI + ', '+j+') -> ( '+ toI + ', ' + j + ') -> (' + toI + ', ' + toJ +')' );
            return [ {i: fromI, j: fromJ}, {i: fromI, j: j}, {i: toI, j: j}, {i: toI, j: toJ} ];
        }
    }

    return false;
}

// 두 지점 사이에 방해물이 없어서 경로의 최소단위인 라인을 그릴 수 있는지 확인
function isLine(fromI, fromJ, toI, toJ) {
    var i, j, map = crntMap;

    if ((fromI===toI && fromJ===toJ) || (fromI!==toI && fromJ!==toJ)){
        return false;
    }
    // horizontal line
    if (fromI!==toI && fromJ===toJ) {
        // rightside
        if ( fromI < toI ) {
            for (i=fromI+1 ; i<toI ; i++) {
                if (map[ i+fromJ*config.boardWidth ] !==0) {
                    return false;
                }
            }
        }
        // leftside
        else {
            for (i=toI+1 ; i<fromI ; i++) {
                if (map[ i+fromJ*config.boardWidth ] !==0) {
                    return false;
                }
            }
        }
    }
    // vertical line
    else {
        // downside
        if ( fromJ < toJ ) {
            for (j=fromJ+1 ; j<toJ ; j++) {
                if (map[ fromI + j*config.boardWidth ] !==0) {
                    return false;
                }
            }
        }
        // upside
        else {
            for (j=toJ+1 ; j<fromJ ; j++) {
                if (map[ fromI + j*config.boardWidth ] !==0) {
                    return false;
                }
            }
        }
    }
    return true;
}

function getChrAt(i, j) {
    if ( mapToBoard[i + config.boardWidth * j] === -1) {
        return;
    }
    return board[ mapToBoard[i + config.boardWidth * j] ] ;
}

function getChrIdx(i, j) {
    return mapToBoard[i + config.boardWidth * j] ;
}

function getChrType(i, j) {
    if ( mapToBoard[i + config.boardWidth * j] === -1) {
        return;
    }
    return board[ mapToBoard[i + config.boardWidth * j] ].type;
}

function getIJfromIdx(idx) {
    return {
        i: idx % config.boardWidth,
        j: Math.floor(idx / config.boardWidth),
    };
};

function onTouchstart(e) {

    if (!e.offsetX) {
        return;
    }

    var x = e.offsetX ,
        y = e.offsetY ,
        i = Math.floor(x/config.chrWidth),
        j = Math.floor((y- config.offsetY)/config.chrHeight),
        lines = [];

    e.preventDefault();

    // 카드를 선택하지 않은 경우
    if ( i<0 || config.boardWidth<=i || j<0 || config.boardHeight<=j || !getChrAt(i, j)) {
        return;
    }

    // 첫번째 카드를 선택한 경우
    if (!firstChoice) {
        firstChoice = getChrAt(i, j);
        firstChoice.selected = true;
        return;
    }
    // 첫번째 카드를 다시 선택한 경우
    else if (i===firstChoice.i && j===firstChoice.j) {
        return;
    }
    // 두번째 카드를 선택한 경우
    else {
    }

    // 카드가 매칭된 경우
    lines = isPath(firstChoice.i, firstChoice.j, i, j);
    if( isSameType(firstChoice.i, firstChoice.j, i, j) && lines ) {

        // 매칭된 카드 사이의 path를 그려줌


        // 카드 및 선택된 카드 sprite를 지워주는 효과


        // 첫 번째 카드를 지워줌
        crntMap[firstChoice.i+firstChoice.j*config.boardWidth] = 0;
        board[ mapToBoard[firstChoice.i+firstChoice.j*config.boardWidth] ] = null;

        // 두 번째 카드를 지워줌
        crntMap[i+j*config.boardWidth] = 0;
        board[ mapToBoard[i+j*config.boardWidth] ] = null;

        // 매칭 점수 추가
        gameStatus.score += config.matchPoint;

        // 미션 완료인 경우
        if ( isFinish() ) {
            return;

            // // 시간 보너스 점수
            // crntTime = new Date().getTime();
            // gameStatus.score += (config.totalTime - Math.floor((gameStatus.crntTime-gameStatus.startTime) / 1000) ) * config.timePoint ;
        }
        // 미션 완료가 아닌 경우, 더 이상 풀 수 없는 경우 카드를 뒤석음
        else if (!canSolve()) {
            do {
                shuffle();
            } while(!canSolve());
        }

        firstChoice = null;
    }

    // 카드가 매칭되지 않은 경우, 현재 선택된 것을 처음 선택으로 바꿈
    else {
        firstChoice.selected = false;
        firstChoice = getChrAt(i, j);
        firstChoice.selected = true;
    }
}

function loop() {
    gameStatus.crntTime = +new Date() - gameStatus.startTime;

    if ( config.totalTime - gameStatus.crntTime <= 0 ){
        drawEnd();
    }
    else if ( isFinish() ) {
        drawEnd();
    }
    else {
        requestAnimationFrame( loop );
        drawAll();
        if ( gameStatus.crntTime < 3000 ){
            drawStart();
        }
    }
}

function drawAll() {
    var i;

    ctx.clearRect( 0, 0, config.width, config.height);

    bg.draw( ctx );

    for ( i=0 ; i < board.length ; i++ ){
        if ( !!board[i] ) {
            board[i].draw( ctx );
        }
    }

    for ( i=0 ; i < block.length ; i++ ){
        if ( !!block[i] ) {
            block[i].draw( ctx );
        }
    }
}

function drawStart() {
    // 시간 막대
    ctx.font = "80px Accent";
    ctx.fillStyle = "#FF9900";
    ctx.fillText("Stage : " + (gameStatus.crntStage +1), 20, 280);
    ctx.fillText("Game Start!", 20, 380);
    ctx.font = "Bold 80px Accent";
    ctx.fillText( 3 - Math.floor( gameStatus.crntTime / 1000 ), 220, 480);
}

function drawEnd() {
    // 시간 막대
    ctx.font = "80px Accent";
    ctx.fillStyle = "#FF9900";
    ctx.fillText("Game End!", 20, 380);
}