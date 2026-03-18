class FightScene extends Phaser.Scene {
    constructor() { super('FightScene'); }

    create() {
        this.cameras.main.fadeIn(800);

        // Player: 3 hearts (6 half), Monster: 10 hearts (20 half)
        this.playerHearts = 6;
        this.monsterHearts = 20;
        this.isBlocking = false;
        this.playerCooldown = 0;
        this.monsterAttackTimer = 2500;
        this.monsterTelegraph = false;
        this.gameOver = false;
        this.playerHitFlash = 0;
        this.monsterHitFlash = 0;
        this.playerPose = 'idle';

        this.playerX = 150;
        this.playerBaseY = 395;
        this.playerY = this.playerBaseY;
        this.velocityY = 0;
        this.isOnGround = true;
        this.GRAVITY = 0.5;
        this.JUMP_FORCE = -10;

        // Monster position - starts far right, walks toward player
        this.monsterX = 680;
        this.monsterBaseY = 385;
        this.monsterSpeed = 0.4;
        this.monsterAttacking = false;

        this.drawArenaBackground();

        this.playerContainer = this.add.container(this.playerX, this.playerY).setDepth(5);
        this.drawPlayerPose('idle');

        this.monsterContainer = this.add.container(this.monsterX, this.monsterBaseY).setDepth(5);
        this.drawMonster();

        // ===== HEARTS UI =====
        this.heartGfx = this.add.graphics().setDepth(20);
        this.drawAllHearts();

        // Labels
        this.add.text(75, 48, 'あなた (YOU)', {
            fontSize: '10px', fontFamily: 'monospace', color: '#F5E6C8'
        }).setOrigin(0.5).setDepth(20);
        this.add.text(625, 48, '鬼 ONI DEMON', {
            fontSize: '10px', fontFamily: 'monospace', color: '#ff8888'
        }).setOrigin(0.5).setDepth(20);

        // Controls UI
        this.add.text(400, 575, 'A/D: Move  SPACE: Jump/Dodge  J: Punch  K: Kick  L: Block', {
            fontSize: '11px', fontFamily: 'monospace', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(20);

        this.actionText = this.add.text(400, 300, '', {
            fontSize: '28px', fontFamily: 'monospace', color: '#FFD700',
            fontStyle: 'bold', stroke: '#1A0A2E', strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        this.telegraphText = this.add.text(this.monsterX, 320, '', {
            fontSize: '18px', fontFamily: 'monospace', color: '#ff4444',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        this.blockShield = this.add.graphics().setDepth(6);
        this.blockShield.fillStyle(0x00AAFF, 0.15);
        this.blockShield.fillCircle(0, 0, 32);
        this.blockShield.lineStyle(2, 0x00AAFF, 0.35);
        this.blockShield.strokeCircle(0, 0, 32);
        this.blockShield.setVisible(false);

        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keySpace = this.input.keyboard.addKey('SPACE');
        this.keyL = this.input.keyboard.addKey('L');
        this.input.keyboard.on('keydown-J', () => this.playerAttack('punch'));
        this.input.keyboard.on('keydown-K', () => this.playerAttack('kick'));

        // Petals (sparse, dark)
        this.addPetals(8);

        // FIGHT splash
        const ft = this.add.text(400, 260, '戦い FIGHT!', {
            fontSize: '52px', fontFamily: 'monospace', color: '#CC2222',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(30);
        this.tweens.add({
            targets: ft, scaleX: 1.4, scaleY: 1.4, alpha: 0,
            duration: 900, delay: 400, onComplete: () => ft.destroy()
        });

        // Monster idle hover
        this.tweens.add({
            targets: this.monsterContainer, y: this.monsterBaseY - 4, duration: 800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });
    }

    // ==================== ARENA ====================
    drawArenaBackground() {
        const g = this.add.graphics();

        // Night sky
        const skyC = [[0x0A0A1E],[0x0D0D25],[0x10102C],[0x141433],[0x18183A],
                       [0x1B1B40],[0x1E1E47],[0x22224E],[0x262655],[0x2A2A5C]];
        for (let i = 0; i < skyC.length; i++) {
            g.fillStyle(skyC[i][0]); g.fillRect(0, i * 20, 800, 21);
        }

        // Stars
        for (let i = 0; i < 50; i++) {
            g.fillStyle(0xFFFFFF, 0.2 + Math.random() * 0.6);
            g.fillCircle(Math.random() * 800, Math.random() * 180, Math.random() * 1.2 + 0.3);
        }

        // Moon
        g.fillStyle(0xFFEEAA, 0.06); g.fillCircle(680, 70, 80);
        g.fillStyle(0xFFEEAA, 0.12); g.fillCircle(680, 70, 50);
        g.fillStyle(0xFFEECC, 0.4); g.fillCircle(680, 70, 28);
        g.fillStyle(0xFFF8DD); g.fillCircle(680, 70, 18);
        g.fillStyle(0xEEDDBB); g.fillCircle(675, 66, 3); g.fillCircle(685, 76, 2);

        // Dark mountains
        g.fillStyle(0x0D0D20, 0.8);
        g.fillTriangle(0, 250, 150, 130, 350, 250);
        g.fillTriangle(250, 250, 450, 110, 650, 250);
        g.fillTriangle(500, 250, 700, 140, 800, 250);

        // Dark trees
        g.fillStyle(0x0A1A0A);
        for (let x = 0; x < 800; x += 28) {
            const h = 55 + Math.sin(x * 0.04) * 20;
            g.fillTriangle(x - 15, 280, x, 280 - h, x + 15, 280);
        }
        g.fillStyle(0x0D220D);
        for (let x = 12; x < 800; x += 40) {
            const h = 70 + Math.sin(x * 0.03) * 25;
            g.fillTriangle(x - 18, 320, x, 320 - h, x + 18, 320);
        }

        // Shrine ruins in background
        g.fillStyle(0x1A1A30, 0.6);
        g.fillRect(350, 230, 100, 60);
        g.fillRect(340, 224, 120, 8);
        g.fillRect(345, 218, 110, 8);
        g.fillRect(365, 230, 5, 50);
        g.fillRect(430, 235, 5, 45);

        // Broken torii
        g.fillStyle(0x441010);
        g.fillRect(100, 270, 5, 45);
        g.fillRect(140, 275, 5, 40);
        g.fillRect(95, 268, 55, 5);

        // Ground
        g.fillStyle(0x1A2F1A);
        g.fillRect(0, 310, 800, 30);
        g.fillStyle(0x162814);
        g.fillRect(0, 335, 800, 20);

        // Fighting ground
        g.fillStyle(0x2D1B00);
        g.fillRect(0, 350, 800, 25);
        g.fillStyle(0x3D2B10);
        g.fillRect(0, 410, 800, 10);

        // Dark grass
        g.fillStyle(0x1A3A1A);
        for (let x = 0; x < 800; x += 5) {
            g.fillRect(x, 348 - (4 + Math.sin(x * 0.2) * 2), 2, 4 + Math.sin(x * 0.2) * 2);
        }

        // Eerie fog
        g.fillStyle(0x335533, 0.05);
        g.fillRect(0, 280, 800, 80);

        // Ground bottom
        g.fillStyle(0x140A00);
        g.fillRect(0, 420, 800, 180);
        g.fillStyle(0x0A0500);
        g.fillRect(0, 450, 800, 150);

        // Ominous particles
        for (let i = 0; i < 8; i++) {
            const p = this.add.circle(
                Math.random() * 800, 300 + Math.random() * 100,
                1.5, 0x8844AA, 0.3
            );
            this.tweens.add({
                targets: p, y: p.y - 60, alpha: 0, duration: 2000 + Math.random() * 2000,
                delay: Math.random() * 3000, repeat: -1,
                onRepeat: () => { p.x = Math.random() * 800; p.y = 320 + Math.random() * 80; p.setAlpha(0.3); }
            });
        }
    }

    // ==================== HEARTS ====================
    drawAllHearts() {
        this.heartGfx.clear();
        // Player hearts (3)
        for (let i = 0; i < 3; i++) this.drawHeart(25 + i * 36, 28, i, this.playerHearts, 0xff2222);
        // Monster hearts (10) - two rows of 5
        for (let i = 0; i < 5; i++) this.drawHeart(500 + i * 34, 18, i, this.monsterHearts, 0x8844AA);
        for (let i = 0; i < 5; i++) this.drawHeart(500 + i * 34, 36, i + 5, this.monsterHearts, 0x8844AA);
    }

    drawHeart(x, y, idx, total, color) {
        const g = this.heartGfx;
        const s = 10;
        const leftIdx = idx * 2;
        const rightIdx = idx * 2 + 1;

        // Left half
        g.fillStyle(leftIdx < total ? color : 0x333333);
        g.fillCircle(x - s / 4, y - s / 4, s / 3);
        g.fillRect(x - s / 2, y - s / 4, s / 2, s / 2);
        g.fillTriangle(x - s / 2, y + s / 4, x, y + s / 4, x, y + s * 0.65);

        // Right half
        g.fillStyle(rightIdx < total ? color : 0x333333);
        g.fillCircle(x + s / 4, y - s / 4, s / 3);
        g.fillRect(x, y - s / 4, s / 2, s / 2);
        g.fillTriangle(x, y + s / 4, x + s / 2, y + s / 4, x, y + s * 0.65);

        // Outline
        g.lineStyle(1, 0x220011, 0.4);
        g.strokeCircle(x - s / 4, y - s / 4, s / 3);
        g.strokeCircle(x + s / 4, y - s / 4, s / 3);
    }

    // ==================== PLAYER ====================
    drawPlayerPose(pose) {
        this.playerContainer.removeAll(true);
        const g = this.add.graphics();
        g.fillStyle(0x000000, 0.15); g.fillEllipse(0, 36, 26, 6);

        if (pose === 'idle') this.pIdle(g);
        else if (pose === 'punch') this.pPunch(g);
        else if (pose === 'kick') this.pKick(g);
        else if (pose === 'block') this.pBlock(g);
        else if (pose === 'hit') this.pHit(g);

        this.playerContainer.add(g);
        this.playerPose = pose;
    }

    pIdle(g) {
        g.fillStyle(0xEEEEEE); g.fillRect(-7, 12, 7, 20);
        g.fillStyle(0xFFFFFF); g.fillRect(1, 12, 7, 20);
        g.fillStyle(0xDEB887); g.fillRect(-8, 30, 8, 4); g.fillRect(0, 30, 8, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(-10, -18, 20, 33);
        g.lineStyle(1, 0xDDDDDD); g.lineBetween(0, -14, -5, 12); g.lineBetween(0, -14, 5, 12);
        g.fillStyle(0xDAA520); g.fillRect(-12, 0, 24, 4); g.fillRect(6, 1, 7, 3);
        g.fillStyle(0xEEEEEE); g.fillRect(-16, -14, 8, 7); g.fillRect(-14, -8, 6, 12);
        g.fillStyle(0xFFFFFF); g.fillRect(8, -14, 8, 7); g.fillRect(10, -8, 6, 12);
        g.fillStyle(0xDEB887); g.fillCircle(-11, 5, 3.5); g.fillCircle(13, 5, 3.5);
        this.pHead(g, 0, -26);
    }

    pPunch(g) {
        g.fillStyle(0xEEEEEE); g.fillRect(-10, 12, 7, 20);
        g.fillStyle(0xFFFFFF); g.fillRect(3, 12, 7, 20);
        g.fillStyle(0xDEB887); g.fillRect(-11, 30, 8, 4); g.fillRect(2, 30, 8, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(-6, -18, 20, 33);
        g.fillStyle(0xDAA520); g.fillRect(-8, 0, 24, 4);
        g.fillStyle(0xEEEEEE); g.fillRect(-16, -10, 7, 6);
        g.fillStyle(0xDEB887); g.fillCircle(-13, -3, 3.5);
        g.fillStyle(0xFFFFFF); g.fillRect(12, -14, 8, 7); g.fillRect(18, -12, 28, 6);
        g.fillStyle(0xDEB887); g.fillRect(44, -15, 12, 11);
        g.fillStyle(0xCCA876); g.fillRect(45, -14, 2, 3); g.fillRect(48, -14, 2, 3); g.fillRect(51, -14, 2, 3);
        g.fillStyle(0xFFFF00, 0.8); g.fillCircle(58, -9, 8);
        g.fillStyle(0xFFFFFF, 0.5); g.fillCircle(58, -9, 4);
        g.lineStyle(2, 0xFFFF44, 0.7);
        g.lineBetween(58, -21, 58, -25); g.lineBetween(58, 3, 58, 7);
        g.lineBetween(66, -9, 70, -9); g.lineBetween(64, -16, 68, -19); g.lineBetween(64, -2, 68, 1);
        this.pHead(g, 3, -26);
    }

    pKick(g) {
        g.fillStyle(0xEEEEEE); g.fillRect(-6, 12, 7, 20);
        g.fillStyle(0xDEB887); g.fillRect(-7, 30, 8, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(2, 6, 7, 8); g.fillRect(8, 0, 32, 7);
        g.fillStyle(0xDEB887); g.fillRect(38, -2, 14, 10);
        g.fillStyle(0xFF8800, 0.8); g.fillCircle(54, 3, 8);
        g.fillStyle(0xFFFFFF, 0.5); g.fillCircle(54, 3, 4);
        g.lineStyle(2, 0xFF8844, 0.7);
        g.lineBetween(54, -9, 54, -13); g.lineBetween(54, 15, 54, 19);
        g.lineBetween(62, 3, 66, 3); g.lineBetween(60, -4, 64, -7); g.lineBetween(60, 10, 64, 13);
        g.fillStyle(0xFFFFFF); g.fillRect(-12, -18, 20, 33);
        g.fillStyle(0xDAA520); g.fillRect(-14, 0, 24, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(-18, -16, 8, 6); g.fillRect(-16, -10, 6, 10);
        g.fillRect(6, -16, 8, 6); g.fillRect(8, -10, 6, 10);
        g.fillStyle(0xDEB887); g.fillCircle(-13, 1, 3.5); g.fillCircle(11, 1, 3.5);
        this.pHead(g, -2, -26);
    }

    pBlock(g) {
        g.fillStyle(0xEEEEEE); g.fillRect(-10, 12, 7, 20);
        g.fillStyle(0xFFFFFF); g.fillRect(3, 12, 7, 20);
        g.fillStyle(0xDEB887); g.fillRect(-11, 30, 8, 4); g.fillRect(2, 30, 8, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(-10, -18, 20, 33);
        g.fillStyle(0xDAA520); g.fillRect(-12, 0, 24, 4);
        g.fillStyle(0xFFFFFF);
        g.fillRect(-14, -20, 8, 6); g.fillRect(-8, -22, 22, 7);
        g.fillRect(6, -18, 8, 6); g.fillRect(-6, -16, 22, 7);
        g.fillStyle(0xDEB887); g.fillCircle(14, -18, 4); g.fillCircle(-6, -12, 4);
        g.fillStyle(0x00AAFF, 0.12); g.fillCircle(4, -10, 26);
        g.lineStyle(2, 0x00AAFF, 0.3); g.strokeCircle(4, -10, 26);
        this.pHead(g, 0, -24);
    }

    pHit(g) {
        g.fillStyle(0xEEEEEE); g.fillRect(-10, 14, 7, 18);
        g.fillStyle(0xFFFFFF); g.fillRect(3, 10, 7, 22);
        g.fillStyle(0xDEB887); g.fillRect(-11, 30, 8, 4); g.fillRect(2, 30, 8, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(-12, -16, 20, 30);
        g.fillStyle(0xDAA520); g.fillRect(-14, 0, 24, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(-24, -12, 14, 6); g.fillRect(6, -8, 8, 6);
        g.fillStyle(0xDEB887); g.fillCircle(-23, -5, 3.5); g.fillCircle(7, -1, 3.5);
        // Hurt head
        g.fillStyle(0xDEB887); g.fillCircle(-2, -24, 11);
        g.fillStyle(0x1A1A2E); g.fillEllipse(-2, -31, 20, 10);
        g.fillStyle(0xCC2222); g.fillRect(-13, -28, 22, 3);
        g.lineStyle(2, 0x1A1A2E);
        g.lineBetween(-7, -26, -3, -22); g.lineBetween(-3, -26, -7, -22);
        g.lineBetween(1, -26, 5, -22); g.lineBetween(5, -26, 1, -22);
        g.fillStyle(0x1A1A2E); g.fillEllipse(-2, -18, 6, 4);
    }

    pHead(g, ox, oy) {
        g.fillStyle(0xDEB887); g.fillCircle(ox, oy, 11);
        g.fillStyle(0x1A1A2E); g.fillEllipse(ox, oy - 7, 20, 10);
        g.fillRect(ox - 10, oy - 10, 5, 8); g.fillRect(ox + 5, oy - 10, 5, 8);
        g.fillStyle(0xCC2222); g.fillRect(ox - 11, oy - 4, 22, 3); g.fillRect(ox - 14, oy - 5, 4, 8);
        g.fillStyle(0xFFFFFF); g.fillRect(ox - 6, oy - 1, 5, 4); g.fillRect(ox + 2, oy - 1, 5, 4);
        g.fillStyle(0x1A1A2E); g.fillRect(ox - 4, oy, 3, 3); g.fillRect(ox + 3, oy, 3, 3);
        g.fillRect(ox - 6, oy - 3, 5, 1.5); g.fillRect(ox + 2, oy - 3, 5, 1.5);
        g.fillStyle(0xBB7766); g.fillRect(ox - 2, oy + 5, 5, 2);
    }

    // ==================== MONSTER ====================
    drawMonster() {
        const g = this.add.graphics();
        g.fillStyle(0x000000, 0.2); g.fillEllipse(0, 48, 40, 9);

        // Legs
        g.fillStyle(0x4B1D6B);
        g.fillRect(-14, 20, 12, 24); g.fillRect(2, 20, 12, 24);
        g.fillStyle(0x333333);
        g.fillTriangle(-14, 44, -10, 38, -6, 44); g.fillTriangle(-6, 44, -2, 38, 2, 44);
        g.fillTriangle(2, 44, 6, 38, 10, 44); g.fillTriangle(10, 44, 14, 38, 18, 44);

        // Body
        g.fillStyle(0x6B2D8B); g.fillRect(-20, -35, 40, 58);
        g.lineStyle(1, 0x5B1D7B);
        g.lineBetween(-10, -25, -10, 15); g.lineBetween(10, -25, 10, 15);
        g.fillStyle(0x7B3D9B, 0.4); g.fillEllipse(0, -10, 24, 28);

        // Arms
        g.fillStyle(0x6B2D8B);
        g.fillRect(-38, -28, 20, 12); g.fillRect(18, -28, 20, 12);
        g.fillRect(-42, -18, 12, 16); g.fillRect(30, -18, 12, 16);
        g.fillStyle(0x7B3D9B); g.fillRect(-44, -4, 14, 8); g.fillRect(30, -4, 14, 8);
        g.fillStyle(0xCCCCCC);
        g.fillTriangle(-46, -4, -44, 0, -42, -4); g.fillTriangle(-40, -4, -38, 0, -36, -4);
        g.fillTriangle(30, -4, 32, 0, 34, -4); g.fillTriangle(36, -4, 38, 0, 40, -4);
        g.fillTriangle(42, -4, 44, 0, 46, -4);

        // Head
        g.fillStyle(0x8B3A62); g.fillCircle(0, -48, 18);
        // Horns
        g.fillStyle(0xAA3333);
        g.fillTriangle(-14, -64, -8, -48, -18, -50);
        g.fillTriangle(14, -64, 8, -48, 18, -50);
        g.fillStyle(0xDDDDDD);
        g.fillTriangle(-14, -66, -11, -58, -17, -58);
        g.fillTriangle(14, -66, 11, -58, 17, -58);
        // Face
        g.fillStyle(0x6B2A52); g.fillRect(-14, -56, 28, 5);
        g.fillStyle(0xFF0000); g.fillCircle(-7, -50, 4); g.fillCircle(7, -50, 4);
        g.fillStyle(0xFFFF00); g.fillCircle(-7, -50, 2); g.fillCircle(7, -50, 2);
        g.fillStyle(0xFFFFFF); g.fillCircle(-6, -51, 0.8); g.fillCircle(8, -51, 0.8);
        g.fillStyle(0x330000); g.fillRect(-10, -42, 20, 6);
        g.fillStyle(0xFFFFFF);
        g.fillTriangle(-8, -42, -5, -42, -6, -38); g.fillTriangle(-2, -42, 1, -42, 0, -38);
        g.fillTriangle(4, -42, 7, -42, 6, -38);
        g.fillTriangle(-7, -36, -4, -36, -5, -40); g.fillTriangle(4, -36, 7, -36, 6, -40);

        this.monsterContainer.add(g);

        // Eye glow
        const glow = this.add.circle(0, -50, 10, 0xFF0000, 0.08);
        this.monsterContainer.add(glow);
        this.tweens.add({ targets: glow, alpha: 0.2, duration: 400, yoyo: true, repeat: -1 });
    }

    // ==================== GAME LOOP ====================
    update(time, delta) {
        if (this.gameOver) return;

        if (this.playerCooldown > 0) this.playerCooldown -= delta;

        // Player movement
        const speed = 3;
        if (this.keyA.isDown && this.playerX > 40) this.playerX -= speed;
        else if (this.keyD.isDown && this.playerX < 700) this.playerX += speed;

        if (Phaser.Input.Keyboard.JustDown(this.keySpace) && this.isOnGround) {
            this.velocityY = this.JUMP_FORCE;
            this.isOnGround = false;
        }
        if (!this.isOnGround) {
            this.velocityY += this.GRAVITY;
            this.playerY += this.velocityY;
            if (this.playerY >= this.playerBaseY) {
                this.playerY = this.playerBaseY;
                this.velocityY = 0;
                this.isOnGround = true;
            }
        }

        this.playerContainer.setPosition(this.playerX, this.playerY);
        this.blockShield.setPosition(this.playerX, this.playerY);

        // Block
        this.isBlocking = this.keyL.isDown && this.playerPose !== 'punch' && this.playerPose !== 'kick';
        if (this.isBlocking && this.playerPose !== 'block') this.drawPlayerPose('block');
        else if (!this.isBlocking && this.playerPose === 'block') this.drawPlayerPose('idle');
        this.blockShield.setVisible(this.isBlocking);

        // ===== MONSTER WALKS TOWARD PLAYER =====
        const dist = this.monsterX - this.playerX;
        if (dist > 70 && !this.monsterAttacking) {
            this.monsterX -= this.monsterSpeed;
            this.monsterContainer.setX(this.monsterX);
        } else if (dist < 50) {
            // Too close, monster pushes forward
            this.monsterX += 0.3;
            this.monsterContainer.setX(this.monsterX);
        }

        this.telegraphText.setX(this.monsterX);

        // Flash effects
        if (this.playerHitFlash > 0) {
            this.playerHitFlash -= delta;
            this.playerContainer.setAlpha(Math.sin(this.playerHitFlash * 0.02) > 0 ? 0.3 : 1);
            if (this.playerHitFlash <= 0) this.playerContainer.setAlpha(1);
        }
        if (this.monsterHitFlash > 0) {
            this.monsterHitFlash -= delta;
            this.monsterContainer.setAlpha(Math.sin(this.monsterHitFlash * 0.02) > 0 ? 0.3 : 1);
            if (this.monsterHitFlash <= 0) this.monsterContainer.setAlpha(1);
        }

        // Monster attack AI
        this.monsterAttackTimer -= delta;
        if (this.monsterAttackTimer <= 600 && !this.monsterTelegraph) {
            this.monsterTelegraph = true;
            this.telegraphText.setText('!! 攻撃 !!').setAlpha(1);
            this.tweens.add({ targets: this.telegraphText, alpha: 0.3, duration: 120, yoyo: true, repeat: 3 });
        }
        if (this.monsterAttackTimer <= 0) {
            this.monsterAttack();
            this.monsterAttackTimer = 1800 + Math.random() * 1500;
            this.monsterTelegraph = false;
            this.telegraphText.setAlpha(0);
        }

        this.drawAllHearts();
    }

    playerAttack(type) {
        if (this.gameOver || this.playerCooldown > 0) return;

        const dist = Math.abs(this.playerX - this.monsterX);
        let cooldown, label, range, heartDmg;

        if (type === 'punch') {
            cooldown = 400; label = 'PUNCH!'; range = 100; heartDmg = 1; // half heart
        } else {
            cooldown = 750; label = 'KICK!'; range = 130; heartDmg = 2; // full heart
        }

        if (dist > range) {
            this.showAction('TOO FAR!', '#888888', 360);
            this.playerCooldown = 200;
            return;
        }

        this.playerCooldown = cooldown;
        this.monsterHearts = Math.max(0, this.monsterHearts - heartDmg);
        this.monsterHitFlash = 300;

        this.drawPlayerPose(type);
        this.time.delayedCall(300, () => { if (this.playerPose === type) this.drawPlayerPose('idle'); });

        this.showAction(label, '#FFD700', 450);

        const dmgLabel = heartDmg === 1 ? '-half' : '-heart';
        const dmg = this.add.text(this.monsterX, 360, dmgLabel, {
            fontSize: '16px', fontFamily: 'monospace', color: '#ff4444',
            fontStyle: 'bold', stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(15);
        this.tweens.add({ targets: dmg, y: 310, alpha: 0, duration: 600, onComplete: () => dmg.destroy() });

        // Push monster back on hit
        this.monsterX += 20;
        this.tweens.add({
            targets: this.monsterContainer, x: this.monsterX + 8, duration: 50, yoyo: true, repeat: 2,
            onComplete: () => this.monsterContainer.setX(this.monsterX)
        });

        if (this.monsterHearts <= 0) this.endFight(true);
    }

    monsterAttack() {
        if (this.gameOver) return;

        const dist = Math.abs(this.monsterX - this.playerX);
        if (dist > 120) {
            this.showAction('MISSED!', '#666666', 400);
            return;
        }

        if (!this.isOnGround) {
            this.showAction('DODGED!', '#00ff88', 400);
            return;
        }

        if (this.isBlocking) {
            this.playerHearts -= 1;
            this.showAction('BLOCKED! -half', '#00AAFF', 400);
            this.cameras.main.shake(100, 0.005);
        } else {
            this.playerHearts -= 2;
            this.showAction('HIT! -heart', '#ff2222', 400);
            this.cameras.main.shake(200, 0.01);
            this.drawPlayerPose('hit');
            this.time.delayedCall(400, () => { if (!this.gameOver) this.drawPlayerPose('idle'); });
        }

        this.playerHearts = Math.max(0, this.playerHearts);
        this.playerHitFlash = 300;

        this.tweens.add({
            targets: this.playerContainer, x: this.playerX - 15, duration: 50, yoyo: true, repeat: 2,
            onComplete: () => this.playerContainer.setX(this.playerX)
        });

        if (this.playerHearts <= 0) this.endFight(false);
    }

    showAction(text, color, y) {
        this.actionText.setText(text).setColor(color).setAlpha(1).setY(y);
        this.tweens.add({ targets: this.actionText, y: y - 40, alpha: 0, duration: 500 });
    }

    endFight(won) {
        this.gameOver = true;
        this.time.delayedCall(900, () => {
            this.cameras.main.fadeOut(800);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start(won ? 'VictoryScene' : 'GameOverScene');
            });
        });
    }

    addPetals(count) {
        const colors = [0xFFB7C5, 0xFFC0CB, 0xFFCCD5];
        for (let i = 0; i < count; i++) {
            const p = this.add.ellipse(Math.random() * 800, -10 - Math.random() * 100,
                2 + Math.random() * 2, 1 + Math.random() * 1.5,
                Phaser.Utils.Array.GetRandom(colors)
            ).setAlpha(0.3 + Math.random() * 0.3).setDepth(18);
            this.tweens.add({
                targets: p, x: p.x + 50 + Math.random() * 100, y: 620,
                angle: Math.random() * 360, duration: 5000 + Math.random() * 5000,
                delay: Math.random() * 4000, repeat: -1,
                onRepeat: () => { p.x = Math.random() * 800; p.y = -10; }
            });
        }
    }
}
