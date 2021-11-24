/*

    * DATE: 2021_07_13 TUE
    * VERSION : 1.0
    * JAVASCRIPT
    * @license Copyright (c) 2021~, Hoeeeeeh, All rights reserved.
    * @author : Hoeeeeeh

*/

/*
    TODO-LIST
    1. 자바스크립트에 소멸자 있는지 찾아보기.


*/

var sibal;

class BrowserManager {
    #SCREEN = {
        width : 0,
        height : 0,
    }
    constructor() {
        this.#SCREEN.width = $(window).width();
        this.#SCREEN.height = $(window).height();
    }

    selectTitle(){
        new Title().selectTitle();
    }

    init(){
        (function(win, $) {

            $(win).on("resize", function() {
                const w_height = $(win).height();
                $("body").css("height", w_height);
                $("#field").css("height", (w_height * 0.6) - (2 * 7) + 'px');
            });
            $(function() {
                $(win).trigger("resize");
            });
            
        }(window, jQuery)); 
    }

    static screen(){
        return {
            width : $(window).width(),
            height : $(window).height(),
        };
    }

}








class EventListener {
    #args = [];
    constructor(...args) { // REST 파라미터, ... 을 붙히면 인자를 배열로 전달받음.
        this.#args = args;
    }
    add = ()=>{
      for (let e of this.#args)
          document.addEventListener(e.event, e.callback); 
      return this;
    }

    dispose = ()=> {
        for (let e of this.#args)
            document.removeEventListener(e.event, e.callback);
        return this;
    }
}











class Title {
    #idx = 0;
    // 메뉴 선택지 인덱스
    #isGameStart = false;
    //게임 시작 여부
    #menu = [this.gameStart, this.characterSelect, this.setting];
    //메뉴 배열

    constructor() {

    }

    get tag(){
        return `#select_title>ul>li:nth-child(${this.#idx + 1})`; 
        // idx 번 째에 있는 메뉴 선택지 태그
    }

    selectTitle() {
        const keydown = (e)=>{
            switch (e.keyCode){
                case 38 : // ↑
                case 82 : // R
                    if(this.#idx > 0){
                        $(this.tag).removeClass(`selected`);
                        this.#idx--;
                        $(this.tag).addClass(`selected`);
                    }
                    break;
                case 40 : // ↓
                case 70 : // F
                    if(this.#idx < 2){
                        $(this.tag).removeClass(`selected`);
                        this.#idx++;
                        $(this.tag).addClass(`selected`);
                    }
                    break;
                case 13 : // ENTER 엔터
                    this.#menu[this.#idx]();
                    keydownEvent.dispose();
                    keydownEvent = null; // 가비지 콜렉터
                    break;

            }
        }
        let keydownEvent = new EventListener({event : 'keydown' , callback : keydown});
        keydownEvent.add();
    }
    gameStart(){
        const isTimeTo = new GameManager();
        sibal = isTimeTo // test
        isTimeTo.setUpTheGame();
    }

    characterSelect(){

    }

    setting(){

    }
}



class StageMap {
    #INFO = {
        MAPMINWIDTH : 0,
        MAPMAXWIDTH : 0,
        MAPMINHEIGHT : 0,
        MAPMAXHEIGHT : 0,
    }

    constructor(){
        const BORDER = 7;
        this.#INFO.MAPMINWIDTH = parseFloat($(".sidebar").css("width")) + BORDER;
            // 1330, 538 / border 7 / sidebar 238
        this.#INFO.MAPMAXWIDTH = this.#INFO.MAPMINWIDTH + (BrowserManager.screen().width-14) * 0.7;
        this.#INFO.MAPMINHEIGHT =  (BrowserManager.screen().height-14) * 0.2 + BORDER;
    // padding : 190
        this.#INFO.MAPMAXHEIGHT = this.#INFO.MAPMINHEIGHT + parseFloat($("#field").css("height"));
    }

    get info(){
        return this.#INFO;
    }
}

class Obstacle{
    #OBSTACLENUM = 0;
    #LEFTOBSTACLE = [];
    #RIGHTOBSTACLE = [];
    #BOTTOMOBSTACLE = [];
    #UPOBSTACLE = [];

    #OBJECTOBSTACLE = [];

    #OBSTACLEIDX = new Map();
    get idx(){
        return this.#OBSTACLEIDX;
    }
    constructor(){
    }

    destructuring(left,right,bottom,up){
        return[
            {right : right, bottom : bottom, up : up }, // left obstacle
            {left : left, bottom : bottom, up : up}, // right obstacle
            {up: up, left : left, right : right}, // bottom obstacle
            {bottom : bottom, left : left, right : right} // up obstacle
        ];
        
    }

    removeObstacle(obsIdxArr){
        for(let i = 0; i<obsIdxArr.length; i++){
            if(obsIdxArr[i] === -1)
                continue;
            if(i === 0)
                this.#LEFTOBSTACLE.splice(obsIdxArr[i],1);
            else if( i === 1)
                this.#RIGHTOBSTACLE.splice(obsIdxArr[i],1);
            else if( i === 2)
                this.#BOTTOMOBSTACLE.splice(obsIdxArr[i],1);
            else if( i === 3)
                this.#UPOBSTACLE.splice(obsIdxArr[i],1);       
        }

    }

    addObstacleAllSide(name, left,right,bottom,up){
        let destructed = this.destructuring(left,right,bottom,up);
        let obstacleIdx = [-1,-1,-1,-1];
        console.log(destructed);

        obstacleIdx[0] = this.#LEFTOBSTACLE.length; 
        this.#LEFTOBSTACLE.push(destructed[0]);

        obstacleIdx[1] = this.#RIGHTOBSTACLE.length; 
        this.#RIGHTOBSTACLE.push(destructed[1]);

        obstacleIdx[2] = this.#BOTTOMOBSTACLE.length;
        this.#BOTTOMOBSTACLE.push(destructed[2]);

        obstacleIdx[3] = this.#UPOBSTACLE.length;
        this.#UPOBSTACLE.push(destructed[3]);

        this.#OBSTACLEIDX.set(name, obstacleIdx);
    }

    addObstaclePartialSide = (name, left,right,bottom,up, ...args)=>{ // 장애물의 quarter 과 partial side를 각각의 파라미터로 
        let side = ['left','right','bottom','up'];
        let destructed = this.destructuring(left,right,bottom,up);
        let obstacleIdx = [-1, -1, -1, -1];
        for(let arg of args){
            for(let idx = 0; idx < side.length; idx++){
                if (arg === side[idx]){
                    switch(idx){
                        case 0: // left obstacle
                        obstacleIdx[0] = this.#LEFTOBSTACLE.length; 
                        this.#LEFTOBSTACLE.push(destructed[0]);
                            break;
                        case 1: // right obstacle
                        obstacleIdx[1] = this.#RIGHTOBSTACLE.length; 
                        this.#RIGHTOBSTACLE.push(destructed[1]);
                            break;
                        case 2: // bottom obstacle
                        obstacleIdx[2] = this.#BOTTOMOBSTACLE.length; 
                        this.#BOTTOMOBSTACLE.push(destructed[2]);
                            break;
                        case 3: // up obstacle
                        obstacleIdx[3] = this.#UPOBSTACLE.length; 
                        this.#UPOBSTACLE.push(destructed[3]);
                            break;
                        default:
                            console.log('error occur');
                    }
                }
            }
        }
        this.#OBSTACLEIDX.set(name, obstacleIdx);
        return obstacleIdx;
    }

    addObject(obj){
      this.#OBJECTOBSTACLE.push(obj);
       let obstacleIdx = [-1, -1, -1, -1];
                switch(obj.arrow){
                    case 'left':
                        obstacleIdx[0] = this.#LEFTOBSTACLE.length; 
                        this.#LEFTOBSTACLE.push(obj);
                        break;

                    case 'right':
                        obstacleIdx[1] = this.#RIGHTOBSTACLE.length; 
                        this.#RIGHTOBSTACLE.push(obj);
                        break;

                    case 'bottom':
                        obstacleIdx[2] = this.#BOTTOMOBSTACLE.length; 
                        this.#BOTTOMOBSTACLE.push(obj);
                        break;

                    case 'up':
                        obstacleIdx[3] = this.#UPOBSTACLE.length; 
                        this.#UPOBSTACLE.push(obj);
                        break;
                
       }
            return obstacleIdx;
    }


//지금은 이동거리 먼저 체크해서, 현재 위치 + 이동거리 < stuck? 체크이지만, 조금 움직이고 stuck? 체크 를 반복해야할듯.

    isGetStuckGoingLeft = (quarter,Speed)=>{
        let movingSpeed = Math.abs(Speed);
        let stuck = {
            bool : false,
            limit : 0,
        };
        for(let obs of this.#LEFTOBSTACLE){
            if(obs?.quarter) {
                obs = obs.quarter;
                }
            if(quarter.up < obs.up && quarter.bottom > obs.bottom){               
                if(quarter.left > obs.right && quarter.left - movingSpeed <= obs.right){
                    stuck.bool = true;
                    stuck.limit = obs.right;
                }
            }
        }
        return stuck;
    }

    isGetStuckGoingRight = (quarter,Speed)=>{
        let movingSpeed = Math.abs(Speed);
        let stuck = {
            bool : false,
            limit : 0,
        };
        for(let obs of this.#RIGHTOBSTACLE){
            if(obs?.quarter) obs = obs.quarter;
             if(quarter.up < obs.up && quarter.bottom > obs.bottom){      
                 if(quarter.right < obs.left && quarter.right + movingSpeed >= obs.left){
                    stuck.bool = true;
                    stuck.limit = obs.left;
                 }
            }
        }
        return stuck;
    }

    isGetStuckGoingBottom = (quarter,Speed)=>{
        let movingSpeed = Math.abs(Speed);
        let stuck = {
            bool : false,
            limit : 0,
        };
        for(let obs of this.#BOTTOMOBSTACLE){
            if(obs?.quarter) obs = obs.quarter;
            if(quarter.left > obs.left && quarter.right < obs.right){
                if(quarter.bottom > obs.up && quarter.bottom - movingSpeed <= obs.up){
                    stuck.bool = true;
                    stuck.limit = obs.up;
                }
            }
        }
        return stuck;
    }

    isGetStuckGoingUp = (quarter,Speed)=>{
        let movingSpeed = Math.abs(Speed);
        let stuck = {
            bool : false,
            limit : 0,
        };
        for(let obs of this.#UPOBSTACLE){
            if(obs?.quarter) obs = obs.quarter;
            if(quarter.left > obs.left && quarter.right < obs.right){
                if(quarter.up < obs.bottom && quarter.up + movingSpeed >= obs.bottom){
                    stuck.bool = true;
                    stuck.limit = obs.bottom;
                }
            }
        }
        return stuck;
    }
    

}




class GameManager{
    #mapInfo = new StageMap().info;
    get mapInfo(){
        return this.#mapInfo;
    }

    #STAGE = new Stage();

    #TROPHY = new Trophy();

    #HEROLIST = [];

    #MONSTERLIST = [];

    #EVENTCALLBACK = [];

    #COMMONOBSTACLE = new Obstacle();
    get common(){
        return this.#COMMONOBSTACLE;
    }
    #HEROOBSTACLE = new Obstacle();
    #MONSTEROBSTACLE = new Obstacle();
    #OBSTACLENAME = [];
    
    #events = ['KeydownAttack', 'KeydownAttack', 'KeydownMove', 'KeydownMove', 'KeyupAttack', 'KeyupAttack', 'KeyupMove', 'KeyupMove'];

    #currentKeyboardEvent = {};

    #keyboardEventOnStage = [{},{}];
    #keyboardEventOnTrophyShop = [{},{}];

    #FPS = 20;

    #keydownMap = new Map([
        [188, false], // 우측 CTRL
        [37, false], // 왼쪽
        [38, false], // 위
        [39, false], // 오른쪽
        [40, false], // 아래
        [190, false],


        [192, false], // 'a'
        [70, false], // h2 아래 (F)
        [68, false], // h2 왼쪽 (D)
        [71, false], // h2 오른쪽 (G)
        [82, false], // h2 위 (R)
        [49, false],

    ]);

    set keydownMap(map){
        this.#keydownMap = map;
    }


    constructor(){
        this.defineEventListener();
        console.log(this.#mapInfo);
       
    };

    setUpTheGame(){
        this.fieldFadeIn();  

        this.loop = setInterval(this.loopWhileGameIsExecuting, this.#FPS);

        const BORDER = 7;
        this.#COMMONOBSTACLE.addObstaclePartialSide('leftWall' , this.#mapInfo.MAPMINWIDTH, this.#mapInfo.MAPMINWIDTH + BORDER, this.#mapInfo.MAPMINHEIGHT, this.#mapInfo.MAPMAXHEIGHT, 'left');
        this.#COMMONOBSTACLE.addObstaclePartialSide('rightWall' , this.#mapInfo.MAPMAXWIDTH, this.#mapInfo.MAPMAXWIDTH + BORDER, this.#mapInfo.MAPMINHEIGHT, this.#mapInfo.MAPMAXHEIGHT, 'right');
        this.#COMMONOBSTACLE.addObstaclePartialSide('bottomWall' , this.#mapInfo.MAPMINWIDTH, this.#mapInfo.MAPMAXWIDTH, this.#mapInfo.MAPMINHEIGHT, this.#mapInfo.MAPMINHEIGHT + BORDER, 'bottom');
        this.#COMMONOBSTACLE.addObstaclePartialSide('upWall' , this.#mapInfo.MAPMINWIDTH, this.#mapInfo.MAPMAXWIDTH, this.#mapInfo.MAPMAXHEIGHT, this.#mapInfo.MAPMAXHEIGHT + BORDER, 'up');
     };

/*
     pushWallObstacle = ()=>{
         const BORDER = 7;
         this.#COMMONOBSTACLE.push( // 좌측 벽
            Obstacle(this.#mapInfo.MAPMINWIDTH, this.#mapInfo.MAPMINWIDTH + BORDER, this.#mapInfo.MAPMINHEIGHT, this.#mapInfo.MAPMAXHEIGHT)
         );
         this.#COMMONOBSTACLE.push( // 우측 벽
            Obstacle(this.#mapInfo.MAPMAXWIDTH, this.#mapInfo.MAPMAXWIDTH + BORDER, this.#mapInfo.MAPMINHEIGHT, this.#mapInfo.MAPMAXHEIGHT)
         );
         this.#COMMONOBSTACLE.push( // 하측 벽
            Obstacle(this.#mapInfo.MAPMINWIDTH, this.#mapInfo.MAPMAXWIDTH, this.#mapInfo.MAPMINHEIGHT, this.#mapInfo.MAPMINHEIGHT + BORDER)
         );
         this.#COMMONOBSTACLE.push( // 상측 벽
            Obstacle(this.#mapInfo.MAPMINWIDTH, this.#mapInfo.MAPMAXWIDTH, this.#mapInfo.MAPMAXHEIGHT, this.#mapInfo.MAPMAXHEIGHT + BORDER)
         );
     }
*/

    defineEventListener(e){

        const player1KeydownAttack = (e)=>{ // 188, 190, 191
            if(e.keyCode === 188)
                this.#keydownMap[e.keyCode] = true;
        }

        const player2KeydownAttack = (e)=>{ // 192,49,50
            if(e.keyCode === 192)
                this.#keydownMap[e.keyCode] = true;
        }

        const player1KeydownMove = (e)=>{
            if(e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 37 || e.keyCode === 39){
                this.#keydownMap[e.keyCode] = true;
                this.#HEROLIST[0].whichDirectionDoesHeGo = e.keyCode;
            }else if(e.keyCode === 190){ // Dash
                this.#keydownMap[e.keyCode] = true;
            }
        }
        const player2KeydownMove = (e)=>{
            if(e.keyCode === 70 || e.keyCode === 68 || e.keyCode === 71 || e.keyCode === 82){
                this.#keydownMap[e.keyCode] = true;
                this.#HEROLIST[1].whichDirectionDoesHeGo = e.keyCode;
            }else if(e.keyCode === 49){ // Dash
                this.#keydownMap[e.keyCode] = true;
            }
             
        }

        const player1KeyupAttack = (e)=>{
            if(e.keyCode === 188)
                this.#keydownMap[e.keyCode] = false;
        }

        const player1KeyupMove = (e)=>{
            if(e.keyCode === 38 || e.keyCode === 40 || e.keyCode === 37 || e.keyCode === 39)
                this.#keydownMap[e.keyCode] = false;
            else if(e.keyCode === 190) // Dash
                this.#keydownMap[e.keyCode] = false;
            
        }
        const player2KeyupAttack = (e)=>{
            if(e.keyCode === 192)
                this.#keydownMap[e.keyCode] = false;
        }
        const player2KeyupMove = (e)=>{
            if(e.keyCode === 70 || e.keyCode === 68 || e.keyCode === 71 || e.keyCode === 82)
                this.#keydownMap[e.keyCode] = false;
            else if(e.keyCode === 49) // Dash
                this.#keydownMap[e.keyCode] = false;
            
        }

        this.#keyboardEventOnStage[0].KeydownAttack = new EventListener({event : 'keydown' , callback : player1KeydownAttack});
        this.#keyboardEventOnStage[1].KeydownAttack = new EventListener({event : 'keydown' , callback : player2KeydownAttack});
        this.#keyboardEventOnStage[0].KeydownMove = new EventListener({event : 'keydown' , callback : player1KeydownMove});
        this.#keyboardEventOnStage[1].KeydownMove = new EventListener({event : 'keydown' , callback : player2KeydownMove});  

        this.#keyboardEventOnStage[0].KeyupAttack = new EventListener({event : 'keyup' , callback : player1KeyupAttack});                  
        this.#keyboardEventOnStage[0].KeyupMove = new EventListener({event : 'keyup' , callback : player1KeyupMove});
        this.#keyboardEventOnStage[1].KeyupAttack = new EventListener({event : 'keyup' , callback : player2KeyupAttack});      
        this.#keyboardEventOnStage[1].KeyupMove = new EventListener({event : 'keyup' , callback : player2KeyupMove});
             

        const player1KeydownMoveOnTrophyShop = (e)=>{
            switch (e.keyCode) {
                    case 37:
                        // 왼
                        if (this.#TROPHY.itemHover > 1) {
                            $(`#item_${this.#TROPHY.itemHover}`).removeClass('selected_1p');
                            $(`#item_${--this.#TROPHY.itemHover}`).addClass('selected_1p');
                            $("#item_description").text(this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].description(this.#HEROLIST[0]));
                        }
                        break;
                    case 39:
                        // 오
                        if (this.#TROPHY.itemHover < 3) {
                            $(`#item_${this.#TROPHY.itemHover}`).removeClass('selected_1p');
                            $(`#item_${++this.#TROPHY.itemHover}`).addClass('selected_1p');
                            $("#item_description").text(this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].description(this.#HEROLIST[0]));
                        }
                        break;
             }

        }
        const player1KeyupAttackOnTrophyShop = (e)=>{
            if (e.keyCode === 188){
                 $(`#item_${this.#TROPHY.itemHover}`).removeClass('selected_1p');
                 this.#HEROLIST[0] = this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].function(this.#HEROLIST[0]);

                 if (this.#HEROLIST[0].KeyupAttack ?? false){
                     this.removeEventListener(this.#keyboardEventOnStage[0].KeyupAttack);
                     this.#keyboardEventOnStage[0].KeyupAttack = new EventListener({event : 'keyup', callback : (e)=>{
                         
                         if(e.keyCode === 188){
                            this.#HEROLIST[0].KeyupAttack();
                                if(this.#HEROLIST[0]?.obstacleIdx)
                                    this.#MONSTEROBSTACLE.removeObstacle(this.#HEROLIST[0].obstacleIdx);
                            this.#keydownMap[e.keyCode] = false;
                         }
                     }
                    });
                         
                     this.addEventListener(this.#keyboardEventOnStage[0].KeyupAttack);
                 }



                 this.#TROPHY.itemHover = 1;

                 this.trophyOrNextStage();
                 // 공격 (선택)
            }
        }
        const player2KeydownMoveOnTrophyShop = (e)=>{
                switch (e.keyCode) {
                    case 68:
                        // 왼
                        if (this.#TROPHY.itemHover > 1) {
                            $(`#item_${this.#TROPHY.itemHover}`).removeClass('selected_2p');
                            $(`#item_${--this.#TROPHY.itemHover}`).addClass('selected_2p');
                            $("#item_description").text(this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].description(this.#HEROLIST[1]));
                        }
                        break;
                    case 71:
                        // 오
                        if (this.#TROPHY.itemHover < 3) {
                            $(`#item_${this.#TROPHY.itemHover}`).removeClass('selected_2p');
                            $(`#item_${++this.#TROPHY.itemHover}`).addClass('selected_2p');
                            $("#item_description").text(this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].description(this.#HEROLIST[1]));
                        }
                        break;
                 }
         }
        const player2KeyupAttackOnTrophyShop = (e)=>{
             if(e.keyCode === 192){
                 // 공격 (선택)
                 this.#HEROLIST[1] = this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].function(this.#HEROLIST[1]);
                 $(`#item_${this.#TROPHY.itemHover}`).removeClass('selected_2p');
                 this.#TROPHY.itemHover = 1;
                        // 공격 (선택)

                 if(this.#HEROLIST[1].KeyupAttack ?? false){
                     this.removeEventListener(this.#keyboardEventOnStage[1].KeyupAttack);
                     this.#keyboardEventOnStage[1].KeyupAttack = new EventListener({event : 'keyup', callback : (e)=>{
                         if(e.keyCode === 192){
                            this.#HEROLIST[1].KeyupAttack();
                            if(this.#HEROLIST[1]?.obstacleIdx)
                                this.#MONSTEROBSTACLE.removeObstacle(this.#HEROLIST[1].obstacleIdx);
                            this.#keydownMap[e.keyCode] = false;

                         }}});
                         
                     this.addEventListener(this.#keyboardEventOnStage[1].KeyupAttack);
                 }

                 this.trophyOrNextStage();

                 }
         }

        this.#keyboardEventOnTrophyShop[0].KeydownMove = new EventListener({event: 'keydown', callback : player1KeydownMoveOnTrophyShop});
        this.#keyboardEventOnTrophyShop[1].KeydownMove = new EventListener({event: 'keydown', callback : player2KeydownMoveOnTrophyShop});
        this.#keyboardEventOnTrophyShop[0].KeyupAttack = new EventListener({event: 'keyup', callback : player1KeyupAttackOnTrophyShop});
        this.#keyboardEventOnTrophyShop[1].KeyupAttack = new EventListener({event: 'keyup', callback : player2KeyupAttackOnTrophyShop});

    }

    addEventListener = (eventListener)=>{
        for (let e of this.#events){
            if(eventListener[e] === undefined)
                continue;
            eventListener[e].add();
        }
    }

    removeEventListener = (eventListener)=>{
        for (let e of this.#events){
            if(eventListener[e] === undefined)
                continue;
            eventListener[e].dispose();
        }
    }

    fieldFadeIn(){
            $(`#title`).addClass(`invisible`);
            //$(`#field`).removeClass(`invisible`);
            $(`#status`).removeClass(`invisible`);
            $(`#field_wrapper`).removeClass(`invisible`);
            $(`#item`).removeClass(`invisible`);

            $(`#land`).fadeIn(2000, "swing");
    }

    drawItemSelectPage = ()=>{
        $("#field").fadeOut(1000, "swing", ()=>{
            $("#item_select").fadeIn(1000, "swing");
            });
    }

    trophyOrNextStage(){
         if(this.#TROPHY.numberPlayerSelect >= Math.max(this.#HEROLIST.length, 2)){
             for (let idx = 0; idx<2; idx++)
                this.removeEventListener(this.#keyboardEventOnTrophyShop[idx]);
             this.goToTheNextLevel();
             this.#TROPHY.numberPlayerSelect = 0;
         }else{
             this.#TROPHY.selectTrophy(this.#STAGE.nowStage, this.#HEROLIST);
             if(this.#TROPHY.numberPlayerSelect > 1)
                this.removeEventListener(this.#keyboardEventOnTrophyShop[this.#TROPHY.numberPlayerSelect-2])
             this.addEventListener(this.#keyboardEventOnTrophyShop[this.#TROPHY.numberPlayerSelect-1]);
         }
    }

    loopWhileGameIsExecuting = ()=>{
         for(let idx = 0; idx<this.#HEROLIST.length; idx++){
            this.#HEROLIST[idx].moveAnimation();
            if(this.#HEROLIST[idx]?.projectionMove){
                this.#HEROLIST[idx]?.projectionMove(this.#MONSTERLIST, this.#COMMONOBSTACLE, this.#HEROOBSTACLE);
            }
/*
            if(this.#HEROLIST[idx].deathCheck()){
                this.#HEROLIST.splice(idx,1);
                $(`#character_${idx}`).fadeOut();
                idx--;
            }
*/
            
         }

         for(let idx = 0; idx<this.#MONSTERLIST.length; idx++){
                this.#MONSTERLIST[idx].moveAnimation();

                let attackOrMove = (this.#MONSTERLIST[idx]?.dashCheck(this.#HEROLIST)) ?? false;

                if(this.#MONSTERLIST[idx].skillCoolTime && (this.#MONSTERLIST[idx].isSpecialAttacking || attackOrMove)){
                   this.#MONSTERLIST[idx].specialAttack(this.#HEROLIST[attackOrMove-1], this.#COMMONOBSTACLE, this.#MONSTEROBSTACLE); 
                }
                else if(!this.#MONSTERLIST[idx].skillCoolTime || !attackOrMove)
                   this.#MONSTERLIST[idx].walkAround(this.#HEROLIST[attackOrMove-1], this.#COMMONOBSTACLE, this.#MONSTEROBSTACLE); 
                

             this.#MONSTERLIST[idx].doIattack(this.#HEROLIST);
            
             if(this.#MONSTERLIST[idx].dead()){
                    this.#MONSTERLIST[idx].deadOut();
                    this.#MONSTERLIST.splice(idx,1);
                    idx--;
                }
         }

         this.functionWhileKeyDownOnStage();
         this.canIGoToTheNextLevel();
         
    }

    

    loopWhileMoveToNextStage = ()=>{
       // this.functionWhileKeyDownOnTrophyShop();
       // this.goToTheNextLevel();
    }

    canIGoToTheNextLevel = ()=>{
        if(this.#MONSTERLIST.length === 0){
            for (let idx = 0; idx<2; idx++)
                this.removeEventListener(this.#keyboardEventOnStage[idx]);
            $("#field").fadeOut(1000,"swing");
            this.drawItemSelectPage(); 
            this.trophyOrNextStage();

            for(let hero of this.#HEROLIST){
               let removeAllProjection =  hero?.projectionClear;
               if(removeAllProjection){
                   removeAllProjection();
               }
            }


            clearInterval(this.loop);
        }
    }

    goToTheNextLevel = ()=>{
        clearInterval(this.loop);

        $("#item_select").fadeOut(1000, "swing", ()=>{
                    $("#field").fadeIn(1000, "swing", ()=>{
        });
        });

        this.#HEROLIST[0].left = 844;
        this.#HEROLIST[0].bottom = 256;
        this.#HEROLIST[0].draw();

        this.#HEROLIST[1].left = 1036;
        this.#HEROLIST[1].bottom = 256;
        this.#HEROLIST[1].draw();

        this.resetKeydownMap();


        
        
        
        this.#MONSTERLIST = this.#STAGE.nextStage(); // 다음 스테이지 시작

        let stageStartDelay = setTimeout(()=>{
            this.loop = setInterval(this.loopWhileGameIsExecuting, this.#FPS);
            clearTimeout(stageStartDelay);
        }, 2000);

        for (let idx = 0; idx<2; idx++)
            this.addEventListener(this.#keyboardEventOnStage[idx]);

    }

    resetKeydownMap(){
        this.#keydownMap = new Map([
        [188, false], // 우측 [,<]
        [37, false], // 왼쪽
        [38, false], // 위
        [39, false], // 오른쪽
        [40, false], // 아래

        [192, false], // 'a'
        [70, false], // h2 아래 (F)
        [68, false], // h2 왼쪽 (D)
        [71, false], // h2 오른쪽 (G)
        [82, false], // h2 위 (R)

    ]);
    }


    functionWhileKeyDownOnTrophyShop = ()=>{
        
    }

    functionWhileKeyDownOnStage = ()=>{
        if(this.#keydownMap[188]){
            let callback = this.#HEROLIST[0].attack(this.#MONSTERLIST);
            if(callback){
                this.#HEROLIST[0].obstacleIdx = this.#MONSTEROBSTACLE.addObject(callback);
            }
        }

        if(this.#keydownMap[192]){
            let callback = this.#HEROLIST[1].attack(this.#MONSTERLIST);
            if(callback){    
                this.#HEROLIST[1].obstacleIdx = this.#MONSTEROBSTACLE.addObject(callback);
            }
        }

        if(this.#keydownMap[37]){
            // 왼쪽 방향키
           if (!this.#HEROLIST[0].isDashed){
               if(!this.#COMMONOBSTACLE.isGetStuckGoingLeft(this.#HEROLIST[0].quarter, this.#HEROLIST[0].move.speed).bool){
                   this.#HEROLIST[0].goLeft();
               }
           }
        }
        if(this.#keydownMap[39]){
            // 오른쪽 방향키
           if (!this.#HEROLIST[0].isDashed){
               if(!this.#COMMONOBSTACLE.isGetStuckGoingRight(this.#HEROLIST[0].quarter, this.#HEROLIST[0].move.speed).bool){
                   this.#HEROLIST[0].goRight();
               }
           }
        }
        if(this.#keydownMap[38]) {
            // 위쪽 방향키	
            if (this.#HEROLIST[0].whichDirectionDoesHeGo === 38 && !this.#HEROLIST[0].isDashed &&  !this.#COMMONOBSTACLE.isGetStuckGoingUp(this.#HEROLIST[0].quarter, this.#HEROLIST[0].move.speed).bool )
                this.#HEROLIST[0].goUp();
        }
        if(this.#keydownMap[40]) {
            // 아래쪽 방향키
            if (!this.#HEROLIST[0].isDashed &&  !this.#COMMONOBSTACLE.isGetStuckGoingBottom(this.#HEROLIST[0].quarter, this.#HEROLIST[0].move.speed).bool )
                this.#HEROLIST[0].goBottom();
        }

        if(this.#keydownMap[68]) {
            // (D)
            if (!this.#HEROLIST[1].isDashed &&  !this.#COMMONOBSTACLE.isGetStuckGoingLeft(this.#HEROLIST[1].quarter, this.#HEROLIST[1].move.speed).bool )
                this.#HEROLIST[1].goLeft();
        }
        if(this.#keydownMap[71]) {
            // (G)
            if (!this.#HEROLIST[1].isDashed &&  !this.#COMMONOBSTACLE.isGetStuckGoingRight(this.#HEROLIST[1].quarter, this.#HEROLIST[1].move.speed).bool )
                this.#HEROLIST[1].goRight();
        }
        if(this.#keydownMap[82]) {
            // (R)
            if (!this.#HEROLIST[1].isDashed &&  !this.#COMMONOBSTACLE.isGetStuckGoingUp(this.#HEROLIST[1].quarter, this.#HEROLIST[1].move.speed).bool )
                this.#HEROLIST[1].goUp();
        }
        if(this.#keydownMap[70]) {
            // (F)
            if (!this.#HEROLIST[1].isDashed &&  !this.#COMMONOBSTACLE.isGetStuckGoingBottom(this.#HEROLIST[1].quarter, this.#HEROLIST[1].move.speed).bool )
                this.#HEROLIST[1].goBottom();
        }

        if(this.#keydownMap[190]){
                this.#HEROLIST[0].dash(this.#COMMONOBSTACLE, this.#HEROOBSTACLE);
        }
        if(this.#keydownMap[49]){
                this.#HEROLIST[1].dash(this.#COMMONOBSTACLE, this.#HEROOBSTACLE);
        }
    }
}

class Living {


		#size = {
			width : 0,
			height : 0,
		};

    #left = 0;
    get left(){
        return this.#left;
    }
    set left(left){
        this.#left = left;
    }
    #bottom = 0;
    get bottom(){
        return this.#bottom;
    }
    set bottom(bottom){
        this.#bottom = bottom;
    }

    #move = {
        speed : 0,
    };

    #attacking = {
        damage : 0,
        speed : 0,
        range : 0,
    };

    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp){ 

        this.#size.width = parseFloat(width);
        this.#size.height = parseFloat(height);

        if (typeof (left) == 'number')
           this.#left  = BrowserManager.screen().width * (left / 100) - this.#size.width/2;
        else if (typeof (left) == 'string')
            this.#left = parseFloat(left);

        if (typeof (bottom) == 'number')
            this.#bottom = BrowserManager.screen().height * (bottom / 100) - this.#size.height/2;
        else if (typeof (bottom) == 'string')
            this.bottom = parseFloat(bottom);

        this.right = this.#left + this.#size.width;
        this.up = this.bottom + this.#size.height;
 
        this.#attacking = {
            damage : damage,
            speed : attackSpeed,
            range : attackRange,
        };

        this.#move = {
            speed : movingSpeed,
        }

        this.maxhp = maxhp;
        this.hp = maxhp;


    }

    get quarter(){
        return {
            left: this.#left,
            right: this.#left + this.#size.width,
            bottom: this.#bottom,
            up: this.#bottom + this.#size.height,
           
        };
    }

    hitBox(width, height){
        return {
            left : this.#left - width/2,
            right: this.#left + this.#size.width + width/2,
            bottom : this.#bottom - height/2,
            up : this.#bottom + this.#size.height + height/2,
        }
    }

    get coordinates(){
        return  {
            x : this.#left + this.#size.width/2,
            y : this.#bottom + this.#size.height/2,
        };
    }

    attackRange(width=0, height=0){ // monster width, monster height
        return {
            left : this.#left - this.attacking.range - width/2,
            right : this.#left + this.#size.width + this.attacking.range + width/2,
            bottom : this.#bottom - this.attacking.range - height/2,
            up : this.#bottom + this.#size.height + this.attacking.range + height/2,
        }
    }

    get attacking(){
        return this.#attacking;
    }

    get left(){
        return this.#left;
    }

    set left(left){
        this.#left = left;
    }

    get bottom(){
        return this.#bottom;
    }

    set bottom(bottom){
        this.#bottom = bottom;
    }

    get move(){
        return this.#move;
    }

    set quarter(args){
        
    }

    get size(){
        return this.#size;
    }
}

class Hero extends Living {
    //move = {};
    static numberOfHero = 1; 

    #aggro = {
        score : 0,
        weight : 0,
    }

    //attack = {};

/* Private 선언 */
    #whichPlayer = 0;
    get whichPlayer(){
        return this.#whichPlayer;
    }
    #whichMotion = 0;
    #whichDirectionDoesHeGo = 0;

    #char = '';
/* Private 선언 */

    set whichDirectionDoesHeGo(w){
        this.#whichDirectionDoesHeGo = w;
    }

    get whichDirectionDoesHeGo(){
        return this.#whichDirectionDoesHeGo;
    }

    constructor(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo, char){


        $("#field").append(
        $(`<div id=character_${whichPlayer} class=character>
                <div class=player id=player_${whichPlayer}></div>
                <div id=gauge_${whichPlayer} class= 'invisible gauge'>
                    <div id=charging_${whichPlayer}></div>
                </div>
                <div class=char_hp>
                    <div id=hp_${whichPlayer}></div>
                </div>
                <div id=char_figure_${whichPlayer}></div>
           </div>`
        ));

        super(left, bottom, 
        /* width, */ $(`#character_${whichPlayer}`).css("width"), 
        /* height, */ $(`#char_figure_${whichPlayer}`).css("height"), 
        damage, attackSpeed, attackRange, movingSpeed, maxhp); // REST 파라미터로 바꿀 예정.

        this.#whichPlayer = whichPlayer;
        this.#whichMotion = whichMotion;
        this.#whichDirectionDoesHeGo = whichDirectionDoesHeGo;
        this.#char = char;

        this.dashSpeed = this.move.speed * 40;
        this.isDashed = false;

        this.invincible = false;

        this.draw();
    }

    draw = function(){
        $(`#character_${this.#whichPlayer}`).css("left", `${this.left}px`);
        $(`#character_${this.#whichPlayer}`).css("bottom", `${this.bottom}px`);
        //$(`#character_${this.#whichPlayer}`).css("background-image", `${this.bottom}px`);
        $(`#hp_${this.#whichPlayer}`).css("width", this.hp + '%');
    }

    goLeft(movingSpeed){
        let speed = movingSpeed ?? this.move.speed; 
        this.left = this.left - speed;
        $(`#character_${this.#whichPlayer}`).css("left", this.left + "px");
    }
    goRight(movingSpeed){
        let speed = movingSpeed ?? this.move.speed; 
        this.left = this.left + speed;
        $(`#character_${this.#whichPlayer}`).css("left", this.left + "px");
    }
    goBottom(movingSpeed){
        let speed = movingSpeed ?? this.move.speed; 
        this.bottom = this.bottom - speed;
        $(`#character_${this.#whichPlayer}`).css("bottom", this.bottom + "px");
    }
    goUp(movingSpeed){
        let speed = movingSpeed ?? this.move.speed; 
        this.bottom = this.bottom + speed;
        $(`#character_${this.#whichPlayer}`).css("bottom", this.bottom + "px");
    }

    dash(...args){
        if(this.isDashed || this.dashCoolTime){
            return false;
        }
        this.isDashed = true;
        this.dashCoolTime = true;

        const dashTime = 0.3;

        $(`#character_${this.#whichPlayer}`).css("transition-property", "left,bottom").css("transition-duration", `${dashTime}s, ${dashTime}s`);
        let dashEnd = setTimeout(()=>{
            $(`#character_${this.#whichPlayer}`).css("transition-property", "").css("transition-duration", '');
            this.isDashed = false;
            clearTimeout(dashEnd);
        }, dashTime * 1000);

        let dashCoolTimeEnd = setTimeout(()=>{
            this.dashCoolTime = false;
            clearTimeout(dashCoolTimeEnd);
        }, dashTime * 1000);

        let obstacles = args;
        let dashDistance = this.dashSpeed;
        let wallPadding = 10;
            switch (this.#whichDirectionDoesHeGo) {
            case 37:
            case 68:
                for(let obs of obstacles){
                    if(obs?.isGetStuckGoingLeft(this.quarter, dashDistance).bool){
                        dashDistance = this.left - obs?.isGetStuckGoingLeft(this.quarter, dashDistance).limit - wallPadding;
                    }
                }
                this.goLeft(dashDistance);
                break;
            case 39:
            case 71:
                for(let obs of obstacles){
                    if(obs?.isGetStuckGoingRight(this.quarter, dashDistance).bool){
                        dashDistance = obs?.isGetStuckGoingRight(this.quarter, dashDistance).limit - this.left - this.size.width - wallPadding;
                    }
                }
                this.goRight(dashDistance);
                break;
            case 38:
            case 82:
                for(let obs of obstacles){
                    if(obs?.isGetStuckGoingUp(this.quarter, dashDistance).bool){
                        dashDistance = obs?.isGetStuckGoingUp(this.quarter, dashDistance).limit - this.bottom - this.size.height - wallPadding;
                    }
                }
                this.goUp(dashDistance);
                break;
            case 40:
            case 70:
                for(let obs of obstacles){
                    if(obs?.isGetStuckGoingBottom(this.quarter, dashDistance).bool){
                        dashDistance = this.bottom - obs?.isGetStuckGoingBottom(this.quarter, dashDistance).limit - wallPadding;
                    }
                }
                this.goBottom(dashDistance);
                break;
            }

        return true;
    }


    moveAnimation(){
         let where;
            switch (this.#whichDirectionDoesHeGo) {
            case 37:
            case 68:
                where = 'left';
                break;
            case 39:
            case 71:
                where = 'right';
                break;
            case 38:
            case 82:
                where = 'forward';
                break;
            case 40:
            case 70:
                where = 'back';
                break;
            }

            this.#whichMotion = (++this.#whichMotion) % 40;
            var motionNum;
            if (this.#whichMotion > 30)
                motionNum = 3;
            else if (this.#whichMotion > 20)
                motionNum = 2;
            else if (this.#whichMotion > 10)
                motionNum = 1;
            else if (this.#whichMotion >= 0)
                motionNum = 0;

            let url = `url('../MAIN/img/character/${this.#char}/move/move_${where}${motionNum}.png')`;
            //$(`#character_${this.idx}`).css("background-image", url);
            $(`#char_figure_${this.#whichPlayer}`).css("background-image", url);
     }

     hpBar(){
         $(`#hp_${this.whichPlayer}`).css("width", (this.hp / this.maxhp) * 100 + '%'); 
      }

     hitCheck(damage){
         if(this.invincible){
             return;
         }
         this.invincible = true;
         let matchless = setTimeout(()=>{
             this.invincible = false;
             clearTimeout(matchless);
         }, 1000)
         this.hp = Math.max(this.hp - damage, 0);
         this.hpBar();

         this.hitAnimation();
     }

     deathCheck = ()=>{
         if(this.hp <= 0){
            return true;
        }else{
            return false;
        }
     }

     hitAnimation(){
        $(`#character_${this.whichPlayer}`).fadeOut(100, "swing", ()=>{
        $(`#character_${this.whichPlayer}`).fadeIn(100, "swing", ()=>{
            $(`#character_${this.whichPlayer}`).fadeOut(100, "swing", ()=>{
                $(`#character_${this.whichPlayer}`).fadeIn(100, "swing", ()=>{}
                );
            }
            );
        }
        );
    }
    );
     }


}






class Trophy {
    #numberPlayerSelect = 0;
    #ITEMHOVER = 1;
    #selectedItem = [];
    get selectedItem(){
        return this.#selectedItem;
    }
    get itemHover(){
        return this.#ITEMHOVER;
    }

    set itemHover(itemHover){
        this.#ITEMHOVER = itemHover;
    }

    get numberPlayerSelect(){
        return this.#numberPlayerSelect;
    }

    set numberPlayerSelect(num){
        this.#numberPlayerSelect = num;
    }
        
    #ITEM = [
     {
        name: 'attack_speed_up',
        url: `url(./img/item/item_speed_up.png)`,
        description: (hero)=>{
            return `공격 속도(${hero.attackRate}) 가 ${(hero.attackRate / 10) * 9} 로 빨라집니다.`;
        }
        ,
        function: (hero)=>{
            hero.attackRate = (hero.attackRate / 10) * 9;
            hero.maxGauge = hero.maxGauge == undefined ? 0 : hero.attackRate / 10;
            return hero;
        }
        ,
    }, {
        name: 'attack_damage_up',
        url: `url(./img/item/item_damage_up.png)`,
        description: (hero)=>{
            return `데미지(${hero.damage})가 0.2 증가합니다.`;
        }
        ,
        function: (hero)=>{
            hero.damage = hero.damage + 0.2;
            return hero;
        }

    }, {
        name: 'heart',
        url: `url(./img/item/item_heart.png)`,
        description: (hero)=>{
            return `[ 현재 체력 : (${hero.hp}) ]  최대 체력의 30%(${hero.maxhp * 0.3}) 가 회복됩니다.`
        }
        ,
        function: (hero)=>{
            hero.hp = hero.hp + (hero.maxhp * 0.3);
            hero.hpBar();
            return hero;
        }
        ,
    }, {
        name: 'defence_up',
        url: `url(./img/item/item_defence_up.png)`,
        description: (hero)=>{
            return `최대 체력(${hero.maxhp}) 이 ${(hero.maxhp + 10)} 로 증가합니다.`
        }
        ,
        function: (hero)=>{
            hero.maxhp = hero.maxhp + 10;
            hero.hp = hero.hp + 10;
            return hero;
        }
        ,
    },
    /*
     {
        name: 'heal_up',
        url: `url(./img/item/item_heal_up.png)`,
        description: (hero)=>{
            return '아군 체력 10 회복'
        }
        ,
        
    }, 
    */
    {
        name: 'velocity_up',
        url: `url(./img/item/item_velocity_up.png)`,
        description: (hero)=>{
            return `현재 이동속도(${hero.move_velocity}) 가 ${0.5} 증가합니다.`
        }
        ,
        function: (hero)=>{
            hero.move_velocity = hero.move_velocity + 0.5;
            return hero;
        }
    }
    ];

    #SKILL = [
    {
        name: 'warrior',
        url: `url(./img/character/skill_icon/warrior.png)`,
        description: (hero)=>{
            return `전사로 승급합니다. 공격 범위가 줄어들지만 강력한 범위 공격을 얻습니다. \n 사거리 - 400, 기본 체력 + 50, [패시브] : 범위 공격 `;
        }
        ,
        function: ()=>{
            return new Warrior(         /* left = */ 50 - (10 * (1.5 - Hero.numberOfHero)) ,
         /* bottom = */ 30, 
         /* damage = */ 3, 
         /* attackSpeed = */ 1500, 
         /* attackRange = */ 200, 
         /* movingSpeed = */ 5, 
         /* maxhp = */ 100, 
         /* whichPlayer = */ Hero.numberOfHero++, 
         /* whichMotion = */ 0, 
         /* whichDirectionDoesHeGo */ 38,
            );
            
        }
    }, {
        name: 'tanker',
        url: `url(./img/character/skill_icon/tanker.png)`,
        description: (hero)=>{
            return `탱커로 승급합니다. 1. 탱커는 데미지가 대폭 감소하지만, 강인한 체력을 얻습니다. 
            2. 탱커는 패시브로 몬스터를 끌어당길 수 있습니다. 끌어당겨진 몬스터들은 데미지를 받고, 캐릭터의 공격속도에 비례하여 스턴에 빠지게 됩니다 . \n 기본 체력 + 100, [패시브] 군중 제어`
        }
        ,
        function: (hero)=>{
            return new Tanker(         /* left = */ 50 - (10 * (1.5 - Hero.numberOfHero)) ,
         /* bottom = */ 30, 
         /* damage = */ 0, 
         /* attackSpeed = */ 1500, 
         /* attackRange = */ 0, 
         /* movingSpeed = */ 5, 
         /* maxhp = */ 100, 
         /* whichPlayer = */ Hero.numberOfHero++, 
         /* whichMotion = */ 0, 
         /* whichDirectionDoesHeGo */ 38,
            );
        }
    }, {
        name: 'dealer',
        url: `url(./img/character/skill_icon/dealer.png)`,
        description: (hero)=>{
            return `원거리 딜러로 승급합니다. 공격력과 체력이 소폭 감소하지만 공격 범위가 증가,
            이동속도 증가 및 투사체를 차징 발사 할 수 있습니다. 차징 발사의 경우 두 배의 데미지를 입힙니다. \n 공격력 - 2, 사거리 + 200, 이동속도 + 2, [패시브] 차징`
        }
        ,
        function: (hero)=>{
            //$(`#gauge_${hero.whichPlayer}`).removeClass('invisible');
           return new Dealer(         /* left = */ 50 - (10 * (1.5 - Hero.numberOfHero)) ,
         /* bottom = */ 30, 
         /* damage = */ 1.5, 
         /* attackSpeed = */ 1500, 
         /* attackRange = */ 300, 
         /* movingSpeed = */ 5, 
         /* maxhp = */ 100, 
         /* whichPlayer = */ Hero.numberOfHero++, 
         /* whichMotion = */ 0, 
         /* whichDirectionDoesHeGo */ 38,
            );

        }
    }, {
        name: 'healer',
        url: `url(./img/character/skill_icon/healer.png)`,
        description: (hero)=>{
            return `힐러로 승급합니다. 힐러는 기본 공격력이 감소하지만, 매 초마다 자신의 체력이 회복되고, 기본 공격이 아군과 몬스터를 모두 관통합니다. 아군에게 타격할 경우 아군의 체력이 회복되고 몬스터에게 타격할 경우 데미지를 입힙니다.`;
        }
        ,
        function: (hero)=>{
            //$(`#gauge_${hero.whichPlayer}`).removeClass('invisible');
            return new Healer(         /* left = */ 50 - (10 * (1.5 - Hero.numberOfHero)) ,
         /* bottom = */ 30, 
         /* damage = */ 1, 
         /* attackSpeed = */ 1500, 
         /* attackRange = */ 0, 
         /* movingSpeed = */ 5, 
         /* maxhp = */ 100, 
         /* whichPlayer = */ Hero.numberOfHero++, 
         /* whichMotion = */ 0, 
         /* whichDirectionDoesHeGo */ 38,
            );

        }
    },];


    constructor(){
    }

    selectTrophy = (nowStage, HEROLIST)=>{
        for (let i = 0; i < 3; i++) {
            $(`#selected_item_${i}`).remove();
        }
        let item_ = [];
        this.#selectedItem = [];
        if (nowStage % 4 == 0 && (nowStage / 4) % 2 == 0){ // 짝수 챕터 4스테이지 에서만 
            for (let skill of this.#SKILL) {
                item_.push(skill);
            }
            $(".item").each(function() {
                $(this).css("background-color", "rgba(0,0,0,0.1)");
            });
        } else {
            for (let item of this.#ITEM) {
                item_.push(item);
            }
            $(".item").each(function() {
                $(this).css("background-color", "rgba(0,0,0,0.4)");
            });
        }
        const MAXITEMSELECT = 3;
        for (let i = 0; i < MAXITEMSELECT; i++) {
            let idx = Math.floor(Math.random() * item_.length);
            this.#selectedItem.push(item_[idx]);
            $(`#item_${i + 1}`).append($(`<div id=selected_item_${i} class=selected_item style='background-image : ${item_[idx].url}'></div>`));
            item_.splice(idx, 1);
        }
        $("#item_1").addClass(`selected_${this.#numberPlayerSelect+1}p`);
        $("#item_description").text(this.#selectedItem[0].description(HEROLIST[this.#numberPlayerSelect]));
        this.#numberPlayerSelect++;
    }
}





class Warrior extends Hero{
    #char = 'warrior';
    constructor(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo){
        super(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo, 'warrior');
        this.attackCoolTime = 1500;
        this.isAttacking = false;
    }

    attack = (MONSTERLIST)=>{
        if (this.isAttacking)
            return;
        this.isAttacking = true;
        let attackCoolTimeEnd = setTimeout(()=>{
            this.isAttacking = false;
            clearTimeout(attackCoolTimeEnd);
        }
        , this.attackCoolTime);

        for (let monster of MONSTERLIST) {
            switch (this.whichDirectionDoesHeGo) {
            case 37:
            case 68:
                if (monster.coordinates.x > this.attackRange(monster.size.width, monster.size.height).left && monster.coordinates.x <  this.attackRange(monster.size.width, monster.size.height).right) {
                    if ((monster.coordinates.y <this.coordinates.y + this.attacking.range / 2) && (monster.coordinates.y >this.coordinates.y - this.attacking.range / 2)) {
                        monster.hitCheck(this.attacking.damage);
                    }
                }
                break;
            case 39:
            case 71:
                if (monster.coordinates.x <this.attackRange(monster.size.width, monster.size.height).right && monster.coordinates.x > this.coordinates.x) {
                      if ((monster.coordinates.y <this.coordinates.y + this.attacking.range / 2) && (monster.coordinates.y >this.coordinates.y - this.attacking.range / 2)) {
                        monster.hitCheck(this.attacking.damage);
                    }
                }
                break;
            case 38:
            case 82:
                if (monster.coordinates.y < this.attackRange(monster.size.width, monster.size.height).up && monster.coordinates.y > this.coordinates.y) {
                    if ((monster.coordinates.x  > this.coordinates.x - this.attacking.range / 2) && (monster.coordinates.x < this.coordinates.x + this.attacking.range / 2)) {
                        monster.hitCheck(this.attacking.damage);
                    }
                }
                break;
            case 40:
            case 70:
                if (monster.coordinates.y > this.attackRange(monster.size.width, monster.size.height).bottom && monster.coordinates.y < this.coordinates.y) {
                   if ((monster.coordinates.x  > this.coordinates.x - this.attacking.range / 2) && (monster.coordinates.x < this.coordinates.x + this.attacking.range / 2)) {
                        monster.hitCheck(this.attacking.damage);
                    }
                }
                break;
            }
    }
    switch (this.whichDirectionDoesHeGo) {
    case 37:
    case 68:
        let leftAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/warrior/attack/attack_left.png); background-size: 100% 100%; position : fixed; 
        left : ${this.left - this.attacking.range}px; bottom : ${this.coordinates.y - this.attacking.range / 2}px; 
        width: ${this.attacking.range}px; height : ${this.attacking.range}px;'> </div>`);
        $("#field").append(leftAttack);
        leftAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 39:
    case 71:
        let rightAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/warrior/attack/attack_right.png); background-size: 100% 100%; position : fixed; 
        left : ${this.quarter.right}px; bottom : ${this.coordinates.y - this.attacking.range / 2}px; 
        width: ${this.attacking.range}px; height : ${this.attacking.range}px;'> </div>`);
        $("#field").append(rightAttack);
        rightAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 38:
    case 82:
        let upAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/warrior/attack/attack_up.png); background-size: 100% 100%; position : fixed; 
        left : ${this.coordinates.x - (this.attacking.range) / 2}px; bottom : ${this.quarter.up}px; 
        width: ${this.attacking.range}px; height : ${this.attacking.range}px;'> </div>`);
        $("#field").append(upAttack);
        upAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 40:
    case 70:
        let downAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/warrior/attack/attack_down.png); background-size: 100% 100%; position : fixed; 
        left : ${this.coordinates.x - (this.attacking.range) / 2}px; bottom : ${this.bottom - this.attacking.range}px; 
        width: ${this.attacking.range}px; height : ${this.attacking.range}px;'> </div>`);
        $("#field").append(downAttack);
        downAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    }
    }
}

class Tanker extends Hero{
    #char = 'tanker';

    constructor(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo){
        super(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo,'tanker');
        $(`#gauge_${this.whichPlayer}`).removeClass('invisible');
        $(`#charging_${this.whichPlayer}`).css("width", "100%");
        this.attackGauge = 0;
        this.maxGauge = 100;
        this.num = 0;
        this.isAttacking = false;
        this.shieldDirection = 0;
        this.shieldObstacle = null;
        this.obstacleIdx = [-1,-1,-1,-1];

        for (let arrow of ['left', 'right', 'bottom', 'up']){
            $(`#char_figure_${this.whichPlayer}`).append(
            `<div class = 'invisible shield shield_${arrow}' 
            id=shield_${arrow}_${this.whichPlayer}>
            </div>`);
        }

        const SHIELDSHORT = 20;
        const SHIELDLONG = 280;
        const SHIELDPADDING = 10;
        const SHIELDGAUGEPADDING = 10;

        $(`#shield_left_${this.whichPlayer}`).css("left", `${0 - SHIELDSHORT - SHIELDPADDING}px`).css("bottom", `${this.size.height / 2 + SHIELDPADDING - SHIELDLONG / 2}px`);
        $(`#shield_right_${this.whichPlayer}`).css("left", `${this.size.width + SHIELDPADDING}px`).css("bottom", `${this.size.height / 2 + SHIELDPADDING - SHIELDLONG / 2}px`);
        $(`#shield_up_${this.whichPlayer}`).css("left", `${this.size.width / 2 - SHIELDLONG / 2}px`).css("bottom", `${this.size.height + SHIELDSHORT + SHIELDGAUGEPADDING + SHIELDPADDING}px`);
        $(`#shield_bottom_${this.whichPlayer}`).css("left", `${this.size.width / 2 - SHIELDLONG / 2}px`).css("bottom", `${0 - SHIELDSHORT - SHIELDPADDING}px`);
    }
           
    

    attack = ()=>{
        if(this.shieldDirection != 0){
            return;
        }

        let where = '';
        switch (this.whichDirectionDoesHeGo) {
        case 37:
        case 68:
            where = 'left';
            break;
        case 39:
        case 71:
            where = 'right';
            break;
        case 38:
        case 82:
            where = 'up';
            break;
        case 40:
        case 70:
            where = 'bottom';
            break;
        }
        $(`#shield_${where}_${this.whichPlayer}`).removeClass('invisible');
        this.shieldDirection = where;

/*
        let obstacleDirection;
        if(where === 'left')
            obstacleDirection = 'right';
        else if(where === 'right')
            obstacleDirection = 'left';
        else if(where === 'up')
            obstacleDirection = 'bottom';
        else if(where === 'bottom')
            obstacleDirection = 'up';

*/

        this.shieldObstacle = new Shield(where+'shield',where,this.whichPlayer);
        return this.shieldObstacle;

//this.#COMMONOBSTACLE.addObstaclePartialSide(where , this.#mapInfo.MAPMINWIDTH, this.#mapInfo.MAPMINWIDTH + BORDER, this.#mapInfo.MAPMINHEIGHT, this.#mapInfo.MAPMAXHEIGHT, 'left');  
            
    }

    KeyupAttack = ()=>{
        let where = '';
        $(`#shield_${this.shieldDirection}_${this.whichPlayer}`).addClass('invisible');
        this.shieldDirection = 0;
    }

}

class Shield{
    constructor(name,arrow, whichPlayer){
        this.name = name;

        this.whichPlayer = whichPlayer;
        this.interruptDirection = arrow;

        if(arrow === 'left')
            this.arrow = 'right';
        else if(arrow === 'right')
            this.arrow = 'left';
        else if(arrow === 'up')
            this.arrow = 'bottom';
        else if(arrow === 'bottom')
            this.arrow = 'up';

        

        this.left = parseFloat($(`#shield_${this.interruptDirection}_${this.whichPlayer}`).css("left"));
        this.width = parseFloat($(`#shield_${this.interruptDirection}_${this.whichPlayer}`).css("width"));

        this.bottom = parseFloat($(`#shield_${this.interruptDirection}_${this.whichPlayer}`).css("bottom"));
        this.height = parseFloat($(`#shield_${this.interruptDirection}_${this.whichPlayer}`).css("height"));

        


    }
    /*
        let shieldLeft = this.left + parseFloat($(`#shield_${where}_${this.whichPlayer}`).css("left"));
        let shieldRight = shieldLeft + parseFloat($(`#shield_${where}_${this.whichPlayer}`).css("width"));
        let shieldBottom = this.bottom + parseFloat($(`#shield_${where}_${this.whichPlayer}`).css("bottom"));
        let shieldUp = shieldBottom + parseFloat($(`#shield_${where}_${this.whichPlayer}`).css("height"));
    */

    get quarter(){
        return {
            left : this.left + parseFloat($(`#character_${this.whichPlayer}`).css("left")),
            right : this.left + parseFloat($(`#character_${this.whichPlayer}`).css("left")) + this.width,
            bottom : this.bottom + parseFloat($(`#character_${this.whichPlayer}`).css("bottom")),
            up : this.bottom + parseFloat($(`#character_${this.whichPlayer}`).css("bottom")) + this.height,
        };
    }

}

class Healer extends Hero{
    #char = 'healer';
    constructor(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo){
        super(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo, 'healer');
    }

    attack = ()=>{

    }
}

class Dealer extends Hero{
    #char = 'dealer';  
      
    #projection = {
        left : [],
        right : [],
        bottom : [],
        up : [],
    }


    constructor(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo){
        super(left, bottom, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichPlayer, whichMotion, whichDirectionDoesHeGo, 'dealer');
        this.attackCoolTime = 500;
        $(`#gauge_${this.whichPlayer}`).removeClass('invisible');
        this.attackGauge = 0;
        this.maxGauge = 100;
        this.num = 0;
        this.isAttacking = false;


  
    }

    attack = ()=>{
        if(this.isAttacking){
            return;
        }


            this.attackGauge = Math.min(this.attackGauge + 3, 100);
            let gauge = (this.attackGauge / this.maxGauge) * 100;
            if (gauge >= 100) {
                $(`#charging_${this.whichPlayer}`).css("background-color", '#f7be3a');
                gauge = 100;
            }else if(gauge >= 50){
                $(`#charging_${this.whichPlayer}`).css("background-color", '#08ec87');   
            }

            $(`#charging_${this.whichPlayer}`).css("width", gauge + '%');
        }
    

    KeyupAttack = ()=>{
            if(this.isAttacking){
                return;
            }
             this.isAttacking = true;
                let attackCoolTime = setTimeout(()=>{
                    this.isAttacking = false;
                    clearTimeout(attackCoolTime);
             }, 600);
            
            $(`#charging_${this.whichPlayer}`).css("width", '0%');
            $(`#charging_${this.whichPlayer}`).css("background-color", '#00BCD4');

            const width = 48;
            const height = 48;
            const damageRate = 1.5;
            let rushSpeed = 10;
            let where;

            switch (this.whichDirectionDoesHeGo) {
                    case 37:
                    case 68:
                        where = 'Left';
                        this.#projection.left.push(new Projection(width,height,this.coordinates.x - width,this.coordinates.y - height/2,this.whichPlayer,where,'left_' + this.num++,
                        0,
                        {left : -rushSpeed, bottom : 0 },
                        this.attacking.range,
                        this.attacking.damage/damageRate,
                        ));

                        break;
                    case 39:
                    case 71:
                        where = 'Right';
                        this.#projection.right.push(new Projection(width,height,this.quarter.right,this.coordinates.y - height/2,this.whichPlayer,where, 'right_' + this.num++,
                        0,
                        {left : rushSpeed, bottom :0 },
                        this.attacking.range,
                        this.attacking.damage/damageRate,
                        ));

                        break;
                    case 38:
                    case 82:
                        where = 'Forward';
                       this.#projection.up.push(new Projection(width,height, this.coordinates.x-width/2 ,this.quarter.up ,this.whichPlayer,where, 'forward_' + this.num++,
                        0,
                        {left : 0, bottom : rushSpeed },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));
                        break;
                    case 40:
                    case 70:
                        where = 'Down';
                       this.#projection.bottom.push(new Projection(width,height, this.coordinates.x-width/2 ,this.quarter.bottom - height ,this.whichPlayer,where, 'down_' + this.num++,
                        0,
                        {left : 0, bottom : -rushSpeed },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));
                        break;
            }




            for(let i = 0; i<Math.floor(this.attackGauge/50)+1; i++){ // 3개, 5개, 7개 생성 -> 3개 : 총 1.5 + 1.5 / 5개 :  / 7개 : 
                switch (this.whichDirectionDoesHeGo) {
                    case 37:
                    case 68:
                        where = 'Left';
                        this.#projection.left.push(new Projection(width,height,this.coordinates.x - width,this.coordinates.y - height/2 + (10*(i+1)),this.whichPlayer,where,'left_' + this.num++,
                        rushSpeed*(i+1),
                        {left : -rushSpeed*Math.cos(rushSpeed*(i+1) * Math.PI / 180), bottom : rushSpeed*Math.sin(rushSpeed*(i+1) * Math.PI / 180), },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));

                        this.#projection.left.push(new Projection(width,height,this.coordinates.x - width,this.coordinates.y - height/2 - (10*(i+1)),this.whichPlayer,where,'left_' + this.num++,
                        -rushSpeed*(i+1),
                        {left : -rushSpeed*Math.cos(-rushSpeed*(i+1) * Math.PI / 180), bottom : rushSpeed*Math.sin(-rushSpeed*(i+1) * Math.PI / 180) },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));
                        break;
                    case 39:
                    case 71:
                        where = 'Right';

                        this.#projection.right.push(new Projection(width,height,this.quarter.right,this.coordinates.y - height/2 + (10*(i+1)),this.whichPlayer,where, 'right_' + this.num++,
                        -rushSpeed*(i+1),
                        {left : rushSpeed*Math.cos(-rushSpeed*(i+1) * Math.PI / 180), bottom : -rushSpeed*Math.sin(-rushSpeed*(i+1) * Math.PI / 180) },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));

                        this.#projection.right.push(new Projection(width,height,this.quarter.right,this.coordinates.y - height/2 - (10*(i+1)),this.whichPlayer,where, 'right_' +this.num++,
                        rushSpeed*(i+1),
                        {left : rushSpeed*Math.cos(-rushSpeed*(i+1) * Math.PI / 180), bottom : rushSpeed*Math.sin(-rushSpeed*(i+1) * Math.PI / 180) },
                        this.attacking.range,
                        this.attacking.damage/damageRate,
                        ));

                        break;
                    case 38:
                    case 82:
                        where = 'Forward';
                        this.#projection.up.push(new Projection(width,height,this.coordinates.x-width/2 + (10*(i+1)) ,this.quarter.up,this.whichPlayer,where, 'forward_' + this.num++,
                        rushSpeed*(i+1),
                        {left : rushSpeed*Math.sin(rushSpeed*(i+1) * Math.PI / 180), bottom : rushSpeed*Math.cos(rushSpeed*(i+1) * Math.PI / 180) },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));

                        this.#projection.up.push(new Projection(width,height,this.coordinates.x-width/2 - (10*(i+1)) ,this.quarter.up,this.whichPlayer,where, 'forward_' + this.num++,
                        -rushSpeed*(i+1),
                        {left : rushSpeed*Math.sin(-rushSpeed*(i+1) * Math.PI / 180), bottom : rushSpeed*Math.cos(-rushSpeed*(i+1) * Math.PI / 180) },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));

                        break;
                    case 40:
                    case 70:
                        where = 'Down';
                        this.#projection.bottom.push(new Projection(width,height,this.coordinates.x-width/2 + (10*(i+1)) ,this.quarter.bottom - height,this.whichPlayer,where, 'down_' + this.num++,
                        -rushSpeed*(i+1),
                        {left : rushSpeed*Math.sin(rushSpeed*(i+1) * Math.PI / 180), bottom : -rushSpeed*Math.cos(rushSpeed*(i+1) * Math.PI / 180) },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));

                        this.#projection.bottom.push(new Projection(width,height,this.coordinates.x-width/2 - (10*(i+1)) ,this.quarter.bottom - height ,this.whichPlayer,where, 'down_' + this.num++,
                        rushSpeed*(i+1),
                        {left : rushSpeed*Math.sin(-rushSpeed*(i+1) * Math.PI / 180), bottom : -rushSpeed*Math.cos(-rushSpeed*(i+1) * Math.PI / 180) },
                         this.attacking.range,
                         this.attacking.damage/damageRate,
                        ));
                        break;
                }
            }
        this.attackGauge = 0;
    }

    projectionMove = (MONSTERLIST, ...obstacle)=>{
         for(let i = 0; i<this.#projection.left.length; i++){
            if(this.#projection.left[i].move(MONSTERLIST, obstacle)){
                this.#projection.left.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.right.length; i++){
            if(this.#projection.right[i].move(MONSTERLIST, obstacle)){
                this.#projection.right.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.up.length; i++){
            if(this.#projection.up[i].move(MONSTERLIST, obstacle)){
                this.#projection.up.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.bottom.length; i++){
            if(this.#projection.bottom[i].move(MONSTERLIST, obstacle)){
                this.#projection.bottom.splice(i,1);
                    i--;
            }
        }

    }

    projectionClear = ()=>{
        for(let proj of this.#projection.left){
                proj.remove();
        }
        this.#projection.left = [];

        for(let proj of this.#projection.right){
                proj.remove();
        }
        this.#projection.right = [];

        for(let proj of this.#projection.up){
                proj.remove();
        }
        this.#projection.up = [];

        for(let proj of this.#projection.bottom){
                proj.remove();
        }
        this.#projection.bottom = [];
    }



         
}

class Projection{
    constructor(width, height, left, bottom, whichPlayer, arrow, idx, degree, rushSpeed,attackRange,damage){
        this.width = width;
        this.height = height;
        this.left= left;
        this.bottom = bottom;
        this.whichPlayer = whichPlayer;
        this.arrow = arrow;
        this.idx = idx;
        this.default = {
            left: left,
            bottom: bottom,
        }

        this.rushSpeed = rushSpeed;
        this.attackRange = attackRange;
        this.damage = damage;

        this.degree = degree;

        this.id = `heroAttack${this.whichPlayer}_${this.idx}`;
        let attackTag = $(`<div id = '${this.id}' 
                            class = 'dealerAttack dealerAttack${this.arrow}' 
                            style='width: ${this.width}px; height: ${this.height}px; 
                            left: ${this.left}px; bottom: ${this.bottom}px;'></div>`);

       $("#field").append(attackTag);
       $(`#${this.id}`).css(`transform`, `rotate(${this.degree}deg)`);

    }

    get quarter(){
        return {
            left : this.left,
            right : this.left + this.width,
            bottom : this.bottom,
            up : this.bottom + this.height,
        }
    }

    get coordinates(){
        return{
            x: this.left + this.width/2,
            y: this.bottom + this.height/2,
        }
    }

    move = (MONSTERLIST, obstacle)=>{

//isGetStuckGoingLeft
        for(let obs of obstacle){
                   if(this.rushSpeed.left < 0){
                       if(obs?.isGetStuckGoingLeft(this.quarter, this.rushSpeed.left).bool){
                           this.remove();

                           return true;
                            //HIT
                        }
                   }else{
                       if(obs?.isGetStuckGoingRight(this.quarter, this.rushSpeed.left).bool){
                           this.remove();
                           return true;
                            //HIT
                        }
                   }

                   if(this.rushSpeed.bottom < 0){
                       if(obs?.isGetStuckGoingBottom(this.quarter, this.rushSpeed.bottom).bool){
                           this.remove();
                           return true;
                            //HIT
                       }
                   }else{
                       if(obs?.isGetStuckGoingUp(this.quarter, this.rushSpeed.bottom).bool){
                           this.remove();
                           return true;
                            //HIT
                       }
                   }
        }
        if( Math.sqrt( ((this.default.left - this.left) ** 2 + (this.default.bottom - this.bottom) ** 2 )) >= this.attackRange ){
            this.remove();
            return true;
        }

        for(let monster of MONSTERLIST){
            if ( monster.hitBox(this.width, this.height).left < this.coordinates.x && monster.hitBox(this.width, this.height).right > this.coordinates.x){
                if ( monster.hitBox(this.width, this.height).bottom < this.coordinates.y && monster.hitBox(this.width, this.height).up > this.coordinates.y ){
                    monster.hitCheck(this.damage);
                    $(`#${this.id}`).remove();
                    return true;
                }
            }
        }





        this.left += this.rushSpeed.left;
        this.bottom += this.rushSpeed.bottom;

        $(`#${this.id}`).css('left', `${this.left}px`);
        $(`#${this.id}`).css('bottom', `${this.bottom}px`); 
    }

    remove(){
        $(`#${this.id}`).fadeOut(150,"swing",()=>{
            $(`#${this.id}`).remove();
        });
    }
}




















class Monster extends Living {
    //left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp

    #whichMotion = 0;
    get motion(){
        return this.#whichMotion;
    }

    set motion(motion){
        this.#whichMotion = motion;
    }

    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, monsterClass){
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp);
        this.whichMonster = whichMonster;
        let fig = $(`<div id = monster_${this.whichMonster} class='monster ${monsterClass}' style=display:none;><div class = monster_hp id=monster_hp_${this.whichMonster}><div class = monster_hp_remain id = monster_hp_remain_${this.whichMonster}></div></div></div>`);
        fig.css("left", this.left).css('bottom', this.bottom);
        
        $("#field").append(fig);
        fig.fadeIn(5000, "swing");
       
        this.isWalkAround = false;
        this.moveDirection = Math.floor(Math.random()* 5);
        this.waitForPlayer = false;  
        this.hp = maxhp;
        this.maxhp = maxhp;

        this.skillCoolTime = true;
    }

    moveAnimation = ()=>{
        this.motion = (++this.motion) % (this.url.length * 20);
        $(`#monster_${this.whichMonster}`).css("background-image",`url(${this.url[Math.floor(this.motion / 20)]})`);
    }
    applyHp =()=>{
        $(`#monster_hp_remain_${this.whichMonster}`).css("width", (this.hp / this.maxhp) * 100 + '%');
    }
    dead = ()=>{
        if(this.hp > 0)
            return false;
         return true;
    }
    deadOut = ()=>{
          $(`#monster_${this.whichMonster}`).fadeOut(1000,"swing",function(){
              $(this).remove();
          });

    }

    walkAround = (HEROLIST, ...obstacle)=>{
        if(!this.isWalkAround){
            this.isWalkAround = true;
            let walk = setTimeout(()=>{
                this.moveDirection = Math.floor(Math.random() * 5);
                this.isWalkAround = false;
                clearTimeout(walk);
            }, Math.floor(5000 - Math.random() * 1000));
        }
        //this.quarter , this.coordinates;
        switch(this.moveDirection){
            case 0:
                this.goLeft(obstacle);
                break;
            case 1:
                this.goBottom(obstacle);
                break;
            case 2:
                this.goRight(obstacle);
                break;
            case 3:
                this.goUp(obstacle);
                break;
            case 4:
                break;
            default:
                console.log('error occur, monster move something strange');
        }
    }
    goLeft = (obstacle, movingSpeed)=>{
        let stuck = false;
        let speed = movingSpeed ?? this.move.speed;
        for (let obs of obstacle){
            stuck = stuck || obs.isGetStuckGoingLeft(this.quarter, speed).bool;
        }
        if(!stuck){
            this.left -= speed;
            $(`#monster_${this.whichMonster}`).css("left", this.left);
        }else{
            this.moveDirection = 2;
            //this.moveDirection = Math.floor(Math.random() * 5);
        }
    }

    goRight = (obstacle, movingSpeed)=>{
        let stuck = false;
        let speed = movingSpeed ?? this.move.speed;
        for (let obs of obstacle){
            stuck = stuck || obs.isGetStuckGoingRight(this.quarter, speed).bool;
        }
        if(!stuck){
            this.left += speed;
            $(`#monster_${this.whichMonster}`).css("left", this.left);
        }else{
                        this.moveDirection = 0;
            //this.moveDirection = Math.floor(Math.random() * 5);
        }
    }

    goBottom = (obstacle, movingSpeed)=>{
        let stuck = false;
        let speed = movingSpeed ?? this.move.speed;
        for (let obs of obstacle){
            stuck = stuck || obs.isGetStuckGoingBottom(this.quarter, speed).bool;
        }
        if(!stuck){
            this.bottom -= speed/2;
            $(`#monster_${this.whichMonster}`).css("bottom", this.bottom);
        }else{
            this.moveDirection = 3;
            //this.moveDirection = Math.floor(Math.random() * 5);
        }
    }

    goUp = (obstacle, movingSpeed)=>{
        let stuck = false;
        let speed = movingSpeed ?? this.move.speed;
        for (let obs of obstacle){
            stuck = stuck || obs.isGetStuckGoingUp(this.quarter, speed).bool;
        }
        if(!stuck){
            this.bottom += speed/2;
            $(`#monster_${this.whichMonster}`).css("bottom", this.bottom);
        }else{
            this.moveDirection = 1;
            //this.moveDirection = Math.floor(Math.random() * 5);
        }     
    }


}


class Bat extends Monster {
    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, monsterClass){
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp,whichMonster, monsterClass);
        this.isSpecialAttacking = false;
        this.dashDelay = true;
        this.attackMotion = 0;
        this.skillCoolTime = true; //(1초)
        this.invincible = false;
    }

    doIattack(HEROIST){
        for(let hero of HEROIST){
            if(hero.coordinates.x > this.hitBox(hero.size.width, hero.size.height).left && hero.coordinates.x < this.hitBox(hero.size.width, hero.size.height).right){
                if(hero.coordinates.y > this.hitBox(hero.size.width, hero.size.height).bottom && hero.coordinates.y < this.hitBox(hero.size.width, hero.size.height).up){
                    hero.hitCheck(this.attacking.damage);
                }
            }
        }
    }

    hitCheck(damage){
        /*
    if(this.invincible){
        return;
    }
    this.invincible = true;
    let overwhelm = setTimeout(()=>{
        this.invincible = false;
    },1000); */

       this.hp = Math.max(this.hp - damage, 0);

       this.applyHp(); 
    }

        dashCheck = (HEROLIST)=>{
    for (let hero of HEROLIST){
            if(hero.coordinates.x > this.attackRange(hero.size.width, hero.size.height).left && hero.coordinates.x < this.attackRange(hero.size.width, hero.size.height).right){
                if(hero.coordinates.y > this.attackRange(hero.size.width, hero.size.height).bottom && hero.coordinates.y < this.attackRange(hero.size.width, hero.size.height).up){
                  return hero.whichPlayer;
                }
            }
        }
        return false;
    }


    specialAttack = (hero, ...obstacle)=>{
       if(!this.isSpecialAttacking){

           //destination config
           this.attackMotion++;
           this.isSpecialAttacking = true;
           this.dashDelay = true;
           let dashDelayEnd = setTimeout(()=>{
               this.dashDelay = false;
               clearTimeout(dashDelayEnd);

           }, 300)
           const time = 1.5;
           let distance = {};
           let movingSpeed = {
               x:0,
               y:0,
           };

           distance.x = hero.coordinates.x - this.coordinates.x;
           distance.y = hero.coordinates.y - this.coordinates.y;

           let degree = (Math.atan2(distance.x,distance.y) * 180) / Math.PI;
           movingSpeed.x = this.attacking.range * this.move.speed * Math.sin((degree * Math.PI) / 180);
           movingSpeed.y = this.attacking.range * this.move.speed * Math.cos((degree * Math.PI) / 180);

           let stuck;
           const wallPadding = 5;
           for(let obs of obstacle){
               if(movingSpeed.x > 0){ // goRight
                    stuck = obs.isGetStuckGoingRight(this.quarter, movingSpeed.x);
                    if(stuck.bool){
                        let limit = stuck.limit-this.left-this.size.width - wallPadding;
                        if(movingSpeed.x !== Math.min(movingSpeed.x , limit)){
                            movingSpeed.y *= limit / movingSpeed.x; 
                            movingSpeed.x = limit;
                        }
                        

                    }
               }else{ // goLeft
                    stuck = obs.isGetStuckGoingLeft(this.quarter, -movingSpeed.x);
                    if(stuck.bool){
                        let limit =  this.left - stuck.limit - wallPadding;
                        if(movingSpeed.x !== Math.min(-movingSpeed.x ,limit)){
                            movingSpeed.y *= limit/-movingSpeed.x; 
                            movingSpeed.x = -limit;
                        }
                    }
               }

               if(movingSpeed.y > 0){
                    stuck = obs.isGetStuckGoingUp(this.quarter, movingSpeed.y);
                    if(stuck.bool){
                        let limit = stuck.limit - this.bottom - this.size.height - wallPadding;
                            if(movingSpeed.y !== Math.min(movingSpeed.y, limit)){
                                movingSpeed.x *= limit/movingSpeed.y;
                                movingSpeed.y =limit;
                            }

                    }
               }else{
                    stuck = obs.isGetStuckGoingBottom(this.quarter, -movingSpeed.y);
                    if(stuck.bool){
                        let limit = this.bottom - stuck.limit - wallPadding;
                        if(movingSpeed.y !== Math.min(-movingSpeed.y, limit)){
                                movingSpeed.x *= limit / -movingSpeed.y;
                                movingSpeed.y = -limit;
                        }
                    }
               }
           }

           this.destination= {
               locationX : this.left + movingSpeed.x,
               speedX : movingSpeed.x,
               locationY : this.bottom + movingSpeed.y,
               speedY : movingSpeed.y,
           };
     }

     if(this.dashDelay)
            return;

     let arrive = {x : false, y : false};
     if(this.destination.speedX > 0){
         if(this.destination.locationX <= this.left){
            this.left = this.destination.locationX;
            arrive.x = true;
         }
     }
     else{
         if(this.destination.locationX >= this.left){
            this.left = this.destination.locationX;
            arrive.x = true;
         }
     }

     if(this.destination.speedY > 0){
         if(this.destination.locationY <= this.bottom){
            this.bottom = this.destination.locationY;
            arrive.y = true;
         }
     }
     else{
         if(this.destination.locationY >= this.bottom){
            this.bottom = this.destination.locationY;
            arrive.y = true;
         }
     }

     if(arrive.x && arrive.y){
            this.left = this.destination.locationX;
            this.bottom = this.destination.locationY;
        $(`#monster_${this.whichMonster}`).css("left",this.left).css("bottom", this.bottom);
            this.isSpecialAttacking = false;
            this.destination ={ locationX : 0, speedX : 0, locationY : 0, speedY : 0};
            this.attackMotion--;
            this.skillCoolTime = false;
            let coolTimeEnd = setTimeout(()=>{
                this.skillCoolTime = true;
                clearTimeout(coolTimeEnd);
            }, 1000)
     }else{
        this.left = this.left + (20 * (this.destination.speedX /(Math.abs(this.destination.speedX) + Math.abs(this.destination.speedY))));
        this.bottom = this.bottom + (20 * (this.destination.speedY /(Math.abs(this.destination.speedX) + Math.abs(this.destination.speedY))));
        $(`#monster_${this.whichMonster}`).css("left",this.left).css("bottom", this.bottom);
     }
    }


}

class purpleBat extends Bat {
    constructor(left, bottom, whichMonster){
        const width = 50;
        const height = 30;
        const damage = 10;
        const attackSpeed = 0;
        const attackRange = 150;
        const movingSpeed = 2.5;
        const maxhp = 6;
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'bat');
        this.folderUrl = '../MAIN/img/monster/bat/move/yoons/';

        $(`#monster_hp_${this.whichMonster}`).css("width", `${this.size.width}px`);
    }

    get url(){
            return [
        this.folderUrl + `yoons_${this.attackMotion}_hit_1.png`,
        this.folderUrl + `yoons_${this.attackMotion}_hit_2.png`,
        ]
    }
/*
    get url(){
        return [
            folderUrl + 'yoons_0_hit_1.png',
            folderUrl + 'yoons_0_hit_2.png',
        ]
    }  
*/


   


}

class redBat extends Bat {
    constructor(left, bottom, whichMonster){
        const width = 50;
        const height = 30;
        const damage = 10;
        const attackSpeed = 0;
        const attackRange = 150;
        const movingSpeed = 3;
        const maxhp = 6;
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'bat');
        this.folderUrl = '../MAIN/img/monster/bat/move/yons/';

        $(`#monster_hp_${this.whichMonster}`).css("width", `${this.size.width}px`);  
    }

    get url(){
            return [
        this.folderUrl + `yons_${this.attackMotion}_hit_1.png`,
        this.folderUrl + `yons_${this.attackMotion}_hit_2.png`,
        ]
    }
}

class kingBat extends Bat{
    constructor(left, bottom, whichMonster){
        const width = 300;
        const height = 150;
        const damage = 10;
        const attackSpeed = 0;
        const attackRange = 100;
        const movingSpeed = 3.5;
        const maxhp = 400;
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'kingbat');
        this.folderUrl = '../MAIN/img/monster/bat/move/kingbat/';
        $("#boss_hp").fadeIn(1000, "swing");
        $("#boss_remain").css("width", "100%");

    }
    get url(){
        return[
        this.folderUrl + `${this.attackMotion}_hit/kingbat_1.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_2.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_1.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_2.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_1.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_3.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_4.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_5.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_6.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_7.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_8.png`,
        this.folderUrl + `${this.attackMotion}_hit/kingbat_9.png`,
        ];
    }

    applyHp = ()=>{
        $("#boss_remain").css("width", ((this.hp / this.maxhp) * 100) + '%');
    }
}

class Ghost extends Monster{
    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp){
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp);
    }
}

class grayGhost extends Ghost{
    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp){
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp);
    }
}

class orangeGhost extends Ghost{
    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp){
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp);
    }
}

class grimreaper extends Ghost{
    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp){
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp);
    }
}






















































class Stage {

    #nowStage = 0;
    #chapter = 1;
    
    #STAGES = [
        function(){
           return[0];
        },

        function(){
            let monster = 0;
            return[
                new purpleBat(30,70,monster++),
                new redBat(70,70,monster++),
            ];
        },

        function(){
          let monster = 0;
              //left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, monsterClass
          return[
            new purpleBat(30,70,monster++),
            new redBat(70,70,monster++),
            new purpleBat(30,50,monster++),
            new redBat(70,50,monster++),
          ];
        },

        function(){
          let monster = 0;
              //left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, monsterClass
          return[
            new redBat(20,70,monster++),
            new purpleBat(30,70,monster++),

            new redBat(45,70,monster++),
            new redBat(55,50,monster++),

            new purpleBat(70,70,monster++),
            new redBat(80,70,monster++),
          ];
        },

        function(){
            let monster = 0;
            return [
                new kingBat(50,70,monster++),
            ];

        },

        function(){

        },

        function(){

        },

        function(){

        }
    ];
    get stage(){
        return this.#STAGES;
    }

    get nowStage(){
        return this.#nowStage;
    }

    nextStage(){
        console.log(`now stage : ${this.#nowStage}`);

        this.backgroundImage();

        this.stageHighLight();

        return this.#STAGES[++(this.#nowStage)]();
    }

    backgroundImage(){
        $("#wrapper").css("background-image", `url(./img/background_${this.#chapter}.png)`);
    }

    stageHighLight(){
        if ((this.#nowStage+1) % 4 == 0 && this.#nowStage > 0) {
            $("#stage_num").css("background-image", `url(./img/stage/BOSS.png)`);
                    $("#stage_num").fadeIn(500, "swing", ()=>{$("#stage_num").fadeOut(500, "swing", ()=>{$("#stage_num").fadeIn(500, "swing", ()=>{$("#stage_num").fadeOut(500, "swing", ()=>{$("#stage_num").fadeIn(500, "swing", ()=>{$("#stage_num").fadeOut(500, "swing");
                        });});});});});
        } else {
            $("#stage_num").css("background-image", `url(./img/stage/STAGE${this.#nowStage + 1}.png)`);

            $("#stage_num").fadeIn(2000, "swing", ()=>{
                $("#stage_num").fadeOut(1000, "swing");
            });
            
        }
    }

}
















const openBrowserAndThen = new BrowserManager();
openBrowserAndThen.init();
openBrowserAndThen.selectTitle();


