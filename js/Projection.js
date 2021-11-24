class Projection{
    constructor(args, alwaysRotate = false){
        this.width = args.width;
        this.height = args.height;
        this.left= args.left;
        this.bottom = args.bottom;
        this.whichPlayer = args.whichPlayer;
        this.arrow = args.arrow;
        this.idx = args.idx;
        this.id = `${args.id}_${this.whichPlayer}_${this.idx}`;
        this._class = args._class;
        this.default = {
            left: args.left,
            bottom: args.bottom,
        }

        this.rushSpeed = args.rushSpeed;
        this.attackRange = args.attackRange;
        this.damage = args.damage;

        this.degree = args.degree;
        this.rotateDegree = args.degree;

        //this.id = `heroAttack_${this.whichPlayer}_${this.idx}`;
        let attackTag = $(`<div id = '${this.id}' 
                            class = '${this._class}' 
                            style='width: ${this.width}px; height: ${this.height}px; 
                            left: ${this.left}px; bottom: ${this.bottom}px;'></div>`);

       $("#field").append(attackTag);
       $(`#${this.id}`).css(`transform`, `rotate(${this.degree}deg)`);

       this.alwaysRotate = alwaysRotate;
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

    move = (OBJECT, obstacle)=>{
        if(this.alwaysRotate){
            $(`#${this.id}`).css('transform', `rotate(${(this.degree+=this.rotateDegree)%360}deg`);
        }

//isGetStuckGoingLeft
        for(const obs of obstacle){
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

        this.attackEnemy(OBJECT);

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
    attackEnemy = (OBJECT)=>{
        for(const obj of OBJECT){
            if ( obj.hitBox(this.width, this.height).left < this.coordinates.x && obj.hitBox(this.width, this.height).right > this.coordinates.x){
                if ( obj.hitBox(this.width, this.height).bottom < this.coordinates.y && obj.hitBox(this.width, this.height).up > this.coordinates.y ){
                    obj.hitCheck(this.damage);
                    $(`#${this.id}`).remove();
                    return true;
                }
            }
        }
    }
    targetAlliance = (OBJECT, whichObject)=>{
        for(const obj of OBJECT){
            if(obj.whichMonster === whichObject) continue;
            if ( obj.hitBox(this.width, this.height).left < this.coordinates.x && obj.hitBox(this.width, this.height).right > this.coordinates.x){
                if ( obj.hitBox(this.width, this.height).bottom < this.coordinates.y && obj.hitBox(this.width, this.height).up > this.coordinates.y ){
                    $(`#${this.id}`).remove();
                    return {bool : true, object : obj};
                }
            }
        }
        return {bool : false} 
    }


}