class MonsterManager {
    #MONSTERLIST = [];

    get MONSTERLIST(){
        return this.#MONSTERLIST;
    }
    constructor(...args){
        for(let i=0; i<args.length; i++){
            this.#MONSTERLIST.push(args[i]);
        }
    }

    push(monster){
        this.#MONSTERLIST.push(monster);
        return monster;
    }

    pop(idx){
        let pop = this.#MONSTERLIST[idx];
        this.#MONSTERLIST.splice(idx,1);
        return pop;
    }

    pushArray(args){
        for(const arg of args){
            this.#MONSTERLIST.push(arg);
        }
    }

    DidWholeMonsterDie(){
        if(this.#MONSTERLIST.length <= 0)
            return true;
        else
            return false;
    }

    monsterMoveAnimation(){
        for(const monster of this.#MONSTERLIST){
            monster.moveAnimation();
        }
    }

    monsterSpecialAttack(HEROLIST, COMMONOBSTACLE, MONSTEROBSTACLE){
        for(const monster of this.#MONSTERLIST){
                monster.specialAttack(HEROLIST, COMMONOBSTACLE, MONSTEROBSTACLE);     
        }

    }

    monsterWalkAround(COMMONOBSTACLE, MONSTEROBSTACLE){
        for(const monster of this.#MONSTERLIST){
            if(!monster.isSpecialAttacking) {
                monster.walkAround(COMMONOBSTACLE,MONSTEROBSTACLE);
            }

        }
    }
    monsterDoIAttack(HEROLIST){
        for(const monster of this.#MONSTERLIST){
            monster.doIattack(HEROLIST);
        }
    }

    monsterDead(){
        for(let idx = 0; idx<this.#MONSTERLIST.length; idx++){
            if(this.#MONSTERLIST[idx].dead()){
                this.#MONSTERLIST[idx].deadOut();
                this.#MONSTERLIST.splice(idx,1);
                idx--;
            }
        }
    }
}