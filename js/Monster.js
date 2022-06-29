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
        super({
            left : left,
            bottom : bottom, 
            width : width, 
            height : height, 
            damage : damage, 
            attackSpeed : attackSpeed, 
            attackRange : attackRange, 
            movingSpeed : movingSpeed, 
            maxhp : maxhp
        });
        this.whichMonster = whichMonster;
        let fig = $(`
        <div id = monster_${this.whichMonster} class=monster style=display:none;>
            <div class = monster_hp id=monster_hp_${this.whichMonster}>
                <div class = monster_hp_remain id = monster_hp_remain_${this.whichMonster}></div>
            </div>
            <div id=monster_${this.whichMonster}_figure class=${monsterClass}></div>
        </div>`);
        fig.css("left", this.left).css('bottom', this.bottom);
        
        $("#field").append(fig);
        fig.fadeIn(5000, "swing");
       
        this.isWalkAround = false;
        this.moveDirection = Math.floor(Math.random()* 5);
        this.waitForPlayer = false;  
        this.hp = maxhp;
        this.maxhp = maxhp;

        this.skillCoolTime = true;

        this.invincible = false;

        $(`#monster_hp_${this.whichMonster}`).css("width", `${this.size.width}px`);  
    }

    bossHpBar(){
        $(`#monster_hp_${this.whichMonster}`).remove();
        $("#boss_hp").fadeIn(1000, "swing");
        $("#boss_remain").css("width", "100%")
    }

    moveAnimation = ()=>{
        this.motion = (++this.motion) % (this.url.length * 20);
        $(`#monster_${this.whichMonster}_figure`).css("background-image",`url(${this.url[Math.floor(this.motion / 20)]})`);
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

    walkAround = (...obstacle)=>{
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
    goLeft = (obstacle, movingSpeed = undefined)=>{
        let stuck = false;
        let speed = movingSpeed ?? this.move.speed;
        speed = Math.abs(speed);
        for (let obs of obstacle){
            stuck = stuck || obs.isGetStuckGoingLeft(this.quarter, speed).bool;
        }
        if(!stuck){
            this.left -= speed;
            $(`#monster_${this.whichMonster}`).css("left", this.left);
            return false;
        }else{
            this.moveDirection = 2;
            return true;
            //this.moveDirection = Math.floor(Math.random() * 5);
        }
    }

    goRight = (obstacle, movingSpeed  = undefined)=>{
        let stuck = false;
        let speed = movingSpeed ?? this.move.speed;
        speed = Math.abs(speed);
        for (let obs of obstacle){
            stuck = stuck || obs.isGetStuckGoingRight(this.quarter, speed).bool;
        }
        if(!stuck){
            this.left += speed;
            $(`#monster_${this.whichMonster}`).css("left", this.left);
            return false;
        }else{
            this.moveDirection = 0;
            return true;
            //this.moveDirection = Math.floor(Math.random() * 5);
        }
    }

    goBottom = (obstacle, movingSpeed  = undefined)=>{
        let stuck = false;
        let speed = movingSpeed ?? this.move.speed;
        speed = Math.abs(speed);
        for (let obs of obstacle){
            stuck = stuck || obs.isGetStuckGoingBottom(this.quarter, speed).bool;
        }
        if(!stuck){
            this.bottom -= speed/2;
            $(`#monster_${this.whichMonster}`).css("bottom", this.bottom);
            return false;
        }else{
            this.moveDirection = 3;
            return true;
            //this.moveDirection = Math.floor(Math.random() * 5);
        }
    }

    goUp = (obstacle, movingSpeed = undefined)=>{ // stuck -> true , not stuck -> false
        let stuck = false;
        let speed = movingSpeed ?? this.move.speed;
        speed = Math.abs(speed);
        for (let obs of obstacle){
            stuck = stuck || obs.isGetStuckGoingUp(this.quarter, speed).bool;
        }
        if(!stuck){
            this.bottom += speed/2;
            $(`#monster_${this.whichMonster}`).css("bottom", this.bottom);
            return false;
        }else{
            this.moveDirection = 1;
            return true;
            //this.moveDirection = Math.floor(Math.random() * 5);
        }     
    }

    hitCheck(damage){
       if(this.invincible) return;
       this.hp = Math.max(this.hp - damage, 0);

       this.applyHp(); 
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

    specialAttack = ()=>{

    }


}


class Bat extends Monster {
    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, monsterClass){
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp,whichMonster, monsterClass);
        this.isSpecialAttacking = false;
        this.dashDelay = true;
        this.attackMotion = 0;
        this.skillCoolTime = false; //(1초)

        this.specialAttackMoveRange = {x:0, y:0};
        this.specialAttackMoveDistance = 0;
    }


    specialAttack = (HEROLIST, MONSTERLIST, ...obstacle)=>{


//coolTime
        if(this.skillCoolTime)
            return;
//coolTime



//dashCheck
        let dashCheck = (HEROLIST)=>{
            for (let idx = 0; idx<HEROLIST.length; idx++){
                const hero = HEROLIST[idx];
                if(hero.coordinates.x > this.attackRange(hero.size.width, hero.size.height).left && hero.coordinates.x < this.attackRange(hero.size.width, hero.size.height).right){
                    if(hero.coordinates.y > this.attackRange(hero.size.width, hero.size.height).bottom && hero.coordinates.y < this.attackRange(hero.size.width, hero.size.height).up){
                        return idx;
                    }
                 }
             }
             return false;
         }

    // destination Config
       if(!this.isSpecialAttacking){

           let temp = dashCheck(HEROLIST);
           if(temp === false) return;

           (()=>{
               const hero = HEROLIST[temp];
               let distance = {};

               distance.x = hero.coordinates.x - this.coordinates.x;
               distance.y = hero.coordinates.y - this.coordinates.y;

               let degree = (Math.atan2(distance.x,distance.y) * 180) / Math.PI;

               this.specialAttackMoveRange.x = this.attacking.range * this.move.speed * Math.sin((degree * Math.PI) / 180);
               this.specialAttackMoveRange.y = this.attacking.range * this.move.speed * Math.cos((degree * Math.PI) / 180);

               this.attackMotion++;
               this.isSpecialAttacking = true;
               this.dashDelay = true;

               
           })();
       }
    // destination Config
    
//dashCheck


        let dashDelayEnd = setTimeout(()=>{
                   this.dashDelay = false;
                   clearTimeout(dashDelayEnd);
        }, 500);



        if(this.dashDelay) return;



// dash
        const specialAttackMovingSpeed = 20;

        let isStuck = false;
        const moveX = this.specialAttackMoveRange.x / specialAttackMovingSpeed;
        const moveY = this.specialAttackMoveRange.y / specialAttackMovingSpeed;

        if(this.specialAttackMoveRange.x >= 0) isStuck = isStuck || this.goRight(obstacle, moveX);
        else if(this.specialAttackMoveRange.x < 0) isStuck = isStuck || this.goLeft(obstacle, moveX);

        if(this.specialAttackMoveRange.y >= 0) isStuck = isStuck || this.goUp(obstacle, moveY);
        else if(this.specialAttackMoveRange.y < 0) isStuck = isStuck || this.goBottom(obstacle, moveY);
// dash
        this.specialAttackMoveDistance++;
//dashEnd?       
        if(isStuck || this.specialAttackMoveDistance >= specialAttackMovingSpeed ){
            console.log('end');
            this.specialAttackMoveRange = {x:0, y:0};
            this.specialAttackMoveDistance = 0;
            this.attackMotion--;
            this.isSpecialAttacking = false;
            this.dashDelay = false;

            this.skillCoolTime = true;
            let skillCoolTimeEnd = setTimeout(()=>{
                this.skillCoolTime = false;
                clearTimeout(skillCoolTimeEnd);
            }, 3000);
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
        this.folderUrl = './img/monster/bat/move/yoons/';

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
        const movingSpeed = 3.5;
        const maxhp = 6;
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'bat');
        this.folderUrl = './img/monster/bat/move/yons/';
 
    }

    get url(){
            return [
        this.folderUrl + `yons_${this.attackMotion}_hit_1.png`,
        this.folderUrl + `yons_${this.attackMotion}_hit_2.png`,
        ]
    }
}

class kingBat extends Bat{
    #bronzeList = [];

    constructor(left, bottom, whichMonster){
        const width = 200;
        const height = 150;
        const damage = 20;
        const attackSpeed = 0;
        const attackRange = 100;
        const movingSpeed = 4;
        const maxhp = 120;
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'kingbat');
        this.folderUrl = './img/monster/bat/move/kingbat/';

        this.bossHpBar();

        this.invincible = true;

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

specialAttack = (HEROLIST, MONSTERLIST, ...obstacle)=>{


//coolTime
        if(this.skillCoolTime)
            return;
//coolTime



//dashCheck
        let dashCheck = (HEROLIST)=>{
            for (let idx = 0; idx<HEROLIST.length; idx++){
                const hero = HEROLIST[idx];
                if(hero.coordinates.x > this.attackRange(hero.size.width, hero.size.height).left && hero.coordinates.x < this.attackRange(hero.size.width, hero.size.height).right){
                    if(hero.coordinates.y > this.attackRange(hero.size.width, hero.size.height).bottom && hero.coordinates.y < this.attackRange(hero.size.width, hero.size.height).up){
                        return idx;
                    }
                 }
             }
             return false;
         }

    // destination Config
       if(!this.isSpecialAttacking){

           let temp = dashCheck(HEROLIST);
           if(temp === false) return;

           (()=>{
               const hero = HEROLIST[temp];
               let distance = {};

               distance.x = hero.coordinates.x - this.coordinates.x;
               distance.y = hero.coordinates.y - this.coordinates.y;

               if(Math.abs(distance.x) > Math.abs(distance.y) ) distance.y = 0;
               else distance.x = 0;

               this.specialAttackMoveRange.x = this.attacking.range * this.move.speed * distance.x/200;
               this.specialAttackMoveRange.y = this.attacking.range * this.move.speed * distance.y/150;


               this.attackMotion++;
               this.isSpecialAttacking = true;
               this.dashDelay = true;

               
           })();
       }
    // destination Config
    
//dashCheck


        let dashDelayEnd = setTimeout(()=>{
                   this.dashDelay = false;
                   clearTimeout(dashDelayEnd);
        }, 500);



        if(this.dashDelay) return;



// dash
        const specialAttackMovingSpeed = 20;

        let isStuck = false;
        const moveX = this.specialAttackMoveRange.x / specialAttackMovingSpeed;
        const moveY = this.specialAttackMoveRange.y / specialAttackMovingSpeed;

        if(this.specialAttackMoveRange.x >= 0) isStuck = isStuck || this.goRight(obstacle, moveX);
        else if(this.specialAttackMoveRange.x < 0) isStuck = isStuck || this.goLeft(obstacle, moveX);

        if(this.specialAttackMoveRange.y >= 0) isStuck = isStuck || this.goUp(obstacle, moveY);
        else if(this.specialAttackMoveRange.y < 0) isStuck = isStuck || this.goBottom(obstacle, moveY);

// dash

        this.specialAttackMoveDistance++;

//dashEnd?       

        const dashEndFunc = ()=>{
            this.specialAttackMoveRange = {x:0, y:0};
            this.specialAttackMoveDistance = 0;
            this.isSpecialAttacking = false;
            this.dashDelay = false;

            this.skillCoolTime = true;
            let skillCoolTimeEnd = setTimeout(()=>{
                this.skillCoolTime = false;
                clearTimeout(skillCoolTimeEnd);
            }, 3000);
        }


        if(isStuck){
            const MAXBRONZE = 3;
            if(this.#bronzeList.length >= MAXBRONZE){
                this.summon(MONSTERLIST);
            }else{
                this.bronzeBat(80 - Math.floor(Math.random()*65), 75 - Math.floor(Math.random()*55) );
            }
            const temp = this.move.speed;
            this.move.speed = 0;

            this.invincible = false;
                dashEndFunc();
            this.attackMotion = 2;
            let wallCrash = setTimeout(()=>{
                this.attackMotion = 0;
                this.move.speed = temp;
                this.invincible = true;
            }, 3000);


        }

        else if(this.specialAttackMoveDistance >= specialAttackMovingSpeed ){
            dashEndFunc();
            this.attackMotion--;
        }


    }

    hitCheck(damage){
       if(this.invincible) damage = damage * 0.05;
       this.hp = Math.max(this.hp - damage, 0);

       this.applyHp(); 
	   
	   if(this.hp <= 0) {
			$(`.bronzeBat`).each(function(){
				$(this).remove();
			});
	   }
    }

    bronzeBat(left, bottom){
        this.#bronzeList.push({left : left, bottom : bottom});

        left = BrowserManager.screen().width * (left / 100) - 50/2;
        bottom = BrowserManager.screen().height * (bottom / 100) - 30/2;
        let fig = $(`<div class='monster bronzeBat' style=display:none;></div>`);
        fig.css("left", left+'px').css('bottom', bottom+'px');
        $("#field").append(fig);
        fig.fadeIn();




    }

    summon(MONSTERLIST){
        $(`.bronzeBat`).each(function(){
            $(this).fadeOut();
        });

        for(const args of this.#bronzeList){
			let whichBat = Math.floor(Math.random()*2);
			if(whichBat) MONSTERLIST.push(new purpleBat(args.left , args.bottom, MONSTERLIST.length));
			else MONSTERLIST.push(new redBat(args.left , args.bottom, MONSTERLIST.length));
        }

        this.#bronzeList = [];



    }
    


}



class Penguin extends Monster{
    constructor(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, monsterClass){
        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp,whichMonster, monsterClass);
        this.isSpecialAttacking = false;
        this.skillCoolTime = {bool : true, coolTime : 5000 - Math.floor(Math.random()*2000)};
        const firstSkillDelay = setTimeout(()=>{
            console.log('coolTime');
            this.skillCoolTime.bool = false;
        }, this.skillCoolTime.coolTime);

        this.rotateDegree = 0;
        this.dashDelay = true;
        this.dashDirection = {
            x: 0,
            y: 0,
        }
    }

    // 5도, 움직임 * 2
    //width: 32px;
    //height: 36px;
 specialAttack = (HEROLIST, MONSTERLIST, ...obstacle)=>{
        if(this.skillCoolTime.bool) return;


        const topBlade = ()=>{
            this.rotateDegree = (this.rotateDegree + 40);
            $(`#monster_${this.whichMonster}_figure`).css("transform", `rotate(${this.rotateDegree % 360}deg)`);
        }

        const dashWhileTopBlade = ()=>{
            if(this.dashDelay) return;

            if(this.dashDirection.x <= 0){
                if(this.goLeft(obstacle, this.dashDirection.x)) this.dashDirection.x = -this.dashDirection.x;
            }else{
                if(this.goRight(obstacle, this.dashDirection.x)) this.dashDirection.x = -this.dashDirection.x;
            }

            if(this.dashDirection.y <= 0){
                if(this.goBottom(obstacle, this.dashDirection.y)) this.dashDirection.y = -this.dashDirection.y;
            }else{
                if(this.goUp(obstacle, this.dashDirection.y)) this.dashDirection.y = -this.dashDirection.y;
            }

        }

        const getCoolTime = ()=>{
                this.skillCoolTime.bool = true;
                let skillCoolTimeEnd = setTimeout(()=>{
                    this.skillCoolTime.bool = false;

                    clearTimeout(skillCoolTimeEnd);
                }, this.skillCoolTime.coolTime);
        }

        const topBladeConfig = ()=>{
            const specialAttackDuration = 10 - Math.floor(Math.random()*5) // 5 < delay < 10

            const specialAttackDegree = Math.floor(Math.random() * 360);

            this.dashDelay = true;
            const dashDelayEnd = setTimeout(()=>{
                this.dashDelay = false;
                clearTimeout(dashDelayEnd);
            }, 2000);
            this.dashDirection.x = this.move.speed * 4 * Math.cos(specialAttackDegree * Math.PI / 180);
            this.dashDirection.y = this.move.speed * 4 * Math.sin(specialAttackDegree * Math.PI / 180);

            this.skillCoolTime.coolTime = (specialAttackDuration * 0.7) * 1000;

            this.isSpecialAttacking = true;
            this.specialAttackEnd = false;
            let specialAttackEnd = setTimeout(()=>{
                this.isSpecialAttacking = false;

                clearTimeout(specialAttackEnd);
            }, specialAttackDuration * 1000);
        }

        if(this.isSpecialAttacking){
            topBlade();
            dashWhileTopBlade();
        }
        else{
            if(this.rotateDegree % 360 !== 0){
                topBlade();
                dashWhileTopBlade();
            }
            else if(this.rotateDegree === 0){ // 초기 상태
                topBladeConfig();
            }else if(this.rotateDegree % 360 === 0){ // 탑블레이드 돌다가 끝났을 때
                this.rotateDegree = 0;
                getCoolTime();
            }
        }

    }
}



class normalPenguin extends Penguin{
    constructor(left, bottom, whichMonster, undead = false){
        const width = 48;
        const height = 48;
        const damage = 10;
        const attackSpeed = 0;
        const attackRange = 150;
        const movingSpeed = 3;
        let maxhp;
        if(undead) maxhp = 1000;
        else maxhp = 7;
        

        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'penguin');


        this.folderUrl = `./img/monster/penguin/penguin/`;
        //this.folderUrl = `./img/monster/penguin/elsa/`;
    }
    get url(){
        return[
            this.folderUrl + `penguin_0.png`,
            this.folderUrl + `penguin_1.png`,
            /*
            this.folderUrl + `snow.png`,
            this.folderUrl + `snow.png`,
            */
        ];
    }

   
}

class kingPenguin extends Penguin{
    constructor(left, bottom, whichMonster, undead = false){
        const width = 48;
        const height = 48;
        const damage = 10;
        const attackSpeed = 0;
        const attackRange = 150;
        const movingSpeed = 5;
        let maxhp;
        if(undead) maxhp = 1000;
        else maxhp = 7;

        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'kingpenguin');

        this.folderUrl = `./img/monster/penguin/kingpenguin/`;
    }
    get url(){
        return[
            this.folderUrl + `kingpenguin_0.png`,
            this.folderUrl + `kingpenguin_1.png`,
        ];
    } 
}

    // 5도, 움직임 * 2
    //width: 32px;
    //height: 36px;

class iceKnight extends Penguin{
    constructor(left, bottom, whichMonster){
        const width = 28;
        const height = 41;
        const damage = 10;
        const attackSpeed = 0;
        const attackRange = 150;
        const movingSpeed = 2;
        const maxhp = 7;

        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'iceKnight');

        this.folderUrl = `./img/monster/penguin/elsa/`;
    }
    get url(){
        return[
            this.folderUrl + `iceKnight_0.png`,
            this.folderUrl + `iceKnight_1.png`,
        ];
    }
    specialAttack = ()=>{

    }
}


class Elsa extends Penguin{

    #projection = {
        left : [],
        right : [],
        bottom : [],
        up : [],
    }
    constructor(left, bottom, whichMonster){
        const width = 103.5;
        const height = 157.5;
        const damage = 10;
        const attackSpeed = 0;
        const attackRange = 150;
        const movingSpeed = 1;
        const maxhp = 200;

        super(left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, 'elsa');

        //setInterval(this.snowAttack, 2000);

        this.folderUrl = `./img/monster/penguin/elsa/`;

        this.bossHpBar();

        this.snowNum = 0;
    }
    get url(){
        return[
            this.folderUrl + `elsa_0.png`,
            this.folderUrl + `elsa_1.png`,
        ];
    } 

    applyHp = ()=>{
        $("#boss_remain").css("width", ((this.hp / this.maxhp) * 100) + '%');
    }

    specialAttack = (HEROLIST, MONSTERLIST, ...obstacle)=>{
        this.projectionMove(HEROLIST, obstacle);
        //this.healAlliance(MONSTERLIST);
        if(this.skillCoolTime.bool) return;

        this.skillCoolTime.bool = true;
        this.snowAttack(HEROLIST, obstacle);

        const skillCoolTimeEnd = setTimeout(()=>{
             this.skillCoolTime.bool = false;
        }, 3000);
    }
    snowAttack = (HEROLIST, obstacle)=>{
       const moveSpeedTemp = this.move.speed;
       this.move.speed = 0;
       const moveStopEnd = setTimeout(()=>{
            this.move.speed = moveSpeedTemp;
            setTimeout(moveStopEnd);
       }, 1000);
       this.#projection.left.push(this.snowObject({left : -2, bottom : 0}));
       //this.#projection.left.push(this.snowObject({left : -Math.sqrt(2), bottom : Math.sqrt(2)}));
       //this.#projection.left.push(this.snowObject({left : -Math.sqrt(2), bottom : -Math.sqrt(2)}));
       this.#projection.left.push(this.snowObject({left : -1, bottom : Math.sqrt(3)}));
       this.#projection.left.push(this.snowObject({left : -1, bottom : -Math.sqrt(3)}));

       this.#projection.left.push(this.snowObject({left : -Math.sqrt(3), bottom : 1}));
       this.#projection.left.push(this.snowObject({left : -Math.sqrt(3), bottom : -1}));

       this.#projection.right.push(this.snowObject({left : 2, bottom : 0}));

       this.#projection.right.push(this.snowObject({left : 1, bottom : Math.sqrt(3)}));
       this.#projection.right.push(this.snowObject({left : 1, bottom : -Math.sqrt(3)}));

       this.#projection.right.push(this.snowObject({left : Math.sqrt(3), bottom : 1}));
       this.#projection.right.push(this.snowObject({left : Math.sqrt(3), bottom : -1}));


       //this.#projection.right.push(this.snowObject({left : Math.sqrt(2), bottom : Math.sqrt(2)}));
       //this.#projection.right.push(this.snowObject({left : Math.sqrt(2), bottom : -Math.sqrt(2)}));

       this.#projection.up.push(this.snowObject({left : 0, bottom : 2}));
       this.#projection.bottom.push(this.snowObject({left : 0, bottom : -2}));

    }

    hitCheck(damage){
       if(this.invincible) damage = damage * 0.05;
       this.hp = Math.max(this.hp - damage, 0);

       this.applyHp(); 
	   
	   if(this.hp <= 0) {
	       this.removeSnowAll();
	   }
    }

    snowObject = (rushSpeed)=>{
        const WIDTH = 32;
        const HEIGHT = 36;
        const DEGREE = 5;
        
        return new Projection({
            width : WIDTH,
            height : HEIGHT,
            left : this.coordinates.x - WIDTH/2,
            bottom : this.coordinates.y - HEIGHT/2,
            whichPlayer : 'elsa',
            arrow : '',
            id : `snow`,
            idx : this.snowNum++,
            _class : `snow`,
            degree : DEGREE,
            rushSpeed : rushSpeed,
            attackRange : this.attacking.range * 10,
            damage : this.attacking.damage,
       }, true);
    }

    removeSnowAll(){
        for(const snow of this.#projection.left) snow.remove();
        for(const snow of this.#projection.right) snow.remove();
        for(const snow of this.#projection.up) snow.remove();
        for(const snow of this.#projection.bottom) snow.remove();
    }

    projectionMove = (OBJECT, obstacle)=>{
         for(let i = 0; i<this.#projection.left.length; i++){
            if(this.#projection.left[i].move(OBJECT, obstacle)){
                this.#projection.left.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.right.length; i++){
            if(this.#projection.right[i].move(OBJECT, obstacle)){
                this.#projection.right.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.up.length; i++){
            if(this.#projection.up[i].move(OBJECT, obstacle)){
                this.#projection.up.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.bottom.length; i++){
            if(this.#projection.bottom[i].move(OBJECT, obstacle)){
                this.#projection.bottom.splice(i,1);
                    i--;
            }
        }

    }

    healAlliance = (OBJECT) =>{
        let obj;
         for(let i = 0; i<this.#projection.left.length; i++){
             obj = this.#projection.left[i].targetAlliance(OBJECT, this.whichMonster)
            if(obj.bool){
                obj.object.hp = Math.min(OBJECT.hp + 20, OBJECT.maxhp);
                obj.object.applyHp();
                this.#projection.left.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.right.length; i++){
            obj = this.#projection.right[i].targetAlliance(OBJECT, this.whichMonster)
            if(obj.bool){
                obj.object.hp = Math.min(OBJECT.hp + 20, OBJECT.maxhp);
                obj.object.applyHp();
                this.#projection.right.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.up.length; i++){
            obj = this.#projection.up[i].targetAlliance(OBJECT, this.whichMonster)
            if(obj.bool){
                obj.object.hp = Math.min(OBJECT.hp + 20, OBJECT.maxhp);
                obj.object.applyHp();
                this.#projection.up.splice(i,1);
                    i--;
            }
        }
        for(let i = 0; i<this.#projection.bottom.length; i++){
            obj = this.#projection.bottom[i].targetAlliance(OBJECT, this.whichMonster);
            if(obj.bool){
                obj.object.hp = Math.min(OBJECT.hp + 20, OBJECT.maxhp);
                obj.object.applyHp();
                this.#projection.bottom.splice(i,1);
                    i--;
            }
        }
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

