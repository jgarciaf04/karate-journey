class VictoryScene extends Phaser.Scene {
    constructor() { super('VictoryScene'); }

    preload() {
        this.load.image('bg-victory', 'assets/tiles/bg-victory.png');
        this.load.image('parchment', 'assets/ui/parchment.png');
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 48, frameHeight: 48 });
        this.load.image('petal', 'assets/fx/petal.png');
        this.load.image('belt', 'assets/ui/belt.png');
    }

    create() {
        this.cameras.main.fadeIn(800);
        this.input.keyboard.removeAllListeners();
        const cx = 400;
        const beltIndex = this.registry.get('beltIndex') || 0;
        const isFinalVictory = beltIndex >= 6; // Beat the Oni at Black Belt

        // Starfield background
        this.add.image(cx, 300, 'bg-victory');

        // Parchment scroll centered, scaled to ~600x480
        const parch = this.add.image(cx, 300, 'parchment');
        parch.setDisplaySize(600, 480);

        if (isFinalVictory) {
            this.createFinalVictory(cx);
        } else {
            this.createBeltPromotion(cx, beltIndex);
        }

        // Cherry blossom petals using petal sprites
        const tints = isFinalVictory
            ? [0xFFD700, 0xFFA500, 0xFFE44D, 0xFFB7C5]
            : [0xFFB7C5, 0xFFC0CB, 0xFFCCD5, 0xFF8FA8];
        for (let i = 0; i < (isFinalVictory ? 30 : 20); i++) {
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
    }

    createFinalVictory(cx) {
        // ===== FINAL VICTORY: Oni Demon defeated! =====

        // Title
        this.add.text(cx, 95, '達人', {
            fontSize: '28px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);

        const title = this.add.text(cx, 140, 'GRAND VICTORY!', {
            fontSize: '16px', fontFamily: '"Press Start 2P"', color: '#DAA520'
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, scaleX: 1.08, scaleY: 1.08, duration: 500, yoyo: true, repeat: -1 });

        this.add.text(cx, 185, 'The Oni Demon has been vanquished!', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#3B2510'
        }).setOrigin(0.5);

        this.add.text(cx, 215, 'You have mastered the way of Karate!', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#3B2510'
        }).setOrigin(0.5);

        // All belts display
        this.add.text(cx, 255, '全帯制覇 ALL BELTS MASTERED', {
            fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#5C3A1E'
        }).setOrigin(0.5);

        for (let i = 0; i < BELTS.length; i++) {
            const bx = cx - 120 + i * 40;
            this.add.image(bx, 290, 'belt').setTint(BELTS[i].color).setScale(2);
        }

        // Player character with golden glow
        const player = this.add.sprite(cx, 385, 'player', 0).setScale(3);
        player.setTint(0xDAA520);

        // Grand celebration glow
        const glow = this.add.image(cx, 385, 'petal').setScale(14).setTint(0xDAA520).setAlpha(0.15);
        this.tweens.add({ targets: glow, scaleX: 22, scaleY: 22, alpha: 0, duration: 1000, yoyo: true, repeat: -1 });

        const glow2 = this.add.image(cx, 385, 'petal').setScale(10).setTint(0xFF4500).setAlpha(0.1);
        this.tweens.add({ targets: glow2, scaleX: 16, scaleY: 16, alpha: 0, duration: 1400, yoyo: true, repeat: -1, delay: 300 });

        this.add.text(cx, 435, 'あなたは空手の達人です', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);

        this.add.text(cx, 460, 'You are a Karate Master!', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#5C3A1E'
        }).setOrigin(0.5);

        const prompt = this.add.text(cx, 510, '桜 Press ENTER to play again 桜', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);
        this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

        // ENTER → restart from IntroScene
        this.input.keyboard.on('keydown-ENTER', () => {
            this.cameras.main.fadeOut(800);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('IntroScene'));
        });
    }

    createBeltPromotion(cx, beltIndex) {
        // ===== BELT PROMOTION: continue journey =====
        const oldBelt = BELTS[beltIndex];
        const newBeltIndex = beltIndex + 1;
        const newBelt = BELTS[newBeltIndex];

        // Update registry with new belt
        this.registry.set('beltIndex', newBeltIndex);

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

        // Next challenge info
        const nextEnemy = newBelt.enemy.name;
        this.add.text(cx, 430, 'あなたの空手の旅は続く...', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);

        this.add.text(cx, 455, 'Next challenge: ' + nextEnemy, {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#5C3A1E'
        }).setOrigin(0.5);

        const prompt = this.add.text(cx, 510, '桜 Press ENTER to continue your journey 桜', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);
        this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

        // ENTER → CityScene for next belt level
        this.input.keyboard.on('keydown-ENTER', () => {
            this.cameras.main.fadeOut(800);
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('CityScene'));
        });
    }
}
