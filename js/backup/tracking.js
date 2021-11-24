/* TODO LIST
       1. ATTACK LIST에서 가장 먼저 스크린 아웃 되는 공격을 pop 해야함.
       2. 몬스터에게 공격이 맞았을 경우 , ATTACK LIST 에서 pop
       3. 몬스터 이동 구현
       4. 몬스터 공격 구현



	*/

var aggroEase;

var pause = false;
var stage = [];
var now_stage = -1;
var chapter = 1;
var stagemove = false;
var itemselectStage = false;



var grave_list = [];
var selected_item = [];
var skill_list = [];
//Hero(gravity, move_velocity, jump_velocity, hp, damage, attackSpeed)
var hero_attack = [];
var attackCnt = 0;
var item_hover = 1;


var moveRate = 20;
//var attackRate = 250;

// 공격 속도 0.8초 제한
var walkthrough = false;
// 처음 시작할 때 걸어나오는 모션
// 가장 최근에 누른 방향키

// 게임 시작 전/후

var keydownMap = new Map([[18, false], // ALT
[25, false], [65, false], // 'a'
[37, false], // 왼쪽
[38, false], // 위
[39, false], // 오른쪽
[40, false], // 아래

[70, false], // h2 아래 (F)
[68, false], // h2 왼쪽 (D)
[71, false], // h2 오른쪽 (G)
[82, false], // h2 위 (R)

]);

/*
		18: // ALT
		32: // Space Bar
		38: // 위
		40: // 아래
		37: // 왼쪽
		39: // 오른쪽
	*/

function game_init() {

    screen_width = parseFloat($("body").css("width"));
    screen_height = parseFloat($("body").css("height"));

    //               gravity, move_velocity, junp_velocity,    hp     damage  attackSpeed   left   bottom  player
    new Hero(500,8,10,100,4,10000,'1500','-100',0,'kyo');
    // kyo
    new Hero(500,8,10,100,4,10000,'800','-100',1,'net');
    // net
    //Hero(gravity, move_velocity, jump_velocity, hp, damage, attackSpeed, left, bottom)

    map_min_width = 288 + 7;
    // 1330, 538 / border 7 / sidebar 238
    map_max_width = map_min_width + 1330;
    map_min_height = 190 + 7;
    // padding : 190
    map_max_height = map_min_height + 538;

    /* 스테이지 삽입 */

    stage.push(Stage_1);
    stage.push(Stage_2);
    stage.push(Stage_3);
    stage.push(Stage_4);
    stage.push(Stage_5);
    stage.push(Stage_6);
    stage.push(Stage_7);
    stage.push(Stage_8);


    skill_list.push({
        name: 'warrior',
        url: `url(./img/character/skill_icon/warrior.png)`,
        description: (hero)=>{
            return `전사로 승급합니다. 공격 범위가 ${hero.attackRange} 에서 ${hero.attackRange - 450} 로 줄어들지만 강력한 범위 공격을 얻습니다. \n 사거리 - 400, 기본 체력 + 50, [패시브] : 범위 공격 `
        }
        ,
        function: (hero)=>{
            hero.char = 'warrior';
            hero.attackRange = 180;
            hero.maxhp = hero.maxhp + 50;
            hero.hp = hero.maxhp;
            hero.hpBar();
            hero.damage = hero.damage - 1;

            hero.skillAggresive = 5;
        }
    }, {
        name: 'tanker',
        url: `url(./img/character/skill_icon/tanker.png)`,
        description: (hero)=>{
            return `탱커로 승급합니다. 1. 탱커는 데미지가 대폭 감소하지만, 강인한 체력을 얻습니다. 
            2. 탱커는 패시브로 몬스터를 끌어당길 수 있습니다. 끌어당겨진 몬스터들은 데미지를 받고, 캐릭터의 공격속도에 비례하여 스턴에 빠지게 됩니다 . \n 기본 체력 + 100, [패시브] 군중 제어`
        }
        ,
        function: (hero)=>{
            hero.char = 'tanker';
            hero.maxhp = hero.maxhp + 100;
            hero.hp = hero.maxhp;
            hero.hpBar();
            hero.attackRange = hero.attackRange - 450;
            hero.damage = hero.damage - 3;
            hero.attackRate = hero.attackRate * 2;

            hero.skillAggresive = 5;

            hero.shieldBroken = false;
            hero.maxShieldHp = 100;
            hero.shieldHp = 100;

            hero.healShield = function() {
                console.log('heal');
                if (stagemove)
                    return;
                $(`#gauge_${hero.idx}`).css("width", (hero.shieldHp / hero.maxShieldHp) * 100 + '%');
                if (hero.shieldHp + 1 <= hero.maxShieldHp)
                    hero.shieldHp = hero.shieldHp + 1;
                else {
                    hero.shieldHp = hero.maxShieldHp;
                }
                if (hero.shieldHp >= hero.maxShieldHp) {
                    $(`#gauge_${hero.idx}`).css("background-color", "#f8ff97");
                }

            }

            hero.healShieldInterval = function() {
                if (stagemove)
                    return;
                hero.interval = setInterval(hero.healShield, 100)
            }
            ;
            hero.healShieldClear = function() {
                if (stagemove)
                    return;
                clearInterval(hero.interval);
            }

            $(`#gauge_${hero.idx}`).removeClass('invisible').css('background-color', '#f8ff97');

            let dir = ['left', 'forward', 'right', 'back'];

            for (let i = 0; i < 4; i++) {
                $(`#char_figure_${hero.idx}`).append(`<div class = 'invisible shield shield_${dir[i]}' id=shield_${dir[i]}_${hero.idx}></div>`);
            }

            const SHIELDSHORT = 20;
            const SHIELDLONG = 280;
            const SHIELDPADDING = 10;
            const SHIELDGAUGEPADDING = 10;

            $(`#shield_left_${hero.idx}`).css("left", `${0 - SHIELDSHORT - SHIELDPADDING}px`).css("bottom", `${hero_height / 2 + SHIELDPADDING - SHIELDLONG / 2}px`);
            $(`#shield_right_${hero.idx}`).css("left", `${hero_width + SHIELDPADDING}px`).css("bottom", `${hero_height / 2 + SHIELDPADDING - SHIELDLONG / 2}px`);
            $(`#shield_forward_${hero.idx}`).css("left", `${hero_width / 2 - SHIELDLONG / 2}px`).css("bottom", `${hero_height + SHIELDSHORT + SHIELDGAUGEPADDING + SHIELDPADDING}px`);
            $(`#shield_back_${hero.idx}`).css("left", `${hero_width / 2 - SHIELDLONG / 2}px`).css("bottom", `${0 - SHIELDSHORT - SHIELDPADDING}px`);

            hero.shieldCoordinates = function() {
                return {
                    LEFT: {
                        left: 0 - SHIELDSHORT - SHIELDPADDING,
                        bottom: hero_height / 2 + SHIELDPADDING - SHIELDLONG / 2,
                    },
                    RIGHT: {
                        left: hero_width + SHIELDPADDING,
                        bottom: hero_height / 2 + SHIELDPADDING - SHIELDLONG / 2,
                    },
                    BACK: {
                        left: hero_width / 2 - SHIELDLONG / 2,
                        bottom: 0 - SHIELDSHORT - SHIELDPADDING,
                    },
                    FORWARD: {
                        left: hero_width / 2 - SHIELDLONG / 2,
                        bottom: hero_height + SHIELDSHORT + SHIELDGAUGEPADDING + SHIELDPADDING,
                    }
                };
            }

            hero.isInShieldHitBox = function(dir, x=false, y=false, range=0) {
                let cord = {};
                let answer = {};

                switch (dir) {
                case 'left':
                case 'LEFT':
                    cord = {
                        left: hero.shieldCoordinates().LEFT.left,
                        bottom: hero.shieldCoordinates().LEFT.bottom
                    };
                    break;
                case 'right':
                case 'RIGHT':
                    cord = {
                        left: hero.shieldCoordinates().RIGHT.left,
                        bottom: hero.shieldCoordinates().RIGHT.bottom
                    };
                    break;

                case 'forward':
                case 'FORWARD':
                    cord = {
                        left: hero.shieldCoordinates().FORWARD.left,
                        bottom: hero.shieldCoordinates().FORWARD.bottom
                    };
                    break;

                case 'back':
                case 'BACK':
                    cord = {
                        left: hero.shieldCoordinates().BACK.left,
                        bottom: hero.shieldCoordinates().BACK.bottom
                    };
                    break;

                }
                if (x) {// if(x > cord.left && )
                }
            }

            /*

            

            */

        }
    }, {
        name: 'adcarry',
        url: `url(./img/character/skill_icon/adcarry.png)`,
        description: (hero)=>{
            return `원거리 딜러로 승급합니다. 공격력과 체력이 소폭 감소하지만 공격 범위가 ${hero.attackRange} 에서 ${hero.attackRange + 200} 증가,
            이동속도 증가 및 투사체를 차징 발사 할 수 있습니다. 차징 발사의 경우 두 배의 데미지를 입힙니다. \n 공격력 - 2, 사거리 + 200, 이동속도 + 2, [패시브] 차징`
        }
        ,
        function: (hero)=>{
            $(`#gauge_${hero.idx}`).removeClass('invisible');
            hero.char = 'adcarry';
            hero.attackRange = 900;
            hero.attackRate = hero.attackRate / 2.5;
            hero.maxGauge = hero.attackRate / 10;
            hero.damage = hero.damage - 2.5;
            hero.move_velocity = hero.move_velocity + 1;
            hero.maxhp = hero.maxhp - 30;
            hero.hp = hero.maxhp;
            hero.hpBar();

        }
    }, {
        name: 'healer',
        url: `url(./img/character/skill_icon/healer.png)`,
        description: (hero)=>{
            return `힐러로 승급합니다. 힐러는 기본 공격력이 감소하지만, 매 초마다 자신의 체력이 회복되고, 기본 공격이 아군과 몬스터를 모두 관통합니다. 아군에게 타격할 경우 아군의 체력이 회복되고 몬스터에게 타격할 경우 데미지를 입힙니다.`;
        }
        ,
        function: (hero)=>{
            $(`#gauge_${hero.idx}`).removeClass('invisible');
            hero.char = 'healer';
            hero.damage = hero.damage - 3.5;

            hero.attackMoveRate = 20;
            hero.skillAggresive = 2;

            setInterval(()=>{
                if (hero.maxhp < hero.hp + hero.damage + 1.5) {
                    hero.hp = hero.maxhp;
                } else {
                    hero.hp = hero.hp + hero.damage + 1.5;
                }
                hero.hpBar();
            }
            , 1000);
        }
    }, );
}

function setTimeFunc() {

    if (!isGameStart)
        return;
    if (pause) {
        return;
    }
    keydownFunc();
    AttackMove();
    if (monster_list.length > 0) {
        for (let monster of monster_list) {
            monster.MovePNG();
            monster.move();
        }
    }
    nextCheck();

}

/* 전역 변수 */

/* 도큐먼트 실행 */
$(document).ready(function() {
    game_init();
    move_cursor_from_to();
    setInterval(setTimeFunc, moveRate);
});
/* 도큐먼트 실행 */

function AttackMove() {
    var isHit = -1;

    for (let i of hero_attack) {
        if (i.idx < 0)
            continue;
        var attack_xy = {
            left: parseFloat($(`#hero_attack_${i.cnt}`).css("width")) / 2,
            bottom: parseFloat($(`#hero_attack_${i.cnt}`).css("height")) / 2,
        }

        let left = parseFloat($(`#hero_attack_${i.cnt}`).css("left"));
        let bottom = parseFloat($(`#hero_attack_${i.cnt}`).css("bottom"));

        /*
        if (left < map_min_width || left > map_max_width || bottom > map_max_height + 50 || bottom < map_min_height) {
            $(`#hero_attack_${i.cnt}`).remove();
            hero_attack[i.cnt] = {
                cnt: -1,
                idx: -1
            };

        }
        */

        switch (parseInt($(`#hero_attack_${i.cnt}`).attr('value'))) {
        case 37:
        case 68:
            // 왼쪽
            var attack_left = parseFloat($(`#hero_attack_${i.cnt}`).css("left")) - hero_list[i.idx].attackMoveRate;
            $(`#hero_attack_${i.cnt}`).css("left", attack_left + 'px');
            if ((attack_left + attack_xy.left < parseFloat(i.left) - hero_list[i.idx].attackRange) || left < map_min_width) {
                $(`#hero_attack_${i.cnt}`).remove();
                hero_attack[i.cnt] = {
                    cnt: -1,
                    idx: -1
                };
            }

            break;

        case 39:
        case 71:
            // 오른쪽
            var attack_left = parseFloat($(`#hero_attack_${i.cnt}`).css("left")) + hero_list[i.idx].attackMoveRate;
            $(`#hero_attack_${i.cnt}`).css("left", attack_left + 'px');
            if ((attack_left + attack_xy.left > parseFloat(i.left) + hero_list[i.idx].attackRange) || left > map_max_width) {
                $(`#hero_attack_${i.cnt}`).remove();
                hero_attack[i.cnt] = {
                    cnt: -1,
                    idx: -1
                };

            }
            break;

        case 38:
        case 82:
            // 위
            var attack_bottom = parseFloat($(`#hero_attack_${i.cnt}`).css("bottom")) + hero_list[i.idx].attackMoveRate;
            $(`#hero_attack_${i.cnt}`).css("bottom", attack_bottom + 'px');
            if ((attack_bottom + attack_xy.bottom > parseFloat(i.bottom) + hero_list[i.idx].attackRange) || bottom > map_max_height) {
                $(`#hero_attack_${i.cnt}`).remove();
                hero_attack[i.cnt] = {
                    cnt: -1,
                    idx: -1
                };

            }
            break;

        case 40:
        case 70:
            // 아래
            var attack_bottom = parseFloat($(`#hero_attack_${i.cnt}`).css("bottom")) - hero_list[i.idx].attackMoveRate;
            $(`#hero_attack_${i.cnt}`).css("bottom", attack_bottom + 'px');
            if ((attack_bottom + attack_xy.bottom < parseFloat(i.bottom) - hero_list[i.idx].attackRange) || bottom < map_min_height) {
                $(`#hero_attack_${i.cnt}`).remove();
                hero_attack[i.cnt] = {
                    cnt: -1,
                    idx: -1
                };

            }
            break;
        }

        let attack_width = parseFloat($(`#hero_attack_${i.cnt}`).css("width"));
        let attack_height = parseFloat($(`#hero_attack_${i.cnt}`).css("height"));

        let hit_left = parseFloat($(`#hero_attack_${i.cnt}`).css("left")) + attack_width / 2;
        let hit_bottom = parseFloat($(`#hero_attack_${i.cnt}`).css("bottom")) + attack_height / 2;

        for (let monster of monster_list) {

            if (monster.death)
                continue;

            if (i.hit.indexOf(monster.idx) != -1)
                continue;

            let monster_left = monster.left;
            let monster_right = monster.left + (monster.width);
            let monster_bottom = monster.bottom;
            let monster_up = monster.bottom + (monster.height);

            if (hit_left > monster_left - (attack_width / 2) && hit_left < monster_right + (attack_width / 2)) {
                if (hit_bottom > monster_bottom - (attack_height / 2) && hit_bottom < monster_up + (attack_height / 2)) {
                    monster.aggro(i.idx, hero_list[i.idx].damage * i.size);
                    if (!monster.death && monster.hitCheck != null)
                        monster.hitCheck(i.idx);
                    if (i.size < 2.0 && i.heal <= 0) {
                        $(`#hero_attack_${i.cnt}`).remove();
                        hero_attack[i.cnt] = {
                            cnt: -1,
                            idx: -1
                        };
                    } else {
                        monster.hitCheck(i.idx);
                    }
                    i.hit.push(monster.idx);

                    //이 부분 나중에 따로 Bat.underattack 함수 따로 만들어야할 듯. 공격받았을 때.

                }
            }
        }
        if (i.heal > 0 && i.size >= 2.0) {
            let hero = hero_list[1 - i.idx];
            let hero_loc = {
                left: hero.left - attack_width / 2,
                right: hero.left + hero_width + attack_width / 2,
                bottom: hero.bottom - attack_height / 2,
                up: hero.bottom + hero_height + attack_height / 2,
            }

            if (hit_left > hero_loc.left && hit_left < hero_loc.right) {
                if (hit_bottom > hero_loc.bottom && hit_bottom < hero_loc.up) {
                    $(`#hp_${hero.idx}`).css('background-color', '#22ecbf');
                    setTimeout(()=>{
                        $(`#hp_${hero.idx}`).css('background-color', '#E91E63');
                    }
                    , 1000);
                    hero.hpBar();
                    if (hero.hp + i.heal > hero.maxhp) {
                        for (monster of monster_list)
                            monster.aggro(1 - hero.idx, hero.skillAggresive);

                        hero.hp = hero.maxhp;
                    } else {
                        hero.hp = hero.hp + i.heal * i.size;
                    }
                }

            }

        }

    }

}

function nextCheck() {
    var next = true;
    for (monster of monster_list) {
        next = (next && monster.death);
    }

    if (next && !stagemove) {
        // 다음 라운드 조건 충족
        stagemove = true;
        // 다음 스테이지로 넘어가는중, 한 번만 실행시키기 위해서

        for (monster of monster_list) {
            $(`#monster_${monster.idx}`).remove();
        }
        clearInterval(aggroEase);
        monster_list = [];
        stageFadeOut();

    }

    let selectComplete = true;

    for (hero of hero_list)
        selectComplete = hero.item_select && selectComplete;
    if (selectComplete) {
        for (hero of hero_list) {
            hero.item_select = false;
        }
        stageFadeIn();
    }

}

function stageFadeOut() {
    for (hero of hero_list) {
        hero.item_select = false;
    }
    $("#field").fadeOut(1000, "swing", ()=>{

        /*
        if (now_stage > -1) {
            $("#item_select").fadeIn(1000, "swing");
            itemSelect();
        } else {
            for (hero of hero_list) {
                hero.item_select = true;
            }
        }

    }
*/
        $("#item_select").fadeIn(1000, "swing");
        itemSelect();

    }
    );

}
function itemSelect() {
    drawItem();
    itemselectStage = true;

    /* 선택 끝나면 */
    //itemselectStage = false;
    //$("#item_select").addClass('invisible');
    //for (hero of hero_list) {
    //    hero.item_select = true;
    //}
}

function stageFadeIn() {
    $("#item_select").fadeOut(1000, "swing", ()=>{
        $("#field").fadeIn(3000, "swing", ()=>{}
        );
        hero_list[0].teleport(1000, -100);
        hero_list[0].arrow = 38;
        hero_list[1].teleport(800, -100);
        hero_list[1].arrow = 82;

        nextStage();

        for (hero of hero_list) {
            //  hero.hp >= hero.maxhp ? (){hero.hp =}
            hero.walkThrough();
        }
        setTimeout(()=>{
            stagemove = false;
        }
        , 2000);
    }
    );

}

function drawItem() {

    let select_player = 0;
    if (!hero_list[0].item_select)
        select_player = 1;
    else if (!hero_list[1].item_select)
        select_player = 2;

    for (let i = 0; i < 3; i++) {
        $(`#selected_item_${i}`).remove();
    }
    let item_choose = 3;
    let item_ = [];
    selected_item = [];
    if ((now_stage + 1) % 4 == 0 && (now_stage == -1 || ((now_stage + 1) / 4) % 2 == 0)) {
        for (skill of skill_list) {
            item_.push(skill);
        }
        $(".item").each(function() {
            $(this).css("background-color", "rgba(0,0,0,0.1)");
        });
    } else {
        for (item of item_list) {
            item_.push(item);
        }
    }

    for (let i = 0; i < item_choose; i++) {
        let idx = Math.floor(Math.random() * item_.length);
        selected_item.push(item_[idx]);
        $(`#item_${i + 1}`).append($(`<div id=selected_item_${i} class=selected_item style='background-image : ${item_[idx].url}'></div>`));
        item_.splice(idx, 1);
    }
    $("#item_1").addClass(`selected_${select_player}p`);
    $("#item_description").text(selected_item[0].description(hero_list[select_player - 1]));
}

function nextStage() {
    $("#boss_hp").fadeOut(1000, "swing");
    now_stage = ++now_stage;
    if (now_stage % 4 == 0 && now_stage > 0) {
        chapter++;
        $("#wrapper").css("background-image", `url(./img/background_${chapter}.png)`);
    }

    if (now_stage % 4 == 3 && now_stage > 0) {
        $("#stage_num").css("background-image", `url(./img/stage/BOSS.png)`);
    } else {
        $("#stage_num").css("background-image", `url(./img/stage/STAGE${now_stage + 1}.png)`);
    }
    stage[now_stage]();

    if ((now_stage + 1) % 4 == 0) {
        $("#stage_num").fadeIn(500, "swing", ()=>{
            $("#stage_num").fadeOut(500, "swing", ()=>{
                $("#stage_num").fadeIn(500, "swing", ()=>{
                    $("#stage_num").fadeOut(500, "swing", ()=>{
                        $("#stage_num").fadeIn(500, "swing", ()=>{
                            $("#stage_num").fadeOut(500, "swing");
                        }
                        );
                    }
                    );
                }
                );
            }
            );
        }
        );
    } else {
        $("#stage_num").fadeIn(1500, "swing", ()=>{
            $("#stage_num").fadeOut(1500, "swing");
        }
        );
    }

    aggroEase = setInterval(()=>{
        for (monster of monster_list) {
            for (let i = 0; i < 2; i++) {
                if (monster.aggroParameter[i] > 0.1) {
                    monster.aggroParameter[i] -= 0.1;
                } else if (monster.aggroParameter[i] <= 0.1)
                    monster.aggroParameter[i] = 0;
            }
        }
    }
    , 1000)

}

/*


                        $(`#${monster.id}`).fadeOut(500, "swing", ()=>{
 
                        });
                        */

function keydownFunc() {

    /* player 1 공격 */
    if (keydownMap[25] && !hero_list[0].death && !stagemove) {
        switch (hero_list[0].char) {
        case 'warrior':
            hero_list[0].warriorAttack();
            break;
        case 'healer':
            hero_list[0].healerAttack();
            break;
        case 'tanker':
            hero_list[0].tankerAttack();
            break;
        case 'adcarry':
            hero_list[0].adcarryAttack();
            break;
        default:
            hero_list[0].attack();
            break;
        }
    }

    /* player 2 공격 */
    if (keydownMap[65] && !hero_list[1].death && !stagemove) {
        switch (hero_list[1].char) {
        case 'warrior':
            hero_list[1].warriorAttack();
            break;
        case 'healer':
            hero_list[1].healerAttack();
            break;
        case 'tanker':
            hero_list[1].tankerAttack();
            break;
        case 'adcarry':
            hero_list[1].adcarryAttack();
            break;
        default:
            hero_list[1].attack();
            break;
        }
    }

    /* player 1 이동 */
    if (!hero_list[0].death) {

        if (keydownMap[37] && (walkthrough || parseFloat($("#character_0").css("left")) > map_min_width)) {
            // 왼쪽 방향키
            hero_list[0].move_left();
        }
        if (keydownMap[39] && (walkthrough || parseFloat($("#character_0").css("left")) + hero_width < map_max_width)) {
            // 오른쪽 방향키
            hero_list[0].move_right();

        }
        if (keydownMap[38] && (walkthrough || parseFloat($("#character_0").css("bottom")) + hero_height - 20 < map_max_height)) {
            // 위쪽 방향키	
            hero_list[0].move_forward();
        }
        if (keydownMap[40] && (walkthrough || parseFloat($("#character_0").css("bottom")) > map_min_height)) {
            // 아래쪽 방향키
            hero_list[0].move_back();
        }
    }

    if (!hero_list[1].death) {
        /* player 2 이동 */
        if (keydownMap[68] && (walkthrough || parseFloat($("#character_1").css("left")) > map_min_width)) {
            // (D)
            hero_list[1].move_left();
        }
        if (keydownMap[71] && (walkthrough || parseFloat($("#character_1").css("left")) + hero_width < map_max_width)) {
            // (G)
            hero_list[1].move_right();
        }
        if (keydownMap[82] && (walkthrough || parseFloat($("#character_1").css("bottom")) + hero_height - 20 < map_max_height)) {
            // (R)
            // hp bar height 때문에 20 빼줌
            hero_list[1].move_forward();

        }
        if (keydownMap[70] && (walkthrough || parseFloat($("#character_1").css("bottom")) > map_min_height)) {
            // (F)
            hero_list[1].move_back();

        }
    }

    /* player 1,2 이미지 변경 */
    for (hero of hero_list) {
        if (hero.death)
            continue;
        hero.MovePNG();
        hero.revive();
    }

}

/* 키보드 키다운 이벤트 */
function move_cursor_from_to() {
    $(document).on("keydown", move_cursor);
    $(document).on("keyup", stand);
    function move_cursor(e) {

        if (e.keyCode == 27) {
            pause = !pause;
        }
        if (e.keyCode == 13) {
            // 엔터
            if (!isGameStart)
                play(select_var);
            return;
        }
        if (isGameStart && walkthrough)
            return;

        if (stagemove && itemselectStage) {
            if (!hero_list[0].item_select) {
                switch (e.keyCode) {
                case 37:
                    // 왼
                    if (item_hover > 1) {
                        $(`#item_${item_hover}`).removeClass('selected_1p');
                        $(`#item_${--item_hover}`).addClass('selected_1p');
                        $("#item_description").text(selected_item[item_hover - 1].description(hero_list[0]));
                    }
                    break;
                case 39:
                    // 오
                    if (item_hover < 3) {
                        $(`#item_${item_hover}`).removeClass('selected_1p');
                        $(`#item_${++item_hover}`).addClass('selected_1p');
                        $("#item_description").text(selected_item[item_hover - 1].description(hero_list[0]));
                    }
                    break;
                case 25:
                    console.log(selected_item[item_hover - 1]);
                    hero_list[0].item_select = true;
                    $(`#item_${item_hover}`).removeClass('selected_1p');
                    selected_item[item_hover - 1].function(hero_list[0]);
                    item_hover = 1;
                    drawItem();
                    // 공격 (선택)
                    break;
                }
                return;
            } else if (!hero_list[1].item_select) {
                switch (e.keyCode) {
                case 68:
                    // 왼
                    if (item_hover > 1) {
                        $(`#item_${item_hover}`).removeClass('selected_2p');
                        $(`#item_${--item_hover}`).addClass('selected_2p');
                        $("#item_description").text(selected_item[item_hover - 1].description(hero_list[1]));
                    }
                    break;
                case 71:
                    // 오
                    if (item_hover < 3) {
                        $(`#item_${item_hover}`).removeClass('selected_2p');
                        $(`#item_${++item_hover}`).addClass('selected_2p');
                        $("#item_description").text(selected_item[item_hover - 1].description(hero_list[1]));
                    }
                    break;
                case 65:
                    // 공격 (선택)
                    console.log(selected_item[item_hover - 1]);
                    hero_list[1].item_select = true;
                    selected_item[item_hover - 1].function(hero_list[1]);
                    itemselectStage = false;
                    $(`#item_${item_hover}`).removeClass('selected_2p');
                    item_hover = 1;
                    // 공격 (선택)
                    break;
                }
                return;
            }
        }
        switch (e.keyCode) {

        case 25:
            // 'a'
            keydownMap[25] = true;
            break;
        case 65:
            // 'a'
            keydownMap[65] = true;
            break;

        case 38:
            // 위
            if (!isGameStart && select_var > 1) {
                // 게임이 시작되지 않았을 때
                $(`#select_title>ul>li:nth-child(${select_var})`).removeClass("selected");
                select_var--;
                $(`#select_title>ul>li:nth-child(${select_var})`).addClass("selected");
            } else if (isGameStart && !keydownMap[38]) {
                // 게임이 시작되고 나서
                keydownMap[38] = true;
                if (!hero_list[0].shieldUp)
                    hero_list[0].arrow = 38;
            }
            break;
        case 40:
            // 아래
            if (!isGameStart && select_var < 3) {
                $(`#select_title>ul>li:nth-child(${select_var})`).removeClass("selected");
                select_var++;
                $(`#select_title>ul>li:nth-child(${select_var})`).addClass("selected");
            } else if (isGameStart && !keydownMap[40]) {
                keydownMap[40] = true;
                if (!hero_list[0].shieldUp)
                    hero_list[0].arrow = 40;
            }
            break;
        case 37:
            // 왼쪽 

            if (!isGameStart || keydownMap[37])
                return;
            keydownMap[37] = true;
            if (!hero_list[0].shieldUp)
                hero_list[0].arrow = 37;
            break;
        case 39:
            // 오른쪽
            if (!isGameStart || keydownMap[39])
                return;
            keydownMap[39] = true;
            if (!hero_list[0].shieldUp)
                hero_list[0].arrow = 39;
            break;

        case 82:
            // 위
            if (!isGameStart && select_var > 1) {
                // 게임이 시작되지 않았을 때
                $(`#select_title>ul>li:nth-child(${select_var})`).removeClass("selected");
                select_var--;
                $(`#select_title>ul>li:nth-child(${select_var})`).addClass("selected");
            } else if (isGameStart && !keydownMap[82]) {
                // 게임이 시작되고 나서
                keydownMap[82] = true;
                if (!hero_list[1].shieldUp)
                    hero_list[1].arrow = 82;
            }

            break;
        case 70:
            // 아래
            if (!isGameStart && select_var < 3) {
                $(`#select_title>ul>li:nth-child(${select_var})`).removeClass("selected");
                select_var++;
                $(`#select_title>ul>li:nth-child(${select_var})`).addClass("selected");
            } else if (isGameStart && !keydownMap[70]) {
                keydownMap[70] = true;
                if (!hero_list[1].shieldUp)
                    hero_list[1].arrow = 70;
            }
            break;
        case 68:
            // 왼쪽 
            if (!isGameStart || keydownMap[68])
                return;
            keydownMap[68] = true;
            if (!hero_list[1].shieldUp)
                hero_list[1].arrow = 68;
            break;
        case 71:
            // 오른쪽
            if (!isGameStart || keydownMap[71])
                return;
            keydownMap[71] = true;
            if (!hero_list[1].shieldUp)
                hero_list[1].arrow = 71;
            break;

        case 18:
            // alt
            if (!isGameStart)
                return
            keydownMap[18] = true;
            break;
        }
    }

    function stand(e) {

        if (walkthrough)
            return;

        switch (e.keyCode) {
        case 37:
            // 왼쪽
            if (!isGameStart)
                break;
            keydownMap[37] = false;
            break;
        case 39:
            // 오른쪽
            if (!isGameStart)
                break;
            keydownMap[39] = false;
            break;
        case 38:
            // 위쪽
            if (!isGameStart)
                break;
            keydownMap[38] = false;
            break;
        case 40:
            // 아래쪽
            if (!isGameStart)
                break;
            keydownMap[40] = false;
            break;

        case 70:
            // 왼쪽
            if (!isGameStart)
                break;
            keydownMap[70] = false;
            break;
        case 68:
            // 오른쪽
            if (!isGameStart)
                break;
            keydownMap[68] = false;
            break;
        case 71:
            // 위쪽
            if (!isGameStart)
                break;
            keydownMap[71] = false;
            break;
        case 82:
            // 아래쪽
            if (!isGameStart)
                break;
            keydownMap[82] = false;
            break;

        case 65:
            keydownMap[65] = false;
            if (hero_list[1].char == 'adcarry') {
                hero_list[1].attack(hero_list[1].attackGauge);
                hero_list[1].attackGauge = 0;
                $(`#charging_${1}`).css("width", '0%');
                $(`#charging_${1}`).css("background-color", '#00BCD4');
            } else if (hero_list[1].char == 'healer') {
                hero_list[1].attack(hero_list[1].attackGauge, hero_list[1].damage + 1);
                hero_list[1].attackGauge = 0;
                $(`#charging_${1}`).css("width", '0%');
                $(`#charging_${1}`).css("background-color", '#4CAF50');
            } else if (hero_list[1].char == 'tanker') {
                if (!hero_list[1].shieldBroken)
                    hero_list[1].tankerAttackKeyup();
            }
            break;
        case 25:
            keydownMap[25] = false;
            if (hero_list[0].char == 'adcarry') {
                hero_list[0].attack(hero_list[0].attackGauge);
                hero_list[0].attackGauge = 0;
                $(`#charging_${0}`).css("width", '0%');
                $(`#charging_${0}`).css("background-color", '#00BCD4');
            } else if (hero_list[0].char == 'healer') {
                hero_list[0].attack(hero_list[0].attackGauge, hero_list[0].damage + 1);
                hero_list[0].attackGauge = 0;
                $(`#charging_${0}`).css("width", '0%');
                $(`#charging_${0}`).css("background-color", '#4CAF50');
            } else if (hero_list[0].char == 'tanker') {
                if (!hero_list[0].shieldBroken)
                    hero_list[0].tankerAttackKeyup();
            }
        }
    }
}
/* 키보드 키다운 이벤트 */

/* 타이틀에서 선택된 인덱스 */
function play(idx) {
    if (idx == 1) {
        $(`#title`).addClass(`invisible`);

        $(`#field`).removeClass(`invisible`);
        $(`#status`).removeClass(`invisible`);
        $(`#field_wrapper`).removeClass(`invisible`);
        $(`#item`).removeClass(`invisible`);

        $(`#land`).fadeIn(2000, "swing");
        isGameStart = true;

        mapResize();

        /* stage */
    }
}
/* 타이틀에서 선택된 인덱스 */

/* 몬스터 객체 */
function Monster() {}
// 모든 몬스터의 프로토타입

/* 몬스터의 외형, 애니메이션(그림 변경) */
Monster.prototype.url;
Monster.prototype.motionNum = 0;
Monster.prototype.width;
Monster.prototype.height;
Monster.prototype.left;
Monster.prototype.bottom;
/* 몬스터의 움직임 애니메이션(그림 변경) */

/* 몬스터의 인덱스 */
Monster.prototype.id;
Monster.prototype.idx;
/* 몬스터의 인덱스 */

/* 몬스터 이동 관련 */
Monster.prototype.move_direction;
Monster.prototype.movingRate;
Monster.prototype.movingSpeed;
Monster.prototype.moving;
Monster.prototype.isMoving = false;
Monster.prototype.isCrowdControlled = false;
Monster.prototype.crowdControlled = function(stunTime) {
    this.isCrowdControlled = true;
    setTimeout(()=>{
        $(`#${this.id}`).css("transition-property", "").css("transition-duration", '');
        this.isCrowdControlled = false;
    }
    , stunTime);
}
Monster.prototype.aggroParameter;
//
Monster.prototype.aggro = function(idx, aggresive) {
    this.aggroParameter[idx] += aggresive;
}

Monster.prototype.coordinates = function() {
    return {
        x: this.left + this.width / 2,
        y: this.bottom + this.height / 2
    };
}
/* 몬스터 이동 관련 */

/* 몬스터 체력 관련 */
Monster.prototype.maxhp;
Monster.prototype.hp = 100;
/* 몬스터 체력 관련 */

/* 몬스터가 타격 받았을 때 관련*/
Monster.prototype.hit = 0;
Monster.prototype.hitStun = false;
Monster.prototype.death = false;
/* 몬스터가 타격 '받았을' 때 관련*/

/* 몬스터가 타격 '할' 때 관련 */
Monster.prototype.specialDamage = 10;
Monster.prototype.hitPositiveField = 30;
Monster.prototype.hitNegativeField = -30;
/* 몬스터가 타격 '할' 때 관련 */

Monster.prototype.hpBar = function() {
    $(`#monster_hp_remain_${this.idx}`).css("width", (this.hp / this.maxhp) * 100 + '%');
}

Monster.prototype.tagRemove = function() {
    $(`#monster_${this.idx}`).fadeOut(500, "swing", ()=>{//$(`#monster-${isHit}`).remove();
    }
    );
}

Monster.prototype.teleport = function(left, bottom) {
    if (typeof (left) == 'number')
        left = screen_width * (left / 100);
    if (typeof (bottom) == 'number')
        bottom = screen_height * (bottom / 100);
    this.left = parseFloat(left);
    this.bottom = parseFloat(bottom);
    $(`#${this.id}`).css("left", left + 'px');
    $(`#${this.id}`).css("bottom", bottom + 'px');
}

Monster.prototype.move = function() {
    // 0~5 사이 0~1 1~2 ,2~3 ,3~4, 4~5
    if (walkthrough || stagemove || this.isCrowdControlled)
        return;
    if (this.death)
        return;
    this.movingRate = 5000 - Math.floor(Math.random() * 250);

    if (this.hitStun)
        return;
    //2 ,4 ,6 ,8

    monster_loc = {
        left: this.left + this.width / 2,
        bottom: this.bottom + this.height / 2,
    }

    let maxAggro = -1;
    let closeTo = {
        idx: -1,
        left: 0,
        bottom: 0,
    };

    for (hero of hero_list) {
        if (hero.death)
            continue;
        hero_loc = {
            left: hero.left + hero_width / 2,
            bottom: hero.bottom + hero_height / 2,
        }
        if (this.aggroParameter[hero.idx] > maxAggro) {
            maxAggro = this.aggroParameter[hero.idx];
            closeTo.idx = hero.idx;
            closeTo.left = hero.left;
            closeTo.bottom = hero.bottom;
        }
    }

    let random = {
        left: this.left > closeTo.left ? -1 : 1,
        right: this.left < closeTo.left ? -1 : 1,
        bottom: this.bottom > closeTo.bottom ? -1 : 1,
        up: this.bottom < closeTo.bottom ? -1 : 1,
    }

    const shieldList = [];

    for (hero of hero_list) {
        if (hero.char == 'tanker') {
            if (hero.shieldUp) {
                var where;
                switch (hero.arrow) {
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
                shieldList.push({
                    idx: hero.idx,
                    arrow: where,
                    left: hero.left + parseFloat($(`#shield_${where}_${hero.idx}`).css("left")),
                    right: hero.left + parseFloat($(`#shield_${where}_${hero.idx}`).css("left")) + parseFloat($(`#shield_${where}_${hero.idx}`).css("width")),
                    bottom: hero.bottom + parseFloat($(`#shield_${where}_${hero.idx}`).css("bottom")),
                    up: hero.bottom + parseFloat($(`#shield_${where}_${hero.idx}`).css("bottom")) + parseFloat($(`#shield_${where}_${hero.idx}`).css("height")),
                });
            }
        }
    }

    if (this.moving > 6 + random.left) {

        let isBlocked = false;
        for (shield of shieldList) {
            //if( )
            if (shield.arrow == 'right') {
                if (shield.right <= this.left && shield.right >= this.left - this.movingSpeed) {
                    if (monster_loc.bottom < shield.up && monster_loc.bottom + monster.height > shield.bottom) {
                        isBlocked = true;
                        hero_list[shield.idx].shieldHp -= this.specialDamage / 30;
                        $(`#gauge_${shield.idx}`).css("width", (hero_list[shield.idx].shieldHp / hero_list[shield.idx].maxShieldHp) * 100 + '%');
                    }
                }
            }
        }
        if (isBlocked) {} else if (this.left <= map_min_width) {
            this.left = map_min_width;
        } else if (this.left > map_min_width)
            this.left = this.left - this.movingSpeed;
        $(`#${this.id}`).css("left", `${this.left}px`);

    } else if (this.moving > 4 + random.left + random.right) {
        let isBlocked = false;

        for (shield of shieldList) {
            //if( )
            if (shield.arrow == 'left') {
                if (shield.left >= this.left + this.width && shield.left <= this.left + this.width + this.movingSpeed) {
                    if (monster_loc.bottom < shield.up && monster_loc.bottom + monster.height > shield.bottom) {
                        isBlocked = true;
                        hero_list[shield.idx].shieldHp -= this.specialDamage / 30;
                        $(`#gauge_${shield.idx}`).css("width", (hero_list[shield.idx].shieldHp / hero_list[shield.idx].maxShieldHp) * 100 + '%');
                    }
                }
            }
        }
        if (isBlocked) {} else if (this.left + this.width >= map_max_width)
            this.left = map_max_width - this.width;
        else if (this.left + this.width < map_max_width)
            this.left = this.left + this.movingSpeed;
        $(`#${this.id}`).css("left", `${this.left}px`);

    } else if (this.moving > 2 + random.left + random.right + random.bottom) {
        let isBlocked = false;

        for (shield of shieldList) {
            //if( )
            if (shield.arrow == 'forward') {

                if (shield.up <= this.bottom && shield.up >= this.bottom - this.movingSpeed) {
                    if (monster_loc.left < shield.right && monster_loc.left > shield.left) {
                        isBlocked = true;
                        hero_list[shield.idx].shieldHp -= this.specialDamage / 30;
                        $(`#gauge_${shield.idx}`).css("width", (hero_list[shield.idx].shieldHp / hero_list[shield.idx].maxShieldHp) * 100 + '%');
                    }
                }
            }
        }
        if (isBlocked) {} else if (this.bottom <= map_min_height)
            this.bottom = map_min_height;
        else if (this.bottom > map_min_height)
            this.bottom = this.bottom - this.movingSpeed;
        $(`#${this.id}`).css("bottom", `${this.bottom}px`);

    } else if (this.moving > 0 + random.left + random.right + random.bottom + random.up) {
        // 5 , 6 , 7 

        let isBlocked = false;

        for (shield of shieldList) {
            //if( )
            if (shield.arrow == 'back') {

                if (shield.bottom >= this.bottom + this.height && shield.bottom <= this.bottom + this.height + this.movingSpeed) {
                    if (monster_loc.left < shield.right && monster_loc.left > shield.left) {
                        isBlocked = true;
                        hero_list[shield.idx].shieldHp -= this.specialDamage / 30;
                        $(`#gauge_${shield.idx}`).css("width", (hero_list[shield.idx].shieldHp / hero_list[shield.idx].maxShieldHp) * 100 + '%');
                    }
                }
            }
        }
        if (isBlocked) {} else if (this.bottom + (this.height) >= map_max_height)
            this.bottom = map_max_height - (this.height);
        else if (this.bottom + (this.height) < map_max_height)
            this.bottom = this.bottom + this.movingSpeed;
        $(`#${this.id}`).css("bottom", `${this.bottom}px`);
    }

    for (hero of hero_list) {

        if (hero.hitsafe)
            continue;

        let monster_left = this.left
        let monster_right = this.left + this.width;
        let monster_bottom = this.bottom
        let monster_up = this.bottom + this.height;

        let hero_left = hero.left
        let hero_right = hero.left + hero_width;
        let hero_bottom = hero.bottom
        let hero_up = hero.bottom + hero_height;

        let hero_height_center = (hero_bottom + hero_up) / 2;
        let hero_width_center = (hero_left + hero_right) / 2;

        const hit_range = 3;

        let hitbox = {
            height: hero_height_center > monster_bottom - (hero_height / 2) && hero_height_center < monster_up + (hero_height / 2),
            // 캐릭터의 중심이 안에 들어왔을 때
            width: hero_width_center > monster_left - (hero_width / 2) && hero_width_center < monster_right + (hero_width / 2),
        };

        if (hitbox.width && hitbox.height) {
            hero.hitAnimation();

            hero.hp = hero.hp - this.specialDamage;
            hero.hpBar();

        }
    }
    if (!hero_list[0].death && hero_list[0].hp <= 0) {
        hero_list[0].death = true;
        grave_list.push({
            player: hero_list[0].idx,
            left: hero_list[0].left + (hero_width / 2) - (23 / 2),
            bottom: hero_list[0].bottom + (hero_height / 2) - (100 / 2)
        });
        $(`#character_${hero_list[0].idx}`).fadeOut(2000, "swing", ()=>{
            $("#field").append($(`<div id=grave_${hero_list[0].idx}></div>`));
            $(`#grave_${hero_list[0].idx}`).css("left", grave_list[grave_list.length - 1].left + (hero_width / 2) - (23 / 2));
            $(`#grave_${hero_list[0].idx}`).css("bottom", grave_list[grave_list.length - 1].bottom + (hero_height / 2) - (100 / 2));
        }
        );
    } else if (!hero_list[1].death && hero_list[1].hp <= 0) {
        hero_list[1].death = true;
        grave_list.push({
            player: hero_list[1].idx,
            left: hero_list[1].left + (hero_width / 2) - (23 / 2),
            bottom: hero_list[1].bottom + (hero_height / 2) - (70 / 2)
        });
        $(`#character_${hero_list[1].idx}`).fadeOut(2000, "swing", ()=>{
            $("#field").append($(`<div id=grave_${hero_list[1].idx}></div>`));
            $(`#grave_${hero_list[1].idx}`).css("left", grave_list[grave_list.length - 1].left + (hero_width / 2) - (23 / 2));
            $(`#grave_${hero_list[1].idx}`).css("bottom", grave_list[grave_list.length - 1].bottom + (hero_height / 2) - (100 / 2));
            //$(`#character_${hero_list[1].idx}`).remove();

        }
        );
    }

    for (hero of hero_list) {
        if (hero.char == 'tanker' && hero.shieldHp <= 0 && !hero.shieldBroken) {
            $(`#gauge_${hero.idx}`).css('background-color', '#ff9797');
            hero.shieldBroken = true;
            hero.tankerAttackKeyup();
        }

    }

    /*
    let tothenextlevel = true;
    for (monster of monster_list)
        tothenextlevel = monster.death && tothenextlevel;

    if (tothenextlevel) {
        for (monster of monster_list) {
            $(`#monster_${monster.idx}`).remove();
        }

        monster_list = [];
    }
    */

    let gameover = true;
    for (hero of hero_list) {
        gameover = hero.death && gameover;
    }

    if (gameover) {
        $("#stage_num").css("background-image", `url(./img/stage/gameover.png)`);
        $("#wrapper").addClass('gameover');
        $("#stage_num").fadeIn(2000, "swing", ()=>{//$("#wrapper_opacity").addClass('gameover');
        //$("#wrapper").addClass('gameover');
        }
        );
    }

}

function Bat() {}
Bat.prototype.init = function() {
    this.aggroParameter = [0, 0]

    this.movingRate = 500 - Math.floor(Math.random() * 400);
    this.movingSpeed = 0;
    // 5

    this.maxhp = 100;

    this.id = `monster_${monster_list.length}`;
    this.idx = monster_list.length;

    this.moving = Math.floor(Math.random() * 8);

    this.move_direction = setInterval(()=>{

        this.moving = Math.floor(Math.random() * 8);

    }
    , this.movingRate);

    this.motionNum = 0;

    this.width = parseFloat($(`#monster_${monster_list.length}`).css('width'));

    this.height = parseFloat($(`#monster_${monster_list.length}`).css('height'));

    $(`#monster_${monster_list.length}`).css("left", `${this.left}px`);
    $(`#monster_${monster_list.length}`).css("bottom", `${this.bottom}px`);

    monster_list.push(this);
}

Bat.prototype.hitCheck = function(idx) {}

Bat.prototype.MovePNG = function() {

    if (monster_list < 1)
        return;

    let motionNum = -1;

    this.motionNum = (++this.motionNum) % 40;
    if (this.motionNum > 15)
        motionNum = 2;
    else if (this.motionNum >= 0)
        motionNum = 1;

    let url = this.url + `${this.hit}_hit_${motionNum}.png')`;
    $(`#${this.id}`).css("background-image", url);

}

Bat.prototype.__proto__ = Monster.prototype;

function purpleBat(left, bottom) {

    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);

    this.url = `url('../MAIN/img/monster/tutorial/move/yoons_`;
    let fig = $(`<div id = monster_${monster_list.length} class='monster bat' style=display:none;>
    <div class = monster_hp id=monster_hp_${monster_list.length}><div class = monster_hp_remain id = monster_hp_remain_${monster_list.length}></div></div></div>`);

    $("#field").append(fig);
    fig.fadeIn(500, "swing");

    this.init();

    this.maxhp = 12;
    this.hp = this.maxhp;

    $(`#monster_hp_${this.idx}`).css("width", `${this.width}px`);

}

purpleBat.prototype.hitCheck = function(idx) {
    this.movingSpeed = 7;
    this.hitStun = true;
    this.hp = this.hp - hero_list[idx].damage;
    this.hpBar();
    if (this.hp < this.maxhp / 2 && this.hit == 0) {
        this.hit = this.hit + 1;
    }
    if (this.hp <= 0) {
        this.hit = 0;
        this.death = true;
        this.tagRemove();
    }

    setTimeout(()=>{
        this.hitStun = false;
    }
    , 300);
}

function redBat(left, bottom) {
    this.movingSpeed = 7;
    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);

    this.url = `url('../MAIN/img/monster/tutorial/move/yons_`;
    let fig = $(`<div id = monster_${monster_list.length} class='monster bat' style=display:none;>
    <div class = monster_hp id=monster_hp_${monster_list.length}><div class = monster_hp_remain id = monster_hp_remain_${monster_list.length}></div></div></div>`);

    $("#field").append(fig);
    fig.fadeIn(500, "swing");

    this.init();

    this.maxhp = 12;
    this.hp = this.maxhp;

    $(`#monster_hp_${this.idx}`).css("width", `${this.width}px`);

}

redBat.prototype.hitCheck = function(idx) {
    this.hitStun = true;
    this.hp = this.hp - hero_list[idx].damage;
    this.hpBar();
    if (this.hp < this.maxhp / 2 && this.hit == 0) {
        this.hit = this.hit + 1;
        this.movingSpeed = 12;
    }
    if (this.hp <= 0) {
        this.hit = 0;
        this.death = true;
        this.tagRemove();
    }

    setTimeout(()=>{
        this.hitStun = false;
    }
    , 300);
}

function kingBat(left, bottom) {

    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);

    this.url = `url('../MAIN/img/monster/tutorial/move/kingbat_`;
    let fig = $(`<div id = monster_${monster_list.length} class='monster kingbat' style=display: none;></div>`);

    $("#field").append(fig);
    fig.fadeIn(500, "swing");

    this.init();
}

kingBat.prototype.specialAttack = function() {
    let summon_max = Math.floor(Math.random() * 3)
    for (let i = 0; i < summon_max; i++)
        if (this.hit == 0)
            new purpleBat(80 - Math.floor(Math.random() * 60),80 - Math.floor(Math.random() * 50));
        else
            new redBat(80 - Math.floor(Math.random() * 60),80 - Math.floor(Math.random() * 50))
}

kingBat.prototype.MovePNG = function() {

    var motionNum = -1;

    this.motionNum = (++this.motionNum) % 140;
    // 1 2 1 3 4 3 1 2 1 -> 1 2 1 2 1 3 4 3 1 2 1 2 1

    if ((this.motionNum > 110 && this.motionNum < 120) || (this.motionNum > 130 && this.motionNum < 140)) {
        // 110~120, 130~140 
        motionNum = 9;
    } else if (this.motionNum > 100) {
        // 100~110, 120~130
        motionNum = 8;
    } else if (this.motionNum > 90) {
        motionNum = 7;
    } else if (this.motionNum > 80) {
        motionNum = 6;
    } else if (this.motionNum > 70) {
        motionNum = 5;
    } else if (this.motionNum > 60) {
        motionNum = 4;
    } else if (this.motionNum > 50) {
        motionNum = 3;
    } else if ((this.motionNum > 10 && this.motionNum < 20) || (this.motionNum > 30 && this.motionNum < 40))
        // 10~20, 30~40
        motionNum = 2;
    else if (this.motionNum >= 0)
        // 0~10, 20~30
        motionNum = 1;

    let url = this.url + `${this.hit}_hit_${motionNum}.png')`;
    $(`#${this.id}`).css("background-image", url);
}

kingBat.prototype.hitCheck = function(idx) {
    this.hp = this.hp - hero_list[idx].damage;
    $("#boss_remain").css("width", ((this.hp / this.maxhp) * 100) + '%');
    this.specialAttack();

    if (this.hp <= (this.maxhp / 2) && this.hp > 0) {
        this.hit = 1;
        this.movingSpeed = 10;
    } else if (this.hp <= 0) {
        for (monster of monster_list)
            monster.death = true;
        this.hit = 0;
        this.death = true;
        this.tagRemove(this.idx);
    }
}

purpleBat.prototype.__proto__ = Bat.prototype;
redBat.prototype.__proto__ = Bat.prototype;
kingBat.prototype.__proto__ = Bat.prototype;

function Ghost() {}

Ghost.prototype.init = function() {
    this.aggroParameter = [0, 0]

    this.movingRate = 500 - Math.floor(Math.random() * 400);
    this.movingSpeed = 5;
    // 5

    this.maxhp = 10;
    this.hp = this.maxhp;
    this.id = `monster_${monster_list.length}`;
    this.idx = monster_list.length;

    this.moving = Math.floor(Math.random() * 8);

    this.move_direction = setInterval(()=>{

        this.moving = Math.floor(Math.random() * 8);

    }
    , this.movingRate);

    this.motionNum = 0;

    this.width = parseFloat($(`#monster_${monster_list.length}`).css('width'));

    this.height = parseFloat($(`#monster_${monster_list.length}`).css('height'));

    this.specialDamage = 20;

    $(`#monster_${monster_list.length}`).css("left", `${this.left}px`);
    $(`#monster_${monster_list.length}`).css("bottom", `${this.bottom}px`);

    monster_list.push(this);
}

Ghost.prototype.MovePNG = function() {
    if (monster_list < 1)
        return;

    let motionNum = -1;

    this.motionNum = (++this.motionNum) % 40;
    if (this.motionNum > 15)
        motionNum = 1;
    else if (this.motionNum >= 0)
        motionNum = 0;

    let url = this.url + `${motionNum}.png')`;
    $(`#${this.id}`).css("background-image", url);
}

Ghost.prototype.hitCheck = function(idx) {

    this.hitStun = true;
    this.hp = this.hp - hero_list[idx].damage;
    this.hpBar();
    if (this.hp < this.maxhp / 2 && this.hit == 0) {
        $(`#${this.id}`).css("opacity", "80%");
        this.hit = this.hit + 1;
    }
    if (this.hp <= 0) {
        this.hit = 0;
        this.death = true;
        this.tagRemove();
    }

    setTimeout(()=>{
        this.hitStun = false;
    }
    , 300);

    /*
    this.hit = this.hit + 1;
    this.hp = this.hp - hero_list[idx].damage;
    if (this.hit == 1)
        $(`#${this.id}`).css("background-size", "60%").css("opacity", "80%");
    if (this.hit >= 2) {
        this.hit = 0;
        this.death = true;
        this.tagRemove();
    }
    */
}

Ghost.prototype.__proto__ = Monster.prototype;

function grayGhost(left, bottom) {
    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);

    this.url = `url('../MAIN/img/monster/ghost/gray_ghost/ghost_`;
    //let fig = $(`<div id = monster_${monster_list.length} class='monster ghost' style=display:none;></div>`);
    let fig = $(`<div id = monster_${monster_list.length} class='monster ghost' style=display:none;>
    <div class = monster_hp id=monster_hp_${monster_list.length}><div class = monster_hp_remain id = monster_hp_remain_${monster_list.length}></div></div></div>`);

    $("#field").append(fig);
    fig.fadeIn(500, "swing");

    this.init();

    $(`#monster_hp_${this.idx}`).css("width", `${this.width}px`);
}

function violetGhost(left, bottom) {
    this.hide = false;
    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);

    this.url = `url('../MAIN/img/monster/ghost/violet_ghost/ghost_`;

    //let fig = $(`<div id = monster_${monster_list.length} class='monster ghost' style=display:none;></div>`);
    let fig = $(`<div id = monster_${monster_list.length} class='monster ghost' style=display:none;>
    <div class = monster_hp id=monster_hp_${monster_list.length}><div class = monster_hp_remain id = monster_hp_remain_${monster_list.length}></div></div></div>`);

    $("#field").append(fig);
    fig.fadeIn(500, "swing");

    this.init();

    $(`#monster_hp_${this.idx}`).css("width", `${this.width}px`);
}

violetGhost.prototype.hitCheck = function(idx) {
    this.hitStun = true;
    this.hp = this.hp - hero_list[idx].damage;
    this.hpBar();
    $(`#${this.id}`).fadeOut(500, "swing", ()=>{
        this.hide = false;
        this.teleport(80 - Math.floor(Math.random() * 50), 80 - Math.floor(Math.random() * 50));
        $(`#${this.id}`).fadeIn(300, "swing", ()=>{}
        );
    }
    );

    if (this.hp < this.maxhp / 2 && this.hit == 0) {
        $(`#${this.id}`).css("opacity", "50%");
        this.hit = this.hit + 1;
    }
    if (this.hp <= 0) {
        this.hit = 0;
        this.death = true;
        this.tagRemove();
    }

    setTimeout(()=>{
        this.hitStun = false;
    }
    , 300);
}

function Grimreaper(left, bottom) {
    this.hide = false;

    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);

    this.url = `url('../MAIN/img/monster/ghost/grimreaper/grimreaper_`;
    let fig = $(`<div id = monster_${monster_list.length} class='monster grimreaper' style=display:none;></div>`);

    $("#field").append(fig);
    fig.fadeIn(500, "swing");

    this.init();
    this.maxhp = 200;
    this.hp = this.maxhp;

    setInterval(()=>{
        this.specialAttack();
    }
    , 4000);
}
Grimreaper.prototype.MovePNG = function() {
    if (monster_list < 1)
        return;

    let motionNum = -1;

    this.motionNum = (++this.motionNum) % 40;
    if (this.motionNum > 15)
        motionNum = 1;
    else if (this.motionNum >= 0)
        motionNum = 0;

    let url = this.url + `${this.hit}_${motionNum}.png')`;
    $(`#${this.id}`).css("background-image", url);
}

Grimreaper.prototype.hitCheck = function(idx) {
    if (this.hide)
        return;
    this.hp = this.hp - hero_list[idx].damage;
    $("#boss_remain").css("width", ((this.hp / this.maxhp) * 100) + '%');

    if (this.hp <= (this.maxhp / 2) && this.hp > 0) {
        this.hit = 1;
        this.movingSpeed = 10;
    } else if (this.hp <= 0) {
        for (monster of monster_list)
            monster.death = true;
        this.hit = 0;
        this.death = true;
        this.tagRemove(this.idx);
    }
}

Grimreaper.prototype.specialAttack = function() {
    switch (Math.floor(Math.random() * 2)) {
    case 0:
        new grayGhost(80 - Math.floor(Math.random() * 50),80 - Math.floor(Math.random() * 50));
        break;
    case 1:
        new violetGhost(80 - Math.floor(Math.random() * 50),80 - Math.floor(Math.random() * 50));
        break;
    }
    ;$(`#${this.id}`).fadeOut(1000, "swing", ()=>{
        this.hide = true;

        setTimeout(()=>{
            this.hide = false;
            $(`#${this.id}`).fadeIn(2000, "swing", ()=>{}
            );
        }
        , 3000);
    }
    );
}

grayGhost.prototype.__proto__ = Ghost.prototype;
violetGhost.prototype.__proto__ = Ghost.prototype;
Grimreaper.prototype.__proto__ = Ghost.prototype;

/* 몬스터 객체 */

/* 캐릭터 객체 */
function Hero(gravity, move_velocity, jump_velocity, hp, damage, attackSpeed, left, bottom, player, char) {
    this.char = char;

    this.gravity = gravity;
    this.move_velocity = move_velocity;
    this.jump_velocity = jump_velocity;
    this.damage = damage;
    this.attackSpeed = attackSpeed;
    this.item_select = true;
    this.attackRate = 1500;
    this.attackRange = 600;
    // 초보자 400

    this.motionNum = 1;
    this.death = false;
    this.shieldUp = false;

    this.isAttacking = false;
    this.attackGauge = 0;
    this.maxGauge = this.attackRate / 10;

    this.hitsafe = false;
    this.hitsafeTime = 1000;
    this.idx = player;

    this.attackMoveRate = 20;
    this.attackSize = {
        width: 50,
        height: 50
    };

    if (typeof (left) == 'number')
        this.left = screen_width * (left / 100);
    else if (typeof (left) == 'string')
        this.left = parseFloat(left);

    if (typeof (bottom) == 'number')
        this.bottom = screen_height * (bottom / 100);
    else if (typeof (bottom) == 'string')
        this.bottom = parseFloat(bottom);

    this.arrow;
    if (this.idx == 0)
        this.arrow = 38;
    else if (this.idx == 1)
        this.arrow = 82;

    if (hero_list.length < 2)
        hero_list.push(this);

    this.hp = hp;
    this.maxhp = hp;

    this.draw();

    this.skillAggresive = 0;

}

Hero.prototype.coordinates = function() {
    return {
        x: this.left + hero_width / 2,
        y: this.bottom + hero_height / 2
    };
}

Hero.prototype.quarter = function() {
    return {
        left: this.left,
        right: this.left + hero_width,
        bottom: this.bottom,
        up: this.bottom + hero_height,
    };
}

Hero.prototype.hitBox = function(width, height) {
    return {
        left: this.left - width / 2,
        right: this.left + hero_width + width / 2,
        bottom: this.bottom - height / 2,
        up: this.bottom + hero_height + height / 2,
    }
}

Hero.prototype.normalAttackAggresive = 5;

Hero.prototype.draw = function() {
    $("#field").append($(`<div id=character_${this.idx} class=character><div class=player id=player_${this.idx + 1}></div><div id=gauge_${this.idx} class= 'invisible gauge'><div id=charging_${this.idx}></div></div><div class=char_hp><div id=hp_${this.idx}></div><</div><div id=char_figure_${this.idx}></div></div>`));
    $(`#character_${this.idx}`).css("left", `${this.left}px`);
    $(`#character_${this.idx}`).css("bottom", `${this.bottom}px`);
    $(`#hp_${this.idx}`).css("width", this.hp + '%');
}

Hero.prototype.revive = function() {
    if (this.death)
        return;
    for (grave of grave_list) {
        let hero_width_center = this.left + (hero_width / 2);
        let hero_height_center = this.bottom + (hero_height / 2);

        let grave_width = parseFloat($(`#grave_${grave.player}`).css("width"));
        let grave_height = parseFloat($(`#grave_${grave.player}`).css("height"));

        let width_hitCheck = grave.left + (grave_width / 2);
        let height_hitCheck = grave.bottom + (grave_height / 2);

        if (hero_width_center > width_hitCheck - 30 && hero_width_center < width_hitCheck + 30) {
            if (hero_height_center > height_hitCheck - 30 && hero_height_center < height_hitCheck + 30) {

                hero_list[grave.player].hp = ((this.hp) * 0.3);
                hero_list[grave.player].hpBar();
                hero_list[grave.player].death = false;
                hero_list[grave.player].left = grave.left;
                hero_list[grave.player].bottom = grave.bottom;

                $(`#grave_${grave.player}`).remove();
                grave_list.pop();

                $(`#character_${hero_list[grave.player].idx}`).fadeIn(1000, "swing");

            }
        }
    }
}

Hero.prototype.hitAnimation = function() {
    if (this.hp <= 10)
        return;
    $(`#character_${this.idx}`).fadeOut(100, "swing", ()=>{
        $(`#character_${this.idx}`).fadeIn(100, "swing", ()=>{
            $(`#character_${this.idx}`).fadeOut(100, "swing", ()=>{
                $(`#character_${this.idx}`).fadeIn(100, "swing", ()=>{}
                );
            }
            );
        }
        );
    }
    );

    this.hitsafe = true;
    setTimeout(()=>{
        this.hitsafe = false;
    }
    , this.hitsafeTime);
}

Hero.prototype.teleport = function(left, bottom) {
    this.left = left;
    this.bottom = bottom;
    $(`#character_${this.idx}`).css("left", left + 'px');
    $(`#character_${this.idx}`).css("bottom", bottom + 'px');
}

Hero.prototype.MovePNG = function() {
    var where;
    switch (this.arrow) {
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

    this.motionNum = (++this.motionNum) % 40;
    var motionNum;
    var char;
    if (this.motionNum > 30)

        motionNum = 3;
    else if (this.motionNum > 20)
        motionNum = 2;
    else if (this.motionNum > 10)
        motionNum = 1;
    else if (this.motionNum >= 0)
        motionNum = 0;

    url = `url('../MAIN/img/character/${this.char}/move/move_${where}${motionNum}.png')`;

    //$(`#character_${this.idx}`).css("background-image", url);
    $(`#char_figure_${this.idx}`).css("background-image", url);
}

Hero.prototype.hpBar = function() {
    $(`#hp_${this.idx}`).css("width", (this.hp / this.maxhp) * 100 + '%');
}

Hero.prototype.crashed = function() {
    console.log(Monster.crashAttackDamage, Monster.crashAttackSpeed);
}
;

Hero.prototype.move_left = function() {
    this.left = this.left - this.move_velocity;
    $(`#character_${this.idx}`).css("left", this.left + "px");
}

Hero.prototype.move_right = function() {
    this.left = this.left + this.move_velocity;
    $(`#character_${this.idx}`).css("left", this.left + "px");
}

Hero.prototype.move_forward = function() {
    this.bottom = this.bottom + this.move_velocity;
    $(`#character_${this.idx}`).css("bottom", this.bottom + "px");
}
Hero.prototype.move_back = function() {
    this.bottom = this.bottom - this.move_velocity;
    $(`#character_${this.idx}`).css("bottom", this.bottom + "px");
}

Hero.prototype.healerAttack = function() {
    if (this.isAttacking)
        return;
    /*
    this.isAttacking = true;
    setTimeout(()=>{
        this.isAttacking = false;
    }
    , this.attackRate);
    */
    let keypress;
    if (this.idx == 0)
        keypress = 25;
    else
        keypress = 65;
    if (keydownMap[keypress]) {
        this.attackGauge++;
        let gauge = (this.attackGauge / this.maxGauge) * 100;
        if (gauge > 100) {
            $(`#charging_${this.idx}`).css("background-color", '#f7be3a');
            gauge = 100;
        }
        $(`#charging_${this.idx}`).css("width", gauge + '%');

    }
}

Hero.prototype.adcarryAttack = function() {
    if (this.isAttacking)
        return;
    /*
    this.isAttacking = true;
    setTimeout(()=>{
        this.isAttacking = false;
    }
    , this.attackRate);
    */
    let keypress;
    if (this.idx == 0)
        keypress = 25;
    else
        keypress = 65;
    if (keydownMap[keypress]) {
        this.attackGauge++;
        let gauge = (this.attackGauge / this.maxGauge) * 100;
        if (gauge > 100) {
            $(`#charging_${this.idx}`).css("background-color", '#f7be3a');
            gauge = 100;
        }
        $(`#charging_${this.idx}`).css("width", gauge + '%');

    }
}

Hero.prototype.tankerAttackKeyup = function() {
    let where = '';
    switch (this.arrow) {
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
    $(`#shield_${where}_${this.idx}`).addClass('invisible');
    this.shieldUp = false;
    this.healShieldInterval();
}

Hero.prototype.tankerAttack = function() {
    if (this.shieldBroken) {
        if (this.shieldHp >= this.maxShieldHp) {
            this.shieldBroken = false;
            $(`#gauge_${this.idx}`).css("background-color", "#f8ff97");
        }
        return;
    }

    this.healShieldClear();

    this.shieldUp = true;
    let where = '';
    switch (this.arrow) {
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
    $(`#shield_${where}_${this.idx}`).removeClass('invisible');

    /*
    if (this.isAttacking)
        return;
    this.isAttacking = true;
    setTimeout(()=>{
        this.isAttacking = false;
    }
    , this.attackRate);

    const pullRange = 30;

    let range = {
        Center: {
            left: this.left + hero_width / 2,
            bottom: this.bottom + hero_height / 2,
        },

        Left: this.left,
        LeftRange: this.left - (this.attackRange),

        Right: this.left + hero_width,
        RightRange: this.left + hero_width + (this.attackRange),

        Bottom: this.bottom,
        BottomRange: this.bottom - (this.attackRange),

        Up: this.bottom + hero_height,
        UpRange: this.bottom + hero_height + (this.attackRange),
    }

    let hit = $(`<div style='position:fixed; border-width: 5px; border-style : solid; background-color : transparent; left: ${range.LeftRange}px; bottom: ${range.BottomRange}px; 
    width: ${this.attackRange * 2 + hero_width}px; height : ${this.attackRange * 2 + hero_height}px;'> </div>`)
    $("#field").append(hit);
    hit.fadeOut(1000, "swing", function() {
        $(this).remove();
    })
    for (monster of monster_list) {
        let hitBox = {
            Center: {
                left: monster.left + monster.width / 2,
                bottom: monster.bottom + monster.height / 2,
            },
        }

        if (monster.coordinates().x > range.LeftRange && monster.coordinates().x < range.RightRange) {
            if (monster.coordinates().y > range.BottomRange && monster.coordinates().y < range.UpRange) {
                monster.crowdControlled(this.maxhp * 10);
                $(`#${monster.id}`).css("transition-property", "left,bottom").css("transition-duration", '1s, 1s');
                let move_left = this.left + hero_width - monster.width;
                let move_bottom = this.bottom + hero_height - monster.height;
                console.log('outside move_left', `${move_left}px`, );
                monster.teleport(`${move_left}`, `${move_bottom}`);
                monster.hitCheck(this.idx);
                monster.aggro(this.idx, this.damage * this.skillAggresive);
            }
        }

    }
    */
}
Hero.prototype.heal = function() {

    setInterval(()=>{
        if (this.hp + this.damage / 10 < this.maxhp) {
            this.hp = this.hp + this.damage / 10;
        } else {
            this.hp = this.maxhp;
        }
        this.hpBar();
    }
    , 100);
}

Hero.prototype.warriorAttack = function() {

    if (this.isAttacking)
        return;
    this.isAttacking = true;
    setTimeout(()=>{
        this.isAttacking = false;
    }
    , this.attackRate);

    for (monster of monster_list) {
        let range = {
            Center: {
                left: this.left + hero_width / 2,
                bottom: this.bottom + hero_height / 2,
            },

            Left: this.left,
            LeftRange: this.left - (this.attackRange) - monster.width / 2,

            Right: this.left + hero_width,
            RightRange: this.left + hero_width + (this.attackRange) + monster.width / 2,

            Bottom: this.bottom,
            BottomRange: this.bottom - (this.attackRange) - monster.height / 2,

            Up: this.bottom + hero_height,
            UpRange: this.bottom + hero_height + (this.attackRange) + monster.height / 2,
        }

        switch (this.arrow) {
        case 37:
        case 68:
            where = 'left';
            if (monster.coordinates().x > range.LeftRange && monster.coordinates().x < range.Left) {
                if ((monster.coordinates().y < range.UpRange) && (monster.coordinates().y > range.BottomRange)) {
                    monster.hitCheck(this.idx);
                    monster.aggro(this.idx, this.damage);
                }
            }
            break;
        case 39:
        case 71:
            where = 'right';
            if (monster.coordinates().x < range.RightRange && monster.coordinates().x > range.Right) {
                if ((monster.coordinates().y < range.UpRange) && (monster.coordinates().y > range.BottomRange)) {
                    monster.hitCheck(this.idx);
                    monster.aggro(this.idx, this.damage);
                }
            }
            break;
        case 38:
        case 82:
            where = 'forward';
            if (monster.coordinates().y < range.UpRange && monster.coordinates().y > range.Up) {
                if ((monster.coordinates().x < range.RightRange) && (monster.coordinates().x > range.LeftRange)) {
                    monster.hitCheck(this.idx);
                    monster.aggro(this.idx, this.damage);
                }
            }
            break;
        case 40:
        case 70:
            where = 'back';
            if (monster.coordinates().y > range.BottomRange && monster.coordinates().y < range.Bottom) {
                if ((monster.coordinates().x < range.RightRange) && (monster.coordinates().x > range.LeftRange)) {
                    monster.hitCheck(this.idx);
                    monster.aggro(this.idx, this.damage);
                }
            }
            break;
        }
    }

    switch (this.arrow) {
    case 37:
    case 68:
        where = 'left';
        let leftAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/warrior/attack/attack_left.png); background-size: 100% 100%; position : fixed; 
        left : ${this.left - this.attackRange}px; bottom : ${this.bottom - this.attackRange / 2}px; 
        width: ${this.attackRange}px; height : ${this.attackRange}px;'> </div>`);
        $("#field").append(leftAttack);
        leftAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 39:
    case 71:
        where = 'right';
        let rightAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/warrior/attack/attack_right.png); background-size: 100% 100%; position : fixed; 
        left : ${this.left + hero_width}px; bottom : ${this.bottom + hero_height / 2 - (hero_height + this.attackRange) / 2}px; 
        width: ${this.attackRange}px; height : ${this.attackRange}px;'> </div>`);
        $("#field").append(rightAttack);
        rightAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 38:
    case 82:
        where = 'forward';
        let upAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/warrior/attack/attack_up.png); background-size: 100% 100%; position : fixed; 
        left : ${this.left + hero_width / 2 - (this.attackRange) / 2}px; bottom : ${this.bottom + hero_height}px; 
        width: ${this.attackRange}px; height : ${this.attackRange}px;'> </div>`);
        $("#field").append(upAttack);
        upAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 40:
    case 70:
        where = 'back';
        let downAttack = $(`<div style=' opacity: 80%; background-image : url(./img/character/warrior/attack/attack_down.png); background-size: 100% 100%; position : fixed; 
        left : ${this.left + hero_width / 2 - (this.attackRange) / 2}px; bottom : ${this.bottom - this.attackRange}px; 
        width: ${this.attackRange}px; height : ${this.attackRange}px;'> </div>`);
        $("#field").append(downAttack);
        downAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    }
}
Hero.prototype.attack = function(g, h) {

    //37: 왼쪽 / 39 : 오른쪽 / 38 : 위쪽 / 40 : 아래쪽6

    // 공격키 눌린거 떼기
    if (this.isAttacking)
        return;
    //if(!isAttacking) return;
    let heal = h || 0;
    let gauge = g || 0;
    let size = 0;
    if (gauge > this.maxGauge / 4) {
        if (gauge < this.maxGauge / 3) {
            size = 1.2;
        } else if (gauge < this.maxGauge / 2) {
            size = 1.5;
        } else if (gauge < this.maxGauge) {
            size = 1.8
        } else if (gauge >= this.maxGauge) {
            size = 2.0;
        }
    } else {
        size = 1;
    }
    var attack_html = $(`<div value = ${this.arrow} id = 'hero_attack_${attackCnt}' class = 'char_attack char_attack_${this.idx} char_attack_${this.arrow}' 
    style='width: ${this.attackSize.width * size}px; height: ${this.attackSize.height * size}px; 
    left: ${this.left + hero_width / 2 - (this.attackSize.width * size) / 2}px; bottom: ${this.bottom + (hero_height - 30) / 2 - (this.attackSize.width * size) / 2}px;'></div>`);
    if (size >= 2.0) {
        let where;
        switch (this.arrow) {
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
        attack_html.addClass(`charging_${where}`);
    }
    let hero_idx = this.idx;

    hero_attack.push({
        cnt: attackCnt++,
        idx: hero_idx,
        left: this.coordinates().x,
        bottom: this.coordinates().y,
        size: size,
        hit: [],
        heal: heal,
    });

    $("#field").append(attack_html);

    this.isAttacking = true;

    const attack_limit = setTimeout(()=>{
        this.isAttacking = false;
        clearTimeout(attack_limit);
    }
    , this.attackRate);
}

Hero.prototype.walkThrough = function() {
    // 게임 시작되어서 걸어나오는 모션
    var key;
    if (this.idx == 0)
        key = 38;
    else
        key = 82;

    walkthrough = true;
    keydownMap[key] = true;

    setTimeout(()=>{
        keydownMap[key] = false;
        walkthrough = false;
    }
    , 1000);

}
;

/* 브라우저 창 사이즈 변화를 감지하고, 전체 사이즈를 리사이즈 합니다. */
(function(win, $) {

    $(win).on("resize", function() {
        var w_height = $(win).height();
        $("body").css("height", w_height);
        $("#field").css("height", (w_height * 0.6) - (2 * 7) + 'px');
        mapResize();
    });
    $(function() {
        $(win).trigger("resize");
    });
}(window, jQuery));
/* 브라우저 창 사이즈 변화를 감지하고, 전체 사이즈를 리사이즈 합니다. */

/* 스테이지 */

/* 튜토리얼 스테이지 */
function Stage_1() {
    new purpleBat(40,90);
    new purpleBat(45,80);
    new purpleBat(50,80);
    new purpleBat(55,90);
    /*
    var tutorial_monster5 = new Bat(50,43);
    var tutorial_monster6 = new Bat(53,54);
    var tutorial_monster7 = new Bat(40,56);
    var tutorial_monster8 = new Bat(66,50);
    var tutorial_monster9 = new Bat(32,40);
    var tutorial_monster10 = new Bat(30,48);
    var tutorial_monster11 = new Bat(20,66);
    var tutorial_monster12 = new Bat(40,55);
    var tutorial_monster13 = new Bat(67,63);
    var tutorial_monster14 = new Bat(80,67);
    var tutorial_monster15 = new Bat(70,70);
    */
    //var test = new Bat(45,50,1);
}

function Stage_2() {
    new redBat(40,90);
    new redBat(55,90);
    new purpleBat(45,80);
    new purpleBat(50,80);

    //var redBat = new 

}

function Stage_3() {
    new redBat(40,90);
    new redBat(45,90);
    new redBat(50,90);
    new redBat(55,90);
    new purpleBat(45,80);
    new purpleBat(50,80);
}

function Stage_4() {
    $("#boss_hp").fadeIn(1000, "swing");
    $("#boss_remain").css("width", "100%");
    new kingBat(43,80);
}

function Stage_5() {
    new grayGhost(40,90);
    new grayGhost(50,80);
    new grayGhost(60,70);
    new grayGhost(70,60);
    new grayGhost(45,60);
    new grayGhost(55,70);
    new grayGhost(65,80);
    new grayGhost(75,90);
}

function Stage_6() {
    new grayGhost(40,60);
    new violetGhost(50,70);
    new violetGhost(60,80);
    new grayGhost(70,90);
    new grayGhost(40,90);
    new violetGhost(50,90);
    new violetGhost(60,90);
    new grayGhost(70,90);
}

function Stage_7() {
    new grayGhost(25,90);
    new violetGhost(35,90);
    new grayGhost(45,90);
    new violetGhost(55,90);
    new grayGhost(65,90);
    new violetGhost(75,90);
}

function Stage_8() {
    new grayGhost(30,90);
    new Grimreaper(43,60);
    new violetGhost(50,90);
    $("#boss_hp").fadeIn(1000, "swing");
    $("#boss_remain").css("width", "100%");
}
function winResize(win) {
    let w_height = $(win).height();
    $("#stageWrapper").css("height", w_height);
    let field_height = w_height * 0.6;
    field_height = field_height - 2 * (7);
    // field border = 7
    console.log(field_height);
    $("#field").css("height", field_height + 'px');
}

function mapResize() {
    map_min_width = parseFloat($(".sidebar").css("width")) + 7;
    // 1330, 538 / border 7 / sidebar 238
    map_max_width = map_min_width + parseFloat($("#field").css("width"));
    map_min_height = parseFloat($(".padding").css("height")) + 7;
    // padding : 190
    map_max_height = map_min_height + parseFloat($("#field").css("height"));
}
