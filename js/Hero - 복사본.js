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


    #keydownMap = new Map([]);
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




















     KeydownAttack(){

     }
     KeyupAttack(){

     }
     KeydownMove(){

     }
     KeyupMove(){

     }
     KeydownAttackOnTrophyShop(){

     }
     KeyupAttackOnTrophyShop(){

     }


   


}

