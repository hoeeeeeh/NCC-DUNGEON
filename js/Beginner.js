class Beginner extends Hero{
    #char = 'beginner';
    constructor(arg){
        let icon = `url(./img/character/skill_icon/beginner.png)`;
        super(arg, 'beginner', icon);
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
        , this.attacking.speed);

        this.attacking.bool = true;
        let attackMotion = setTimeout(()=>{
            this.attacking.bool = false;
        }, 200);

        for (let monster of MONSTERLIST) {
            switch (this.whichDirectionDoesHeGo) {
            case 37:
            case 68:
                if (monster.coordinates.x > this.attackRange(monster.size.width, monster.size.height).left && monster.coordinates.x < this.coordinates.x) {
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
        let leftAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/beginner/attack/attack_left.png); background-size: 100% 100%; position : fixed; 
        left : ${this.left - this.attacking.range}px; bottom : ${this.coordinates.y - this.attacking.range / 2}px; 
        width: ${this.attacking.range}px; height : ${this.attacking.range}px;'> </div>`);
        $("#field").append(leftAttack);
        leftAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 39:
    case 71:
        let rightAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/beginner/attack/attack_right.png); background-size: 100% 100%; position : fixed; 
        left : ${this.quarter.right}px; bottom : ${this.coordinates.y - this.attacking.range / 2}px; 
        width: ${this.attacking.range}px; height : ${this.attacking.range}px;'> </div>`);
        $("#field").append(rightAttack);
        rightAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 38:
    case 82:
        let upAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/beginner/attack/attack_up.png); background-size: 100% 100%; position : fixed; 
        left : ${this.coordinates.x - (this.attacking.range) / 2}px; bottom : ${this.quarter.up}px; 
        width: ${this.attacking.range}px; height : ${this.attacking.range}px;'> </div>`);
        $("#field").append(upAttack);
        upAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 40:
    case 70:
        let downAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/beginner/attack/attack_down.png); background-size: 100% 100%; position : fixed; 
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