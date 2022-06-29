class Dealer extends Hero {
  #char = "dealer";

  #projection = {
    left: [],
    right: [],
    bottom: [],
    up: [],
  };

  constructor(arg) {
    super(arg, "dealer");
    this.attackCoolTime = 500;
    $(`#gauge_${this.whichPlayer}`).removeClass("invisible");
    this.attackGauge = 0;
    this.maxGauge = 100;
    this.num = 0;
    this.isAttacking = false;
    this.attacking.range = 1000;

    this.eventList.KeyupAttack.dispose();
    this.eventList.KeyupAttack = new EventListener({
      event: "keyup",
      callback: (e) => {
        if (e.keyCode === this.key["attack"]) {
          this.keydownMap[e.keyCode] = false;
          this.KeyupAttack(this.MONSTEROBSTACLE);
        }
      },
    });
    this.eventList.KeyupAttack.add();
  }

  attack = () => {
    if (this.isAttacking) {
      return;
    }

    this.attacking.bool = true;

    this.attackGauge = Math.min(this.attackGauge + 3, 100);
    let gauge = (this.attackGauge / this.maxGauge) * 100;
    if (gauge >= 100) {
      $(`#charging_${this.whichPlayer}`).css("background-color", "#f7be3a");
      gauge = 100;
    } else if (gauge >= 50) {
      $(`#charging_${this.whichPlayer}`).css("background-color", "#08ec87");
    }

    $(`#charging_${this.whichPlayer}`).css("width", gauge + "%");
  };

  KeyupAttack = () => {
    if (this.isAttacking) {
      return;
    }
    this.isAttacking = true;
    let attackCoolTime = setTimeout(() => {
      this.isAttacking = false;
      clearTimeout(attackCoolTime);
    }, 600);

    this.attacking.bool = false;
    $(`#charging_${this.whichPlayer}`).css("width", "0%");
    $(`#charging_${this.whichPlayer}`).css("background-color", "#00BCD4");

    const width = 48;
    const height = 48;
    const damageRate = 1.5;
    let rushSpeed = 10;
    let where;

    //width, height, left, bottom, whichPlayer, arrow, idx, degree, rushSpeed, attackRange, damage,
    //일직선 방향 투사체 생성
    switch (this.whichDirectionDoesHeGo) {
      case 37:
      case 68:
        where = "Left";
        this.#projection.left.push(
          new Projection({
            width: width,
            height: height,
            left: this.coordinates.x - width,
            bottom: this.coordinates.y - height / 2,
            whichPlayer: this.whichPlayer,
            arrow: where,
            id: `heroAttack`,
            idx: "left_" + this.num++,
            _class: `dealerAttack dealerAttack${where}`,
            degree: 0,
            rushSpeed: { left: -rushSpeed, bottom: 0 },
            attackRange: this.attacking.range,
            damage: this.attacking.damage / damageRate,
          })
        );

        break;
      case 39:
      case 71:
        where = "Right";
        this.#projection.right.push(
          new Projection({
            width: width,
            height: height,
            left: this.quarter.right,
            bottom: this.coordinates.y - height / 2,
            whichPlayer: this.whichPlayer,
            arrow: where,
            id: `heroAttack`,
            idx: "right_" + this.num++,
            _class: `dealerAttack dealerAttack${where}`,
            degree: 0,
            rushSpeed: { left: rushSpeed, bottom: 0 },
            attackRange: this.attacking.range,
            damage: this.attacking.damage / damageRate,
          })
        );

        break;
      case 38:
      case 82:
        where = "Forward";
        this.#projection.up.push(
          new Projection({
            width: width,
            height: height,
            left: this.coordinates.x - width / 2,
            bottom: this.quarter.up,
            whichPlayer: this.whichPlayer,
            arrow: where,
            id: `heroAttack`,
            idx: "forward_" + this.num++,
            _class: `dealerAttack dealerAttack${where}`,
            degree: 0,
            rushSpeed: { left: 0, bottom: rushSpeed },
            attackRange: this.attacking.range,
            damage: this.attacking.damage / damageRate,
          })
        );
        break;
      case 40:
      case 70:
        where = "Down";
        this.#projection.bottom.push(
          new Projection({
            width: width,
            height: height,
            left: this.coordinates.x - width / 2,
            bottom: this.quarter.bottom - height,
            whichPlayer: this.whichPlayer,
            arrow: where,
            id: `heroAttack`,
            idx: "down_" + this.num++,
            _class: `dealerAttack dealerAttack${where}`,
            degree: 0,
            rushSpeed: { left: 0, bottom: -rushSpeed },
            attackRange: this.attacking.range,
            damage: this.attacking.damage / damageRate,
          })
        );
        break;
    }

    //각도가 주어진 투사체 생성
    for (let i = 0; i < Math.floor(this.attackGauge / 50) + 1; i++) {
      // 3개, 5개, 7개 생성 -> 3개 : 총 1.5 + 1.5 / 5개 :  / 7개 :
      switch (this.whichDirectionDoesHeGo) {
        case 37:
        case 68:
          where = "Left";
          this.#projection.left.push(
            new Projection({
              width: width,
              height: height,
              left: this.coordinates.x - width,
              bottom: this.coordinates.y - height / 2 + 10 * (i + 1),
              whichPlayer: this.whichPlayer,
              arrow: where,
              id: `heroAttack`,
              idx: "left_" + this.num++,
              _class: `dealerAttack dealerAttack${where}`,
              degree: rushSpeed * (i + 1),
              rushSpeed: {
                left:
                  -rushSpeed * Math.cos((rushSpeed * (i + 1) * Math.PI) / 180),
                bottom:
                  rushSpeed * Math.sin((rushSpeed * (i + 1) * Math.PI) / 180),
              },
              attackRange: this.attacking.range,
              damage: this.attacking.damage / damageRate,
            })
          );

          this.#projection.left.push(
            new Projection({
              width: width,
              height: height,
              left: this.coordinates.x - width,
              bottom: this.coordinates.y - height / 2 - 10 * (i + 1),
              whichPlayer: this.whichPlayer,
              arrow: where,
              id: `heroAttack`,
              idx: "left_" + this.num++,
              _class: `dealerAttack dealerAttack${where}`,
              degree: -rushSpeed * (i + 1),
              rushSpeed: {
                left:
                  -rushSpeed * Math.cos((-rushSpeed * (i + 1) * Math.PI) / 180),
                bottom:
                  rushSpeed * Math.sin((-rushSpeed * (i + 1) * Math.PI) / 180),
              },
              attackRange: this.attacking.range,
              damage: this.attacking.damage / damageRate,
            })
          );
          break;
        case 39:
        case 71:
          where = "Right";

          this.#projection.right.push(
            new Projection({
              width: width,
              height: height,
              left: this.quarter.right,
              bottom: this.coordinates.y - height / 2 + 10 * (i + 1),
              whichPlayer: this.whichPlayer,
              arrow: where,
              id: `heroAttack`,
              idx: "right_" + this.num++,
              _class: `dealerAttack dealerAttack${where}`,
              degree: -rushSpeed * (i + 1),
              rushSpeed: {
                left:
                  rushSpeed * Math.cos((-rushSpeed * (i + 1) * Math.PI) / 180),
                bottom:
                  -rushSpeed * Math.sin((-rushSpeed * (i + 1) * Math.PI) / 180),
              },
              attackRange: this.attacking.range,
              damage: this.attacking.damage / damageRate,
            })
          );

          this.#projection.right.push(
            new Projection({
              width: width,
              height: height,
              left: this.quarter.right,
              bottom: this.coordinates.y - height / 2 - 10 * (i + 1),
              whichPlayer: this.whichPlayer,
              arrow: where,
              id: `heroAttack`,
              idx: "right_" + this.num++,
              _class: `dealerAttack dealerAttack${where}`,
              degree: rushSpeed * (i + 1),
              rushSpeed: {
                left:
                  rushSpeed * Math.cos((-rushSpeed * (i + 1) * Math.PI) / 180),
                bottom:
                  rushSpeed * Math.sin((-rushSpeed * (i + 1) * Math.PI) / 180),
              },
              attackRange: this.attacking.range,
              damage: this.attacking.damage / damageRate,
            })
          );

          break;
        case 38:
        case 82:
          where = "Forward";
          this.#projection.up.push(
            new Projection({
              width: width,
              height: height,
              left: this.coordinates.x - width / 2 + 10 * (i + 1),
              bottom: this.quarter.up,
              whichPlayer: this.whichPlayer,
              arrow: where,
              id: `heroAttack`,
              idx: "forward_" + this.num++,
              _class: `dealerAttack dealerAttack${where}`,
              degree: rushSpeed * (i + 1),
              rushSpeed: {
                left:
                  rushSpeed * Math.sin((rushSpeed * (i + 1) * Math.PI) / 180),
                bottom:
                  rushSpeed * Math.cos((rushSpeed * (i + 1) * Math.PI) / 180),
              },
              attackRange: this.attacking.range,
              damage: this.attacking.damage / damageRate,
            })
          );

          this.#projection.up.push(
            new Projection({
              width: width,
              height: height,
              left: this.coordinates.x - width / 2 - 10 * (i + 1),
              bottom: this.quarter.up,
              whichPlayer: this.whichPlayer,
              arrow: where,
              id: `heroAttack`,
              idx: "forward_" + this.num++,
              _class: `dealerAttack dealerAttack${where}`,
              degree: -rushSpeed * (i + 1),
              rushSpeed: {
                left:
                  rushSpeed * Math.sin((-rushSpeed * (i + 1) * Math.PI) / 180),
                bottom:
                  rushSpeed * Math.cos((-rushSpeed * (i + 1) * Math.PI) / 180),
              },
              attackRange: this.attacking.range,
              damage: this.attacking.damage / damageRate,
            })
          );

          break;
        case 40:
        case 70:
          where = "Down";
          this.#projection.bottom.push(
            new Projection({
              width: width,
              height: height,
              left: this.coordinates.x - width / 2 + 10 * (i + 1),
              bottom: this.quarter.bottom - height,
              whichPlayer: this.whichPlayer,
              arrow: where,
              id: `heroAttack`,
              idx: "down_" + this.num++,
              _class: `dealerAttack dealerAttack${where}`,
              degree: -rushSpeed * (i + 1),
              rushSpeed: {
                left:
                  rushSpeed * Math.sin((rushSpeed * (i + 1) * Math.PI) / 180),
                bottom:
                  -rushSpeed * Math.cos((rushSpeed * (i + 1) * Math.PI) / 180),
              },
              attackRange: this.attacking.range,
              damage: this.attacking.damage / damageRate,
            })
          );

          this.#projection.bottom.push(
            new Projection({
              width: width,
              height: height,
              left: this.coordinates.x - width / 2 - 10 * (i + 1),
              bottom: this.quarter.bottom - height,
              whichPlayer: this.whichPlayer,
              arrow: where,
              id: `heroAttack`,
              idx: "down_" + this.num++,
              _class: `dealerAttack dealerAttack${where}`,
              degree: rushSpeed * (i + 1),
              rushSpeed: {
                left:
                  rushSpeed * Math.sin((-rushSpeed * (i + 1) * Math.PI) / 180),
                bottom:
                  -rushSpeed * Math.cos((-rushSpeed * (i + 1) * Math.PI) / 180),
              },
              attackRange: this.attacking.range,
              damage: this.attacking.damage / damageRate,
            })
          );
          break;
      }
    }
    this.attackGauge = 0;
  };

  projectionMove = (MONSTERLIST, ...obstacle) => {
    for (let i = 0; i < this.#projection.left.length; i++) {
      if (this.#projection.left[i].move(MONSTERLIST, obstacle)) {
        this.#projection.left.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < this.#projection.right.length; i++) {
      if (this.#projection.right[i].move(MONSTERLIST, obstacle)) {
        this.#projection.right.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < this.#projection.up.length; i++) {
      if (this.#projection.up[i].move(MONSTERLIST, obstacle)) {
        this.#projection.up.splice(i, 1);
        i--;
      }
    }
    for (let i = 0; i < this.#projection.bottom.length; i++) {
      if (this.#projection.bottom[i].move(MONSTERLIST, obstacle)) {
        this.#projection.bottom.splice(i, 1);
        i--;
      }
    }
  };

  projectionClear = () => {
    for (let proj of this.#projection.left) {
      proj.remove();
    }
    this.#projection.left = [];

    for (let proj of this.#projection.right) {
      proj.remove();
    }
    this.#projection.right = [];

    for (let proj of this.#projection.up) {
      proj.remove();
    }
    this.#projection.up = [];

    for (let proj of this.#projection.bottom) {
      proj.remove();
    }
    this.#projection.bottom = [];
  };

  moveAnimation() {
    let where;
    switch (this.whichDirectionDoesHeGo) {
      case 37:
      case 68:
        where = "left";
        break;
      case 39:
      case 71:
        where = "right";
        break;
      case 38:
      case 82:
        where = "forward";
        break;
      case 40:
      case 70:
        where = "back";
        break;
    }

    this.whichMotion = ++this.whichMotion % 40;
    let motionNum;
    let url = `url('./img/character/${this.#char}/move`;

    if (this.attacking.bool) {
      if (this.whichMotion > 32) motionNum = 4;
      else if (this.whichMotion > 24) motionNum = 3;
      else if (this.whichMotion > 16) motionNum = 2;
      else if (this.whichMotion > 8) motionNum = 1;
      else if (this.whichMotion >= 0) motionNum = 0;

      url = url + `/attack_${where}${motionNum}.png')`;
    } else {
      if (this.whichMotion > 30) motionNum = 3;
      else if (this.whichMotion > 20) motionNum = 2;
      else if (this.whichMotion > 10) motionNum = 1;
      else if (this.whichMotion >= 0) motionNum = 0;

      url = url + `/move_${where}${motionNum}.png')`;
    }

    //$(`#character_${this.idx}`).css("background-image", url);
    $(`#char_figure_${this.whichPlayer}`).css("background-image", url);
  }
}
