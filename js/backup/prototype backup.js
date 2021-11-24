/* TODO LIST
       1. ATTACK LIST에서 가장 먼저 스크린 아웃 되는 공격을 pop 해야함.
       2. 몬스터에게 공격이 맞았을 경우 , ATTACK LIST 에서 pop
       3. 몬스터 이동 구현
       4. 몬스터 공격 구현



	*/
var stage = [];
var now_stage = -1;
var stagemove = false;
var itemselectStage = false;

var screen_width = 0;
var screen_height = 0;

var hero_list = [];
var grave_list = [];
var item_list = [];
var selected_item = [];
var skill_list = [];
//Hero(gravity, move_velocity, jump_velocity, hp, damage, attackSpeed)
var hero_attack = [];
var attackCnt = 0;
var item_hover = 1;

var monster_list = [];

var moveRate = 20;
//var attackRate = 250;

// 공격 속도 0.8초 제한
var walkthrough = true;
// 처음 시작할 때 걸어나오는 모션
// 가장 최근에 누른 방향키

var map_min_width;
var map_max_width;
var map_min_height;
var map_max_height;

var hero_width = 40;
var hero_height = 70;

var select_var = 1;
// 타이틀 메뉴 선택 인덱스
var isGameStart = false;
// 게임 시작 전/후

var keydownArr = [];
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
    new Hero(500,7,10,100,4,10000,'1000','-100',0,'kyo');
    // kyo
    new Hero(500,7,10,100,4,10000,'800','-100',1,'net'); // net
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
    stage.push(Stage_justjoke);

    item_list.push({
        name: 'attack_speed_up',
        url: `url(./img/item/item_speed_up.png)`,
        description: (hero)=>{
            return `공격 속도(${hero.attackRate}) 가 ${(hero.attackRate / 10) * 9} 로 빨라집니다.`;
        }
        ,
        function: (hero)=>{
            hero.attackRate = (hero.attackRate / 10) * 9;
        }
        ,
    }, {
        name: 'attack_damage_up',
        url: `url(./img/item/item_damage_up.png)`,
        description: (hero)=>{
            return `데미지(${hero.damage}) 가 ${(hero.damage + 0.5)} 로 증가합니다.`;
        }
        ,
        function: (hero)=>{
            hero.damage = hero.damage + 0.5;

            /*
            hero.attackSize = {
                width: hero.attackSize.width + 10,
                height: hero.attackSize.height + 10,
            }
*/

        }
        ,
    }, {
        name: 'heart',
        url: `url(./img/item/item_heart.png)`,
        description: (hero)=>{
            return `[ 현재 체력 : (${hero.hp}) ]  최대 체력의 30%(${hero.maxhp * 0.3}) 가 회복됩니다.`
        }
        ,
        function: (hero)=>{
            hero.maxhp = hero.maxhp + 10;
            hero.hp = hero.maxhp;
            // maxhp = 100;
            hero.hpBar();
        }
        ,
    }, {
        name: 'defence_up',
        url: `url(./img/item/item_defence_up.png)`,
        description: (hero)=>{
            return `최대 체력(${hero.maxhp}) 이 ${(hero.maxhp + 10)} 로 증가합니다.`
        }
        ,
        function: (hero)=>{
            hero.maxhp = hero.maxhp + 10;
            hero.hp = hero.hp + 10;
        }
        ,
    }, {
        name: 'heal_up',
        url: `url(./img/item/item_heal_up.png)`,
        description: (hero)=>{
            return '아군 체력 10 회복'
        }
        ,
        function: (hero)=>{
            
        }
        ,
    }, );

    skill_list.push({
        name: 'warrior',
        url: `url(./img/character/skill_icon/warrior.png)`,
        description: (hero)=>{
            return `전사로 승급합니다. 공격 범위가 ${hero.attackRange} 에서 ${hero.attackRange - 200} 로 줄어들지만 강력한 범위 공격을 얻습니다. \n 사거리 - 200, 기본 체력 + 50, [패시브] : 범위 공격 `
        }
        ,
        function: (hero)=>{
            hero.char = 'warrior';
            hero.attackRange = 200;
            hero.maxhp = hero.maxhp + 50;
            hero.hp = hero.maxhp;
        }
    }, {
        name: 'tanker',
        url: `url(./img/character/skill_icon/tanker.png)`,
        description: (hero)=>{
            return `탱커로 승급합니다. 강인한 체력과 몬스터 도발을 얻습니다. \n 기본 체력 + 100, [패시브] 도발`
        }
        ,
        function: (hero)=>{
            hero.char = 'tanker';
        }
    }, {
        name: 'adcarry',
        url: `url(./img/character/skill_icon/adcarry.png)`,
        description: (hero)=>{
            return `원거리 딜러로 승급합니다. 공격 범위가 ${hero.attackRange} 에서 ${hero.attackRange + 200} 이동속도 증가 및 투사체를 차징 발사 할 수 있습니다. 차징 발사의 경우 두 대를 때린 효과를 가집니다. \n 사거리 + 200, 이동속도 + 3, [패시브] 차징`
        }
        ,
        function: (hero)=>{
            hero.char = 'adcarry';
            hero.attackRange = 600;
            hero.move_velocity = 10;
        }
    }, 
    /*
    {
        name: 'healer',
        url: `url(./img/character/skill_icon/healer.png)`,
        description: (hero)=>{
            return `힐러로 승급합니다. 아군의 체력을 회복시켜주거나 버프 스킬을 얻습니다.`
        }
        ,
        function: (hero)=>{
            hero.char = 'healer';
        }
    }, 
*/
    );
}

function setTimeFunc() {
    if (!isGameStart)
        return;
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
        if (i < 0)
            continue;

        var attack_xy = {
            left: parseFloat($(`#hero_attack_${i.cnt}`).css("width")) / 2,
            bottom: parseFloat($(`#hero_attack_${i.cnt}`).css("height")) / 2,
        }
        switch (parseInt($(`#hero_attack_${i.cnt}`).attr('value'))) {
        case 37:
        case 68:
            // 왼쪽
            var attack_left = parseFloat($(`#hero_attack_${i.cnt}`).css("left")) - 20;
            $(`#hero_attack_${i.cnt}`).css("left", attack_left + 'px');
            if (attack_left + attack_xy.left < map_min_width || (attack_left + attack_xy.left < parseFloat(i.left) - hero_list[i.idx].attackRange)) {
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
            var attack_left = parseFloat($(`#hero_attack_${i.cnt}`).css("left")) + 20;
            $(`#hero_attack_${i.cnt}`).css("left", attack_left + 'px');
            if (attack_left > map_max_width || (attack_left + attack_xy.left > parseFloat(i.left) + hero_list[i.idx].attackRange)) {
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
            var attack_bottom = parseFloat($(`#hero_attack_${i.cnt}`).css("bottom")) + 20;
            $(`#hero_attack_${i.cnt}`).css("bottom", attack_bottom + 'px');
            console.log(attack_bottom + attack_xy.bottom);
            console.log(parseFloat(i.bottom) - hero_list[i.idx].attackRange / 2);
            if (attack_bottom > map_max_height + 50 || (attack_bottom + attack_xy.bottom > parseFloat(i.bottom) + hero_list[i.idx].attackRange)) {
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
            console.log(attack_xy.bottom, parseFloat(i.bottom));
            var attack_bottom = parseFloat($(`#hero_attack_${i.cnt}`).css("bottom")) - 20;
            $(`#hero_attack_${i.cnt}`).css("bottom", attack_bottom + 'px');
            if (attack_bottom < map_min_height || (attack_bottom + attack_xy.bottom < parseFloat(i.bottom) - hero_list[i.idx].attackRange)) {
                $(`#hero_attack_${i.cnt}`).remove();
                hero_attack[i.cnt] = {
                    cnt: -1,
                    idx: -1
                };
            }
            break;
        }

        for (let monster of monster_list) {

            if (monster.death)
                continue;

            let attack_width = parseFloat($(`#hero_attack_${i.cnt}`).css("width"));
            let attack_height = parseFloat($(`#hero_attack_${i.cnt}`).css("height"));

            let hit_left = parseFloat($(`#hero_attack_${i.cnt}`).css("left")) + attack_width / 2;
            let hit_bottom = parseFloat($(`#hero_attack_${i.cnt}`).css("bottom")) + attack_height / 2;

            let monster_left = monster.left;
            let monster_right = monster.left + (monster.width);
            let monster_bottom = monster.bottom;
            let monster_up = monster.bottom + (monster.height);

            if (hit_left > monster_left - (attack_width / 2) && hit_left < monster_right + (attack_width / 2)) {
                if (hit_bottom > monster_bottom - (attack_height / 2) && hit_bottom < monster_up + (attack_height / 2)) {

                    if (monster.type != 2)
                        monster.hitStun = true;

                    if (!monster.death && monster.hitCheck != null)
                        monster.hitCheck(i.idx);

                    setTimeout(()=>{
                        monster.hitStun = false;
                    }
                    , 300);
                    $(`#hero_attack_${i.cnt}`).remove();
                    hero_attack[i.cnt] = -1;

                    //이 부분 나중에 따로 Bat.underattack 함수 따로 만들어야할 듯. 공격받았을 때.

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

        monster_list = [];
        if (now_stage > -1)
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
        if (now_stage > -1) {
            $("#item_select").fadeIn(1000, "swing");
            itemSelect();
        } else {
            for (hero of hero_list) {
                hero.item_select = true;
            }
        }

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
        hero_list[0].teleport(900, -100);
        hero_list[0].arrow = 38;
        hero_list[1].teleport(700, -100);
        hero_list[1].arrow = 82;

        nextStage();

        for (hero of hero_list)
            hero.walkThrough();
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
    if ((now_stage + 1) % 4 == 0) {
        for (skill of skill_list) {
            item_.push(skill);
        }
        $(".item").each(function() {
            $(this).css("background-color", "rgba(500,100,100,0.5)");
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
    now_stage = ++now_stage % 5;
    stage[now_stage]();
    $("#stage_num").css("background-image", `url(./img/stage/STAGE${now_stage + 1}.png)`);

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
            break;
        case 'tanker':
            break;
        case 'adcarry':
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
            break;
        case 'tanker':
            break;
        case 'adcarry':
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
                hero_list[0].arrow = 40;
            }
            break;
        case 37:
            // 왼쪽 

            if (!isGameStart || keydownMap[37])
                return;
            keydownMap[37] = true;
            hero_list[0].arrow = 37;
            break;
        case 39:
            // 오른쪽
            if (!isGameStart || keydownMap[39])
                return;
            keydownMap[39] = true;
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
                hero_list[1].arrow = 70;
            }
            break;
        case 68:
            // 왼쪽 
            if (!isGameStart || keydownMap[68])
                return;
            keydownMap[68] = true;
            hero_list[1].arrow = 68;
            break;
        case 71:
            // 오른쪽
            if (!isGameStart || keydownMap[71])
                return;
            keydownMap[71] = true;
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
            break;
        case 25:
            keydownMap[25] = false;
            break;
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
function Monster(left, bottom) {
    this.left = left;
    this.bottom = bottom;
    this.prot = 30;
}
// 모든 몬스터의 프로토타입
Monster.prototype.movingRate = 500 - Math.floor(Math.random() * 400);
Monster.prototype.move = function() {
    // 0~5 사이 0~1 1~2 ,2~3 ,3~4, 4~5
    if (walkthrough || stagemove)
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

    let min_distance = 500000;
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

        let x_loc = monster_loc.left - hero_loc.left;
        let y_loc = monster_loc.bottom - hero_loc.bottom;

        if (min_distance > Math.pow(x_loc, 2) + Math.pow(y_loc, 2)) {
            min_distance = Math.pow(x_loc, 2) + Math.pow(y_loc, 2);
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

    if (this.moving > 6 + random.left) {
        if (this.left <= map_min_width) {
            this.left = map_min_width;
        } else if (this.left > map_min_width)
            this.left = this.left - this.movingSpeed;
        $(`#${this.id}`).css("left", `${this.left}px`);

    } else if (this.moving > 4 + random.left + random.right) {
        if (this.left + this.width >= map_max_width)
            this.left = map_max_width - this.width;
        else if (this.left + this.width < map_max_width)
            this.left = this.left + this.movingSpeed;
        $(`#${this.id}`).css("left", `${this.left}px`);

    } else if (this.moving > 2 + random.left + random.right + random.bottom) {
        // 2 , 3 , 4
        if (this.bottom <= map_min_height)
            this.bottom = map_min_height;
        else if (this.bottom > map_min_height)
            this.bottom = this.bottom - this.movingSpeed;
        $(`#${this.id}`).css("bottom", `${this.bottom}px`);

    } else if (this.moving > 0 + random.left + random.right + random.bottom + random.up) {
        // 5 , 6 , 7 
        if (this.bottom + (this.height) >= map_max_height)
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
            $(`#character_${hero_list[0].idx}`).remove();
        }
        );
    } else if (!hero_list[1].death && hero_list[1].hp <= 0) {
        hero_list[1].death = true;
        grave_list.push({
            player: hero_list[1].idx,
            left: hero_list[1].left + (hero_width / 2) - (23 / 2),
            bottom: hero_list[1].bottom + (hero_height / 2) - (100 / 2)
        });
        $(`#character_${hero_list[1].idx}`).fadeOut(2000, "swing", ()=>{
            $("#field").append($(`<div id=grave_${hero_list[1].idx}></div>`));
            $(`#grave_${hero_list[1].idx}`).css("left", grave_list[grave_list.length - 1].left + (hero_width / 2) - (23 / 2));
            $(`#grave_${hero_list[1].idx}`).css("bottom", grave_list[grave_list.length - 1].bottom + (hero_height / 2) - (100 / 2));
            $(`#character_${hero_list[1].idx}`).remove();

        }
        );
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
Monster.crashAttackSpeed = 5;
// 모든 몬스터는 5초마다 한 번씩 crash 데미지를 줄 수 있다.
Monster.crashAttackDamage = 20;
// 모든 몬스터의 crash 데미지는 20이다.

;


function Bat(left, bottom, type) {

    this.url;

    //redBat

    this.movingRate = 500 - Math.floor(Math.random() * 400);
    this.movingSpeed = 5;
    // 5
    this.hit = 0;
    this.hitStun = false;

    this.hitPositiveField = 30;
    this.hitNegativeField = -30;
    this.knockback = 50;
    this.death = false;

    this.maxhp = parseInt($("#boss_hp").css("width"));

    this.id = `monster_${monster_list.length}`;
    this.idx = monster_list.length;

    this.moving = Math.floor(Math.random() * 8);
    this.isMoving = false;

    this.move_direction = setInterval(()=>{

        this.moving = Math.floor(Math.random() * 8);

    }
    , this.movingRate);

    this.motionNum = 0;
    this.type = type;

    if (this.type == 0) {
        // purpleBat
        this.url = `url('../MAIN/img/monster/tutorial/move/yoons_`;
        $("#field").append($(`<div id = monster_${monster_list.length} class='monster bat' style='display:none;'></div>`));
        $(`#monster_${monster_list.length}`).fadeIn(500, "swing");

    } else if (type == 1) {
        this.url = `url('../MAIN/img/monster/tutorial/move/yons_`;
        $("#field").append($(`<div id = monster_${monster_list.length} class='monster bat style='display:none;''></div>`));
        $(`#monster_${monster_list.length}>`).fadeIn(500, "swing");
    } else if (type == 2) {
        this.url = `url('../MAIN/img/monster/tutorial/move/kingbat_`;
        $("#field").append($(`<div id = monster_${monster_list.length} class='monster kingbat'></div>`));
    }

    this.width = parseFloat($(`#monster_${monster_list.length}`).css('width'));

    this.height = parseFloat($(`#monster_${monster_list.length}`).css('height'));

    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);

    $(`#monster_${monster_list.length}`).css("left", `${this.left}px`);
    $(`#monster_${monster_list.length}`).css("bottom", `${this.bottom}px`);

    monster_list.push(this);

}

Bat.prototype.specialAttack = function() {
    if (this.type == 2) {
        for (let i = 0; i < 1; i++)
            new Bat(70 - Math.floor(Math.random() * 40),70 - Math.floor(Math.random() * 40),this.hit);
    }
}

Bat.prototype.hitCheck = function(idx) {
    if (this.type != 2)
        this.hit = this.hit + 1;
    else if (this.type == 2) {
        this.hp = this.hp - hero_list[idx].damage;
        $("#boss_remain").css("width", this.hp + '%');
        this.specialAttack();
    }
    if (this.hit == 1 && this.type == 1)
        this.movingSpeed = 10;
    // 박쥐가 한 대 맞으면 속도 업

    if (this.hp <= 50) {
        this.hit = 1;
        this.movingSpeed = 10;
    }

    if (this.hit == 2 || this.hp <= 0) {
        if (this.type == 2) {
            for (monster of monster_list)
                monster.death = true;
        }
        this.hit = 0;
        this.death = true;
        tagRemove(this.idx);

    }
    function tagRemove(idx) {
        $(`#monster_${idx}`).fadeOut(500, "swing", ()=>{//$(`#monster-${isHit}`).remove();
        }
        );
    }

}

Bat.prototype.MovePNG = function() {

    if (monster_list < 1)
        return;

    var motionNum = -1;
    let loopCnt = 1;

    if (this.type == 2) {
        this.motionNum = (++this.motionNum) % 90;
        while (motionNum == -1) {
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
        }

    } else if (this.type < 2) {
        this.motionNum = (++this.motionNum) % 40;
        if (this.motionNum > 15)
            motionNum = 2;
        else if (this.motionNum >= 0)
            motionNum = 1;

    }

    var url = this.url + `${this.hit}_hit_${motionNum}.png')`;
    $(`#${this.id}`).css("background-image", url);

    /*
        $(".tutorial_monster").each(function(){
        	url = `url('../MAIN/img/monster/tutorial/move/yoons_${this.hit}_hit_${motionNum}.png')`;
            $(this).css("background-image", url);
        });
*/
}

Bat.prototype.hp = 100;
Bat.prototype.specialDamage = 10;

Bat.prototype.__proto__ = Monster.prototype;

function Grimreaper(left, bottom, type){
	 this.url;

    //redBat

    this.movingRate = 500 - Math.floor(Math.random() * 400);
    this.movingSpeed = 5;
    // 5
    this.hit = 0;
    this.hitStun = false;

    this.hitPositiveField = 30;
    this.hitNegativeField = -30;
    this.knockback = 50;
    this.death = false;

    this.maxhp = parseInt($("#boss_hp").css("width"));

    this.id = `monster_${monster_list.length}`;
    this.idx = monster_list.length;

    this.moving = Math.floor(Math.random() * 8);
    this.isMoving = false;

    this.move_direction = setInterval(()=>{

        this.moving = Math.floor(Math.random() * 8);

    }
    , this.movingRate);

    this.motionNum = 0;
    this.type = type;

    if (this.type == 0) {
        // purpleBat
        this.url = `url('../MAIN/img/monster/tutorial/move/yoons_`;
        $("#field").append($(`<div id = monster_${monster_list.length} class='monster bat' style='display:none;'></div>`));
        $(`#monster_${monster_list.length}`).fadeIn(500, "swing");

    } else if (type == 1) {
        this.url = `url('../MAIN/img/monster/tutorial/move/yons_`;
        $("#field").append($(`<div id = monster_${monster_list.length} class='monster bat style='display:none;''></div>`));
        $(`#monster_${monster_list.length}>`).fadeIn(500, "swing");
    } else if (type == 2) {
        this.url = `url('../MAIN/img/monster/tutorial/move/kingbat_`;
        $("#field").append($(`<div id = monster_${monster_list.length} class='monster kingbat'></div>`));
    }

    this.width = parseFloat($(`#monster_${monster_list.length}`).css('width'));

    this.height = parseFloat($(`#monster_${monster_list.length}`).css('height'));

    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);

    $(`#monster_${monster_list.length}`).css("left", `${this.left}px`);
    $(`#monster_${monster_list.length}`).css("bottom", `${this.bottom}px`);

    monster_list.push(this);

}


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
    this.attackRate = 1000;
    this.attackRange = 200; // 초보자 400

    this.motionNum = 1;
    this.death = false;

    this.isAttacking = false;

    this.hitsafe = false;
    this.hitsafeTime = 1000;
    this.idx = player;

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
}

Hero.prototype.draw = function() {
    $("#field").append($(`<div id=character_${this.idx} class=character><div class=player id=player_${this.idx + 1}></div><div class=char_hp><div id=hp_${this.idx}></div></div><div id=char_figure_${this.idx}></div></div>`));
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

                hero_list[grave.player].hp = this.hp;
                hero_list[grave.player].death = false;
                hero_list[grave.player].left = grave.left;
                hero_list[grave.player].bottom = grave.bottom;

                hero_list[grave.player].draw();

                $(`#grave_${grave.player}`).remove();
                grave_list.pop();

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
Hero.prototype.adcarryAttack = function() {
    if (this.isAttacking)
        return;
    this.isAttacking = true;
    setTimeout(()=>{
        this.isAttacking = false;
    }
    , this.attackRate);

    if(this.idx == 0){
        if(keydownMap[25]){

        }
    }



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
        let hitBox = {
            Center: {
                left: monster.left + monster.width / 2,
                bottom: monster.bottom + monster.height / 2,
            },
        }

        let range = {
            Center: {
                left: this.left + hero_width / 2,
                bottom: this.bottom + hero_height / 2,
            },

            Left: this.left,
            LeftRange: this.left - (monster.width / 2) - (this.attackRange ),

            Right: this.left + hero_width,
            RightRange: this.left + hero_width + (monster.width / 2) + (this.attackRange ),

            Bottom: this.bottom,
            BottomRange: this.bottom - (monster.height / 2) - (this.attackRange ),

            Up: this.bottom + hero_height,
            UpRange: this.bottom + hero_height + (monster.height / 2) + (this.attackRange ),
        }

        switch (this.arrow) {
        case 37:
        case 68:
            where = 'left';
            if (hitBox.Center.left > range.LeftRange && hitBox.Center.left < range.Left) {
                if ((hitBox.Center.bottom < range.UpRange) && (hitBox.Center.bottom > range.BottomRange)) {
                    monster.hitCheck(this.idx);
                }
            }
            break;
        case 39:
        case 71:
            where = 'right';
            if (hitBox.Center.left < range.RightRange && hitBox.Center.left > range.Right) {
                if ((hitBox.Center.bottom < range.UpRange) && (hitBox.Center.bottom > range.BottomRange)) {
                    monster.hitCheck(this.idx);
                }
            }
            break;
        case 38:
        case 82:
            where = 'forward';
            if (hitBox.Center.bottom < range.UpRange && hitBox.Center.bottom > range.Up) {
                if ((hitBox.Center.left < range.RightRange) && (hitBox.Center.left > range.LeftRange)) {
                    monster.hitCheck(this.idx);
                }
            }
            break;
        case 40:
        case 70:
            where = 'back';
            if (hitBox.Center.bottom > range.BottomRange && hitBox.Center.bottom < range.Bottom) {
                if ((hitBox.Center.left < range.RightRange) && (hitBox.Center.left > range.LeftRange)) {
                    monster.hitCheck(this.idx);
                }
            }
            break;
        }
    }
    console.log(hit);

    switch (this.arrow) {
    case 37:
    case 68:
        where = 'left';
        let leftAttack = $(`<div style=' opacity: 30%; background-image : url(./img/character/warrior/attack/attack_left.png); background-size: 100% 100%; position : fixed; left : ${this.left - this.attackRange}px; bottom : ${this.bottom - this.attackRange / 2}px; width: ${this.attackRange}px; height : ${hero_height + this.attackRange}px;'> </div>`);
        $("#field").append(leftAttack);
        leftAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 39:
    case 71:
        where = 'right';
        let rightAttack = $(`<div style=' opacity: 30%; background-image : url(./img/character/warrior/attack/attack_right.png); background-size: 100% 100%; position : fixed; left : ${this.left +hero_width}px; bottom : ${this.bottom - this.attackRange / 2}px; width: ${this.attackRange}px; height : ${hero_height + this.attackRange}px;'> </div>`);
        $("#field").append(rightAttack);
        rightAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 38:
    case 82:
        where = 'forward';
        let upAttack = $(`<div style=' opacity: 30%; background-image : url(./img/character/warrior/attack/attack_up.png); background-size: 100% 100%; position : fixed; left : ${this.left - this.attackRange/2 }px; bottom : ${this.bottom + hero_height}px; width: ${hero_height + this.attackRange}px; height : ${this.attackRange}px;'> </div>`);
        $("#field").append(upAttack);
        upAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    case 40:
    case 70:
        where = 'back';
        let downAttack = $(`<div style=' opacity: 30%; background-image : url(./img/character/warrior/attack/attack_down.png); background-size: 100% 100%; position : fixed; left : ${this.left - this.attackRange/2}px; bottom : ${this.bottom - this.attackRange}px; width: ${hero_height + this.attackRange}px; height : ${this.attackRange}px;'> </div>`);
        $("#field").append(downAttack);
        downAttack.fadeOut(1000, "swing", function() {
            $(this).remove();
        });
        break;
    }
}
Hero.prototype.attack = function() {
    //37: 왼쪽 / 39 : 오른쪽 / 38 : 위쪽 / 40 : 아래쪽6

    // 공격키 눌린거 떼기
    if (this.isAttacking)
        return;
    //if(!isAttacking) return;

    var attack_html = $(`<div value = ${this.arrow} id = 'hero_attack_${attackCnt}' class = 'char_attack char_attack_${this.idx} char_attack_${this.arrow}' style='width: ${this.attackSize.width}px; height: ${this.attackSize.height}px; left: ${this.left}px; bottom: ${this.bottom}px;'></div>`);

    let hero_idx = this.idx;

    hero_attack.push({
        cnt: attackCnt++,
        idx: hero_idx,
        left: this.left + hero_width / 2,
        bottom: this.bottom + hero_height / 2,
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
    var purpleBat1 = new Bat(40,90,0);
    var purpleBat2 = new Bat(45,80,0);
    var purpleBat3 = new Bat(50,80,0);
    var purpleBat4 = new Bat(55,90,0);
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
    var redBat1 = new Bat(40,90,1);
    var redBat1 = new Bat(55,90,1);
    var purpleBat1 = new Bat(45,80,0);
    var purpleBat2 = new Bat(50,80,0);

    //var redBat = new 

}

function Stage_3() {
    var redBat1 = new Bat(40,90,1);
    var redBat2 = new Bat(45,90,1);
    var redBat3 = new Bat(50,90,1);
    var redBat4 = new Bat(55,90,1);
    var purpleBat1 = new Bat(45,80,0);
    var purpleBat2 = new Bat(50,80,0);
}

function Stage_4() {
    $("#boss_hp").fadeIn(1000, "swing");

    var kingbat = new Bat(43,80,2);
}

function Stage_justjoke() {
    var kingbat = new Bat(43,70,2);
    var kingbat = new Bat(43,80,2);
    var kingbat = new Bat(43,60,2);
    var kingbat = new Bat(30,60,2);
    var kingbat = new Bat(40,60,2);
    var kingbat = new Bat(50,60,2);
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
