/* TODO LIST
       1. ATTACK LIST에서 가장 먼저 스크린 아웃 되는 공격을 pop 해야함.
       2. 몬스터에게 공격이 맞았을 경우 , ATTACK LIST 에서 pop
       3. 몬스터 이동 구현
       4. 몬스터 공격 구현



	*/
var stage = [];
var now_stage = 0;
var stagemove = false;

var screen_width = 0;
var screen_height = 0;

var hero_list = [];
var hero;
var hero_2;
//Hero(gravity, move_velocity, jump_velocity, hp, damage, attackSpeed)
var hero_attack = [];
var attackCnt = 0;

var monster_list = [];

var moveRate = 20;
var attackRate = 800;

var isAttacking = false;
// 공격 속도 0.8초 제한
var walkthrough = false;
// 처음 시작할 때 걸어나오는 모션
var arrow = 38;
// 가장 최근에 누른 방향키

var map_min_width;
var map_max_width;
var map_min_height;
var map_max_height;

var hero_width = 60;
var hero_height = 96;

var select_var = 1;
// 타이틀 메뉴 선택 인덱스
var isGameStart = false;
// 게임 시작 전/후

var keydownArr = [];
var keydownMap = new Map([[18, false], // ALT
[96, false], [65, false], // 'a'
[37, false], // 왼쪽
[38, false], // 위
[39, false], // 오른쪽
[40, false], // 아래

[70, false], // h2 아래
[68, false], // h2 아래
[71, false], // h2 아래
[82, false], // h2 아래
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

    //               gravity, move_velocity, junp_velocity,    hp     damage  attackSpeed   left   bottom
    hero = new Hero(500,7,10,100,63,10000,0,-10);
    hero_2 = new Hero(500,7,10,100,63,10000,70,-10);
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

}

function setTimeFunc() {
    keydownFunc();
    AttackMove();
    if (monster_list.length > 0) {
        for (let monster of monster_list) {
            monster.MovePNG();
            monster.move();
        }
    }
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
        switch (parseInt($(`#hero_attack_${i}`).attr('value'))) {
        case 37:
            // 왼쪽
            var attack_left = parseFloat($(`#hero_attack_${i}`).css("left")) - 20;
            $(`#hero_attack_${i}`).css("left", attack_left + 'px');
            if (attack_left < map_min_width) {
                $(`#hero_attack_${i}`).remove();
                hero_attack[i] = -1;
            }
            break;

        case 39:
            // 오른쪽
            var attack_left = parseFloat($(`#hero_attack_${i}`).css("left")) + 20
            $(`#hero_attack_${i}`).css("left", attack_left + 'px');
            if (attack_left > map_max_width) {
                $(`#hero_attack_${i}`).remove();
                hero_attack[i] = -1;
            }
            break;

        case 38:
            // 위
            var attack_bottom = parseFloat($(`#hero_attack_${i}`).css("bottom")) + 20;
            $(`#hero_attack_${i}`).css("bottom", attack_bottom + 'px');
            if (attack_bottom > map_max_height + 50) {
                $(`#hero_attack_${i}`).remove();
                hero_attack[i] = -1;
            }
            break;

        case 40:
            // 아래
            var attack_bottom = parseFloat($(`#hero_attack_${i}`).css("bottom")) - 20;
            $(`#hero_attack_${i}`).css("bottom", attack_bottom + 'px');
            if (attack_bottom < map_min_height) {
                $(`#hero_attack_${i}`).remove();
                hero_attack[i] = -1;
            }
            break;
        }

        for (let monster of monster_list) {

            let attack_width = parseFloat($(`#hero_attack_${i}`).css("width"));
            let attack_height = parseFloat($(`#hero_attack_${i}`).css("height"));

            let hit_left = parseFloat($(`#hero_attack_${i}`).css("left")) + attack_width / 2;
            let hit_bottom = parseFloat($(`#hero_attack_${i}`).css("bottom")) + attack_height / 2;

            let monster_left = monster.left;
            let monster_right = monster.left + (monster.width);
            let monster_bottom = monster.bottom;
            let monster_up = monster.bottom + (monster.height);

            if (hit_left > monster_left - (attack_width / 2) && hit_left < monster_right + (attack_width / 2)) {
                if (hit_bottom > monster_bottom - (attack_height / 2) && hit_bottom < monster_up + (attack_height / 2)) {
                    monster.hitStun = true;
                    setTimeout(()=>{
                        monster.hitStun = false;
                    }
                    , 300);
                    $(`#hero_attack_${i}`).remove();
                    hero_attack[i] = -1;

                    if (monster.hitCheck != null)
                        monster.hitCheck();

                    //이 부분 나중에 따로 Bat.underattack 함수 따로 만들어야할 듯. 공격받았을 때.

                }
            }
        }
        if (monster_list.length <= 0) {
            $("#field").fadeOut(2000, "swing", ()=>{
                hero.teleport(921, 210);
                hero.left = 921;
                hero.bottom = 210;
                hero.MovePNG("forward");
                $("#field").fadeIn(2000, "swing", ()=>{
                    nextStage();
                    setTimeout(()=>{
                        stagemove = false;
                    }
                    , 1000);
                }
                );
            }
            );
        }
    }

}

function nextStage() {
    if (!stagemove)
        stage[++now_stage]();
    stagemove = true;
}

/*


                        $(`#${monster.id}`).fadeOut(500, "swing", ()=>{
 
                        });
                        */

function keydownFunc() {
    if (keydownMap[96]) {
        hero_list[0].attack();
    }

    if (keydownMap[37]) {
        // 왼쪽 방향키
        var left = parseFloat($("#character_0").css("left"));
        if (left < map_min_width)
            return;
        hero_list[0].move_left(left);
    }
    if (keydownMap[39]) {
        // 오른쪽 방향키
        var left = parseFloat($("#character_0").css("left"));
        if (left + hero_width > map_max_width)
            return;
        hero_list[0].move_right(left);
    }
    if (keydownMap[38]) {
        // 위쪽 방향키	
        var bottom = parseFloat($("#character_0").css("bottom"));
        if (bottom + hero_height - 20 > map_max_height)
            // hp bar height 때문에 20 빼줌
            return;
        hero_list[0].move_forward(bottom);
    }
    if (keydownMap[40]) {
        // 아래쪽 방향키
        var bottom = parseFloat($("#character_0").css("bottom"));
        if (bottom < map_min_height)
            return;
        hero_list[0].move_back(bottom);
    }

    var dir = '';

    switch (hero_list[0].arrow) {
    case 37:
        dir = 'left';
        break;
    case 39:
        dir = 'right';
        break;
    case 38:
        dir = 'forward';
        break;
    case 40:
        dir = 'back';
        break;
    }
    hero_list[0].MovePNG(dir);
}

/* 키보드 키다운 이벤트 */
function move_cursor_from_to() {
    $(document).on("keydown", move_cursor);
    $(document).on("keyup", stand);
    function move_cursor(e) {
        if (walkthrough)
            return;

        switch (e.keyCode) {

        case 96:
            // 'a'
            keydownMap[96] = true;
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

        case 13:
            // 엔터
            if (!isGameStart)
                play(select_var);
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

        for (hero of hero_list)
            hero.walkThrough();

        /* stage */

        Stage_1();
    }
}
/* 타이틀에서 선택된 인덱스 */

/* 몬스터 객체 */
function Monster(left, bottom) {
    this.left = left;
    this.bottom = bottom;
}
// 모든 몬스터의 프로토타입

Monster.crashAttackSpeed = 5;
// 모든 몬스터는 5초마다 한 번씩 crash 데미지를 줄 수 있다.
Monster.crashAttackDamage = 20;
// 모든 몬스터의 crash 데미지는 20이다.

Monster.prototype.move = function() {
    // 0~5 사이 0~1 1~2 ,2~3 ,3~4, 4~5
    let moving = Math.floor(Math.random()) * 5;
    if (moving < 1) {
        // 왼쪽 이동
        $(".monster").css("left", `${this.left - 0.2}%`);
    } else if (moving < 2) {}
}
;

function Gunner(left, bottom) {

    $(".monster").css("left", `${screen_width * (left / 100)}px`);
    $(".monster").css("bottom", `${bottom}%`);

    this.left = $(".monster").css("left");
    this.bottom = $(".monster").css("bottom");

}
// 특수공격으로 중간 데미지의, 중간 속도의, 작은 공격범위의 총을 쏘는 거너 몬스터.

Gunner.prototype.move_velocity = 10;
Gunner.prototype.hp = 200;
Gunner.prototype.specialDamage = 20;
Gunner.prototype.specialAttack = function() {// Gunner 몬스터의 특수 공격
}
;

function Bomber(left, bottom) {

    $(".monster").css("left", `${screen_width * (left / 100)}px`);
    $(".monster").css("bottom", `${bottom}%`);

    this.left = left;
    this.bottom = bottom;
}
// 특수공격으로 강력한 데미지의, 느린 속도의, 넓은 공격범위의 폭탄을 던지는 봄버 몬스터

Bomber.prototype.move_velocity = 5;
Bomber.prototype.hp = 100;
Bomber.prototype.specialDamage = 40;
Bomber.prototype.specialAttack = function() {}
;

function Bat(left, bottom, type) {
    this.url;

    //redBat

    this.movingRate = 500 - Math.floor(Math.random() * 200);
    this.movingSpeed = 5;
    // 5
    this.hit = 0;
    this.hitStun = false;

    this.hitPositiveField = 30;
    this.hitNegativeField = -30;
    this.knockback = 50;

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
        $("#field").append($(`<div id = monster_${monster_list.length} class='monster bat'></div>`));

    } else if (type == 1) {
        this.url = `url('../MAIN/img/monster/tutorial/move/yons_`;
        $("#field").append($(`<div id = monster_${monster_list.length} class='monster bat'></div>`));
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
    console.log('a');
    if (this.type == 2) {
        new Bat(70 - Math.floor(Math.random() * 40),70 - Math.floor(Math.random() * 40),this.hit);
    }
}

Bat.prototype.hitCheck = function(idx) {
    if (this.type != 2)
        this.hit = this.hit + 1;
    else if (this.type == 2) {
        this.hp = this.hp - hero_list[idx].damage;
        $("#boss_remain").css("width", this.hp + 'px');
        this.specialAttack();
    }
    if (this.hit == 1 && this.type == 1)
        this.movingSpeed = 10;
    // 박쥐가 한 대 맞으면 속도 업

    if (this.hp <= 1260 / 2) {
        this.hit = 1;
        this.movingSpeed = 10;
    }

    if (this.hit == 2 || this.hp <= 0) {
        isHit = this.idx;
        $(`#monster_${isHit}`).attr("id", `monster-${isHit}`);
        monster_list.splice(isHit, 1);

        for (let i = isHit; i < monster_list.length; i++) {
            monster_list[i].idx--;
            $(`#${monster_list[i].id}`).attr("id", `monster_${monster_list[i].idx}`);
            monster_list[i].id = 'monster_' + monster_list[i].idx;
        }
        console.log('isHit: ', isHit);

        $(`#monster-${isHit}`).fadeOut(500, "swing", ()=>{
            $(`#monster-${isHit}`).remove();
        }
        );
        console.log('killed monster idx : ', this.idx);
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

Bat.prototype.move = function() {
    // 0~5 사이 0~1 1~2 ,2~3 ,3~4, 4~5
    if (walkthrough || stagemove)
        return;
    this.movingRate = 300 - Math.floor(Math.random() * 250);

    if (this.hitStun)
        return;
    //2 ,4 ,6 ,8
    if (this.moving < 2) {
        if (this.left <= map_min_width) {
            this.left = map_min_width;
        } else if (this.left > map_min_width)
            this.left = this.left - this.movingSpeed;
        $(`#${this.id}`).css("left", `${this.left}px`);

    } else if (this.moving < 4) {
        if (this.left + this.width >= map_max_width)
            this.left = map_max_width - this.width;
        else if (this.left + this.width < map_max_width)
            this.left = this.left + this.movingSpeed;
        $(`#${this.id}`).css("left", `${this.left}px`);

    } else if (this.moving < 6) {
        // 2 , 3 , 4
        if (this.bottom <= map_min_height)
            this.bottom = map_min_height;
        else if (this.bottom > map_min_height)
            this.bottom = this.bottom - this.movingSpeed;
        $(`#${this.id}`).css("bottom", `${this.bottom}px`);

    } else if (this.moving < 8) {
        // 5 , 6 , 7 
        if (this.bottom + (this.height) >= map_max_height)
            this.bottom = map_max_height - (this.height);
        else if (this.bottom + (this.height) < map_max_height)
            this.bottom = this.bottom + this.movingSpeed;
        $(`#${this.id}`).css("bottom", `${this.bottom}px`);
    }
    for (hero of hero_list) {

        if (hero.hitsafe)
            return;

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
            hero.hitsafe = true;
            setTimeout(()=>{
                hero.hitsafe = false;
            }
            , hero.hitsafeTime);
            hero.hp = hero.hp - this.specialDamage;
            hero.hpBar();

        }

        if (hero.hp <= 0) {
            $("#character").fadeOut(2000, "swing", ()=>{
                $("#character").remove();
            }
            );
        }
    }

    /*


        if (monster_left - hero_right < hit_range && monster_left - hero_right > hit_range - monster.width) { // hit_range는 어느정도 범위 내애 들어오면 맞게끔 하는 상수.
            // 왼쪽에서 충돌
            if (hero_height_center > monster_bottom - (hero_height / 2) && hero_height_center < monster_up + (hero_height / 2)) {
                $("#character").css("left", hero.left - Math.min(hero_left - map_min_width, this.knockback));
                hero.left = hero.left - Math.min(hero.left - map_min_width, this.knockback);
                hero.hitsafe = true;
                setTimeout(()=>{
                    hero.hitsafe = false;
                }
                , hero.hitsafeTime);
                hero.hp = hero.hp - this.specialDamage;
                hero.hpBar();
            }
        }
        else if (hero_left - monster_right < hit_range && hero_left - monster_right > hit_range - monster.width) {
            // 오른쪽
            if (hero_height_center > monster_bottom - (hero_height / 2) && hero_height_center < monster_up + (hero_height / 2)) {
                $("#character").css("left", hero.left + Math.min(map_max_width - hero_right, this.knockback));
                hero.left = hero.left + Math.min(map_max_width - hero.left, this.knockback);
                hero.hitsafe = true;
                setTimeout(()=>{
                    hero.hitsafe = false;
                }
                , hero.hitsafeTime);
                hero.hp = hero.hp - this.specialDamage;
                hero.hpBar();
            }
        }
        else if (monster_bottom - hero_up <hit_range && monster_bottom - hero_up > hit_range - monster.height) {
            // 아래쪽
            console.log('bottom');
            if (hero_width_center > monster_left - (hero_width / 2) && hero_width_center < monster_right + (hero_width / 2)) {
                $("#character").css("bottom", hero_bottom - Math.min(hero_bottom - map_min_height, this.knockback));
                hero.bottom = hero_bottom - Math.min(hero_bottom - map_min_height, this.knockback);
                hero.hitsafe = true;
                setTimeout(()=>{
                    hero.hitsafe = false;
                }
                , hero.hitsafeTime);
                hero.hp = hero.hp - this.specialDamage;
                hero.hpBar();
            }
        }
        else if (hero_bottom - monster_up < hit_range && hero_bottom - monster_up > hit_range - monster.height) {
            // 위쪽
            console.log('up');
            if (hero_width_center > monster_left - (hero_width / 2) && hero_width_center < monster_right + (hero_width / 2)) {
                $("#character").css("bottom", hero_bottom + Math.min(map_max_height - hero_up, this.knockback));
                hero.bottom = hero.bottom + Math.min(map_max_height - hero_up, this.knockback);
                hero.hitsafe = true;
                setTimeout(()=>{
                    hero.hitsafe = false;
                }
                , hero.hitsafeTime);
                hero.hp = hero.hp - this.specialDamage;
                hero.hpBar();
            }
        }
 */

}
;

Bat.prototype.move_velocity = 3;
Bat.prototype.hp = 1260;
Bat.prototype.specialDamage = 10;

Bat.__proto__ = Monster;
Gunner.__proto__ = Monster;
Bomber.__proto__ = Monster;
Bat.__proto__ = Monster;
/* 몬스터 객체 */

/* 캐릭터 객체 */
function Hero(gravity, move_velocity, jump_velocity, hp, damage, attackSpeed, left, bottom) {
    this.gravity = gravity;
    this.move_velocity = move_velocity;
    this.jump_velocity = jump_velocity;
    this.damage = damage;
    this.attackSpeed = attackSpeed;

    this.motionNum = 1;

    this.hitsafe = false;
    this.hitsafeTime = 1000;
    this.idx = hero_list.length;

    $("#field").append($(`<div id=character_${hero_list.length} class=character><div class=char_hp><div id=hp_${this.idx}></div></div></div>`));

    this.left = screen_width * (left / 100);
    this.bottom = screen_height * (bottom / 100);
    this.arrow = 38;

    $(`#character_${this.idx}`).css("left", `${this.left}px`);
    $(`#character_${this.idx}`).css("bottom", `${this.bottom}px`);

    hero_list.push(this);

    this.hp = hp;
    $(`#hp_${this.idx}`).css("width", hp + '%');
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
}

Hero.prototype.teleport = function(left, bottom) {
    $(`#character_${this.idx}`).css("left", left + 'px');
    $(`#character_${this.idx}`).css("bottom", bottom + 'px');
}

Hero.prototype.MovePNG = function(where) {
    this.motionNum = (++this.motionNum) % 40;
    var motionNum;
    if (this.motionNum > 30)
        motionNum = 3;
    else if (this.motionNum > 20)
        motionNum = 2;
    else if (this.motionNum > 10)
        motionNum = 1;
    else if (this.motionNum >= 0)
        motionNum = 0;

    url = `url('../MAIN/img/character/kyo/move/move_${where}${motionNum}.png')`;

    $(`#character_${this.idx}`).css("background-image", url);
}

Hero.prototype.hpBar = function() {
    $(`#hp_${this.idx}`).css("width", this.hp + '%');
}

Hero.prototype.crashed = function() {
    console.log(Monster.crashAttackDamage, Monster.crashAttackSpeed);
}
;

Hero.prototype.move_left = function(left) {
    left = left - this.move_velocity;
    $(`#character_${this.idx}`).css("left", left + "px");

    this.left = left;
}

Hero.prototype.move_right = function(left) {
    left = left + this.move_velocity;
    $(`#character_${this.idx}`).css("left", left + "px");

    this.left = left;
}

Hero.prototype.move_forward = function(bottom) {
    bottom = bottom + this.move_velocity;
    $(`#character_${this.idx}`).css("bottom", bottom + "px");

    this.bottom = bottom;
}
Hero.prototype.move_back = function(bottom) {
    bottom = bottom - this.move_velocity;
    $(`#character_${this.idx}`).css("bottom", bottom + "px");

    this.bottom = bottom;
}

Hero.prototype.attack = function() {
    //37: 왼쪽 / 39 : 오른쪽 / 38 : 위쪽 / 40 : 아래쪽

    keydownMap[96] = false;
    if (isAttacking)
        return;
    //if(!isAttacking) return;
    var mst_x = monster_list[0].left;
    var mst_y = monster_list[0].bottom;

    var attack_x = parseFloat(mst_x) - parseFloat(this.left);
    var attack_y = parseFloat(mst_y) - parseFloat(this.bottom);

    var attack_html = $(`<div value = ${this.arrow} id = 'hero_attack_${attackCnt}' class = 'char_attack char_attack_${this.arrow}' style='left: ${this.left}px; bottom: ${this.bottom}px;'></div>`);

    hero_attack.push(attackCnt++);
    $("#field").append(attack_html);

    isAttacking = true;

    const attack_limit = setTimeout(()=>{
        isAttacking = false;
        clearTimeout(attack_limit);
    }
    , attackRate);
}

Hero.prototype.walkThrough = function() {
    // 게임 시작되어서 걸어나오는 모션
    walkthrough = true;
    keydownMap[38] = true;

    setTimeout(()=>{
        keydownMap[38] = false;
        walkthrough = false;
    }
    , 800);

}
Hero.prototype.attackSpeedUp = function() {
    attackRate = attackRate / 2;
}// hero_attack_0

//var attack_html = $(`<div id = 'hero_attack_${hero_attack.length - 1}' class = 'char_attack' style='left: ${hero_moment["left"]}%; bottom: ${hero_moment["bottom"]}%  '></div> `);

/* 캐릭터 객체 */

/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/*
	
	 var runDirection = 0;
    var upDown = 1;
	Hero.prototype.jump = function(bottom){

        if(!isJumping){
			var jump = setTimeout(() => {
				upDown = -1;
				clearTimeout(jump);
			}, this.gravity);
			isJumping = true;
        }

        
        bottom = bottom + (upDown * this.jump_velocity);
        $("#character").css("bottom", bottom+"px");
	

        if(bottom == 140.547){
			keydownMap[32] = false;
			isJumping = false;				
			upDown = 1;
	    }

	}

	Hero.prototype.crossJump = function(bottom, left, rightOrLeft){		
        if(!isCrossJumping){
			var jump = setTimeout(() => {
				upDown = -1;
				clearTimeout(jump);
			}, this.gravity);
			isCrossJumping = true;
        }

        if(keydownMap[38+runDirection] && map_min_width < left && map_max_width > left){
        	left = left + (rightOrLeft * this.move_velocity);
		    $("#character").css("left", left+"px");
        }

        bottom = bottom + (upDown * this.jump_velocity);
        $("#character").css("bottom", bottom+"px");	

        if(bottom == 140.547){
			keydownMap[32] = false;
			isCrossJumping = false;				
			upDown = 1;
            $("#character").css("background-image", `url('../MAIN/img/character/move/stand.png')`);
	    }
	}
	*/

/*
			if(keydownMap[37] && keydownMap[32]){ // 왼쪽 방향키에 이어서 점프 키 = 왼쪽 대각선 점프
				// 바닥에 있는지 체크 
				//왼쪽 대각선 점프
				var bottom = parseFloat($("#character").css("bottom"));
				var left = parseFloat($("#character").css("left"));
                runDirection = -1;
			    hero.crossJump(bottom, left, runDirection);
                
			} else if(keydownMap[39] && keydownMap[32]){  // 오른쪽 방향키에 이어서 점프 키 = 오른쪽 대각선 점프
				// 바닥에 있는지 체크 
				//오른쪽 대각선 점프
                var bottom = parseFloat($("#character").css("bottom"));
				var left = parseFloat($("#character").css("left"));
                runDirection = 1;
				hero.crossJump(bottom, left, runDirection);
			}
			 else if(keydownMap[32] && !isCrossJumping){ // Space Bar
				if(!isGameStart) return;
				var bottom = parseFloat($("#character").css("bottom"));
            
				// 점프


                // 바닥에 있는지 체크
				hero.jump(bottom); 

			else if(isCrossJumping){
                var bottom = parseFloat($("#character").css("bottom"));
				var left = parseFloat($("#character").css("left"));
				hero.crossJump(bottom, left, runDirection);
			}
        */

/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */
/* 캐릭터 점프 */

/* 브라우저 창 사이즈 변화를 감지하고, 전체 사이즈를 리사이즈 합니다. */
(function(win, $) {

    $(win).on("resize", function() {
        var w_height = $(win).height();
        $("body").css("height", w_height);
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
