class BrowserManager {
  constructor() {}

  selectTitle() {
    new Title().selectTitle();
  }

  init() {
    (function (win, $) {
      $(win).on("resize", function () {
        console.log("this width", $(window).height());
        const w_height = $(win).height();
        $("body").css("height", w_height);
        $("#field").css("height", w_height * 0.6 - 2 * 7 + "px");
        $("#item_select").css("height", w_height * 0.6 - 2 * 7 + "px");
        const paddingHeight =
          (parseFloat($("body").css("height")) -
            parseFloat($("#field").css("height")) -
            2 * parseFloat($("#field").css("border-width"))) /
          2;
        console.log(paddingHeight);
        $(`.padding`).each(function () {
          $(this).css("height", paddingHeight);
        });
      });
      $(function () {
        $(win).trigger("resize");
      });
    })(window, jQuery);
  }

  static screen() {
    return {
      width: $(window).width(),
      height: $(window).height(),
    };
  }
}

class GameManager {
  #howManyPlayer = 0;

  #mapInfo = new StageMap().info;
  get mapInfo() {
    return this.#mapInfo;
  }

  #STAGE = new Stage();

  #HEROMANAGER = new HeroManager();
  #MONSTERMANAGER = new MonsterManager();

  #MONSTERLIST = [];

  #COMMONOBSTACLE = new Obstacle();
  get common() {
    return this.#COMMONOBSTACLE;
  }
  #HEROOBSTACLE = new Obstacle();
  #MONSTEROBSTACLE = new Obstacle();
  #OBSTACLENAME = [];

  #FPS = 17;

  constructor(howManyPlayer) {
    this.#howManyPlayer = howManyPlayer;
    console.log(this.#mapInfo);
  }

  setUpTheGame() {
    this.fieldFadeIn();

    this.loop = setInterval(this.loopWhileGameIsExecuting, this.#FPS);

    const BORDER = 7;
    this.#COMMONOBSTACLE.addObstaclePartialSide(
      "leftWall",
      this.#mapInfo.MAPMINWIDTH,
      this.#mapInfo.MAPMINWIDTH + BORDER,
      this.#mapInfo.MAPMINHEIGHT,
      this.#mapInfo.MAPMAXHEIGHT,
      "left"
    );
    this.#COMMONOBSTACLE.addObstaclePartialSide(
      "rightWall",
      this.#mapInfo.MAPMAXWIDTH,
      this.#mapInfo.MAPMAXWIDTH + BORDER,
      this.#mapInfo.MAPMINHEIGHT,
      this.#mapInfo.MAPMAXHEIGHT,
      "right"
    );
    this.#COMMONOBSTACLE.addObstaclePartialSide(
      "bottomWall",
      this.#mapInfo.MAPMINWIDTH,
      this.#mapInfo.MAPMAXWIDTH,
      this.#mapInfo.MAPMINHEIGHT,
      this.#mapInfo.MAPMINHEIGHT + BORDER,
      "bottom"
    );
    this.#COMMONOBSTACLE.addObstaclePartialSide(
      "upWall",
      this.#mapInfo.MAPMINWIDTH,
      this.#mapInfo.MAPMAXWIDTH,
      this.#mapInfo.MAPMAXHEIGHT,
      this.#mapInfo.MAPMAXHEIGHT + BORDER,
      "up"
    );

    for (let i = this.#howManyPlayer; i > 0; i--) {
      $("#itemDownPadding").append(
        $(`<div id='item_description_${i}' class='item_description'></div>`)
      );
    }

    const ADJUST = 2 - this.#howManyPlayer;
    this.#HEROMANAGER.push(
      new Dealer(
        {
          left: 60 - 10 * ADJUST,
          bottom: /* bottom = */ 60,
          damage: /* damage = */ 200 + 2 * ADJUST,
          attackSpeed: /* attackSpeed = */ 1000 - 200 * ADJUST,
          attackRange: /* attackRange = */ 150, // + 50 * ADJUST,
          movingSpeed: /* movingSpeed = */ 6 + 0.5 * ADJUST,
          maxhp: /* maxhp = */ 100 + 50 * ADJUST,
          whichPlayer: /* whichPlayer = */ Hero.numberOfHero++,
          whichMotion: /* whichMotion = */ 0,
          whichDirectionDoesHeGo: /* whichDirectionDoesHeGo */ 38,
          key: {
            left: 37,
            right: 39,
            bottom: 40,
            up: 38,
            attack: 188,
            dash: 190,
            specialAttack: 191,
          },
        }
        //this.#MONSTEROBSTACLE,
      )
    );

    if (this.#howManyPlayer < 2) return;

    this.#HEROMANAGER.push(
      new Beginner({
        left: 40,
        bottom: /* bottom = */ 60,
        damage: /* damage = */ 200,
        attackSpeed: /* attackSpeed = */ 1000,
        attackRange: /* attackRange = */ 150,
        movingSpeed: /* movingSpeed = */ 60,
        maxhp: /* maxhp = */ 100,
        whichPlayer: /* whichPlayer = */ Hero.numberOfHero++,
        whichMotion: /* whichMotion = */ 0,
        whichDirectionDoesHeGo: /* whichDirectionDoesHeGo */ 38,
        key: {
          left: 68,
          right: 71,
          bottom: 70,
          up: 82,
          attack: 192,
          dash: 49,
          specialAttack: 50,
        },
      })
    );
  }

  loopWhileTrophyShop = () => {
    if (this.#HEROMANAGER.isCompletedSelectTrophy()) {
      this.goToTheNextLevel();
    }
  };

  trophyOrNextStage() {
    this.#HEROMANAGER.selectTrophyEachHero(this.#STAGE.nowstage);
    this.loop = setInterval(this.loopWhileTrophyShop, this.#FPS);
  }

  loopWhileGameIsExecuting = () => {
    this.#HEROMANAGER.heroMoveAnimation();
    this.#HEROMANAGER.heroProjectionMove(
      this.#MONSTERMANAGER.MONSTERLIST,
      this.#COMMONOBSTACLE,
      this.#HEROOBSTACLE
    );
    this.#HEROMANAGER.heroMove(this.#COMMONOBSTACLE, this.#HEROOBSTACLE);
    this.#HEROMANAGER.heroAttack(
      this.#MONSTERMANAGER.MONSTERLIST,
      this.#MONSTEROBSTACLE
    );

    this.#HEROMANAGER.heroDeathCheck();

    this.#MONSTERMANAGER.monsterMoveAnimation();
    this.#MONSTERMANAGER.monsterSpecialAttack(
      this.#HEROMANAGER.HEROLIST,
      this.#MONSTERMANAGER.MONSTERLIST,
      this.#COMMONOBSTACLE,
      this.#MONSTEROBSTACLE
    );
    this.#MONSTERMANAGER.monsterWalkAround(
      this.#COMMONOBSTACLE,
      this.#MONSTEROBSTACLE
    );
    this.#MONSTERMANAGER.monsterDoIAttack(this.#HEROMANAGER.HEROLIST);
    this.#MONSTERMANAGER.monsterDead();

    this.#HEROMANAGER.isGameover();

    /*
         for(let idx = 0; idx<this.#MONSTERLIST.length; idx++){
                this.#MONSTERLIST[idx].moveAnimation();
                //let attackOrMove = (this.#MONSTERLIST[idx]?.dashCheck(this.#HEROMANAGER.HEROLIST)) ?? false;
                if(this.#MONSTERLIST[idx].skillCoolTime && (this.#MONSTERLIST[idx].isSpecialAttacking)){
                   this.#MONSTERLIST[idx].specialAttack(this.#HEROMANAGER.HEROLIST, this.#COMMONOBSTACLE, this.#MONSTEROBSTACLE); 
                }
                //else if(!this.#MONSTERLIST[idx].skillCoolTime || !attackOrMove)
                this.#MONSTERLIST[idx].walkAround(this.#COMMONOBSTACLE, this.#MONSTEROBSTACLE); 
                

             this.#MONSTERLIST[idx].doIattack(this.#HEROMANAGER.HEROLIST);
            
             if(this.#MONSTERLIST[idx].dead()){
                    this.#MONSTERLIST[idx].deadOut();
                    this.#MONSTERLIST.splice(idx,1);
                    idx--;
                }
         }

         */

    this.canIGoToTheNextLevel();
  };

  canIGoToTheNextLevel = () => {
    if (this.#MONSTERMANAGER.DidWholeMonsterDie()) {
      this.#HEROMANAGER.revive();

      $("#field").fadeOut(1000, "swing");
      this.drawItemSelectPage();
      clearInterval(this.loop);
      this.trophyOrNextStage();

      this.#HEROMANAGER.removeAllProjection();
    }
  };

  goToTheNextLevel = () => {
    clearInterval(this.loop);

    $("#item_select").fadeOut(1000, "swing", () => {
      $("#field").fadeIn(1000, "swing", () => {});
    });

    this.#MONSTERMANAGER.pushArray(this.#STAGE.nextStage());

    // this.#MONSTERLIST = this.#STAGE.nextStage(); // 다음 스테이지 시작

    let stageStartDelay = setTimeout(() => {
      this.loop = setInterval(this.loopWhileGameIsExecuting, this.#FPS);
      clearTimeout(stageStartDelay);
    }, 2000);

    this.#HEROMANAGER.addEventOnStage();

    this.#HEROMANAGER.stageStartTeleport();
  };

  fieldFadeIn() {
    $(`#title`).addClass(`invisible`);
    //$(`#field`).removeClass(`invisible`);
    $(`.sidebar`).each(function () {
      $(this).removeClass(`invisible`);
    });

    $(`#field_wrapper`).removeClass(`invisible`);

    $(`#land`).fadeIn(2000, "swing");
  }

  drawItemSelectPage = () => {
    $("#field").fadeOut(1000, "swing", () => {
      $("#item_select").fadeIn(1000, "swing");
    });
  };
}
