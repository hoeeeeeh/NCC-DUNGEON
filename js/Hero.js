class Hero extends Living {
    //move = {};
    static numberOfHero = 1; 

    #aggro = {
        score : 0,
        weight : 0,
    }

    //attack = {};

/* Private 선언 */

    #TROPHY;
    get trophy(){
        return this.#TROPHY;
    }
    #whichPlayer = 0;
    get whichPlayer(){
        return this.#whichPlayer;
    }

    #whichMotion = 0;
    get whichMotion(){
        return this.#whichMotion;
    }
    set whichMotion(m){
        this.#whichMotion = m;
    }
    #whichDirectionDoesHeGo = 0;

    #char = '';
    icon = '';



    #keydownMap = new Map([]);
    get keydownMap(){
        return this.#keydownMap;
    }
    keyList = ['left','right', 'bottom', 'up', 'attack','dash','specialAttack'];
/* Private 선언 */


    set whichDirectionDoesHeGo(w){
        this.#whichDirectionDoesHeGo = w;
    }

    get whichDirectionDoesHeGo(){
        return this.#whichDirectionDoesHeGo;
    }

    takeOutInfo(){
        return{
            left : this.quarter.left,
            bottom : this.quarter.bottom,
            damage : this.attacking.damage,
            attackSpeed : this.attacking.speed,
            attackRange : this.attacking.speed,
            movingSpeed : this.move.speed,
            maxhp : this.maxhp,
            whichPlayer : this.whichPlayer,
            whichMotion : this.whichMotion,
            whichDirectionDoesHeGo: this.whichDirectionDoesHeGo,
            key : this.key,
        }
    }

    constructor(arg, char, icon){
/*


key = {
    left : 48,
    right : 50,
    up : 49,
    ...
    attack : 30,
    dash : 20,
    specialAttack : 21,


}



*/

        $("#field").append(
        $(`<div id=character_${arg.whichPlayer} class=character>
                <div class=player id=player_${arg.whichPlayer}></div>
                <div id=gauge_${arg.whichPlayer} class= 'invisible gauge'>
                    <div id=charging_${arg.whichPlayer}></div>
                </div>
                <div class=char_hp>
                    <div id=hp_${arg.whichPlayer}></div>
                </div>
                <div id=char_figure_${arg.whichPlayer}></div>
           </div>`
        ));

        super({
            left : arg.left, 
            bottom : arg.bottom, 
            width : $(`#character_${arg.whichPlayer}`).css("width"), 
            height : $(`#char_figure_${arg.whichPlayer}`).css("height"), 
            damage : arg.damage, 
            attackSpeed : arg.attackSpeed, 
            attackRange : arg.attackRange, 
            movingSpeed : arg.movingSpeed, 
            maxhp : arg.maxhp
        });

        this.#whichPlayer = arg.whichPlayer;
        this.#whichMotion = arg.whichMotion;
        this.#whichDirectionDoesHeGo = arg.whichDirectionDoesHeGo;
        this.#char = char;

        this.dashSpeed = this.move.speed * 25;
        this.isDashed = false;

        this.invincible = false;

        this.draw();

        this.key = arg.key;
        

        this.keyReset(arg);

        this.eventList = {

        };

        this.eventInit();

        this.icon = icon;

        this.#TROPHY = new Trophy(this.whichPlayer);
        this.#TROPHY.statInit(this);
        this.trophyMove = false;

    }

    draw = function(){
        $(`#character_${this.#whichPlayer}`).css("left", `${this.left}px`);
        $(`#character_${this.#whichPlayer}`).css("bottom", `${this.bottom}px`);
        //$(`#character_${this.#whichPlayer}`).css("background-image", `${this.bottom}px`);
        $(`#hp_${this.#whichPlayer}`).css("width", this.hp + '%');
    }

    keyReset(arg=this){
        for(let i = 0; i<this.keyList.length; i++){
            this.#keydownMap.set(arg.key[this.keyList[i]], false);
        }
    }

    goLeft(movingSpeed){
        let speed = movingSpeed ?? this.move.speed; 
        this.left = this.left - speed;
        $(`#character_${this.#whichPlayer}`).css("left", this.left + "px");
        this.whichDirectionDoesHeGo = this.key.left;
    }
    goRight(movingSpeed){
        let speed = movingSpeed ?? this.move.speed; 
        this.left = this.left + speed;
        $(`#character_${this.#whichPlayer}`).css("left", this.left + "px");
        this.whichDirectionDoesHeGo = this.key.right;
    }
    goBottom(movingSpeed){
        let speed = movingSpeed ?? this.move.speed; 
        this.bottom = this.bottom - speed;
        $(`#character_${this.#whichPlayer}`).css("bottom", this.bottom + "px");
        this.whichDirectionDoesHeGo = this.key.bottom;
    }
    goUp(movingSpeed){
        let speed = movingSpeed ?? this.move.speed; 
        this.bottom = this.bottom + speed;
        $(`#character_${this.#whichPlayer}`).css("bottom", this.bottom + "px");
        this.whichDirectionDoesHeGo = this.key.up;
    }

    dash(...args){
        if(this.isDashed || this.dashCoolTime){
            return false;
        }
        this.isDashed = true;
        this.dashCoolTime = true;

        const dashTime = 0.5;

        $(`#character_${this.#whichPlayer}`).css("transition-property", "left,bottom").css("transition-duration", `${dashTime}s, ${dashTime}s`);
        const dashEnd = setTimeout(()=>{
            $(`#character_${this.#whichPlayer}`).css("transition-property", "").css("transition-duration", '');
            this.isDashed = false;
            clearTimeout(dashEnd);
        }, dashTime * 1000);

        const dashCoolTimeEnd = setTimeout(()=>{
            this.dashCoolTime = false;
            clearTimeout(dashCoolTimeEnd);
        }, dashTime * 3000);

        const obstacles = args;
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

            let url = `url('./img/character/${this.#char}/move/move_${where}${motionNum}.png')`;
            if(this.attacking.bool) url =  `url('./img/character/${this.#char}/move/attack_${where}.png')`;
            //$(`#character_${this.idx}`).css("background-image", url);
            $(`#char_figure_${this.#whichPlayer}`).css("background-image", url);
     }

     hpBar(){
         $(`#hp_${this.whichPlayer}`).css("width", (this.hp / this.maxhp) * 100 + '%'); 
         $(`#p${this.whichPlayer}_stat_0_pick_num`).text(this.hp);
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
         if(this.hp <= 0) return;
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











    //EVENTLISTENER

    EVENT = {
         KeydownAttack : (e)=>{
             if(e.keyCode === this.key['attack']){
                 this.#keydownMap[e.keyCode] = true;
             }
         },
         KeyupAttack : (e)=>{
             if(e.keyCode === this.key['attack']){
                 this.#keydownMap[e.keyCode] = false;
             }
         },
         KeydownMove : (e)=>{
             if(e.keyCode === this.key['left'] || e.keyCode === this.key['right'] || e.keyCode === this.key['bottom'] || e.keyCode === this.key['up'] || e.keyCode === this.key['dash']){
                 this.#keydownMap[e.keyCode] = true;
             }

         },
         KeyupMove : (e)=>{
             if(e.keyCode === this.key['left'] || e.keyCode === this.key['right'] || e.keyCode === this.key['bottom'] || e.keyCode === this.key['up'] || e.keyCode === this.key['dash']){
                 this.#keydownMap[e.keyCode] = false;
             }
         },

         KeydownAttackOnTrophyShop : (e)=>{

         },

         KeyupAttackOnTrophyShop : (e)=>{
             console.log(this.trophyMove);
            if (e.keyCode === this.key['attack'] && this.trophyMove){
                 $(`#item_${this.whichPlayer}_${this.#TROPHY.itemHover}`).removeClass(`selected_${this.whichPlayer}p`);

                 Trophy.trophySelectComplete++;
                 this.#TROPHY.trophyStack(this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].idx);
                 this.disposeEventOnTrophyShop();
                 $(`#item_description_${this.whichPlayer}`).text('선택 완료');
                 return this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].function(this);

                 this.#TROPHY.itemHover = 1;
                 this.trophyMove = false;
                 // 공격 (선택)

            }
         },

         KeydownMoveOnTrophyShop : (e)=>{
             const MINITEMSELECT = 1;
            switch (e.keyCode) {
                    case this.key['left']:
                        // 왼
                        if (this.#TROPHY.itemHover > MINITEMSELECT) {
                            --this.#TROPHY.itemHover;
                        }
                            this.trophyMove = true;
                            $(`#item_${this.whichPlayer}_${this.#TROPHY.itemHover+1}`).removeClass(`selected_${this.whichPlayer}p`);
                            $(`#item_${this.whichPlayer}_${this.#TROPHY.itemHover}`).addClass(`selected_${this.whichPlayer}p`);
                            $(`#item_description_${this.whichPlayer}`).text(this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].description(this));
                        break;
                    case this.key['right']:
                        // 오
                        if (this.#TROPHY.itemHover < this.#TROPHY.MAXITEMSELECT) {
                            this.trophyMove = true;
                            $(`#item_${this.whichPlayer}_${this.#TROPHY.itemHover}`).removeClass(`selected_${this.whichPlayer}p`);
                            $(`#item_${this.whichPlayer}_${++this.#TROPHY.itemHover}`).addClass(`selected_${this.whichPlayer}p`);
                            $(`#item_description_${this.whichPlayer}`).text(this.#TROPHY.selectedItem[this.#TROPHY.itemHover - 1].description(this));
                        }
                        break;
             }
         },

         KeyupMoveOnTrophyShop : (e)=>{

         },
    }











    eventInit = ()=>{
        this.eventList.KeydownMove = new EventListener({event : 'keydown', callback : this.EVENT.KeydownMove});
        this.eventList.KeydownAttack = new EventListener({event : 'keydown', callback : this.EVENT.KeydownAttack});
        this.eventList.KeyupMove = new EventListener({event : 'keyup', callback : this.EVENT.KeyupMove});
        this.eventList.KeyupAttack = new EventListener({event : 'keyup', callback : this.EVENT.KeyupAttack});


        this.eventList.KeydownAttackOnTrophyShop = new EventListener({event : 'keydown', callback : this.EVENT.KeydownAttackOnTrophyShop});
        this.eventList.KeydownMoveOnTrophyShop = new EventListener({event : 'keydown', callback : this.EVENT.KeydownMoveOnTrophyShop});
        this.eventList.KeyupAttackOnTrophyShop = new EventListener({event : 'keyup', callback : this.EVENT.KeyupAttackOnTrophyShop});
        this.eventList.KeyupMoveOnTrophyShop = new EventListener({event : 'keyup', callback : this.EVENT.KeyupMoveOnTrophyShop});
    }

    addEventOnStage = ()=>{
        this.eventList.KeydownMove.add();
        this.eventList.KeydownAttack.add();
        this.eventList.KeyupMove.add();
        this.eventList.KeyupAttack.add();
    }

    addEventOnTrophyShop = ()=>{
        this.eventList.KeydownAttackOnTrophyShop.add();
        this.eventList.KeydownMoveOnTrophyShop.add();
        this.eventList.KeyupAttackOnTrophyShop.add();
        this.eventList.KeyupMoveOnTrophyShop.add();
    }

    disposeEventOnStage = ()=>{
        this.eventList.KeydownMove.dispose();
        this.eventList.KeydownAttack.dispose();
        this.eventList.KeyupMove.dispose();
        this.eventList.KeyupAttack.dispose();
    }


    disposeEventOnTrophyShop = ()=>{
        this.eventList.KeydownAttackOnTrophyShop.dispose();
        this.eventList.KeydownMoveOnTrophyShop.dispose();
        this.eventList.KeyupAttackOnTrophyShop.dispose();
        this.eventList.KeyupMoveOnTrophyShop.dispose();
    }







    MoveFunctionWhileKeyDownOnStage = (COMMONOBSTACLE, HEROOBSTACLE)=>{
        if(this.#keydownMap[this.key['left']]){
            if (!this.isDashed &&  !COMMONOBSTACLE.isGetStuckGoingLeft(this.quarter, this.move.speed).bool )
                this.goLeft();
        }
        if(this.#keydownMap[this.key['right']]){
            if (!this.isDashed &&  !COMMONOBSTACLE.isGetStuckGoingRight(this.quarter, this.move.speed).bool )
                this.goRight();
        }
        if(this.#keydownMap[this.key['up']]){
            if (!this.isDashed &&  !COMMONOBSTACLE.isGetStuckGoingUp(this.quarter, this.move.speed).bool )
                this.goUp();
        }
        if(this.#keydownMap[this.key['bottom']]){
            if (!this.isDashed &&  !COMMONOBSTACLE.isGetStuckGoingBottom(this.quarter, this.move.speed).bool )
                this.goBottom();
        }
        if(this.#keydownMap[this.key['dash']]){
            if (!this.isDashed &&  !COMMONOBSTACLE.isGetStuckGoingLeft(this.quarter, this.move.speed).bool )
                this.dash(COMMONOBSTACLE, HEROOBSTACLE);
        }
    }

    AttackFunctionWhileKeyDownOnStage = (MONSTERLIST, MONSTEROBSTACLE)=>{
        if(this.#keydownMap[this.key['attack']]){
            this.attack(MONSTERLIST, MONSTEROBSTACLE);
        }
    }


   


}

