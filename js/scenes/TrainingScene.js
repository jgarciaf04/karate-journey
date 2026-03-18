class TrainingScene extends Phaser.Scene {
    constructor() { super('TrainingScene'); }

    create() {
        this.cameras.main.fadeIn(800);
        this.learned = { punch: false, kick: false, block: false };
        this.playerX = 250;
        this.playerBaseY = 440;
        this.playerY = this.playerBaseY;
        this.velocityY = 0;
        this.isOnGround = true;
        this.actionCooldown = 0;
        this.GRAVITY = 0.5;
        this.JUMP_FORCE = -10;
        this.currentPose = 'idle';

        // Phase: 'learn', 'exam_ready', 'exam', 'passed'
        this.phase = 'learn';
        this.examSequence = [];
        this.examIndex = 0;
        this.examTimer = 0;
        this.examTimeLimit = 2500;
        this.examCorrect = 0;
        this.examRequired = 5;

        this.drawBackground();
        this.drawMakiwara(550, 415);
        this.drawSenseiCharacter(100, 430);

        this.playerContainer = this.add.container(this.playerX, this.playerY).setDepth(5);
        this.drawPlayerPose('idle');

        this.addPetals(15);
        this.drawForegroundElements();

        // UI
        this.instructionText = this.add.text(400, 25, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 14, y: 6 }, align: 'center'
        }).setOrigin(0.5).setDepth(20);

        this.feedbackText = this.add.text(400, 65, '', {
            fontSize: '14px', fontFamily: 'monospace', color: '#00ff00',
            backgroundColor: '#1A0A2Ecc', padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        this.statusText = this.add.text(10, 575, '', {
            fontSize: '11px', fontFamily: 'monospace', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 8, y: 4 }
        }).setDepth(20);

        this.senseiSpeech = this.add.text(100, 370, '', {
            fontSize: '10px', fontFamily: 'monospace', color: '#3B2510',
            backgroundColor: '#F5E6C8dd', padding: { x: 8, y: 5 },
            align: 'center', wordWrap: { width: 130 }
        }).setOrigin(0.5).setDepth(20);

        // Exam UI (hidden initially)
        this.examMoveText = this.add.text(400, 200, '', {
            fontSize: '36px', fontFamily: 'monospace', color: '#FFD700',
            fontStyle: 'bold', stroke: '#1A0A2E', strokeThickness: 4
        }).setOrigin(0.5).setDepth(20).setAlpha(0);

        this.examProgressText = this.add.text(400, 150, '', {
            fontSize: '12px', fontFamily: 'monospace', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(20).setAlpha(0);

        this.examTimerBar = this.add.rectangle(400, 250, 200, 8, 0xDAA520).setDepth(20).setAlpha(0);
        this.examTimerBg = this.add.rectangle(400, 250, 204, 12, 0x333333).setDepth(19).setAlpha(0);

        this.updateUI();

        // Controls
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keySpace = this.input.keyboard.addKey('SPACE');
        this.input.keyboard.on('keydown-J', () => this.handleInput('punch'));
        this.input.keyboard.on('keydown-K', () => this.handleInput('kick'));
        this.input.keyboard.on('keydown-L', () => this.handleInput('block'));
        this.input.keyboard.on('keydown-ENTER', () => this.handleEnter());
    }

    // ==================== BACKGROUND ====================
    drawBackground() {
        const g = this.add.graphics();

        // Sky gradient (soft morning)
        const skyC = [[0x87CEEB],[0x98D8F0],[0xA8E0F5],[0xB8E8FA],[0xC8F0FF],
                       [0xD0F4FF],[0xD8F0F0],[0xE0EEE0],[0xD0DDB0],[0xC0CC90]];
        for (let i = 0; i < skyC.length; i++) {
            g.fillStyle(skyC[i][0]);
            g.fillRect(0, i * 22, 800, 23);
        }

        // Distant mountains (soft blue)
        g.fillStyle(0x7BA8C4, 0.5);
        g.fillTriangle(0, 240, 120, 140, 280, 240);
        g.fillTriangle(180, 240, 350, 110, 520, 240);
        g.fillTriangle(400, 240, 580, 130, 750, 240);
        g.fillStyle(0x8BB8D0, 0.3);
        g.fillTriangle(600, 240, 720, 160, 800, 240);

        // Mist layer
        g.fillStyle(0xDDEEDD, 0.3);
        g.fillRect(0, 220, 800, 30);

        // Far bamboo forest
        g.fillStyle(0x4A7A4A, 0.6);
        for (let x = 0; x < 800; x += 12) {
            g.fillRect(x, 200 + Math.sin(x * 0.05) * 10, 3, 70);
            // Bamboo leaves
            g.fillEllipse(x + 1, 200 + Math.sin(x * 0.05) * 10, 8, 4);
        }

        // Torii gate in background
        this.drawTorii(g, 680, 260, 0.6);

        // Mid-ground cherry trees
        this.drawCherryTree(g, 50, 340, 0.9);
        this.drawCherryTree(g, 720, 350, 0.7);

        // Ground layers
        g.fillStyle(0x5A8B4A);
        g.fillRect(0, 340, 800, 30);
        g.fillStyle(0x6B9B5A);
        g.fillRect(0, 360, 800, 20);
        g.fillStyle(0x7BAB6A);
        g.fillRect(0, 375, 800, 15);

        // Dirt training area
        g.fillStyle(0xC8A878);
        g.fillRect(150, 460, 500, 40);
        g.fillStyle(0xB89868);
        g.fillRect(150, 462, 500, 2);
        g.fillRect(150, 495, 500, 2);
        // Sand texture
        for (let x = 155; x < 645; x += 8) {
            g.fillStyle(0xD8B888, 0.5);
            g.fillRect(x, 470 + Math.sin(x * 0.1) * 2, 4, 2);
        }

        // Grass
        g.fillStyle(0x5A9B4A);
        g.fillRect(0, 388, 800, 75);
        // Grass blades
        for (let x = 0; x < 800; x += 4) {
            g.fillStyle(x % 8 === 0 ? 0x6BAB5A : 0x4A8B3A);
            const h = 5 + Math.sin(x * 0.15) * 3;
            g.fillRect(x, 458 - h, 2, h);
        }

        // Flowers
        const fColors = [0xFFB7C5, 0xFFD700, 0xFF8FA8, 0xAAAAFF];
        for (let i = 0; i < 12; i++) {
            const fx = 20 + Math.random() * 760;
            const fy = 445 + Math.random() * 12;
            g.fillStyle(0x228B22); g.fillRect(fx, fy, 1, 6);
            g.fillStyle(fColors[i % 4]); g.fillCircle(fx, fy, 2.5);
            g.fillStyle(0xFFFF88); g.fillCircle(fx, fy, 1);
        }

        // Stone lantern (tōrō)
        this.drawToro(g, 400, 445);

        // Ground bottom
        g.fillStyle(0x4A3428);
        g.fillRect(0, 498, 800, 102);
        g.fillStyle(0x3A2A1E);
        g.fillRect(0, 510, 800, 90);
    }

    drawTorii(g, x, y, s) {
        g.fillStyle(0x8B2020);
        g.fillRect(x - 20 * s, y, 5 * s, 40 * s);
        g.fillRect(x + 15 * s, y, 5 * s, 40 * s);
        g.fillRect(x - 25 * s, y - 3 * s, 50 * s, 5 * s);
        g.fillRect(x - 22 * s, y + 8 * s, 44 * s, 3 * s);
    }

    drawCherryTree(g, x, y, s) {
        g.fillStyle(0x3B2510);
        g.fillRect(x - 5 * s, y - 50 * s, 10 * s, 55 * s);
        g.fillRect(x - 25 * s, y - 45 * s, 20 * s, 3 * s);
        g.fillRect(x + 5 * s, y - 40 * s, 18 * s, 3 * s);
        const pinks = [0xFFB7C5, 0xFFC0CB, 0xFFAABB, 0xFF8FA8];
        for (let i = 0; i < 10; i++) {
            g.fillStyle(pinks[i % 4], 0.8);
            g.fillCircle(
                x + Math.sin(i * 2.2) * 25 * s,
                y - (42 + Math.cos(i * 1.7) * 16) * s,
                (4 + Math.random() * 3) * s
            );
        }
    }

    drawToro(g, x, y) {
        g.fillStyle(0x808080);
        g.fillRect(x - 6, y, 12, 4);
        g.fillRect(x - 3, y - 15, 6, 15);
        g.fillRect(x - 8, y - 18, 16, 4);
        g.fillStyle(0xFFAA33, 0.5);
        g.fillCircle(x, y - 10, 3);
    }

    drawForegroundElements() {
        const fg = this.add.graphics().setDepth(8);
        fg.fillStyle(0x5A9B4A);
        for (let x = 0; x < 800; x += 5) {
            const h = 4 + Math.sin(x * 0.2) * 2;
            fg.fillRect(x, 458 - h, 2, h);
        }
    }

    // ==================== MAKIWARA ====================
    drawMakiwara(x, y) {
        const g = this.add.graphics().setDepth(3);
        g.fillStyle(0x5C3A1E);
        g.fillRect(x - 5, y + 8, 10, 30);
        g.fillRect(x - 18, y + 34, 36, 5);
        g.fillStyle(0x8B6914);
        g.fillRect(x - 6, y - 45, 12, 70);
        g.lineStyle(1, 0x7A5A10);
        g.lineBetween(x - 3, y - 40, x - 3, y + 20);
        g.lineBetween(x + 2, y - 35, x + 2, y + 15);
        g.fillStyle(0xC8A84E);
        g.fillRect(x - 10, y - 30, 20, 25);
        g.fillStyle(0xB89840);
        g.fillRect(x - 10, y - 25, 20, 2);
        g.fillRect(x - 10, y - 17, 20, 2);
        g.fillRect(x - 10, y - 9, 20, 2);
        g.fillStyle(0x8B6914);
        g.fillRect(x - 25, y - 20, 50, 4);
        g.fillStyle(0xC8A84E);
        g.fillEllipse(x - 27, y - 18, 8, 6);
        g.fillEllipse(x + 27, y - 18, 8, 6);
        g.fillStyle(0xC8A84E);
        g.fillCircle(x, y - 38, 8);
        g.lineStyle(1, 0x8B0000);
        g.strokeCircle(x, y - 15, 7);
        g.fillStyle(0x8B0000);
        g.fillCircle(x, y - 15, 2.5);
    }

    // ==================== SENSEI ====================
    drawSenseiCharacter(x, y) {
        const g = this.add.graphics().setDepth(4);
        g.fillStyle(0x000000, 0.15);
        g.fillEllipse(x, y + 36, 28, 7);

        // Legs
        g.fillStyle(0xDDDDDD);
        g.fillRect(x - 8, y + 8, 7, 22);
        g.fillRect(x + 1, y + 8, 7, 22);
        g.fillStyle(0xDEB887);
        g.fillRect(x - 9, y + 28, 9, 4);
        g.fillRect(x, y + 28, 9, 4);

        // Body
        g.fillStyle(0xEEEEEE);
        g.fillRect(x - 12, y - 22, 24, 33);
        g.lineStyle(1, 0xCCCCCC);
        g.lineBetween(x, y - 18, x - 5, y + 8);
        g.lineBetween(x, y - 18, x + 5, y + 8);
        g.fillStyle(0xDDDDDD);
        g.fillTriangle(x - 10, y - 22, x, y - 10, x - 1, y - 22);
        g.fillTriangle(x + 10, y - 22, x, y - 10, x + 1, y - 22);

        // Black belt
        g.fillStyle(0x111111);
        g.fillRect(x - 14, y - 3, 28, 5);
        g.fillRect(x + 2, y - 5, 4, 9);
        g.fillRect(x + 4, y, 10, 3);

        // Arms (teaching pose - one pointing)
        g.fillStyle(0xEEEEEE);
        g.fillRect(x - 20, y - 16, 10, 7);
        g.fillRect(x - 18, y - 10, 6, 12);
        g.fillRect(x + 10, y - 18, 8, 6);
        g.fillRect(x + 16, y - 20, 16, 5);
        g.fillStyle(0xDEB887);
        g.fillCircle(x - 15, y + 2, 3.5);
        g.fillCircle(x + 33, y - 17, 3);

        // Head
        g.fillStyle(0xDEB887);
        g.fillCircle(x, y - 30, 12);
        g.fillStyle(0x888888);
        g.fillEllipse(x, y - 39, 18, 8);
        g.fillRect(x + 5, y - 38, 3, 10);
        g.fillStyle(0x555555);
        g.fillRect(x - 7, y - 35, 5, 2);
        g.fillRect(x + 2, y - 35, 5, 2);
        g.fillStyle(0x222222);
        g.fillRect(x - 5, y - 32, 3, 3);
        g.fillRect(x + 3, y - 32, 3, 3);
        g.fillStyle(0x999999);
        g.fillRect(x - 4, y - 22, 8, 4);
        g.fillTriangle(x - 3, y - 18, x + 3, y - 18, x, y - 14);
        g.fillStyle(0xBB7766);
        g.fillRect(x - 2, y - 24, 4, 1);
    }

    // ==================== PLAYER DRAWING ====================
    drawPlayerPose(pose) {
        this.playerContainer.removeAll(true);
        const g = this.add.graphics();
        g.fillStyle(0x000000, 0.15);
        g.fillEllipse(0, 36, 26, 6);

        if (pose === 'idle') this.pIdle(g);
        else if (pose === 'punch') this.pPunch(g);
        else if (pose === 'kick') this.pKick(g);
        else if (pose === 'block') this.pBlock(g);

        this.playerContainer.add(g);
        this.currentPose = pose;
    }

    pIdle(g) {
        g.fillStyle(0xEEEEEE); g.fillRect(-7, 12, 7, 20);
        g.fillStyle(0xFFFFFF); g.fillRect(1, 12, 7, 20);
        g.fillStyle(0xDEB887); g.fillRect(-8, 30, 8, 4); g.fillRect(0, 30, 8, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(-10, -18, 20, 33);
        g.lineStyle(1, 0xDDDDDD); g.lineBetween(0, -14, -5, 12); g.lineBetween(0, -14, 5, 12);
        g.fillStyle(0xFFFFFF); g.lineStyle(1, 0xCCCCCC);
        g.fillRect(-12, 0, 24, 4); g.strokeRect(-12, 0, 24, 4);
        g.fillRect(6, 1, 7, 3);
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
        g.fillStyle(0xFFFFFF); g.fillRect(-8, 0, 24, 4);
        g.fillStyle(0xEEEEEE); g.fillRect(-16, -10, 7, 6);
        g.fillStyle(0xDEB887); g.fillCircle(-13, -3, 3.5);
        // Extended punch
        g.fillStyle(0xFFFFFF); g.fillRect(12, -14, 8, 7); g.fillRect(18, -12, 26, 6);
        g.fillStyle(0xDEB887); g.fillRect(42, -14, 11, 10);
        g.fillStyle(0xCCA876); g.fillRect(43, -13, 2, 3); g.fillRect(46, -13, 2, 3); g.fillRect(49, -13, 2, 3);
        g.fillStyle(0xFFFF00, 0.8); g.fillCircle(55, -9, 7);
        g.fillStyle(0xFFFFFF, 0.5); g.fillCircle(55, -9, 3);
        g.lineStyle(2, 0xFFFF44, 0.6);
        g.lineBetween(55, -20, 55, -24); g.lineBetween(55, 2, 55, 6);
        g.lineBetween(63, -9, 67, -9);
        this.pHead(g, 3, -26);
    }

    pKick(g) {
        g.fillStyle(0xEEEEEE); g.fillRect(-6, 12, 7, 20);
        g.fillStyle(0xDEB887); g.fillRect(-7, 30, 8, 4);
        // Extended kick
        g.fillStyle(0xFFFFFF); g.fillRect(2, 6, 7, 8); g.fillRect(8, 1, 30, 7);
        g.fillStyle(0xDEB887); g.fillRect(36, -1, 13, 9);
        g.fillStyle(0xFF8800, 0.8); g.fillCircle(51, 4, 7);
        g.fillStyle(0xFFFFFF, 0.5); g.fillCircle(51, 4, 3);
        g.lineStyle(2, 0xFF8844, 0.6);
        g.lineBetween(51, -7, 51, -11); g.lineBetween(51, 15, 51, 19); g.lineBetween(59, 4, 63, 4);
        g.fillStyle(0xFFFFFF); g.fillRect(-12, -18, 20, 33);
        g.fillStyle(0xFFFFFF); g.fillRect(-14, 0, 24, 4);
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
        g.fillStyle(0xFFFFFF); g.fillRect(-12, 0, 24, 4);
        g.fillStyle(0xFFFFFF);
        g.fillRect(-14, -20, 8, 6); g.fillRect(-8, -22, 22, 7);
        g.fillRect(6, -18, 8, 6); g.fillRect(-6, -16, 22, 7);
        g.fillStyle(0xDEB887); g.fillCircle(14, -18, 4); g.fillCircle(-6, -12, 4);
        g.fillStyle(0x00AAFF, 0.12); g.fillCircle(4, -10, 25);
        g.lineStyle(2, 0x00AAFF, 0.3); g.strokeCircle(4, -10, 25);
        this.pHead(g, 0, -24);
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

    // ==================== GAME LOGIC ====================
    update(time, delta) {
        if (this.actionCooldown > 0) this.actionCooldown -= delta;

        const speed = 3;
        if (this.keyA.isDown && this.playerX > 50) this.playerX -= speed;
        else if (this.keyD.isDown && this.playerX < 750) this.playerX += speed;

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

        // Exam timer
        if (this.phase === 'exam') {
            this.examTimer -= delta;
            const pct = Math.max(0, this.examTimer / this.examTimeLimit);
            this.examTimerBar.setScale(pct, 1);
            this.examTimerBar.setX(300 + pct * 100);

            if (this.examTimer <= 0) {
                this.examFail('TOO SLOW!');
            }
        }
    }

    handleInput(move) {
        if (this.actionCooldown > 0) return;

        if (this.phase === 'learn') {
            this.tryLearn(move);
        } else if (this.phase === 'exam') {
            this.tryExam(move);
        }
    }

    handleEnter() {
        if (this.phase === 'exam_ready') {
            this.startExam();
        } else if (this.phase === 'passed') {
            this.cameras.main.fadeOut(800);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.registry.set('learnedMoves', this.learned);
                this.scene.start('CityScene');
            });
        }
    }

    isNearMakiwara() {
        return Math.abs(this.playerX - 550) < 100;
    }

    getNextLesson() {
        if (!this.learned.punch) return 'punch';
        if (!this.learned.kick) return 'kick';
        if (!this.learned.block) return 'block';
        return null;
    }

    tryLearn(move) {
        const next = this.getNextLesson();
        if (!next) return;
        if (!this.isNearMakiwara()) {
            this.showFeedback('Get closer to the makiwara! (D)', '#ffaa00');
            return;
        }
        if (move !== next) {
            this.showFeedback(`Learn ${next.toUpperCase()} first! (${this.keyFor(next)})`, '#ff4444');
            return;
        }
        this.learned[move] = true;
        this.showFeedback(`${move.toUpperCase()} learned!`, '#00ff88');
        this.drawPlayerPose(move);
        this.actionCooldown = 500;
        this.showImpact(move);
        this.time.delayedCall(400, () => this.drawPlayerPose('idle'));

        if (this.getNextLesson() === null) {
            this.phase = 'exam_ready';
        }
        this.updateUI();
    }

    startExam() {
        this.phase = 'exam';
        this.examSequence = [];
        const moves = ['punch', 'kick', 'block'];
        for (let i = 0; i < this.examRequired; i++) {
            this.examSequence.push(moves[Math.floor(Math.random() * 3)]);
        }
        this.examIndex = 0;
        this.examCorrect = 0;
        this.examTimer = this.examTimeLimit;

        this.examMoveText.setAlpha(1);
        this.examProgressText.setAlpha(1);
        this.examTimerBg.setAlpha(1);
        this.examTimerBar.setAlpha(1);

        this.updateUI();
        this.showFeedback('EXAM STARTED! Perform the moves!', '#FFD700');
    }

    tryExam(move) {
        const expected = this.examSequence[this.examIndex];
        if (move === expected) {
            this.examIndex++;
            this.examCorrect++;
            this.drawPlayerPose(move);
            this.showImpact(move);
            this.actionCooldown = 400;
            this.time.delayedCall(300, () => this.drawPlayerPose('idle'));

            if (this.examIndex >= this.examRequired) {
                this.examPass();
            } else {
                this.examTimer = this.examTimeLimit;
                this.showFeedback('GOOD!', '#00ff88');
            }
        } else {
            this.examFail('WRONG MOVE!');
        }
        this.updateUI();
    }

    examFail(reason) {
        this.showFeedback(`${reason} Exam failed. Try again!`, '#ff4444');
        this.cameras.main.shake(200, 0.008);
        this.phase = 'exam_ready';
        this.examMoveText.setAlpha(0);
        this.examProgressText.setAlpha(0);
        this.examTimerBg.setAlpha(0);
        this.examTimerBar.setAlpha(0);
        this.updateUI();
    }

    examPass() {
        this.phase = 'passed';
        this.examMoveText.setAlpha(0);
        this.examProgressText.setAlpha(0);
        this.examTimerBg.setAlpha(0);
        this.examTimerBar.setAlpha(0);

        // Belt promotion flash
        this.cameras.main.flash(500, 255, 215, 0);
        this.showFeedback('EXAM PASSED! You earned the Yellow Belt!', '#FFD700');

        // Belt glow
        const glow = this.add.circle(this.playerX, this.playerY, 40, 0xFFD700, 0.2).setDepth(15);
        this.tweens.add({
            targets: glow, scaleX: 2, scaleY: 2, alpha: 0, duration: 1000,
            onComplete: () => glow.destroy()
        });

        this.updateUI();
    }

    showImpact(move) {
        const labels = { punch: 'POW!', kick: 'WHAM!', block: 'GUARD!' };
        const colors = { punch: '#FFFF44', kick: '#FF8844', block: '#44AAFF' };
        const fx = this.add.text(555, 385, labels[move], {
            fontSize: '24px', fontFamily: 'monospace', color: colors[move],
            fontStyle: 'bold', stroke: '#1A0A2E', strokeThickness: 3
        }).setOrigin(0.5).setDepth(15);
        this.tweens.add({
            targets: fx, y: 345, alpha: 0, scaleX: 1.3, scaleY: 1.3,
            duration: 500, onComplete: () => fx.destroy()
        });
    }

    keyFor(move) { return { punch: 'J', kick: 'K', block: 'L' }[move]; }

    showFeedback(text, color) {
        this.feedbackText.setText(text).setColor(color).setAlpha(1);
        this.tweens.killTweensOf(this.feedbackText);
        this.tweens.add({ targets: this.feedbackText, alpha: 0, duration: 300, delay: 2000 });
    }

    updateUI() {
        const moves = [
            `Punch[J]:${this.learned.punch ? 'OK' : '--'}`,
            `Kick[K]:${this.learned.kick ? 'OK' : '--'}`,
            `Block[L]:${this.learned.block ? 'OK' : '--'}`
        ].join(' | ');
        this.statusText.setText(moves);

        if (this.phase === 'learn') {
            const next = this.getNextLesson();
            this.instructionText.setText(`Walk to makiwara (A/D) and press ${this.keyFor(next)} to learn ${next.toUpperCase()}`);
            const tips = {
                punch: '"Extend your fist!\nPress J!"',
                kick: '"Power from the hip!\nPress K!"',
                block: '"Guard yourself!\nHold L!"'
            };
            this.senseiSpeech.setText(tips[next]);
        } else if (this.phase === 'exam_ready') {
            this.instructionText.setText('All moves learned! Press ENTER to take the Sensei\'s exam');
            this.senseiSpeech.setText('"Show me what\nyou have learned.\nPress ENTER."');
        } else if (this.phase === 'exam') {
            const move = this.examSequence[this.examIndex];
            this.examMoveText.setText(`${move.toUpperCase()}! (${this.keyFor(move)})`);
            this.examProgressText.setText(`Exam: ${this.examIndex}/${this.examRequired}`);
            this.instructionText.setText(`Perform: ${move.toUpperCase()} [${this.keyFor(move)}]`);
            this.senseiSpeech.setText(`"${move.toUpperCase()}!\nNow!"`)
        } else if (this.phase === 'passed') {
            this.instructionText.setText('黄帯 Yellow Belt earned! Press ENTER to go to the village');
            this.senseiSpeech.setText('"You are ready.\nGo, young warrior.\nProtect our village."');
        }
    }

    addPetals(count) {
        const colors = [0xFFB7C5, 0xFFC0CB, 0xFFCCD5, 0xFF8FA8];
        for (let i = 0; i < count; i++) {
            const p = this.add.ellipse(
                Math.random() * 800, -10 - Math.random() * 200,
                2 + Math.random() * 2.5, 1.5 + Math.random() * 1.5,
                Phaser.Utils.Array.GetRandom(colors)
            ).setAlpha(0.5 + Math.random() * 0.4).setDepth(18);
            this.tweens.add({
                targets: p, x: p.x + 60 + Math.random() * 150, y: 620,
                angle: Math.random() * 400, duration: 5000 + Math.random() * 6000,
                delay: Math.random() * 5000, repeat: -1,
                onRepeat: () => { p.x = Math.random() * 800; p.y = -10; }
            });
        }
    }
}
