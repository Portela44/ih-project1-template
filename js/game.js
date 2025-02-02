class Game{
  constructor(context) {
    this.ctx = context;
    this.knight = new Player(0, 480, 70, 118, 4, 100);
    this.vengefly = new Enemy(500, 180, 110, 100, 200, true);
    this.tiktik1 = new Enemy(390, 460, 85, 76, 150, false);
    this.tiktik2 = new Enemy(600, 460, 85, 76, 150, false);
    //ALERT! two enemies cannot have the same name.
    this.enemies = [
      this.vengefly,
      this.tiktik1,
      this.tiktik2
    ];
    
    this.healthArr = [];

    this.damageSound = new sound ("./sounds/damageSound.wav");
    this.attackSound = new sound ("./sounds/sword.wav");
    this.enemyHit = new sound ("./sounds/enemyHit.mp3");
    this.soundtrack = new sound ("./sounds/soundtrack.mp3");
    this.attacking = false;
  }

  _assignControls() {
    document.addEventListener('keydown', (event) => {
      switch (event.code) {
        case "ArrowLeft":
          this.knight.moveLeft();
          break;
        case "ArrowRight":
          this.knight.moveRight();
          break;
        case "Space":
          this.knight.jump();
          break;
        case "KeyW":
          this.makeAttack();
          break;          
        default:
          break;
      }
    });
  }

  drawKnight() {
    this.ctx.drawImage(this.knight.image, this.knight.x, this.knight.y, this.knight.width, this.knight.height);
  }

  drawEnemies() {
    this.enemies.forEach(enemy => {
      if(!enemy.inv) {
        enemy.image = enemiesImages[this.enemies.indexOf(enemy)][1];
      } else if (enemy.inv) {
        enemy.image = enemiesImages[this.enemies.indexOf(enemy)][0];
      }
      this.ctx.drawImage(enemy.image, enemy.x, enemy.y, enemy.width, enemy.height);
    });
  }

  
    
  _drawScenario() {
    this.ctx.drawImage(background, 0, 0, 1000, 600);
  }

  _drawHealth() {
    this.ctx.drawImage(lifeHUD, 10, 10, 120, 75);
    switch(this.knight.health) {
      case 1: 
        this.healthArr = [
        this.ctx.drawImage(lifeHit, 80, 20, 24, 30),
        ];
        break;
      case 2:
        this.healthArr = [
        this.ctx.drawImage(lifeHit, 80, 20, 24, 30),
        this.ctx.drawImage(lifeHit, 115, 20, 24, 30),
        ];
        break;
      case 3:
        this.healthArr = [
        this.ctx.drawImage(lifeHit, 80, 20, 24, 30),
        this.ctx.drawImage(lifeHit, 115, 20, 24, 30),
        this.ctx.drawImage(lifeHit, 150, 20, 24, 30),
        ];
        break;  
      case 4:
        this.healthArr = [
        this.ctx.drawImage(lifeHit, 80, 20, 24, 30),
        this.ctx.drawImage(lifeHit, 115, 20, 24, 30),
        this.ctx.drawImage(lifeHit, 150, 20, 24, 30),
        this.ctx.drawImage(lifeHit, 185, 20, 24, 30),
        ];
        break; 
      default:
      break;
    }
  }

  makeAttack() {
    //first we set attack cooldown
    if(this.knight.canAttack) {
      this.knight.canAttack = false;
      this.attackSound.play();
      this.attacking=true;
      setTimeout(() => this.knight.canAttack = true, 1000);
      setTimeout(() => this.attacking = false, 100);
      //then we proceed with proper attack action
      this.enemies.forEach(enemy => {
        if(this._checkAttackRange(enemy)) {
          enemy._getDamage(this.knight.strength)
          this.enemyHit.play();
        }
        if(enemy.health <= 0) {
          this.enemies.splice(this.enemies.indexOf(enemy), 1);
        }
      });
    }
  }

  _drawAttack() {
    if((this.attacking) && (this.knight.inv)) {
      this.ctx.drawImage(attackLeftEffect, this.knight.x - this.knight.width, this.knight.y, this.knight.width, this.knight.height);
    } else if ((this.attacking) && (!this.knight.inv)) {
      this.ctx.drawImage(attackRightEffect, this.knight.x + this.knight.width, this.knight.y, this.knight.width, this.knight.height);
    }
  }

  _checkAttackRange(enemy) {
    let enemyAtAttackRange = false;
    const knightsXMaxAttackRange = this.knight.x + this.knight.width + this.knight.attackRange;
    const knightsInvXMaxAttackRange = this.knight.x - this.knight.attackRange;
    // First we check if the knight is looking right or looking left.
    if(!this.knight.inv) {
      if((
        ((knightsXMaxAttackRange >= enemy.x) && (knightsXMaxAttackRange <= enemy.x + enemy.width)) 
      ) &&
      (
        ((this.knight.y >= enemy.y) && (this.knight.y <= enemy.y + enemy.height)) ||
        ((enemy.y >= this.knight.y) && (enemy.y <= this.knight.y + this.knight.height))
      )) 
      {
        enemyAtAttackRange = true;
      }
    } else if (this.knight.inv) {
      if((
        ((knightsInvXMaxAttackRange >= enemy.x) && (knightsInvXMaxAttackRange <= enemy.x + enemy.width)) 
      ) &&
      (
        ((this.knight.y >= enemy.y) && (this.knight.y <= enemy.y + enemy.height)) ||
        ((enemy.y >= this.knight.y) && (enemy.y <= this.knight.y + this.knight.height))
      )) 
      {
        enemyAtAttackRange = true;
      }
    }
    return enemyAtAttackRange;
  }

  _checkCollisions() {
    this.enemies.forEach((enemy) => {
      if((
        ((this.knight.x >= enemy.x) && (this.knight.x <= enemy.x + enemy.width)) ||
        ((this.knight.x >= enemy.x) && (this.knight.x <= enemy.x + enemy.width)) ||
        ((enemy.x >= this.knight.x) && (enemy.x <= this.knight.x + this.knight.width)) 
      ) &&
      (
        ((this.knight.y >= enemy.y) && (this.knight.y <= enemy.y + enemy.height)) ||
        ((this.knight.y >= enemy.y) && (this.knight.y <= enemy.y + enemy.height)) ||
        ((enemy.y >= this.knight.y) && (enemy.y <= this.knight.y + this.knight.height))
      )) 
      {
        this.knight._getDamage();
        this.damageSound.play();
        if (this.knight.health < 1) {
          this.gameOver();
        }
      }
    })
  }

  _checkFallDown() {
    if(this.knight.y > 600+this.knight.height) {
      this.gameOver();
    }
  }

  _checkWin() {
    if(this.knight.x > 980) {
      this.youWin();
    }
  }

  gameOver() {
    const losePage = document.getElementById("lose-page");
    losePage.style = "display: flex";
    const canvas = document.getElementById("canvas");
    canvas.style = "display: none";
    if(this.enemies.lenght !== 0) {
      this.enemies.pop();
    }
  }

  youWin() {
    const losePage = document.getElementById("win-page");
    losePage.style = "display: flex";
    const canvas = document.getElementById("canvas");
    canvas.style = "display: none";
  }

  _clean(){
    this.ctx.clearRect(0, 0, 1000, 600);
  }

  _update() {
    this._clean();
    this._drawScenario();
    this.drawKnight();
    this.drawEnemies();
    this._drawAttack();
    this._checkCollisions();
    this._checkFallDown();
    this._checkWin();
    this._drawHealth();
    window.requestAnimationFrame(() => this._update());
  }

  start() {
    this._assignControls();
    this.vengefly._moveRandom();
    this.tiktik1._moveRandom();
    this.tiktik2._moveRandom();
    this._update();
  }
}