class TrainingScene extends Phaser.Scene {
    constructor() { super('TrainingScene'); }

    preload() {
        this.load.image('bg-training', 'assets/tiles/bg-training.png');
        this.load.image('makiwara', 'assets/tiles/makiwara.png');
        this.load.image('petal', 'assets/fx/petal.png');
        this.load.image('impact-punch', 'assets/fx/impact-punch.png');
        this.load.image('impact-kick', 'assets/fx/impact-kick.png');
        this.load.image('shield', 'assets/fx/shield.png');
        this.load.spritesheet('player', 'assets/sprites/player.png', {
            frameWidth: 48, frameHeight: 48
        });
        this.load.spritesheet('sensei', 'assets/sprites/sensei.png', {
            frameWidth: 32, frameHeight: 48
        });
    }

    create() {
        this.cameras.main.fadeIn(800);
        this.input.keyboard.removeAllListeners();
        const beltIndex = this.registry.get('beltIndex') || 0;
        this.beltIndex = beltIndex;
        this.currentBelt = BELTS[beltIndex];

        // If returning for higher belt, player already knows basic moves
        if (beltIndex > 0) {
            this.learned = { punch: true, kick: true, block: true };
        } else {
            this.learned = { punch: false, kick: false, block: false };
        }

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
        this.phase = beltIndex > 0 ? 'exam_ready' : 'learn';
        this.examSequence = [];
        this.examIndex = 0;
        this.examTimer = 0;
        this.examTimeLimit = this.currentBelt.examTime;
        this.examCorrect = 0;
        this.examRequired = this.currentBelt.examMoves;

        // Background
        this.add.image(400, 300, 'bg-training').setDepth(0);

        // Makiwara
        this.add.image(550, 415, 'makiwara').setDepth(3).setScale(2).setOrigin(0.5, 1);

        // Sensei
        this.senseiSprite = this.add.sprite(100, 430, 'sensei', 0).setDepth(4).setScale(2).setOrigin(0.5, 1);
        if (!this.anims.exists('sensei-idle')) {
            this.anims.create({ key: 'sensei-idle', frames: [{ key: 'sensei', frame: 0 }], frameRate: 1 });
            this.anims.create({ key: 'sensei-teaching', frames: [{ key: 'sensei', frame: 1 }], frameRate: 1 });
        }
        this.senseiSprite.play('sensei-idle');

        // Player sprite
        this.playerSprite = this.add.sprite(this.playerX, this.playerY, 'player', 0).setDepth(5).setScale(2).setOrigin(0.5, 1);
        if (this.currentBelt.color !== 0xFFFFFF) {
            this.playerSprite.setTint(this.currentBelt.color);
        }

        // Player animations (guarded for scene restart)
        if (!this.anims.exists('player-idle')) {
            this.anims.create({ key: 'player-idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1 });
            this.anims.create({ key: 'player-walk', frames: [{ key: 'player', frame: 1 }, { key: 'player', frame: 2 }], frameRate: 4, repeat: -1 });
            this.anims.create({ key: 'player-punch', frames: [{ key: 'player', frame: 3 }], frameRate: 1 });
            this.anims.create({ key: 'player-kick', frames: [{ key: 'player', frame: 4 }], frameRate: 1 });
            this.anims.create({ key: 'player-block', frames: [{ key: 'player', frame: 5 }], frameRate: 1 });
            this.anims.create({ key: 'player-hurt', frames: [{ key: 'player', frame: 6 }], frameRate: 1 });
        }
        this.playerSprite.play('player-idle');

        // Petals
        this.addPetals(15);

        // UI
        const fontFamily = '"Press Start 2P"';

        this.instructionText = this.add.text(400, 25, '', {
            fontSize: '10px', fontFamily: fontFamily, color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 14, y: 6 }, align: 'center'
        }).setOrigin(0.5).setDepth(20);

        this.feedbackText = this.add.text(400, 65, '', {
            fontSize: '10px', fontFamily: fontFamily, color: '#00ff00',
            backgroundColor: '#1A0A2Ecc', padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        this.statusText = this.add.text(10, 575, '', {
            fontSize: '8px', fontFamily: fontFamily, color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 8, y: 4 }
        }).setDepth(20);

        this.senseiSpeech = this.add.text(100, 370, '', {
            fontSize: '7px', fontFamily: fontFamily, color: '#3B2510',
            backgroundColor: '#F5E6C8dd', padding: { x: 8, y: 5 },
            align: 'center', wordWrap: { width: 130 }
        }).setOrigin(0.5).setDepth(20);

        // Exam UI (hidden initially)
        this.examMoveText = this.add.text(400, 200, '', {
            fontSize: '20px', fontFamily: fontFamily, color: '#FFD700',
            stroke: '#1A0A2E', strokeThickness: 4
        }).setOrigin(0.5).setDepth(20).setAlpha(0);

        this.examProgressText = this.add.text(400, 150, '', {
            fontSize: '9px', fontFamily: fontFamily, color: '#F5E6C8',
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

    // ==================== PLAYER POSE ====================
    setPlayerPose(pose) {
        this.currentPose = pose;
        this.playerSprite.play('player-' + pose);
    }

    // ==================== GAME LOGIC ====================
    update(time, delta) {
        if (this.actionCooldown > 0) this.actionCooldown -= delta;

        const speed = 3;
        let walking = false;
        if (this.keyA.isDown && this.playerX > 50) {
            this.playerX -= speed;
            this.playerSprite.setFlipX(true);
            walking = true;
        } else if (this.keyD.isDown && this.playerX < 750) {
            this.playerX += speed;
            this.playerSprite.setFlipX(false);
            walking = true;
        }

        // Play walk or idle animation (only when not performing action)
        if (this.actionCooldown <= 0) {
            if (walking && this.playerSprite.anims.currentAnim?.key !== 'player-walk') {
                this.playerSprite.play('player-walk');
            } else if (!walking && this.playerSprite.anims.currentAnim?.key !== 'player-idle') {
                this.playerSprite.play('player-idle');
            }
        }

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

        this.playerSprite.setPosition(this.playerX, this.playerY);

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
        this.setPlayerPose(move);
        this.actionCooldown = 500;
        this.showImpact(move);
        this.time.delayedCall(400, () => this.setPlayerPose('idle'));

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

        this.senseiSprite.play('sensei-teaching');

        this.updateUI();
        this.showFeedback('EXAM STARTED! Perform the moves!', '#FFD700');
    }

    tryExam(move) {
        const expected = this.examSequence[this.examIndex];
        if (move === expected) {
            this.examIndex++;
            this.examCorrect++;
            this.setPlayerPose(move);
            this.showImpact(move);
            this.actionCooldown = 400;
            this.time.delayedCall(300, () => this.setPlayerPose('idle'));

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
        this.senseiSprite.play('sensei-idle');
        this.updateUI();
    }

    examPass() {
        this.phase = 'passed';
        this.examMoveText.setAlpha(0);
        this.examProgressText.setAlpha(0);
        this.examTimerBg.setAlpha(0);
        this.examTimerBar.setAlpha(0);

        // Exam passed flash
        this.cameras.main.flash(500, 255, 215, 0);
        this.showFeedback('EXAM PASSED! Go face the ' + this.currentBelt.enemy.name + '!', '#FFD700');

        // Belt glow
        const glow = this.add.circle(this.playerX, this.playerY, 40, this.currentBelt.color, 0.2).setDepth(15);
        this.tweens.add({
            targets: glow, scaleX: 2, scaleY: 2, alpha: 0, duration: 1000,
            onComplete: () => glow.destroy()
        });

        this.senseiSprite.play('sensei-idle');
        this.updateUI();
    }

    showImpact(move) {
        const spriteKeys = { punch: 'impact-punch', kick: 'impact-kick', block: 'shield' };
        const fx = this.add.image(555, 385, spriteKeys[move]).setDepth(15);
        this.tweens.add({
            targets: fx, y: 345, alpha: 0, scaleX: 2, scaleY: 2,
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
        this.statusText.setText(this.currentBelt.kanji + ' ' + this.currentBelt.name + ' | ' + moves);

        if (this.phase === 'learn') {
            const next = this.getNextLesson();
            this.instructionText.setText(`Walk to makiwara (A/D) and press ${this.keyFor(next)} to learn ${next.toUpperCase()}`);
            const tips = {
                punch: '"Extend your fist!\nPress J!"',
                kick: '"Power from the hip!\nPress K!"',
                block: '"Guard yourself!\nHold L!"'
            };
            this.senseiSpeech.setText(tips[next]);
            this.senseiSprite.play('sensei-teaching');
        } else if (this.phase === 'exam_ready') {
            this.instructionText.setText(this.currentBelt.name + ' Belt Exam \u2014 Press ENTER to begin');
            this.senseiSpeech.setText('"Show me your\nmastery, student.\nPress ENTER."');
            this.senseiSprite.play('sensei-idle');
        } else if (this.phase === 'exam') {
            const move = this.examSequence[this.examIndex];
            this.examMoveText.setText(`${move.toUpperCase()}! (${this.keyFor(move)})`);
            this.examProgressText.setText(`Exam: ${this.examIndex}/${this.examRequired}`);
            this.instructionText.setText(`Perform: ${move.toUpperCase()} [${this.keyFor(move)}]`);
            this.senseiSpeech.setText(`"${move.toUpperCase()}!\nNow!"`);
        } else if (this.phase === 'passed') {
            this.instructionText.setText('Exam passed! Press ENTER to begin your adventure');
            this.senseiSpeech.setText('"You are ready.\nGo face the\n' + this.currentBelt.enemy.name + '."');
        }
    }

    addPetals(count) {
        for (let i = 0; i < count; i++) {
            const p = this.add.image(
                Math.random() * 800, -10 - Math.random() * 200, 'petal'
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
