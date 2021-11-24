class Stage {

    #nowStage = 0;
    #chapter = 1;
    get chapter(){
        return this.#chapter;
    }
    set chapter(num){
        this.#chapter = num;
    }
    #STAGES = [
        function(){
           return[0];
        },

        function(){
            let monster = 0;
            return[
                new purpleBat(30,70,monster++),
                new purpleBat(70,70,monster++),
                new purpleBat(40,60,monster++),
                new purpleBat(60,60,monster++),
            ];
        },

        function(){
          let monster = 0;
              //left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, monsterClass
          return[
            new purpleBat(30,70,monster++),
            new redBat(70,70,monster++),
            new purpleBat(40,60,monster++),
            new redBat(60,60,monster++),
          ];
        },

        function(){
          let monster = 0;
              //left, bottom, width, height, damage, attackSpeed, attackRange, movingSpeed, maxhp, whichMonster, monsterClass
          return[
            new redBat(20,70,monster++),
            new purpleBat(30,70,monster++),

            new redBat(45,70,monster++),
            new redBat(55,70,monster++),

            new purpleBat(70,70,monster++),
            new redBat(80,70,monster++),
          ];
        },

        function(){
            let monster = 0;
            return [
                new kingBat(50,70,monster++),
            ];

        },

        ()=>{
            this.#chapter++;
            this.backgroundImage();
            let monster = 0;
            return[
                new normalPenguin(30,70,monster++),
                new normalPenguin(70,70,monster++),
            ];
        },

        function(){
            let monster = 0;
            return[
                new normalPenguin(30,70,monster++),
                new normalPenguin(70,70,monster++),
                new kingPenguin(50, 70, monster++),
                new kingPenguin(60, 70, monster++),
            ];
        },

        function(){
            let monster = 0;
            return[
                new normalPenguin(30,70,monster++),
                new normalPenguin(70,70,monster++),
                new normalPenguin(60,60,monster++),
                new kingPenguin(60, 60, monster++),
                new kingPenguin(50, 70, monster++),
                new kingPenguin(60, 70, monster++),
            ];
        },

        function(){
            let monster = 0;
            return[
                new normalPenguin(30,70,monster++),
                new normalPenguin(70,70,monster++),
                new kingPenguin(40, 70, monster++),
                new kingPenguin(60, 70, monster++),
                new Elsa(50, 70, monster++),

            ];
        }
    ];
    get stage(){
        return this.#STAGES;
    }

    get nowStage(){
        return this.#nowStage;
    }

    nextStage(){
        console.log(`now stage : ${this.#nowStage}`);

        this.stageHighLight();

        return this.#STAGES[++(this.#nowStage)]();
    }

    backgroundImage(){
        $("#wrapper").css("background-image", `url(./img/background_${this.#chapter}.png)`);
    }

    stageHighLight(){
        if ((this.#nowStage+1) % 4 == 0 && this.#nowStage > 0) {
            $("#stage_num").css("background-image", `url(./img/stage/BOSS.png)`);
                    $("#stage_num").fadeIn(500, "swing", ()=>{$("#stage_num").fadeOut(500, "swing", ()=>{$("#stage_num").fadeIn(500, "swing", ()=>{$("#stage_num").fadeOut(500, "swing", ()=>{$("#stage_num").fadeIn(500, "swing", ()=>{$("#stage_num").fadeOut(500, "swing");
                        });});});});});
        } else {
            $("#stage_num").css("background-image", `url(./img/stage/STAGE${this.#nowStage + 1}.png)`);

            $("#stage_num").fadeIn(2000, "swing", ()=>{
                $("#stage_num").fadeOut(1000, "swing");
            });
            
        }
    }

}
