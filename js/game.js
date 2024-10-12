// new scene
const gameScene = new Phaser.Scene('Game');
const titleScene = new Phaser.Scene('Title');

titleScene.preload = function(){
    this.load.image('titlebackground', 'assets/title-background.png');
}

titleScene.create = function () {
    const background = this.add.sprite(0,0, 'titlebackground');
    background.setOrigin(0,0)

    this.add.text(this.sys.game.config.width / 2,this.sys.game.config.height / 2, 'Welcome to my Game')
        .setOrigin(0.5);

    this.input.on('pointerup', function (pointer) {
        this.scene.start('Game');
    }, this);
}

gameScene.gameOver = function () {
    // initiate the game over sequence// shake the camera
    this.isTerminating = true;
    this.cameras.main.shake(500);

    // listen for event completion
    this.cameras.main.on('camerashakecomplete', function (camera, effect) {
        this.cameras.main.fade(500);
    }, this);

    this.cameras.main.on('camerafadeoutcomplete', function (camera, effect) {
        this.scene.restart();
        this.isTerminating = false;
    }, this);
}

// init scene parameters
gameScene.init = function () {
    this.playerSpeed = 3;
    this.enemyMinSpeed = 1;
    this.enemyMaxSpeed = 4;

    // enemy boundaries
    this.enemyMinY = 80;
    this.enemyMaxY = 280;

    this.isTerminating = false;
}

// load assets
gameScene.preload = function () {
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
    this.load.image('enemy', 'assets/dragon.png');
    this.load.image('goal', 'assets/treasure.png');
}

gameScene.create = function () {
    // create background sprite
    this.player = this.add.sprite(40, this.sys.game.config.height / 2, 'player');
    const bg = this.add.sprite(0, 0, 'background');

    // enemy group
    this.enemies = this.add.group({
        key: 'enemy',
        repeat: 5,
        setXY: {
            x: 80,
            y: 100,
            stepX: 90,
            stepY: 20
        }
    });
    // this.enemy = this.add.sprite(120, this.sys.game.config.height / 2, 'enemy');
    this.goal = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'goal')
        .setScale(0.6);

    Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.4, -0.4);
    Phaser.Actions.Call(this.enemies.getChildren(), function (enemy) {
        const dir = Math.random() > 0.5 ? 1 : -1;
        const speed = this.enemyMinSpeed + Math.random() * (this.enemyMaxSpeed - this.enemyMinSpeed);

        enemy.speed = dir * speed;
        enemy.flipX = true;
    }, this);


    // get all group's elements
    // this.enemies.getChildren()

    // z index
    this.player.depth = 1;
    // this.enemy.speed = dir * speed;

    // set origin to the top-left corner
    // bg.setOrigin(0, 0);

    // place sprite in the center
    // bg.setPosition(640 / 2,360 / 2);

    // get the width and height of the scene
    const gameWidth = this.sys.game.config.width;
    const gameHeight = this.sys.game.config.height;

    // place the sprite in the center
    bg.setPosition(gameWidth / 2,gameHeight / 2);

    // scaling
    // has 2 arguments: x and y if the same value is passed, it will scale uniformly
    // in player object we have displayHeight and displayWidth properties they are the scaled values
    this.player.setScale(0.5);

    // another way to scale
    // enemy.scaleY = 2;
    // enemy.scaleX = 2;
    // enemy2.displayWidth = 300;
    // enemy2.displayHeight = 300;

    // flipping
    // enemy1.flipX = true;
    // enemy1.flipY = true;

    // rotation
    // enemy1.angle = 45;
    // enemy1.setAngle(45);
    // enemy1.rotation = Math.PI / 4;
    // rotating by left to corner
    // enemy1.setOrigin(0, 0);
    // enemy1.setRotation(Math.PI / 4);
}


// this is called up to 60 times per second
gameScene.update = function () {
    if (this.isTerminating) {
        return;
    }
    const playerRect = this.player.getBounds();
    const treasureRect = this.goal.getBounds();

    // move enemy
    // this.enemy1.x += 0.1

    // scale and rotate enemy
    // this.enemy1.angle += 1;
    // if (this.enemy1.scale < 2) {
    //     this.enemy1.setScale(this.enemy1.scale + 0.01);
    // }

    // check for active input

    if (this.input.activePointer.isDown) {
        // player walks
        this.player.x += this.playerSpeed;
    }

    // treasure overlap check


    // const conditionUp = this.enemy.speed < 0 && this.enemy.y <= this.enemyMinY;
    // const conditionDown = this.enemy.speed > 0 && this.enemy.y >= this.enemyMaxY;

    // if (conditionUp || conditionDown) {
    //   this.enemy.speed *= -1;
    // }

    // this.enemy.y += this.enemy.speed;

    const enemies = this.enemies.getChildren();
    const numEnemies = enemies.length;

    for (let i = 0; i < numEnemies; i++) {
        const enemyRect = enemies[i].getBounds();

        enemies[i].y += enemies[i].speed;

        const conditionUp = enemies[i].speed < 0 && enemies[i].y <= this.enemyMinY;
        const conditionDown = enemies[i].speed > 0 && enemies[i].y >= this.enemyMaxY;

        if (conditionUp || conditionDown) {
            enemies[i].speed *= -1;
        }

        if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, enemyRect)) {
            return this.gameOver();
        }
    }

    if (Phaser.Geom.Intersects.RectangleToRectangle(playerRect, treasureRect)) {
        this.scene.restart();

        return;
    }
}

// set the configuration of the game
const config = {
    type: Phaser.AUTO,
    width: 640,
    height: 360,
    scene: [titleScene, gameScene]
}

// create a new game, pass the configuration
const game = new Phaser.Game(config);