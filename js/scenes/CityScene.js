class CityScene extends Phaser.Scene {
    constructor() { super('CityScene'); }

    create() {
        this.cameras.main.fadeIn(800);
        const WORLD_W = 2800;

        this.cameras.main.setBounds(0, 0, WORLD_W, 600);

        // ===== SKY (fixed) =====
        const sky = this.add.graphics().setScrollFactor(0);
        const skyC = [[0x87CEEB],[0x92D2EE],[0x9DD8F2],[0xA8DEF6],[0xB3E4FA],
                       [0xBEEAFE],[0xC9F0FF],[0xD4F6FF],[0xDFFCFF],[0xEAFFFF]];
        for (let i = 0; i < skyC.length; i++) {
            sky.fillStyle(skyC[i][0]); sky.fillRect(0, i * 22, 800, 23);
        }
        // Sun
        sky.fillStyle(0xFFEE88, 0.15); sky.fillCircle(650, 70, 60);
        sky.fillStyle(0xFFDD44, 0.5); sky.fillCircle(650, 70, 30);
        sky.fillStyle(0xFFFFAA); sky.fillCircle(650, 70, 16);
        // Clouds
        this.drawCloud(sky, 100, 50, 0.8);
        this.drawCloud(sky, 350, 30, 0.6);
        this.drawCloud(sky, 600, 60, 0.7);

        // ===== DISTANT MOUNTAINS (slow scroll) =====
        const mtns = this.add.graphics().setScrollFactor(0.1);
        mtns.fillStyle(0x7BA8C4, 0.4);
        for (let x = 0; x < WORLD_W; x += 300) {
            mtns.fillTriangle(x, 250, x + 150, 100 + Math.sin(x * 0.01) * 40, x + 300, 250);
        }

        // ===== FAR TREES (slow scroll) =====
        const farTrees = this.add.graphics().setScrollFactor(0.3);
        farTrees.fillStyle(0x3A6B3A, 0.6);
        for (let x = 0; x < WORLD_W; x += 25) {
            const h = 40 + Math.sin(x * 0.04) * 15;
            farTrees.fillTriangle(x - 12, 280, x, 280 - h, x + 12, 280);
        }

        // ===== MAIN WORLD GRAPHICS =====
        const world = this.add.graphics();

        // Ground
        world.fillStyle(0x6B9B5A);
        world.fillRect(0, 380, WORLD_W, 30);
        world.fillStyle(0x5A8B4A);
        world.fillRect(0, 400, WORLD_W, 15);

        // Stone path
        world.fillStyle(0xA0A0A0);
        world.fillRect(0, 460, WORLD_W, 35);
        world.fillStyle(0x909090);
        for (let x = 0; x < WORLD_W; x += 30) {
            world.fillRect(x, 462, 25, 14);
            world.fillRect(x + 12, 478, 25, 14);
        }
        world.fillStyle(0x888888);
        world.fillRect(0, 495, WORLD_W, 3);

        // Grass
        for (let x = 0; x < WORLD_W; x += 4) {
            world.fillStyle(x % 8 === 0 ? 0x6BAB5A : 0x4A8B3A);
            world.fillRect(x, 455 - (4 + Math.sin(x * 0.15) * 3), 2, 4 + Math.sin(x * 0.15) * 3);
        }

        // Ground bottom
        world.fillStyle(0x4A3428);
        world.fillRect(0, 498, WORLD_W, 102);

        // ===== VILLAGE ELEMENTS =====

        // Start area: player's house + cherry tree
        this.drawJapaneseHouse(world, 80, 400, 'small', '家');
        this.drawCherryTree(world, 200, 400, 0.9);

        // Village section
        this.drawCherryTree(world, 380, 395, 0.7);
        this.drawJapaneseHouse(world, 500, 398, 'medium', '茶屋');
        this.drawLantern(world, 450, 420);
        this.drawLantern(world, 620, 420);
        this.drawJapaneseHouse(world, 720, 400, 'small', '店');
        this.drawCherryTree(world, 850, 398, 0.8);

        // Market area
        this.drawJapaneseHouse(world, 1000, 396, 'large', '市場');
        this.drawLantern(world, 950, 418);
        this.drawLantern(world, 1100, 418);
        this.drawMarketStall(world, 1150, 438);
        this.drawMarketStall(world, 1250, 438);
        this.drawCherryTree(world, 1350, 400, 0.7);

        // Temple area
        this.drawTorii(world, 1500, 370, 1.0);
        this.drawJapaneseHouse(world, 1650, 394, 'temple', '寺');
        this.drawLantern(world, 1580, 418);
        this.drawLantern(world, 1750, 418);
        this.drawCherryTree(world, 1850, 395, 1.0);

        // Bridge over stream
        world.fillStyle(0x4488CC, 0.6);
        world.fillRect(1950, 470, 120, 20);
        world.fillStyle(0x8B6914);
        world.fillRect(1940, 458, 140, 8);
        world.fillRect(1940, 458, 4, 15);
        world.fillRect(2076, 458, 4, 15);
        // Railing
        world.fillRect(1940, 450, 140, 4);
        for (let x = 1950; x < 2080; x += 15) {
            world.fillRect(x, 450, 3, 12);
        }

        // Outskirts - getting darker
        this.drawCherryTree(world, 2150, 400, 0.6);
        this.drawJapaneseHouse(world, 2250, 400, 'small', '');

        // ===== DARK ZONE (demon territory) =====
        // Darkness gradient
        for (let i = 0; i < 15; i++) {
            world.fillStyle(0x0A0A1A, i * 0.05);
            world.fillRect(2350 + i * 30, 0, 35, 600);
        }

        // Dead trees
        world.fillStyle(0x2A1A0A);
        world.fillRect(2450, 350, 6, 60);
        world.fillRect(2447, 350, 12, 3);
        world.fillRect(2445, 360, 16, 3);
        world.fillRect(2550, 340, 6, 70);
        world.fillRect(2547, 340, 12, 3);

        // Evil torii (broken)
        world.fillStyle(0x440000);
        world.fillRect(2620, 360, 5, 50);
        world.fillRect(2680, 355, 5, 55);
        world.fillRect(2615, 358, 75, 5);

        // Ominous glow
        const demonGlow = this.add.circle(2700, 420, 50, 0x440000, 0.3);
        this.tweens.add({
            targets: demonGlow, scaleX: 1.4, scaleY: 1.4, alpha: 0.1,
            duration: 1000, yoyo: true, repeat: -1
        });

        // Demon silhouette hint
        world.fillStyle(0x220011, 0.5);
        world.fillRect(2685, 380, 30, 40);
        world.fillCircle(2700, 372, 14);

        this.add.text(2700, 340, '!!!', {
            fontSize: '22px', fontFamily: 'monospace', color: '#ff0000', fontStyle: 'bold',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        // ===== PLAYER =====
        this.playerX = 150;
        this.playerBaseY = 435;
        this.playerY = this.playerBaseY;
        this.velocityY = 0;
        this.isOnGround = true;
        this.triggered = false;

        this.playerContainer = this.add.container(this.playerX, this.playerY).setDepth(5);
        this.drawPlayer();

        this.cameras.main.startFollow(this.playerContainer, true, 0.08, 0);

        // Cherry blossom petals
        this.addPetals(20);

        // ===== UI (fixed to camera) =====
        this.add.text(400, 575, 'A/D: Walk   SPACE: Jump   → Walk right to find the demon', {
            fontSize: '11px', fontFamily: 'monospace', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

        this.add.text(10, 10, '黄帯 Yellow Belt  |  Moves: punch, kick, block', {
            fontSize: '11px', fontFamily: 'monospace', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 8, y: 4 }
        }).setScrollFactor(0).setDepth(20);

        // Lair trigger zone
        this.lairX = 2650;

        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keySpace = this.input.keyboard.addKey('SPACE');
    }

    update() {
        const speed = 3;
        if (this.keyA.isDown && this.playerX > 30) this.playerX -= speed;
        if (this.keyD.isDown && this.playerX < 2780) this.playerX += speed;

        if (Phaser.Input.Keyboard.JustDown(this.keySpace) && this.isOnGround) {
            this.velocityY = -10;
            this.isOnGround = false;
        }
        if (!this.isOnGround) {
            this.velocityY += 0.5;
            this.playerY += this.velocityY;
            if (this.playerY >= this.playerBaseY) {
                this.playerY = this.playerBaseY;
                this.velocityY = 0;
                this.isOnGround = true;
            }
        }

        this.playerContainer.setPosition(this.playerX, this.playerY);

        if (!this.triggered && this.playerX > this.lairX) {
            this.triggered = true;
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('FightScene');
            });
        }
    }

    // ===== DRAWING HELPERS =====
    drawJapaneseHouse(g, x, groundY, type, kanji) {
        let w, h, roofH;
        if (type === 'small') { w = 70; h = 50; roofH = 20; }
        else if (type === 'medium') { w = 100; h = 60; roofH = 25; }
        else if (type === 'large') { w = 130; h = 65; roofH = 28; }
        else { w = 120; h = 70; roofH = 35; } // temple

        const wallY = groundY - h;

        // Wall
        g.fillStyle(0xF5E6C8);
        g.fillRect(x - w / 2, wallY, w, h);
        // Wall lines (wood frame)
        g.lineStyle(1, 0xC8A878);
        g.lineBetween(x - w / 2, wallY + h / 3, x + w / 2, wallY + h / 3);
        g.lineBetween(x - w / 2, wallY + 2 * h / 3, x + w / 2, wallY + 2 * h / 3);
        g.lineBetween(x, wallY, x, wallY + h);

        // Roof (curved Japanese style)
        g.fillStyle(type === 'temple' ? 0x2A4A6B : 0x5C3A1E);
        // Main roof body
        g.fillRect(x - w / 2 - 10, wallY - roofH, w + 20, roofH);
        // Curved edges (stepped)
        g.fillRect(x - w / 2 - 14, wallY - roofH + 3, w + 28, 4);
        g.fillRect(x - w / 2 - 8, wallY - roofH - 2, w + 16, 5);
        // Ridge
        g.fillStyle(type === 'temple' ? 0x3A5A7B : 0x6C4A2E);
        g.fillRect(x - w / 2 - 6, wallY - roofH - 4, w + 12, 4);
        // Roof tile lines
        g.lineStyle(1, 0x000000, 0.15);
        for (let rx = x - w / 2 - 10; rx < x + w / 2 + 10; rx += 8) {
            g.lineBetween(rx, wallY - roofH, rx, wallY);
        }

        // Door (shoji style)
        g.fillStyle(0xD2B48C);
        g.fillRect(x - 8, wallY + h - 30, 16, 30);
        g.lineStyle(1, 0x8B6914);
        g.strokeRect(x - 8, wallY + h - 30, 16, 30);
        g.lineBetween(x, wallY + h - 30, x, wallY + h);
        g.lineBetween(x - 8, wallY + h - 15, x + 8, wallY + h - 15);

        // Windows (shoji grid)
        const winY = wallY + 10;
        this.drawShojiWindow(g, x - w / 4 - 2, winY, 14, 14);
        this.drawShojiWindow(g, x + w / 4 - 5, winY, 14, 14);

        // Kanji sign
        if (kanji) {
            g.fillStyle(0xF5E6C8);
            g.fillRect(x - 10, wallY - roofH - 16, 20, 12);
            g.lineStyle(1, 0x8B0000);
            g.strokeRect(x - 10, wallY - roofH - 16, 20, 12);
            this.add.text(x, wallY - roofH - 10, kanji, {
                fontSize: '8px', color: '#8B0000'
            }).setOrigin(0.5);
        }
    }

    drawShojiWindow(g, x, y, w, h) {
        g.fillStyle(0xFFF8F0);
        g.fillRect(x, y, w, h);
        g.lineStyle(1, 0x8B6914);
        g.strokeRect(x, y, w, h);
        g.lineBetween(x + w / 2, y, x + w / 2, y + h);
        g.lineBetween(x, y + h / 2, x + w, y + h / 2);
    }

    drawLantern(g, x, y) {
        // Pole
        g.fillStyle(0x333333);
        g.fillRect(x - 1, y - 25, 2, 30);
        // Lantern body
        g.fillStyle(0xCC3333);
        g.fillEllipse(x, y - 30, 10, 14);
        // Light glow
        g.fillStyle(0xFFAA33, 0.3);
        g.fillCircle(x, y - 30, 10);
        // Kanji on lantern
        g.fillStyle(0x000000, 0.3);
        g.fillRect(x - 1, y - 34, 2, 8);
    }

    drawTorii(g, x, y, s) {
        g.fillStyle(0xBB2020);
        g.fillRect(x - 25 * s, y, 6 * s, 50 * s);
        g.fillRect(x + 19 * s, y, 6 * s, 50 * s);
        g.fillRect(x - 30 * s, y - 4 * s, 60 * s, 6 * s);
        g.fillRect(x - 27 * s, y + 10 * s, 54 * s, 4 * s);
        // Top cap
        g.fillRect(x - 32 * s, y - 7 * s, 64 * s, 4 * s);
        // Gold accents
        g.fillStyle(0xDAA520);
        g.fillRect(x - 32 * s, y - 8 * s, 64 * s, 2 * s);
    }

    drawCherryTree(g, x, y, s) {
        g.fillStyle(0x3B2510);
        g.fillRect(x - 4 * s, y - 45 * s, 8 * s, 50 * s);
        g.fillRect(x - 20 * s, y - 40 * s, 16 * s, 3 * s);
        g.fillRect(x + 4 * s, y - 35 * s, 14 * s, 3 * s);
        g.fillRect(x - 15 * s, y - 50 * s, 12 * s, 3 * s);
        const pk = [0xFFB7C5, 0xFFC0CB, 0xFFAABB, 0xFF8FA8, 0xFFCCD5];
        for (let i = 0; i < 10; i++) {
            g.fillStyle(pk[i % 5], 0.85);
            g.fillCircle(
                x + Math.sin(i * 2.2) * 22 * s,
                y - (38 + Math.cos(i * 1.7) * 14) * s,
                (3.5 + Math.random() * 2.5) * s
            );
        }
        g.fillStyle(0xFFFFFF, 0.25);
        for (let i = 0; i < 5; i++) {
            g.fillCircle(x + Math.sin(i * 3) * 18 * s, y - (42 + Math.cos(i * 2) * 12) * s, 2 * s);
        }
    }

    drawMarketStall(g, x, y) {
        g.fillStyle(0x8B6914);
        g.fillRect(x - 20, y - 15, 40, 3);
        g.fillRect(x - 18, y - 12, 2, 15);
        g.fillRect(x + 16, y - 12, 2, 15);
        g.fillStyle(0xCC3333);
        g.fillRect(x - 22, y - 22, 44, 8);
        // Goods on table
        g.fillStyle(0x88CC44); g.fillCircle(x - 8, y - 16, 3);
        g.fillStyle(0xFFAA33); g.fillCircle(x, y - 16, 3);
        g.fillStyle(0xFF6644); g.fillCircle(x + 8, y - 16, 3);
    }

    drawCloud(g, x, y, s) {
        g.fillStyle(0xFFFFFF, 0.6);
        g.fillCircle(x, y, 16 * s);
        g.fillCircle(x + 18 * s, y - 4, 20 * s);
        g.fillCircle(x + 40 * s, y, 14 * s);
        g.fillCircle(x + 22 * s, y + 2, 18 * s);
    }

    drawPlayer() {
        const g = this.add.graphics();
        g.fillStyle(0x000000, 0.15); g.fillEllipse(0, 28, 22, 5);
        // Legs
        g.fillStyle(0xFFFFFF); g.fillRect(-5, 8, 5, 16); g.fillRect(1, 8, 5, 16);
        g.fillStyle(0xDEB887); g.fillRect(-6, 23, 6, 3); g.fillRect(0, 23, 6, 3);
        // Body
        g.fillStyle(0xFFFFFF); g.fillRect(-8, -14, 16, 25);
        // Belt (yellow - promoted!)
        g.fillStyle(0xDAA520); g.fillRect(-9, 0, 18, 3);
        // Arms
        g.fillStyle(0xFFFFFF); g.fillRect(-12, -10, 5, 14); g.fillRect(7, -10, 5, 14);
        g.fillStyle(0xDEB887); g.fillCircle(-10, 5, 2.5); g.fillCircle(10, 5, 2.5);
        // Head
        g.fillStyle(0xDEB887); g.fillCircle(0, -20, 8);
        g.fillStyle(0x1A1A2E); g.fillEllipse(0, -26, 14, 7);
        g.fillStyle(0xCC2222); g.fillRect(-8, -22, 16, 2); g.fillRect(-10, -23, 3, 6);
        g.fillStyle(0x1A1A2E); g.fillRect(-3, -20, 2, 2); g.fillRect(2, -20, 2, 2);
        this.playerContainer.add(g);
    }

    addPetals(count) {
        const colors = [0xFFB7C5, 0xFFC0CB, 0xFFCCD5, 0xFF8FA8];
        for (let i = 0; i < count; i++) {
            const sx = Math.random() * 2800;
            const p = this.add.ellipse(sx, -10 - Math.random() * 100,
                2 + Math.random() * 2, 1.5 + Math.random() * 1.5,
                Phaser.Utils.Array.GetRandom(colors)
            ).setAlpha(0.5 + Math.random() * 0.4).setDepth(18);
            this.tweens.add({
                targets: p, x: sx + 60 + Math.random() * 120, y: 620,
                angle: Math.random() * 400, duration: 5000 + Math.random() * 5000,
                delay: Math.random() * 4000, repeat: -1,
                onRepeat: () => { p.x = this.playerX - 400 + Math.random() * 800; p.y = -10; }
            });
        }
    }
}
