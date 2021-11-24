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



    functionWhileKeyDownOnTrophyShop = ()=>{
        
    }

    functionWhileKeyDownOnStage = ()=>{ // HERO CLASS 안에 넣을 수 있다.
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
            if (!this.#HEROLIST[0].isDashed && !this.#COMMONOBSTACLE.isGetStuckGoingUp(this.#HEROLIST[0].quarter, this.#HEROLIST[0].move.speed).bool )
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
}
