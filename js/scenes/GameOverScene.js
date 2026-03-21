class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    preload() {
        this.load.image('bg-gameover', 'assets/tiles/bg-gameover.png');
        this.load.image('parchment', 'assets/ui/parchment.png');
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image('petal', 'assets/fx/petal.png');
    }

    create() {
        this.cameras.main.fadeIn(800);
        this.input.keyboard.removeAllListeners();

        const beltIndex = this.registry.get('beltIndex') || 0;

        // Dark red background
        this.add.image(400, 300, 'bg-gameover');

        // Parchment scroll centered, scaled to ~500x400
        const parch = this.add.image(400, 300, 'parchment');
        parch.setDisplaySize(500, 400);

        // Title
        this.add.text(400, 140, '敗北', {
            fontSize: '22px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);

        this.add.text(400, 180, 'DEFEATED', {
            fontSize: '18px', fontFamily: '"Press Start 2P"', color: '#5C2020'
        }).setOrigin(0.5);

        this.add.text(400, 220, 'The ' + BELTS[beltIndex].enemy.name + ' was too powerful...', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#5C3A1E'
        }).setOrigin(0.5);

        // Fallen character: player sprite (hurt frame 6), rotated 90 degrees
        const fallen = this.add.sprite(400, 340, 'player', 6).setScale(3);
        fallen.setAngle(90);

        // Japanese proverb
        this.add.text(400, 260, '七転び八起き', {
            fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);
        this.add.text(400, 285, '"Fall seven times, stand up eight"', {
            fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#888888'
        }).setOrigin(0.5);

        // Prompts
        const retry = this.add.text(400, 420, '[ Press ENTER to try again ]', {
            fontSize: '9px', fontFamily: '"Press Start 2P"', color: '#DAA520'
        }).setOrigin(0.5);
        this.tweens.add({ targets: retry, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

        this.add.text(400, 455, '[ Press T to return to training ]', {
            fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#888888'
        }).setOrigin(0.5);

        // Dark petals using petal sprites
        const tints = [0x8B4060, 0x6B3050, 0x5B2040];
        for (let i = 0; i < 10; i++) {
            const p = this.add.image(Math.random() * 800, -10, 'petal')
                .setTint(Phaser.Utils.Array.GetRandom(tints))
                .setAlpha(0.4)
                .setScale(0.5 + Math.random() * 0.6)
                .setDepth(10);
            this.tweens.add({
                targets: p, x: p.x + 40 + Math.random() * 80, y: 620,
                angle: Math.random() * 300, duration: 6000 + Math.random() * 4000,
                delay: Math.random() * 3000, repeat: -1,
                onRepeat: () => { p.x = Math.random() * 800; p.y = -10; }
            });
        }

        this.input.keyboard.on('keydown-ENTER', () => {
            this.cameras.main.fadeOut(600);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('FightScene'));
        });
        this.input.keyboard.on('keydown-T', () => {
            this.cameras.main.fadeOut(600);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('VillageScene'));
        });
    }
}
