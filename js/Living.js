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
        bool : false,
        damage : 0,
        speed : 0,
        range : 0,
    };

    constructor(arg){ 
        
        this.#size.width = parseFloat(arg.width);
        this.#size.height = parseFloat(arg.height);
        
        if (typeof (arg.left) == 'number')
           this.#left  = BrowserManager.screen().width * (arg.left / 100) - this.#size.width/2;
        else if (typeof (arg.left) == 'string')
            this.#left = parseFloat(arg.left);

        if (typeof (arg.bottom) == 'number')
            this.#bottom = BrowserManager.screen().height * (arg.bottom / 100) - this.#size.height/2;
        else if (typeof (arg.bottom) == 'string')
            this.bottom = parseFloat(arg.bottom);

        this.right = this.#left + this.#size.width;
        this.up = this.bottom + this.#size.height;
 
        this.#attacking = {
            damage : arg.damage,
            speed : arg.attackSpeed,
            range : arg.attackRange,
        };

        this.#move = {
            speed : arg.movingSpeed,
        }

        this.maxhp = arg.maxhp;
        this.hp = arg.maxhp;


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
