//const { Phaser } = require("../sectionActivity2/lib/phaser");

class Scene0 extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'scene0' });
    }

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('coolcleanv2','coolcleanv2.png');
    }

    create ()
    {
        //var mrclean = this.add.image(700,400,'coolcleanv2');
        //mrclean.setScale(400/mrclean.height,400/mrclean.width);

        this.add.text(10,10,"Click to begin. Keep clicking to go through the entire cinematic");
                this.input.on('pointerdown', () => this.scene.start('body'));

        this.cameras.main.once('camerafadeincomplete', function (camera) {
            camera.fadeOut(6000);
        });


        this.input.once('pointerdown', function (event)
        {

            console.log('From Scene0 to SceneA');

            this.scene.start('sceneA');

        }, this);
    }
}

class SceneA extends Phaser.Scene {
    constructor(){
        super({key: 'sceneA'});
    }
    preload(){
        this.load.path = './assets/';
        this.load.image('logo','spawn_point_studios.png')
        this.load.image('sectionimage', 'sectionimage.png');
        this.load.image('coolcleanv2','coolcleanv2.png');
        this.load.image('alivestick','alive_stick_v2.png');
        this.load.image('deadstick','dead_stick_v2.png');

        this.load.audio('hitWall','Heavy object Hit and body thud sound effect.mp3')
        this.load.audio('respawn','Respawn Sound Effect.mp3')
        this.load.audio('run','running_and_falling.mp3')

    }
    create()
    {
        this.graphics = this.add.graphics();

        this.graphics.fillStyle(0xffffff, 1);
        this.graphics.fillRect(0,0,1920,1080); //x1,y1, width, height

        
        var stick = this.add.image(400,600,'alivestick');
        stick.setScale(800/stick.height,800/stick.width);

        var deadStick = this.add.image(1600,750,'deadstick');
        deadStick.setScale(600/deadStick.height,600/deadStick.width);

        this.graphics.fillStyle(0x00ff00, 1); //color opacity
        this.graphics.fillTriangle(140,100,300,150,140,200); //x1, y1, x2, y2, x3, y3

        this.graphics.fillStyle(0x000000, 1);
        this.graphics.fillRect(100,100,40,800); //x1,y1, width, height
        this.graphics.fillRect(1700,200,300,800); //x1,y1, width, height

        var logo = this.add.image(810,100,'logo');
        //logo.setScale(400/logo.height,400/logo.width);

  


        this.tweens.add({
            targets: stick,
            alpha: 0,
            x: 1800,
            duration: 2000,
            repeat: 1,
            hold: 2000,
            repeatDelay: 500,
            ease: 'cubic.out',
        });

        //this.time.events.add(5000, this.graphics.destroy, this.graphics); tried getting rid of objects but lead nowhere

        this.tweens.add({
            targets: deadStick,           //doesn't properly display the deadstick after stick does it first animation. Deadstick appears at scene start which is incorrect
            alpha: 0,
            x:1600,
            y:750,
            duration: 2000,
            repeat: 1,
            hold: 3000,
            delay: 1000,
            repeatDelay: 500,
        });

        this.hit = this.sound.add('hitWall');
        var soundConfig = {
            mute:0,
            volume: 0.5,
            seek: 0, 
            loop: false,
            delay: .75
        }
        this.hit.play(soundConfig);

        this.run = this.sound.add('run');
        var soundConfigV2 = {
            mute:0,
            rate: 1.5,
            volume: 0.5,
            seek: 0, 
            loop: false,
            delay: 0
        }
        this.run.play(soundConfigV2);

        this.respawn = this.sound.add('respawn');
        var soundConfigV3 = {
            mute:0,
            volume: 1,
            seek: 0, 
            loop: false,
            delay: 3
        }
        this.respawn.play(soundConfigV3);


        this.cameras.main.once('camerafadeincomplete', function (camera) {
            camera.fadeOut(14000);
        });

        this.cameras.main.fadeIn(1000);

        //var mrclean = this.add.image(700,800,'coolcleanv2');
        //mrclean.setScale(400/mrclean.height,400/mrclean.width);

        this.input.once('pointerdown', function ()
        {

            console.log('From SceneA to SceneB');

            this.scene.start('sceneB');

        }, this);

    


    }
}

class SceneB extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'sceneB' });
    }

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('sectionimage', 'sectionimage.png');
    }

    create ()
    {

        let box = this.add.text(0, 340,
`IN A WORLD WHERE
ALL ANYONE KNOWS
ARE EXPLOSIONS`
            ,{fontSize:200});

        
        this.cameras.main.once('camerafadeincomplete', function (camera) {
            camera.fadeOut(2000);
        });

        this.cameras.main.fadeIn(1000);

        //this.doggie = this.add.sprite(300, 300, 'sectionimage').setOrigin(0, 0.5);

        this.input.once('pointerdown', function (event)
        {

            console.log('From SceneB to SceneC');

            this.scene.start('sceneC');

        }, this);
    }

    /*update (time, delta)
    {
        this.doggie.rotation += .001;
    }*/
}
class SceneC extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'sceneC' });
    }

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('explode', 'ExplosionHD.png');
        this.load.audio('explodeSound','quiter_explosion.mp3')
    }

    create ()
    {

        //this.doggie = this.add.sprite(300, 300, 'sectionimage').setOrigin(0, 0.5);
        var explode = this.add.image(900,500,'explode');
        //explode.setScale(1080/explode.height,1920/explode.width);

        this.exploded = this.sound.add('explodeSound');
        var soundConfig = {
            mute:0,
            volume: 0.5,
            seek: 0, 
            loop: false,
            delay: 0.5
        }
        this.exploded.play(soundConfig);

        this.input.once('pointerdown', function (event)
        {

            console.log('From SceneC to SceneD');

            this.scene.start('sceneD');

        }, this);
    }

    /*update (time, delta)
    {
        this.doggie.rotation += .001;
    }
    */
}

class SceneD extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'sceneD' });
    }

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('coolcleanv2','coolcleanv2.png');
    }

    create ()
    {
        
        let box = this.add.text(0, 240,
`ONE MAN WILL
CAUSE AN EXPLOSION
THAT WILL END
ALL OTHER EXPLOSIONS`
                        ,{fontSize:160});
            
                    
                    this.cameras.main.once('camerafadeincomplete', function (camera) {
                        camera.fadeOut(2000);
                    });
            
                    this.cameras.main.fadeIn(1000);

        this.input.once('pointerdown', function (event)
        {

            console.log('From SceneD to SceneE');

            this.scene.start('sceneE');

        }, this);
    }
}

class SceneE extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'sceneE' });
    }

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('explode', 'ExplosionHD.png');
        this.load.audio('explodeSound','quiter_explosion.mp3')
    }

    create ()
    {

        //this.doggie = this.add.sprite(300, 300, 'sectionimage').setOrigin(0, 0.5);
        var explode = this.add.image(900,500,'explode');
        //explode.setScale(1080/explode.height,1920/explode.width);

        this.exploded = this.sound.add('explodeSound');
        var soundConfig = {
            mute:0,
            volume: 0.5,
            seek: 0, 
            loop: false,
            delay: 0.5
        }
        this.exploded.play(soundConfig);

        this.input.once('pointerdown', function (event)
        {

            console.log('From SceneE to SceneF');

            this.scene.start('sceneF');

        }, this);
    }
}

class SceneF extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'sceneF' });
    }

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('coolcleanv2','coolcleanv2.png');
    }

    create ()
    {
        
        let box = this.add.text(200, 340,
`AND HIS NAME

MR CLEAN`
                        ,{fontSize:200});
            
                    
                    this.cameras.main.once('camerafadeincomplete', function (camera) {
                        camera.fadeOut(2000);
                    });
            
                    this.cameras.main.fadeIn(1000);

        this.input.once('pointerdown', function (event)
        {

            console.log('From SceneF to SceneG');

            this.scene.start('sceneG');

        }, this);
    }
}

class SceneG extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'sceneG' });
    }

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('explode', 'ExplosionHD.png');
        this.load.audio('explodeSound','quiter_explosion.mp3')
    }

    create ()
    {

        //this.doggie = this.add.sprite(300, 300, 'sectionimage').setOrigin(0, 0.5);
        var explode = this.add.image(900,500,'explode');
        //explode.setScale(1080/explode.height,1920/explode.width);

        this.exploded = this.sound.add('explodeSound');
        var soundConfig = {
            mute:0,
            volume: 0.5,
            seek: 0, 
            loop: false,
            delay: 0.5
        }
        this.exploded.play(soundConfig);

        this.input.once('pointerdown', function (event)
        {

            console.log('From SceneG to SceneH');

            this.scene.start('sceneH');

        }, this);
    }
}

class SceneH extends Phaser.Scene
{
    constructor ()
    {
        super({ key: 'sceneH' });
    }

    preload ()
    {
        this.load.path = './assets/';
        this.load.image('coolcleanv2','coolcleanv2.png');
        this.load.image('explosion','ExplosionHD.png')
    }

    create ()
    {
        var explode = this.add.image(1300,600,'explosion');
        explode.setAlpha(0.5);
        //mrclean.setScale(400/mrclean.height,400/mrclean.width);

        var mrclean = this.add.image(1300,600,'coolcleanv2');
        mrclean.setScale(400/mrclean.height,400/mrclean.width);

        let title = this.add.text(100,0,`MR.CLEAN: ONE LAST CLEAN`, {fontSize:120});

        this.textObject = this.add.text(10, 340,
`PLAY
OPTIONS
CREDITS
EXIT`
                        ,{fontSize:30, scale:0.2});
            
                    
                    /*this.cameras.main.once('camerafadeincomplete', function (camera) {
                        camera.fadeOut(2000);
                    });
            
                    this.cameras.main.fadeIn(1000);*/
        this.tweens.add({
            targets: this.textObject,
            //alpha:0,
            x:200,
            y:340,
            duration:4000,
            ease:'Linear',
            repeat: 0,
        });
        this.input.once('pointerdown', function (event)
        {

            console.log('From SceneH to Scene0');

            this.scene.start('scene0');

        }, this);
    }
}

let config = {
    type: Phaser.WEBGL,
    width: 1920,
    height: 1080,
    backgroundColor: 0x000000,
    scene: [Scene0, SceneA, SceneB, SceneC, SceneD, SceneE, SceneF, SceneG, SceneH],
}

let game = new Phaser.Game(config);
