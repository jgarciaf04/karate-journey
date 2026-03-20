class VictoryScene extends Phaser.Scene {
    constructor() { super('VictoryScene'); }

    preload() {
        this.load.image('bg-victory', 'assets/tiles/bg-victory.png');
        this.load.image('parchment', 'assets/ui/parchment.png');
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 48 });
        this.load.image('petal', 'assets/fx/petal.png');
        this.load.image('belt', 'assets/ui/belt.png');
    }

    create() {
        this.cameras.main.fadeIn(800);
        const cx = 400;
        const beltIndex = this.registry.get('beltIndex') || 0;
        const oldBelt = BELTS[beltIndex];
        const newBeltIndex = Math.min(beltIndex + 1, BELTS.length - 1);
        const newBelt = BELTS[newBeltIndex];

        // Starfield background
        this.add.image(cx, 300, 'bg-victory');

        // Parchment scroll centered, scaled to ~600x480
        const parch = this.add.image(cx, 300, 'parchment');
        parch.setDisplaySize(600, 480);

        // Title
        this.add.text(cx, 100, '勝利', {
            fontSize: '24px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);

        const title = this.add.text(cx, 140, 'VICTORY!', {
            fontSize: '18px', fontFamily: '"Press Start 2P"', color: '#DAA520'
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, scaleX: 1.05, scaleY: 1.05, duration: 600, yoyo: true, repeat: -1 });

        this.add.text(cx, 185, 'The ' + oldBelt.enemy.name + ' has been vanquished!', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#3B2510'
        }).setOrigin(0.5);

        // Belt promotion section
        this.add.text(cx, 225, '帯昇進 BELT PROMOTION', {
            fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#5C3A1E'
        }).setOrigin(0.5);

        // Old belt label + sprite
        this.add.text(cx - 100, 265, oldBelt.name + ' Belt', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#888888'
        }).setOrigin(0.5);
        this.add.image(cx - 100, 285, 'belt').setTint(oldBelt.color).setScale(3);

        // Arrow
        this.add.text(cx, 283, '>>>>', {
            fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#DAA520'
        }).setOrigin(0.5);

        // New belt label + sprite with glow
        this.add.text(cx + 100, 265, newBelt.name + ' Belt', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#B8860B'
        }).setOrigin(0.5);
        this.add.image(cx + 100, 285, 'belt').setTint(newBelt.color).setScale(3);

        const beltGlow = this.add.image(cx + 100, 285, 'belt').setTint(newBelt.color).setScale(4).setAlpha(0.15);
        this.tweens.add({ targets: beltGlow, scaleX: 6, scaleY: 6, alpha: 0, duration: 1000, yoyo: true, repeat: -1 });

        // Player character (idle frame 0) with new belt tint
        const player = this.add.sprite(cx, 385, 'player', 0).setScale(3);
        if (newBelt.color !== 0xFFFFFF) {
            player.setTint(newBelt.color);
        }

        // Celebration glow around player
        const glow = this.add.image(cx, 385, 'petal').setScale(12).setTint(0xDAA520).setAlpha(0.1);
        this.tweens.add({ targets: glow, scaleX: 18, scaleY: 18, alpha: 0, duration: 1200, yoyo: true, repeat: -1 });

        this.add.text(cx, 440, 'あなたの空手の旅は続く...', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);

        this.add.text(cx, 465, 'Your karate journey continues...', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#5C3A1E'
        }).setOrigin(0.5);

        const prompt = this.add.text(cx, 510, '桜 Press ENTER to play again 桜', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);
        this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

        // Cherry blossom petals using petal sprites
        const tints = [0xFFB7C5, 0xFFC0CB, 0xFFCCD5, 0xFF8FA8];
        for (let i = 0; i < 20; i++) {
            const p = this.add.image(Math.random() * 800, -10 - Math.random() * 100, 'petal')
                .setTint(Phaser.Utils.Array.GetRandom(tints))
                .setAlpha(0.5 + Math.random() * 0.4)
                .setScale(0.6 + Math.random() * 0.8)
                .setDepth(15);
            this.tweens.add({
                targets: p, x: p.x + 60 + Math.random() * 130, y: 620,
                angle: Math.random() * 400, duration: 5000 + Math.random() * 5000,
                delay: Math.random() * 4000, repeat: -1,
                onRepeat: () => { p.x = Math.random() * 800; p.y = -10; }
            });
        }

        this.input.keyboard.on('keydown-ENTER', () => {
            this.cameras.main.fadeOut(800);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('IntroScene'));
        });
    }
}
