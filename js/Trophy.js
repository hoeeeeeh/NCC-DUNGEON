class Trophy {
    static trophySelectComplete = 0;
    #numberPlayerSelect = 0;
    #userPickItem = [];

    #ITEMHOVER = 1;
    
    #selectedItem = [];
    get selectedItem(){
        return this.#selectedItem;
    }
    get itemHover(){
        return this.#ITEMHOVER;
    }

    set itemHover(itemHover){
        this.#ITEMHOVER = itemHover;
    }

    get numberPlayerSelect(){
        return this.#numberPlayerSelect;
    }

    set numberPlayerSelect(num){
        this.#numberPlayerSelect = num;
    }
        
    #ITEM = [
    {
        name: 'heart',
        idx : 0,
        url: `url(./img/item/item_heart.png)`,
        description: (hero)=>{
            return `최대 체력의 30%(${hero.maxhp * 0.3}) 가 회복됩니다.`
        }
        ,
        init : (hero)=>{
            $(`#p${hero.whichPlayer}_stat_${0}_pick_num`).text(Math.floor(hero.hp*10)/10);
        },
        function: (hero)=>{
            hero.hp = Math.min(hero.hp + (hero.maxhp * 0.3), hero.maxhp);
            hero.hpBar();

            $(`#p${hero.whichPlayer}_stat_${0}_pick_num`).text(Math.floor(hero.hp*10)/10);
            return false;
        }
        ,
    },
    {
        name: 'attack_damage_up',
        idx : 1,
        url: `url(./img/item/item_damage_up.png)`,
        description: (hero)=>{
            return `데미지가 0.5 증가합니다.`;
        }
        ,
        init : (hero)=>{
            $(`#p${hero.whichPlayer}_stat_${1}_pick_num`).text(Math.floor(hero.attacking.damage*10)/10);
        },
        function: (hero)=>{
            hero.attacking.damage = hero.attacking.damage + 0.5;
            $(`#p${hero.whichPlayer}_stat_${1}_pick_num`).text(Math.floor(hero.attacking.damage*10)/10);
            return false;
        }

    },{
        name: 'attack_speed_up',
        idx : 2,
        url: `url(./img/item/item_speed_up.png)`,
        description: (hero)=>{
            return `공격 속도가 ${(hero.attacking.speed / 10)} 빨라집니다.`;
        }
        ,
        init : (hero)=>{
            $(`#p${hero.whichPlayer}_stat_${2}_pick_num`).text(Math.floor(hero.attacking.speed*10)/10);
        },
        function: (hero)=>{
            hero.attacking.speed = (hero.attacking.speed / 10) * 9;
            hero.maxGauge = hero.maxGauge == undefined ? 0 : hero.attacking.speed / 10;

            $(`#p${hero.whichPlayer}_stat_${2}_pick_num`).text(Math.floor(hero.attacking.speed*10)/10);
            return false;
        }
        ,
    },  
    {
        name: 'defence_up',
        idx : 3,
        url: `url(./img/item/item_defence_up.png)`,
        description: (hero)=>{
            return `최대 체력이 ${10} 증가합니다.`
        }
        ,
        init : (hero)=>{
            $(`#p${hero.whichPlayer}_stat_${3}_pick_num`).text(Math.floor(hero.maxhp*10)/10);
        },
        function: (hero)=>{
            hero.maxhp = hero.maxhp + 10;
            hero.hp = hero.hp + 10;

            $(`#p${hero.whichPlayer}_stat_${3}_pick_num`).text(Math.floor(hero.maxhp*10)/10);
            return false;
        }
        ,
    },
    /*
     {
        name: 'heal_up',
        url: `url(./img/item/item_heal_up.png)`,
        description: (hero)=>{
            return '아군 체력 10 회복'
        }
        ,
        
    }, 
    */
    {
        name: 'velocity_up',
        idx : 4,
        url: `url(./img/item/item_velocity_up.png)`,
        description: (hero)=>{
            return `현재 이동속도가 ${0.5} 증가합니다.`
        }
        ,
        init : (hero)=>{
            $(`#p${hero.whichPlayer}_stat_${4}_pick_num`).text(Math.floor(hero.move.speed*10)/10);
        },
        function: (hero)=>{
            hero.move.speed = hero.move.speed + 0.5;
            console.log(hero.move.speed);

            $(`#p${hero.whichPlayer}_stat_${4}_pick_num`).text(Math.floor(hero.move.speed*10)/10);
            return false;
        }
    }
    ];

    #SKILL = [
    {
        name: 'warrior',
        idx : this.#ITEM.length + 0,
        url: `url(./img/character/skill_icon/warrior.png)`,
        description: (hero)=>{
            return `전사로 승급합니다. 공격 범위가 줄어들지만 강력한 범위 공격을 얻습니다. \n 사거리 - 400, 기본 체력 + 50, [패시브] : 범위 공격 `;
        }
        ,
        function: (hero)=>{
            return new Warrior(hero.takeOutInfo());
            
        }
    }, {
        name: 'tanker', // MONSTEROBSTACLE 파라미터로 넣어줘야함.
        idx : this.#ITEM.length + 1,
        url: `url(./img/character/skill_icon/tanker.png)`,
        description: (hero)=>{
            return `탱커로 승급합니다. 1. 탱커는 데미지가 대폭 감소하지만, 강인한 체력을 얻습니다. 
            2. 탱커는 패시브로 몬스터를 끌어당길 수 있습니다. 끌어당겨진 몬스터들은 데미지를 받고, 캐릭터의 공격속도에 비례하여 스턴에 빠지게 됩니다 . \n 기본 체력 + 100, [패시브] 군중 제어`
        }
        ,
        function: (hero)=>{
            return new Tanker(hero.takeOutInfo());
        }
    }, {
        name: 'dealer',
        idx : this.#ITEM.length + 2,
        url: `url(./img/character/skill_icon/dealer.png)`,
        description: (hero)=>{
            return `원거리 딜러로 승급합니다. 공격력과 체력이 소폭 감소하지만 공격 범위가 증가,
            이동속도 증가 및 투사체를 차징 발사 할 수 있습니다. 차징 발사의 경우 두 배의 데미지를 입힙니다. \n 공격력 - 2, 사거리 + 200, 이동속도 + 2, [패시브] 차징`
        }
        ,
        function: (hero)=>{
            //$(`#gauge_${hero.whichPlayer}`).removeClass('invisible');
           return new Dealer(hero.takeOutInfo());

        }
    }, {
        name: 'healer',
        idx : this.#ITEM.length + 3,
        url: `url(./img/character/skill_icon/healer.png)`,
        description: (hero)=>{
            return `힐러로 승급합니다. 힐러는 기본 공격력이 감소하지만, 매 초마다 자신의 체력이 회복되고, 기본 공격이 아군과 몬스터를 모두 관통합니다. 아군에게 타격할 경우 아군의 체력이 회복되고 몬스터에게 타격할 경우 데미지를 입힙니다.`;
        }
        ,
        function: (hero)=>{
            //$(`#gauge_${hero.whichPlayer}`).removeClass('invisible');
            return new Healer(hero.takeOutInfo());

        }
    },];


    constructor(whichPlayer){
        this.whichPlayer = whichPlayer;
        this.MAXITEMSELECT = 3;
        for(let i =0; i<this.#ITEM.length + this.#SKILL.length; i++){
            this.#userPickItem.push(0);
        }



        for(let i = 0; i<this.#ITEM.length; i++){
            const item = $(`<div id = ${this.#ITEM[i].name} class = selectedStat><div class=stat_img style= 'background-image : ${this.#ITEM[i].url}'></div><div id = p${this.whichPlayer}_stat_${i}_pick_num class=stat_pick_num></div></div>`);
            $(`#p${this.whichPlayer}_select_status_wrapper`).append(item);
        }
    }
    statInit(hero){
        $(`#p${this.whichPlayer}_job`).css('background-image', hero.icon);
        for(const item of this.#ITEM){
            item.init(hero);
        }

    }

    trophyStack = (idx)=>{
        this.#userPickItem[idx]++;
        console.log(idx);
        console.log(this.whichPlayer, this.#userPickItem);
       // if(idx >)
    }

    selectTrophy = (nowStage)=>{
        $(`#item_description_${this.whichPlayer}`).text('방향키를 통해 스탯을 골라주세요.');

        $(".item").each(function() {
            $(this).css("background-color", "rgba(255, 97, 97, 0.16)");
        });



        let item_ = [];
        this.#selectedItem = [];

        for (let item of this.#ITEM) {
                item_.push(item);
        }

        
        for (let i = 0; i < this.MAXITEMSELECT; i++) {
            let idx = Math.floor(Math.random() * item_.length);
            this.#selectedItem.push(item_[idx]);
            $(`#itemWrapper`).append($(`<div id = item_${this.whichPlayer}_${i + 1} class = item></div>`));
            $(`#item_${this.whichPlayer}_${i + 1}`).append($(`<div id=selected_item_${this.whichPlayer}_${i} class=selected_item style='background-image : ${item_[idx].url}'></div>`));
            item_.splice(idx, 1);
        }
        $("#item_1").addClass(`selected_${this.#numberPlayerSelect+1}p`);
        //$("#item_description").text(this.#selectedItem[0].description(HEROLIST[this.#numberPlayerSelect]));
        this.#numberPlayerSelect++;
    }
    
    randomSample = (copiedItem, sample)=>{
        const FIRSTUPGRADE = 3;
        const SECONDUPGRADE = 6;

        const PICKPERCENT = 10;

        const PROB = [];

        let PERCENT = 0; 

        for(let i=0; i<this.#ITEM.length; i++){
            let picked = this.#userPickItem[i];
            if(picked >= FIRSTUPGRADE){
                PROB.push({
                    percent : PERCENT + PICKPERCENT * picked,
                    idx : i + this.#ITEM.length,
                })
                PERCENT += PICKPERCENT * picked;
            }
        }

        




        
    }

}