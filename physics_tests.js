// These next two classes were copied from the phaser 3 examples 
// They modify both and Image object and the Group classes in phaser
// to make it easier to shoot bullets at other objects.

// Must run in phaser version 3.60 or later.  Does not work in 
// phaser v3.15.  The Bullets call onCreate doesn't work in phaser
// v3.15.

class Bullet extends Phaser.Physics.Arcade.Image
{
    fire (x, y, vx, vy)
    {
        this.enableBody(true, x, y, true, true);
        this.setVelocity(vx, vy);
    }

    onCreate ()
    {
        this.disableBody(true, true);
        this.body.collideWorldBounds = true;
        this.body.onWorldBounds = true;
    }

    onWorldBounds ()
    {
        this.disableBody(true, true);
    }
}

class Bullets extends Phaser.Physics.Arcade.Group
{
    constructor (world, scene, config)
    {
        super(
            world,
            scene,
            { ...config, classType: Bullet, createCallback: Bullets.prototype.onCreate }
        );
    }

    fire (x, y, vx, vy)
    {
        
        const bullet = this.getFirstDead(false);
        if (bullet)
        {
            bullet.fire(x, y, vx, vy);
        }
    }

    onCreate (bullet)
    {
        bullet.onCreate();
    }

    poolInfo ()
    {
        return `${this.name} total=${this.getLength()} active=${this.countActive(true)} inactive=${this.countActive(false)}`;
    }
}
//  End of Image and Group class extensions

class Level extends Phaser.Scene
{
    constructor(key) {
        super(key);

        this.levelKey = key
        this.nextLevel = {
          'Level1': 'Level2',
          'Level2': 'Level3',
          'Level3': 'Level1',
          'Level4': 'Credits',
        }
      }
    movingPlatform;
    cursors;
    platforms;
    stars;
    player;
    jumps = 0;
    jumpText;

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('sky', 'sky.png');
        this.load.image('ground', 'platform.png');
        this.load.image('star', 'star.png');
        this.load.spritesheet('dude', 'dude.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('bg3','snowdunes.png')
        this.load.spritesheet('campfire2','campfire.png',{ frameWidth: 32, frameHeight: 32}); 
        this.load.spritesheet('enemy','campfire.png',{ frameWidth: 32, frameHeight: 32});      
        this.load.audio('mars', 'Mars, the Bringer of War.ogg')
        this.load.image('bg2', 'trees.png');
        this.load.image('enemyBullet', 'snowflake.png');
    }

    create ()
    {
        gameState.active=true;
        gameState.min=0;
        gameState.sec=0;
        gameState.jumps=0;
        gameState.stars=0;
        gameState.nextLevel=this.nextLevel[this.levelKey];
        gameState.levelKey=this.levelKey;
        const offSet= 650;

        gameState.cursors = this.input.keyboard.createCursorKeys();

        // set up some "soothing" game background music from Holst

        gameState.bgMusic = this.sound.add('mars');
        const music = gameState.bgMusic;
        music.stop();
        music.play({
            seek:5
        });
        
        gameState.sky=this.add.image(0, 0, 'sky');
        gameState.bg2 = this.add.image(0,0,'bg2').setOrigin(0,0);
        gameState.bg3 = this.add.image(0, 0, 'bg3');
        

        gameState.sky.setOrigin(0, 0);
        gameState.bg2.setOrigin(0, 0);
        gameState.bg3.setOrigin(0, 0);

        this.elasped_time=this.add.text(650,25,'Time: '+gameState.min+':'+gameState.sec, {fontsize: '12px', fill: '#000'});
        this.jumpText = this.add.text(650, 50, 'Jumps Used: '+gameState.jumps, {fontsize: '12px', fill: '#000'});
        this.starCollected = this.add.text(650,75,'Captured: '+gameState.stars, {fontsize: '12px', fill: '#000'});
        

        // Parallax Backgrounds setup
    
        const game_width = parseFloat(gameState.bg3.getBounds().width)
        gameState.width = game_width;
        const window_width = config.width

        const sky_width = gameState.sky.getBounds().width
        const bg2_width = gameState.bg2.getBounds().width
        const bg3_width = gameState.bg3.getBounds().width

        //gameState.bgColor.setScrollFactor(0);
        gameState.sky.setScrollFactor((sky_width - window_width) / (game_width - window_width));
        gameState.bg2.setScrollFactor((bg2_width - window_width) / (game_width - window_width));

        // Make sure the score board stays in the same spot during game movement 
        this.elasped_time.setScrollFactor((sky_width - window_width) / (game_width - window_width));
        this.jumpText.setScrollFactor((sky_width - window_width) / (game_width - window_width));
        this.starCollected.setScrollFactor((sky_width - window_width) / (game_width - window_width));


        // set up timer tween for this level
        let startingTime = 0;
        let endTime =59;

        let updateTween = this.tweens.addCounter({
            from: startingTime,
            to: endTime,
            duration: 60100,        // each counter last for 10 secs
            ease: 'linear',
            repeat: -1,
            onRepeat: () =>
            {
                this.elasped_time.setText(`Time: ${gameState.min}:00`);
                gameState.min += 1;
            },
            onUpdate: tween =>
            {
                const value = Math.round(tween.getValue());
                gameState.sec=value;
                this.elasped_time.setText(`Time: ${gameState.min}:${value}`)
            }
        });

        // create the lava out of a campfire
        gameState.lava = this.add.sprite(1100,580,'campfire2');
        gameState.lava.setScale(1500/gameState.lava.height,100/gameState.lava.width);
        
        //  Set up the static platforms
        this.platforms = this.physics.add.staticGroup();
        this.levelSetup();

        this.movingPlatform = this.physics.add.image(600, 400, 'ground');
        this.movingPlatform.setScale(200/this.movingPlatform.width,30/this.movingPlatform.height);
        this.movingPlatformv2 = this.physics.add.image(350,300,'ground');
        this.movingPlatformv2.setScale(200/this.movingPlatformv2.width,30/this.movingPlatformv2.height);
        this.movingPlatformv3 = this.physics.add.image(100,400,'ground');
        this.movingPlatformv3.setScale(200/this.movingPlatformv3.width,30/this.movingPlatformv3.height);

        this.movingPlatform.setImmovable(true);
        this.movingPlatform.body.allowGravity = false;
        this.movingPlatform.setVelocityX(50);

        this.movingPlatformv2.setImmovable(true);
        this.movingPlatformv2.body.allowGravity = false;
        this.movingPlatformv2.setVelocityX(100);

        this.movingPlatformv3.setImmovable(true);
        this.movingPlatformv3.body.allowGravity = false;
        //this.movingPlatformv2.setVelocityX(50);

        this.player = this.physics.add.sprite(100, 450, 'dude');

        this.enemy = this.physics.add.sprite(256, 128, 'enemy');
        this.enemy.body.allowGravity=false;
        this.enemy.setCollideWorldBounds(true);
        this.enemy.setScale(2);
        this.enemy.setBodySize(100, 50);


        

// Create the troll head bullets/bombs
        gameState.enemyBullets = this.add.existing(
            new Bullets(this.physics.world, this, { name: 'enemyBullets' })
        );
        gameState.enemyBullets.createMultiple({
            key: 'enemyBullet',
            quantity: 1
        });

        gameState.enemyBullets2 = this.add.existing(
            new Bullets(this.physics.world, this, { name: 'enemyBullets' })
        );
        gameState.enemyBullets2.createMultiple({
            key: 'enemyBullet',
            quantity: 5
        })
        gameState.enemyBullets3 = this.add.existing(
            new Bullets(this.physics.world, this, { name: 'enemyBullets' })
        );
        gameState.enemyBullets3.createMultiple({
            key: 'enemyBullet',
            quantity: 5
        })

        // Hit points
        this.enemy.state = 5;

        this.enemyMoving = this.tweens.add({
            //targets: this.enemy.body.velocity,
            targets: this.enemy,
            //x: 700,
        
            props: {
                x: { from: 100, to: 700, duration: 6000 },
                y: { from: 200, to: 20, duration: 2000 }
            },
            
            duration: 12000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1
        });

        this.enemyFiring = this.time.addEvent({
            delay:2000,
            startAt: 100,
            loop: true,
            callback: () =>
            {
                if(this.levelKey==='Level1'){
                    gameState.enemyBullets.fire(this.enemy.x, this.enemy.y+50, 0, -10);
                }else if(this.levelKey==='Level2'){
                    gameState.enemyBullets2.fire(this.enemy.x+20, this.enemy.y+50, this.enemy.angle*5, -100);
                    gameState.enemyBullets3.fire(this.enemy.x-20, this.enemy.y+50, -this.enemy.angle*5, -150);
                }else if (this.levelKey==='Level3'){
                    gameState.enemyBullets.fire(this.enemy.x, this.enemy.y+50, 0, -10);
                    gameState.enemyBullets2.fire(this.enemy.x+20, this.enemy.y+50, this.enemy.angle*5, -100);
                    gameState.enemyBullets3.fire(this.enemy.x-20, this.enemy.y+50, -this.enemy.angle*5, -150);
                }
            }
        })

        this.cameras.main.setBounds(0, 0, gameState.bg3.width, gameState.bg3.height);
        this.physics.world.setBounds(0, 0, gameState.width, gameState.bg3.height + this.player.height);

        this.cameras.main.startFollow(this.player, true, 0.5, 0.5)

        this.player.setBounce(0.2);
        this.player.setCollideWorldBounds(true);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [ { key: 'dude', frame: 4 } ],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
            frameRate: 10,
            repeat: -1
        });

        this.cursors = this.input.keyboard.createCursorKeys();

        this.physics.add.image().setAngle()
        this.stars = this.physics.add.group({
            key: 'star',
            repeat: 120,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        for (const star of this.stars.getChildren())
        {
            star.setBounceY(Phaser.Math.FloatBetween(0.3, 0.5));
        }

        this.physics.add.collider(this.player, this.platforms);
        this.physics.add.collider(this.player, this.movingPlatform);
        this.physics.add.collider(this.player, this.movingPlatformv2);
        this.physics.add.collider(this.player, this.movingPlatformv3);
        this.physics.add.collider(this.stars, this.platforms);
        this.physics.add.collider(this.stars, this.movingPlatform);
        this.physics.add.collider(this.stars, this.movingPlatformv2);
        this.physics.add.collider(this.stars, this.movingPlatformv3);

        this.physics.add.overlap(this.player, this.stars, this.collectStar, null, this);

        // This kills the player.
        this.physics.add.overlap(this.player, [gameState.enemyBullets,gameState.enemyBullets2,
            gameState.enemyBullets3], (player, bullet) =>
        {
            const { x, y } = bullet.body.center;

            bullet.disableBody(true, true);
            //this.player.disableBody(true,true);
            this.tweens.add({
                targets: this.player,
                props: {
                    x: { from: this.player.x -10, to: this.player.x+10, duration: 80 },
                    y: { from: this.player.y -5, to: this.player.y+5, duration: 80 }
                },
                duratation: 400,
                repeat: -1,
                yoyo: true

            })
            music.stop();
            this.cameras.main.fade(5000, 0xff,0xff,0xff);
            this.time.delayedCall(6000, () => this.scene.start('Outro'));
            //this.plasma.setSpeedY(0.2 * bullet.body.velocity.y).emitParticleAt(x, y);
        });
        this.physics.world.on('worldbounds', (body) =>
        {
            body.gameObject.onWorldBounds()
        });

        this.input.on('pointerdown', () => {
            this.cameras.main.fade(1000, 0,0,0);
            this.time.delayedCall(1000, () => this.scene.start('Outro'));
        });
    }
        //alert('exiting create');
    levelSetup() {
            
        for (const [xIndex, yIndex] of this.heights.entries()) {
              this.createPlatform(xIndex, yIndex);
            } 
            this.setWeather(this.weather);
          }
    
    createPlatform(xIndex, yIndex) {
        // Creates a platform evenly spaced along the two indices.
        // If either is not a number it won't make a platform
          if (typeof yIndex === 'number' && typeof xIndex === 'number') {
            this.platforms.create((150 * xIndex),  yIndex * 70, 'ground').setOrigin(0, 0.5).refreshBody()
            .setScale(.5,1).setBodySize(200,36);
          }
      }



    update ()
    {
        const { left, right, up } = this.cursors;

        if (left.isDown)
        {
            this.player.setVelocityX(-160);

            this.player.anims.play('left', true);
        }
        else if (right.isDown)
        {
            this.player.setVelocityX(160);

            this.player.anims.play('right', true);
        }
        else
        {
            this.player.setVelocityX(0);

            this.player.anims.play('turn');
        }
       

        /*if (up.isDown && this.player.body.touching.down)
        {
            this.player.setVelocityY(-330);
        }*/

        // This is the code during update() that detects if our little friend jumps and then increments the jump counter

        if (Phaser.Input.Keyboard.JustDown(gameState.cursors.space) && this.player.body.touching.down) {
            //gameState.player.anims.play('jump', true);
            this.player.setVelocityY(-330);
            gameState.jumps +=1;
            this.jumpText.setText('Jumps Used: ' + gameState.jumps);
          }
    
          if (!this.player.body.touching.down){
            //gameState.player.anims.play('jump', true);
          }

        if (this.movingPlatform.x >= 800)
        {
            this.movingPlatform.setVelocityX(-50);
        }
        else if (this.movingPlatform.x <= 300)
        {
            this.movingPlatform.setVelocityX(50);
        }

        if (this.movingPlatformv2.x >= 1500)
        {
            this.movingPlatformv2.setVelocityX(-100);
        }
        else if (this.movingPlatformv2.x <= 50)
        {
            this.movingPlatformv2.setVelocityX(100);
        }

        if (this.enemy.angle<-45){
            gameState.enemyRot=Math.abs(gameState.enemyRot);
        } else if (this.enemy.angle>45){
            gameState.enemyRot=-Math.abs(gameState.enemyRot);
        }
        this.enemy.rotation +=gameState.enemyRot;

        // Check to see if player has fallen into the lava.
        // if so, restart level
        if (this.player.y > gameState.bg3.height) {
            //music.stop();
            this.cameras.main.shake(240, .01, false, function(camera, progress) {
              if (progress > .9) {
                //this.scene.restart(this.example);
                //music.stop();
                this.scene.stop(this.levelKey);
                //this.scene.start(this.nextLevel[this.levelKey]);
                
                this.scene.start('Outro');
              }
            });
          }
    }

    jump() {
        const{space} = this.cursors
        if (space.isDown && this.player.body.touching.down){
            this.player.setVelocityY(-330);
            this.jumps++;
            this.jumpText.setText('Jumps Used: ' + this.jumps);
        }}



    collectStar (player, star)
    {
        star.disableBody(true, true);
        this.starCollected.setText('Captured: '+gameState.stars)
        gameState.stars +=1;
    }




setWeather(weather) {
    const weathers = {

      'morning': {
        'color': 0xecdccc,
        'snow':  1,
        'wind':  20,
        'bgColor': 0xF8c3aC,
      },

      'afternoon': {
        'color': 0xffffff,
        'snow':  1,
        'wind': 80,
        'bgColor': 0x0571FF,
      },

      'twilight': {
        'color': 0xccaacc,
        'bgColor': 0x18235C,
        'snow':  10,
        'wind': 200,
      },

      'night': {
        'color': 0x555555,
        'bgColor': 0x000000,
        'snow':  0,
        'wind': 0,
      },
    }
    let { color, bgColor, snow, wind } = weathers[weather];
    gameState.sky.setTint(color);
    //gameState.bg2.setTint(color);
    gameState.bg3.setTint(color);
    //gameState.bgColor.fillColor = bgColor;
    //gameState.emitter.setQuantity(snow);
    //gameState.emitter.setSpeedX(-wind);
    //gameState.player.setTint(color);
    
    for (let platform of this.platforms.getChildren()) {
      platform.setTint(color);
    }
    /*
    if (weather === 'night') {
      gameState.stars.forEach(star => star.setVisible(true));
    } else {
      gameState.stars.forEach(star => star.setVisible(false));
    }
    */

    return
  }
}










 class Level1 extends Level {
    constructor() {
      super('Level1')
      //this.heights = [8.2, 7, 5, null, 5, 3, null, 3, 3];
      this.heights = [8.4, null, 8.4, 6.0, 8.4, 6.0, null, 4.0, 8.4, null, 6.0, null, 6.0];

      this.weather = 'afternoon';
    }
  }
  
  class Level2 extends Level {
    constructor() {
        
      super('Level2')
      //alert('level 2 class, levelKey: '+this.levelKey+' nlk: '+this.nextLevel[this.levelKey])
      //this.heights = [8, 4, null, 4, 6, 4, 6, 5, 5];
      this.heights = [8.4, 8.4,null, 8.4, 6.0, 8.4, 6.0, null, 4.0, 8.4, null, 6.0, null, 6.0];
      this.weather = 'twilight';
    }
  }

  class Level3 extends Level {
    constructor() {
      super('Level3')
      //this.heights = [8, null, 6, 4, 6, 4, 5, null, 4];
      this.heights = [8.4, null, 8.4, 6.0, 8.4, 6.0, null, 4.0, 8.4, null, 6.0, null, 6.0];
      this.weather = 'morning';
    }
  }

class Outro extends Phaser.Scene {
    constructor() {
       // alert('in Outro class')
        super('Outro')
    }
    preload(){
        
        this.load.path = './assets/';
        this.load.image('campfire','campfire.gif')
        //this.load.image('campfire2','campfire.png')
        this.load.spritesheet('campfire2','campfire.png',{ frameWidth: 32, frameHeight: 32}); 
        this.load.audio('summary_sound','running_and_falling.mp3');      
    }
    create() {

        gameState.bgMusic.stop();
        gameState.campfire = this.add.sprite(500, 500, 'campfire2');
        gameState.campfire.setScale(300/gameState.campfire.height,150/gameState.campfire.width);
        this.add.text(100,50, gameState.levelKey+" Summary",{ fontFamily: 'Arial', size: 100, color: '#1940ff' }).setFontSize(90);

        this.add.text(310,175, 'Total time spent: '+gameState.min+':'+gameState.sec,{ fontFamily: 'Arial', size: 19, color: '#fff' });
        this.add.text(310,200, "Number of Jumps made: "+gameState.jumps, { fontFamily: 'Arial', size: 20, color: '#fff' });

        this.add.text(310,225, "Number of Stars Collector: "+gameState.stars, { fontFamily: 'Arial', size: 20, color: '#fff' });

        
        const transition = this.sound.add('summary_sound');
        transition.play();
        this.anims.create({
            key: 'fire',
            frames: this.anims.generateFrameNumbers('campfire2'),
            frameRate: 5,
            repeat: -1
        });

        if(gameState.nextLevel == 'Level1')
        {
            this.add.text(300,375,"Ahh, the simple life.  Back to the past!", { fontFamily: 'Arial', size: 20, color: '#fff' });

        }
        else if(gameState.nextLevel == 'Level2')
        {
            this.add.text(300,375,"If you dare proceed, two bullets will be thrown",{ fontFamily: 'Arial', size: 20, color: '#fff' });
        }
        else if(gameState.nextLevel == 'Level3')
        {
            this.add.text(300,375,"It will take courage to dodge three bullets on the next level.", { fontFamily: 'Arial', size: 20, color: '#fff' });
        }

        this.input.on('pointerdown', () => {
            this.cameras.main.fade(1000, 0,0,0);
            this.time.delayedCall(1000, () => this.scene.start(gameState.nextLevel));
        });
    }
    update(){
        gameState.campfire.anims.play('fire', true);

    }
}

const gameState = {
    speed: 240,
    ups: 380,
    jumps: 0,
    stars: 0,
    enemyRot: .01,      //rotation amount of enemy shooter
    nextLevel: 'Level4'
  };
  
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    parent: 'phaser-example',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            enableBody: true,
            //debug: true
        }
    },
    scene: [Level1, Level2, Level3, Outro]
};

const game = new Phaser.Game(config);