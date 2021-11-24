class HeroManager{
    #HEROLIST = [];
    #GRAVE = new Grave();
    constructor(...args){
        for(let i=0; i<args.length; i++){
            this.#HEROLIST.push(args[i]);
        }
    }

    push(hero){
        this.#HEROLIST.push(hero);
        return hero;
    }

    pop(idx){
        let pop = this.#HEROLIST[idx];
        this.#HEROLIST.splice(idx,1);
        return pop;
    }

    selectTrophyEachHero(nowstage){
        $('#itemWrapper').empty();

        for(let idx = this.#HEROLIST.length -1; idx >= 0; idx--){
            this.#HEROLIST[idx].trophy.selectTrophy(nowstage);
            this.#HEROLIST[idx].trophyMove = false;
            this.#HEROLIST[idx].addEventOnTrophyShop();
        }

/*
        for(const hero of this.#HEROLIST){
            hero.trophy.selectTrophy(nowstage);
            hero.addEventOnTrophyShop();
        }
*/    
    }

    get HEROLIST(){
        return this.#HEROLIST;
    }

    revive(){
        let hero = this.#GRAVE.revive();
        const REVIVEHP = 0.3;

        if(hero){
            hero.hp = hero.maxhp*REVIVEHP;
            hero.keyReset();
            $(`#grave_${hero.whichPlayer}`).remove();
            $(`#character_${hero.whichPlayer}`).fadeIn();

            this.#HEROLIST.splice(hero.whichPlayer - 1, 0, hero);
            

        }


    }

    isCompletedSelectTrophy(){
        if(Trophy.trophySelectComplete >= this.#HEROLIST.length){
            Trophy.trophySelectComplete = 0;
            return true;
        }
        return false;
    }

    removeAllProjection(){
        for(const hero of this.#HEROLIST){
            let removeAllProjection =  hero?.projectionClear;
            if(removeAllProjection){
                removeAllProjection();
            }
       }
    }

    stageStartTeleport(){
        this.#HEROLIST[0].left = 1036;
        this.#HEROLIST[0].bottom = 256;
        this.#HEROLIST[0].draw();

        this.#HEROLIST[1].left = 844;
        this.#HEROLIST[1].bottom = 256;
        this.#HEROLIST[1].draw();
    }

    addEventOnStage(){
        for(const hero of this.#HEROLIST){
            hero.addEventOnStage();
        }
    }

    heroMoveAnimation(){
         for(const hero of this.#HEROLIST){
            hero.moveAnimation();  
         }
    }
    heroProjectionMove(MONSTERLIST,COMMONOBSTACLE,HEROOBSTACLE){
         for(const hero of this.#HEROLIST){
            if(hero?.projectionMove){
                hero?.projectionMove(MONSTERLIST, COMMONOBSTACLE, HEROOBSTACLE);
            }    
         }
    }
    heroMove(COMMONOBSTACLE, HEROOBSTACLE){
        for(const hero of this.#HEROLIST){
            hero.MoveFunctionWhileKeyDownOnStage(COMMONOBSTACLE,HEROOBSTACLE);
        }

    }
    heroAttack(MONSTERLIST,MONSTEROBSTACLE){
        for(const hero of this.#HEROLIST){
            hero.AttackFunctionWhileKeyDownOnStage(MONSTERLIST,MONSTEROBSTACLE);
        }
    }

    heroDeathCheck(){
        for(let idx = 0; idx < this.#HEROLIST.length; idx++){
            if(this.#HEROLIST[idx].deathCheck()){
                this.#GRAVE.push(this.#HEROLIST[idx]); // 무덤 리스트에 넣기
                this.#GRAVE.drawGrave(this.#HEROLIST[idx].coordinates, this.#HEROLIST[idx].whichPlayer);

                $(`#character_${this.#HEROLIST[idx].whichPlayer}`).fadeOut(1000,"swing",()=>{});
                this.#HEROLIST[idx].disposeEventOnStage(); // 키보드 이벤트 해제







                
                this.#HEROLIST.splice(idx,1); // 캐릭터 리스트에서 팝
                
            }
        }
    }

    isGameover(){
        if(this.#HEROLIST.length <= 0){
            $("#stage_num").css("background-image", `url(./img/stage/gameover.png)`);
            $("#wrapper").addClass('gameover');
            $("#stage_num").fadeIn(2000, "swing", ()=>{
                //$("#wrapper_opacity").addClass('gameover');
                //$("#wrapper").addClass('gameover');
            });  
        }
    }
    
}