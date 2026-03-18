class GameOverScene extends Phaser.Scene {
    constructor() { super('GameOverScene'); }

    create() {
        this.cameras.main.fadeIn(800);

        const bg = this.add.graphics();
        // Dark red gradient
        for (let i = 0; i < 12; i++) {
            bg.fillStyle(Phaser.Display.Color.GetColor(10 + i * 2, 2, 4 + i));
            bg.fillRect(0, i * 50, 800, 51);
        }

        // Parchment (damaged look)
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(155, 105, 500, 400, 8);
        bg.fillStyle(0xE8D8B8, 0.9);
        bg.fillRoundedRect(150, 100, 500, 400, 8);
        bg.lineStyle(2, 0x5C3A1E);
        bg.strokeRoundedRect(150, 100, 500, 400, 8);

        // Fallen character
        const cg = this.add.graphics();
        cg.fillStyle(0xFFFFFF);
        cg.fillRect(370, 370, 44, 16);
        cg.fillStyle(0xDEB887);
        cg.fillCircle(358, 378, 9);
        cg.fillStyle(0x1A1A2E);
        cg.fillEllipse(358, 373, 14, 6);
        cg.fillStyle(0xCC2222);
        cg.fillRect(350, 376, 16, 2);
        cg.fillStyle(0xDAA520);
        cg.fillRect(388, 374, 20, 3);
        cg.fillStyle(0xFFFFFF);
        cg.fillRect(410, 375, 16, 6);

        this.add.text(400, 140, '敗北', {
            fontSize: '40px', fontFamily: 'serif', color: '#8B0000'
        }).setOrigin(0.5);

        this.add.text(400, 185, 'DEFEATED', {
            fontSize: '32px', fontFamily: 'monospace', color: '#5C2020', fontStyle: 'bold'
        }).setOrigin(0.5);

        bg.lineStyle(2, 0x5C2020, 0.3);
        bg.lineBetween(250, 205, 550, 205);

        this.add.text(400, 230, 'The Oni Demon was too powerful...', {
            fontSize: '14px', fontFamily: 'monospace', color: '#5C3A1E'
        }).setOrigin(0.5);

        this.add.text(400, 270, '七転び八起き', {
            fontSize: '16px', fontFamily: 'serif', color: '#8B0000'
        }).setOrigin(0.5);
        this.add.text(400, 295, '"Fall seven times, stand up eight"', {
            fontSize: '11px', fontFamily: 'monospace', color: '#888888', fontStyle: 'italic'
        }).setOrigin(0.5);

        const retry = this.add.text(400, 420, '[ Press ENTER to try again ]', {
            fontSize: '15px', fontFamily: 'monospace', color: '#DAA520'
        }).setOrigin(0.5);
        this.tweens.add({ targets: retry, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

        this.add.text(400, 455, '[ Press T to return to training ]', {
            fontSize: '12px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5);

        // Dark petals
        const colors = [0x8B4060, 0x6B3050, 0x5B2040];
        for (let i = 0; i < 10; i++) {
            const p = this.add.ellipse(Math.random() * 800, -10, 2 + Math.random() * 2, 1.5,
                Phaser.Utils.Array.GetRandom(colors)
            ).setAlpha(0.4).setDepth(10);
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
            this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('TrainingScene'));
        });
    }
}
