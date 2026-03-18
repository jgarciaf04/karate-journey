class VictoryScene extends Phaser.Scene {
    constructor() { super('VictoryScene'); }

    create() {
        this.cameras.main.fadeIn(800);
        const cx = 400;

        // Dark background with stars
        const bg = this.add.graphics();
        for (let i = 0; i < 12; i++) {
            bg.fillStyle(Phaser.Display.Color.GetColor(8 + i * 2, 8 + i * 2, 20 + i * 3));
            bg.fillRect(0, i * 50, 800, 51);
        }
        for (let i = 0; i < 40; i++) {
            bg.fillStyle(0xFFFFAA, 0.3 + Math.random() * 0.5);
            bg.fillCircle(Math.random() * 800, Math.random() * 300, Math.random() * 1.5 + 0.3);
        }

        // Parchment scroll
        bg.fillStyle(0x000000, 0.3);
        bg.fillRoundedRect(105, 65, 600, 480, 8);
        bg.fillStyle(0xF5E6C8, 0.93);
        bg.fillRoundedRect(100, 60, 600, 480, 8);
        bg.lineStyle(3, 0x8B0000);
        bg.strokeRoundedRect(100, 60, 600, 480, 8);
        bg.lineStyle(1, 0xDAA520);
        bg.strokeRoundedRect(112, 72, 576, 456, 6);

        // Seigaiha pattern top
        for (let x = 120; x < 690; x += 14) {
            bg.lineStyle(1, 0xDAA520, 0.25);
            bg.strokeCircle(x, 80, 5);
        }

        // Title
        this.add.text(cx, 100, '勝利', {
            fontSize: '44px', fontFamily: 'serif', color: '#8B0000'
        }).setOrigin(0.5);

        const title = this.add.text(cx, 145, 'VICTORY!', {
            fontSize: '28px', fontFamily: 'monospace', color: '#DAA520', fontStyle: 'bold'
        }).setOrigin(0.5);
        this.tweens.add({ targets: title, scaleX: 1.05, scaleY: 1.05, duration: 600, yoyo: true, repeat: -1 });

        bg.lineStyle(2, 0x8B0000, 0.4);
        bg.lineBetween(250, 165, 550, 165);

        this.add.text(cx, 190, 'The Oni Demon has been vanquished!', {
            fontSize: '14px', fontFamily: 'monospace', color: '#3B2510'
        }).setOrigin(0.5);

        // Belt promotion section
        this.add.text(cx, 235, '帯昇進 BELT PROMOTION', {
            fontSize: '16px', fontFamily: 'monospace', color: '#5C3A1E', fontStyle: 'bold'
        }).setOrigin(0.5);

        // Old belt
        this.add.text(cx - 100, 275, 'White Belt', {
            fontSize: '13px', fontFamily: 'monospace', color: '#888888'
        }).setOrigin(0.5);
        bg.fillStyle(0xFFFFFF); bg.fillRect(cx - 130, 290, 60, 10);
        bg.lineStyle(1, 0xCCCCCC); bg.strokeRect(cx - 130, 290, 60, 10);

        // Arrow
        this.add.text(cx, 293, '>>>>', {
            fontSize: '14px', fontFamily: 'monospace', color: '#DAA520'
        }).setOrigin(0.5);

        // New belt (with glow)
        this.add.text(cx + 100, 275, 'Yellow Belt', {
            fontSize: '13px', fontFamily: 'monospace', color: '#B8860B', fontStyle: 'bold'
        }).setOrigin(0.5);
        bg.fillStyle(0xDAA520); bg.fillRect(cx + 70, 290, 60, 10);

        const beltGlow = this.add.circle(cx + 100, 295, 20, 0xDAA520, 0.15);
        this.tweens.add({ targets: beltGlow, scaleX: 1.5, scaleY: 1.5, alpha: 0, duration: 1000, yoyo: true, repeat: -1 });

        // Character with new belt
        const charG = this.add.graphics();
        // Body
        charG.fillStyle(0xFFFFFF); charG.fillRect(cx - 12, 360, 24, 40);
        charG.lineStyle(1, 0xDDDDDD);
        charG.lineBetween(cx, 366, cx - 5, 398); charG.lineBetween(cx, 366, cx + 5, 398);
        // Belt (yellow!)
        charG.fillStyle(0xDAA520); charG.fillRect(cx - 14, 380, 28, 5);
        charG.fillRect(cx + 6, 381, 8, 3);
        // Head
        charG.fillStyle(0xDEB887); charG.fillCircle(cx, 348, 12);
        charG.fillStyle(0x1A1A2E); charG.fillEllipse(cx, 341, 18, 8);
        charG.fillStyle(0xCC2222); charG.fillRect(cx - 10, 345, 20, 3);
        // Eyes (happy)
        charG.fillStyle(0x1A1A2E);
        charG.lineBetween(cx - 5, 350, cx - 3, 348); charG.lineBetween(cx - 3, 348, cx - 1, 350);
        charG.lineBetween(cx + 1, 350, cx + 3, 348); charG.lineBetween(cx + 3, 348, cx + 5, 350);
        // Legs
        charG.fillStyle(0xFFFFFF); charG.fillRect(cx - 9, 400, 7, 18); charG.fillRect(cx + 2, 400, 7, 18);
        charG.fillStyle(0xDEB887); charG.fillRect(cx - 10, 416, 8, 4); charG.fillRect(cx + 1, 416, 8, 4);
        // Arms raised (victory pose)
        charG.fillStyle(0xFFFFFF);
        charG.fillRect(cx - 18, 358, 8, 5); charG.fillRect(cx - 20, 346, 5, 14);
        charG.fillRect(cx + 10, 358, 8, 5); charG.fillRect(cx + 15, 346, 5, 14);
        charG.fillStyle(0xDEB887); charG.fillCircle(cx - 18, 344, 3.5); charG.fillCircle(cx + 18, 344, 3.5);

        // Celebration glow
        const glow = this.add.circle(cx, 385, 45, 0xDAA520, 0.1);
        this.tweens.add({ targets: glow, scaleX: 1.6, scaleY: 1.6, alpha: 0, duration: 1200, yoyo: true, repeat: -1 });

        this.add.text(cx, 450, 'あなたの空手の旅は続く...', {
            fontSize: '12px', fontFamily: 'monospace', color: '#8B0000'
        }).setOrigin(0.5);

        this.add.text(cx, 475, 'Your karate journey continues...', {
            fontSize: '13px', fontFamily: 'monospace', color: '#5C3A1E'
        }).setOrigin(0.5);

        const prompt = this.add.text(cx, 520, '桜 Press ENTER to play again 桜', {
            fontSize: '13px', fontFamily: 'monospace', color: '#8B0000'
        }).setOrigin(0.5);
        this.tweens.add({ targets: prompt, alpha: 0.3, duration: 600, yoyo: true, repeat: -1 });

        // Cherry blossoms
        const colors = [0xFFB7C5, 0xFFC0CB, 0xFFCCD5, 0xFF8FA8];
        for (let i = 0; i < 20; i++) {
            const p = this.add.ellipse(Math.random() * 800, -10 - Math.random() * 100,
                2 + Math.random() * 2.5, 1.5 + Math.random() * 1.5,
                Phaser.Utils.Array.GetRandom(colors)
            ).setAlpha(0.5 + Math.random() * 0.4).setDepth(15);
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
