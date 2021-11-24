class Tanker extends Hero{
    #char = 'tanker';

    constructor(arg, MONSTEROBSTACLE){
        super(arg, 'tanker');
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


        this.MONSTEROBSTACLE = MONSTEROBSTACLE;


        this.eventList.KeyupAttack.dispose();
        this.eventList.KeyupAttack = new EventListener({event: 'keyup', callback : (e)=>{
             if(e.keyCode === this.key['attack']){
                 this.keydownMap[e.keyCode] = false;
                 this.KeyupAttack(this.MONSTEROBSTACLE);
             }
            
        }
        })
        this.eventList.KeyupAttack.add();

    }
           
    

    attack = (MONSTERLIST, MONSTEROBSTACLE)=>{
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
        this.obstacleIdx = MONSTEROBSTACLE.addObject(this.shieldObstacle);
        return this.shieldObstacle;

//this.#COMMONOBSTACLE.addObstaclePartialSide(where , this.#mapInfo.MAPMINWIDTH, this.#mapInfo.MAPMINWIDTH + BORDER, this.#mapInfo.MAPMINHEIGHT, this.#mapInfo.MAPMAXHEIGHT, 'left');  
            
    }

    KeyupAttack = ()=>{
        let where = '';
        $(`#shield_${this.shieldDirection}_${this.whichPlayer}`).addClass('invisible');
        this.shieldDirection = 0;
        this.MONSTEROBSTACLE.removeObstacle(this.obstacleIdx);
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