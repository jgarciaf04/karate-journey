class IntroScene extends Phaser.Scene {
    constructor() { super('IntroScene'); }

    create() {
        this.registry.set('learnedMoves', { punch: false, kick: false, block: false });
        this.registry.set('beltIndex', 0);

        // ===== PAINTED LANDSCAPE BACKGROUND =====
        const bg = this.add.graphics();

        // Sky gradient (sunset/dawn)
        const skyColors = [
            [0x1B1035], [0x2A1545], [0x3D1F5C], [0x5C2D6E],
            [0x8B3A62], [0xB8475A], [0xD4644A], [0xE88844],
            [0xF0A848], [0xF5C060], [0xF8D878], [0xFAE8A0]
        ];
        for (let i = 0; i < skyColors.length; i++) {
            bg.fillStyle(skyColors[i][0]);
            bg.fillRect(0, i * 25, 800, 26);
        }

        // Mt. Fuji silhouette
        bg.fillStyle(0x2A1545, 0.9);
        bg.fillTriangle(500, 300, 650, 80, 800, 300);
        bg.fillStyle(0x3D1F5C, 0.7);
        bg.fillTriangle(480, 300, 640, 100, 780, 300);
        // Snow cap
        bg.fillStyle(0xFFFFFF, 0.6);
        bg.fillTriangle(620, 120, 650, 80, 680, 120);

        // Distant mountains
        bg.fillStyle(0x3D1F5C, 0.5);
        bg.fillTriangle(0, 300, 120, 180, 280, 300);
        bg.fillTriangle(200, 300, 350, 160, 500, 300);

        // Water / lake
        bg.fillStyle(0x1B2838, 0.8);
        bg.fillRect(0, 300, 800, 100);
        // Water reflections
        for (let i = 0; i < 20; i++) {
            bg.fillStyle(0xF0A848, 0.04);
            bg.fillRect(200 + i * 20, 310 + Math.sin(i) * 5, 15, 2);
            bg.fillRect(150 + i * 22, 340 + Math.cos(i) * 3, 12, 1);
        }

        // Hills and ground
        bg.fillStyle(0x1A3320);
        bg.fillEllipse(200, 400, 500, 200);
        bg.fillEllipse(650, 410, 400, 180);
        bg.fillStyle(0x152A1A);
        bg.fillRect(0, 400, 800, 200);

        // Cherry blossom trees (left and right framing)
        this.drawCherryTree(bg, 60, 380, 1.2);
        this.drawCherryTree(bg, 740, 390, 1.0);
        this.drawCherryTree(bg, 150, 400, 0.6);

        // Small pagoda silhouette
        bg.fillStyle(0x1A1A2E, 0.6);
        bg.fillRect(355, 260, 4, 30);
        bg.fillRect(345, 265, 24, 3);
        bg.fillRect(348, 270, 18, 3);
        bg.fillRect(350, 275, 14, 3);

        // Torii gate silhouette on the right
        bg.fillStyle(0x1A1A2E, 0.5);
        bg.fillRect(680, 280, 5, 25);
        bg.fillRect(710, 280, 5, 25);
        bg.fillRect(675, 278, 45, 4);
        bg.fillRect(678, 284, 39, 3);

        // ===== PARCHMENT SCROLL =====
        const scroll = this.add.graphics();
        // Outer shadow
        scroll.fillStyle(0x000000, 0.4);
        scroll.fillRoundedRect(65, 45, 680, 520, 8);
        // Parchment
        scroll.fillStyle(0xF5E6C8, 0.92);
        scroll.fillRoundedRect(60, 40, 680, 520, 8);
        // Decorative border
        scroll.lineStyle(3, 0x8B0000);
        scroll.strokeRoundedRect(60, 40, 680, 520, 8);
        scroll.lineStyle(1, 0xDAA520);
        scroll.strokeRoundedRect(72, 52, 656, 496, 6);

        // Corner ornaments (simple Japanese pattern)
        this.drawCornerOrnament(scroll, 75, 55);
        this.drawCornerOrnament(scroll, 715, 55);
        this.drawCornerOrnament(scroll, 75, 535);
        this.drawCornerOrnament(scroll, 715, 535);

        // Seigaiha wave pattern border (top)
        for (let x = 90; x < 720; x += 16) {
            scroll.lineStyle(1, 0xDAA520, 0.3);
            scroll.strokeCircle(x, 62, 6);
            scroll.strokeCircle(x + 8, 62, 6);
        }
        // Bottom pattern
        for (let x = 90; x < 720; x += 16) {
            scroll.lineStyle(1, 0xDAA520, 0.3);
            scroll.strokeCircle(x, 548, 6);
            scroll.strokeCircle(x + 8, 548, 6);
        }

        // ===== TITLE =====
        this.add.text(400, 95, '空手の旅', {
            fontSize: '40px', fontFamily: 'serif', color: '#8B0000'
        }).setOrigin(0.5);

        this.add.text(400, 140, 'KARATE JOURNEY', {
            fontSize: '22px', fontFamily: 'monospace', color: '#5C3A1E',
            fontStyle: 'bold', letterSpacing: 8
        }).setOrigin(0.5);

        // Decorative line under title
        scroll.lineStyle(2, 0x8B0000, 0.5);
        scroll.lineBetween(200, 162, 600, 162);
        scroll.fillStyle(0x8B0000);
        scroll.fillCircle(200, 162, 3);
        scroll.fillCircle(400, 162, 3);
        scroll.fillCircle(600, 162, 3);

        // ===== STORY TEXT =====
        const storyLines = [
            '',
            'In a land where cherry blossoms',
            'dance upon the mountain winds,',
            'a young warrior begins the path',
            'of the empty hand.',
            '',
            'Under the watchful eye of a master,',
            'you will learn the ancient art of Karate.',
            '',
            'But darkness lurks beyond the village...',
            'An Oni Demon terrorizes the peaceful people.',
            '',
            'Only through discipline and courage',
            'can you hope to defeat this evil.',
            '',
            '          あなたの旅が始まる',
            '       Your journey begins now.'
        ];

        const storyText = this.add.text(400, 340, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#3B2510',
            align: 'center', lineSpacing: 6
        }).setOrigin(0.5);

        const fullText = storyLines.join('\n');
        let charIdx = 0;
        let display = '';

        this.time.addEvent({
            delay: 30,
            callback: () => {
                if (charIdx < fullText.length) {
                    display += fullText[charIdx];
                    charIdx++;
                    storyText.setText(display);
                }
            },
            repeat: fullText.length - 1
        });

        // ===== CHERRY BLOSSOM PETALS =====
        this.addPetals(25);

        // ===== PROMPT =====
        const prompt = this.add.text(400, 530, '桜  Press ENTER to begin  桜', {
            fontSize: '13px', fontFamily: 'monospace', color: '#8B0000'
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
            targets: prompt, alpha: 1, duration: 800,
            delay: 5000, yoyo: true, repeat: -1
        });

        this.input.keyboard.on('keydown-ENTER', () => {
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('TrainingScene');
            });
        });
    }

    drawCherryTree(g, x, y, scale) {
        const s = scale;
        // Trunk
        g.fillStyle(0x3B2510);
        g.fillRect(x - 5 * s, y - 60 * s, 10 * s, 65 * s);
        g.fillStyle(0x2A1A0A);
        g.fillRect(x - 2 * s, y - 55 * s, 3 * s, 50 * s);
        // Branches
        g.fillStyle(0x3B2510);
        g.fillRect(x - 30 * s, y - 55 * s, 25 * s, 4 * s);
        g.fillRect(x + 5 * s, y - 50 * s, 20 * s, 3 * s);
        g.fillRect(x - 20 * s, y - 65 * s, 18 * s, 3 * s);
        // Blossom clusters
        const pinks = [0xFFB7C5, 0xFFC0CB, 0xFFAABB, 0xFF8FA8];
        for (let i = 0; i < 12; i++) {
            g.fillStyle(pinks[i % 4], 0.85);
            const bx = x + (Math.sin(i * 2.5) * 30 - 5) * s;
            const by = y - (50 + Math.cos(i * 1.8) * 20) * s;
            g.fillCircle(bx, by, (5 + Math.random() * 4) * s);
        }
        // White highlights
        for (let i = 0; i < 6; i++) {
            g.fillStyle(0xFFFFFF, 0.3);
            const bx = x + (Math.sin(i * 3) * 25) * s;
            const by = y - (55 + Math.cos(i * 2) * 15) * s;
            g.fillCircle(bx, by, 3 * s);
        }
    }

    drawCornerOrnament(g, x, y) {
        g.fillStyle(0x8B0000, 0.6);
        g.fillCircle(x, y, 4);
        g.lineStyle(1, 0x8B0000, 0.4);
        g.lineBetween(x - 6, y, x + 6, y);
        g.lineBetween(x, y - 6, x, y + 6);
    }

    addPetals(count) {
        const colors = [0xFFB7C5, 0xFFC0CB, 0xFFCCD5, 0xFF8FA8, 0xFFAABB];
        for (let i = 0; i < count; i++) {
            const petal = this.add.ellipse(
                Math.random() * 800, -10 - Math.random() * 200,
                2 + Math.random() * 3, 1.5 + Math.random() * 2,
                Phaser.Utils.Array.GetRandom(colors)
            ).setAlpha(0.5 + Math.random() * 0.4).setDepth(20);

            this.tweens.add({
                targets: petal,
                x: petal.x + 80 + Math.random() * 200,
                y: 620,
                angle: Math.random() * 540,
                duration: 5000 + Math.random() * 7000,
                delay: Math.random() * 6000,
                repeat: -1,
                onRepeat: () => { petal.x = Math.random() * 800; petal.y = -10; }
            });
        }
    }
}
