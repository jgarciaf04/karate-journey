class FightScene extends Phaser.Scene {
    constructor() { super('FightScene'); }

    preload() {
        this.load.image('bg-fight', 'assets/tiles/bg-fight.png');
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 32, frameHeight: 48 });
        this.load.spritesheet('hearts', 'assets/ui/hearts.png', { frameWidth: 16, frameHeight: 16 });
        this.load.image('impact-punch', 'assets/fx/impact-punch.png');
        this.load.image('impact-kick', 'assets/fx/impact-kick.png');
        this.load.image('shield', 'assets/fx/shield.png');
        this.load.image('petal', 'assets/fx/petal.png');

        // Load correct enemy sprite based on belt level
        const beltIndex = this.registry.get('beltIndex') || 0;
        const enemyType = BELTS[beltIndex].enemy.type;
        const isOni = enemyType === 'oni';
        const enemyKey = 'enemy-' + enemyType;
        this.load.spritesheet(enemyKey, 'assets/sprites/' + enemyKey + '.png', {
            frameWidth: isOni ? 48 : 32,
            frameHeight: isOni ? 64 : 48
        });
    }

    create() {
        this.cameras.main.fadeIn(800);
        this.input.keyboard.removeAllListeners();

        const beltIndex = this.registry.get('beltIndex') || 0;
        const belt = BELTS[beltIndex];

        // Player: 3 hearts (6 half), Monster: hearts from belt data (x2 for halves)
        this.playerHearts = 6;
        this.monsterHearts = belt.enemy.hearts * 2;
        this.monsterMaxHearts = belt.enemy.hearts;
        this.punchDmg = belt.punchDmg;
        this.kickDmg = belt.kickDmg;
        this.isBlocking = false;
        this.playerCooldown = 0;
        this.monsterAttackTimer = belt.enemy.atkInterval;
        this.monsterBaseAtkInterval = belt.enemy.atkInterval;
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
        this.monsterSpeed = belt.enemy.speed;
        this.monsterAttacking = false;

        // ===== BACKGROUND =====
        this.add.image(400, 300, 'bg-fight').setDepth(0);

        // ===== PLAYER SPRITE =====
        this.playerSprite = this.add.sprite(this.playerX, this.playerY, 'player', 0)
            .setDepth(5)
            .setScale(2)
            .setOrigin(0.5, 1);

        // Apply belt tint
        if (belt.color !== 0xFFFFFF) {
            this.playerSprite.setTint(belt.color);
        }

        // Player animations (single-frame each)
        if (!this.anims.exists('player-idle')) {
            this.anims.create({ key: 'player-idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1 });
            this.anims.create({ key: 'player-punch', frames: [{ key: 'player', frame: 1 }], frameRate: 1 });
            this.anims.create({ key: 'player-kick', frames: [{ key: 'player', frame: 2 }], frameRate: 1 });
            this.anims.create({ key: 'player-block', frames: [{ key: 'player', frame: 3 }], frameRate: 1 });
            this.anims.create({ key: 'player-hurt', frames: [{ key: 'player', frame: 4 }], frameRate: 1 });
        }

        this.playerSprite.play('player-idle');

        // ===== MONSTER SPRITE =====
        const enemyType = belt.enemy.type;
        const enemyKey = 'enemy-' + enemyType;
        this.enemyKey = enemyKey;

        this.monsterSprite = this.add.sprite(this.monsterX, this.monsterBaseY, enemyKey, 0)
            .setDepth(5)
            .setScale(2)
            .setOrigin(0.5, 1);

        // Enemy animations (single-frame each)
        const idleKey = enemyType + '-idle';
        const attackKey = enemyType + '-attack';
        this.enemyIdleKey = idleKey;
        this.enemyAttackKey = attackKey;

        if (!this.anims.exists(idleKey)) {
            this.anims.create({ key: idleKey, frames: [{ key: enemyKey, frame: 0 }], frameRate: 1 });
            this.anims.create({ key: attackKey, frames: [{ key: enemyKey, frame: 1 }], frameRate: 1 });
        }

        this.monsterSprite.play(idleKey);

        // Eye glow overlay - pulsing red tint on the monster
        this.eyeGlow = this.add.sprite(this.monsterX, this.monsterBaseY, enemyKey, 0)
            .setDepth(5)
            .setScale(2)
            .setOrigin(0.5, 1)
            .setTint(0xFF0000)
            .setAlpha(0.08)
            .setBlendMode(Phaser.BlendModes.ADD);

        this.tweens.add({
            targets: this.eyeGlow, alpha: 0.2, duration: 400,
            yoyo: true, repeat: -1
        });

        // Monster idle hover
        this.tweens.add({
            targets: [this.monsterSprite, this.eyeGlow],
            y: '-=4', duration: 800,
            yoyo: true, repeat: -1, ease: 'Sine.easeInOut'
        });

        // ===== HEARTS UI =====
        this.playerHeartSprites = [];
        for (let i = 0; i < 3; i++) {
            const heart = this.add.sprite(25 + i * 36, 28, 'hearts', 0)
                .setDepth(20).setScale(2);
            this.playerHeartSprites.push(heart);
        }

        this.monsterHeartSprites = [];
        for (let i = 0; i < 5; i++) {
            const heart = this.add.sprite(500 + i * 34, 18, 'hearts', 0)
                .setDepth(20).setScale(2);
            this.monsterHeartSprites.push(heart);
        }
        for (let i = 0; i < 5; i++) {
            const heart = this.add.sprite(500 + i * 34, 38, 'hearts', 0)
                .setDepth(20).setScale(2);
            this.monsterHeartSprites.push(heart);
        }

        this.updateHeartDisplay();

        // Labels
        this.add.text(75, 56, '\u3042\u306a\u305f (YOU)', {
            fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#F5E6C8'
        }).setOrigin(0.5).setDepth(20);
        this.add.text(625, 56, belt.enemy.kanji + ' ' + belt.enemy.name.toUpperCase(), {
            fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#ff8888'
        }).setOrigin(0.5).setDepth(20);

        // Controls UI
        this.add.text(400, 575, 'A/D: Move  SPACE: Jump  J: Punch  K: Kick  L: Block', {
            fontSize: '9px', fontFamily: '"Press Start 2P"', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 8, y: 4 }
        }).setOrigin(0.5).setDepth(20);

        this.actionText = this.add.text(400, 300, '', {
            fontSize: '20px', fontFamily: '"Press Start 2P"', color: '#FFD700',
            stroke: '#1A0A2E', strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        this.telegraphText = this.add.text(this.monsterX, 320, '', {
            fontSize: '14px', fontFamily: '"Press Start 2P"', color: '#ff4444',
            stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5).setAlpha(0).setDepth(20);

        // ===== BLOCK SHIELD =====
        this.blockShield = this.add.image(0, 0, 'shield')
            .setDepth(6)
            .setScale(2)
            .setAlpha(0.6)
            .setVisible(false);

        // ===== INPUT =====
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.keySpace = this.input.keyboard.addKey('SPACE');
        this.keyL = this.input.keyboard.addKey('L');
        this.input.keyboard.on('keydown-J', () => this.playerAttack('punch'));
        this.input.keyboard.on('keydown-K', () => this.playerAttack('kick'));

        // ===== IMPACT EFFECTS (pooled, hidden until needed) =====
        this.impactPunch = this.add.image(0, 0, 'impact-punch')
            .setDepth(15).setScale(2).setVisible(false);
        this.impactKick = this.add.image(0, 0, 'impact-kick')
            .setDepth(15).setScale(2).setVisible(false);

        // ===== PETALS =====
        this.addPetals(8);

        // ===== FIGHT SPLASH =====
        const ft = this.add.text(400, 260, '\u6226\u3044 FIGHT!', {
            fontSize: '36px', fontFamily: '"Press Start 2P"', color: '#CC2222',
            stroke: '#000000', strokeThickness: 5
        }).setOrigin(0.5).setDepth(30);
        this.tweens.add({
            targets: ft, scaleX: 1.4, scaleY: 1.4, alpha: 0,
            duration: 900, delay: 400, onComplete: () => ft.destroy()
        });
    }

    // ==================== HEART DISPLAY ====================
    updateHeartDisplay() {
        // Player hearts: 3 heart sprites, 6 half-hearts total
        for (let i = 0; i < 3; i++) {
            const fullThreshold = (i + 1) * 2;
            const halfThreshold = i * 2 + 1;
            if (this.playerHearts >= fullThreshold) {
                this.playerHeartSprites[i].setFrame(0); // full
            } else if (this.playerHearts >= halfThreshold) {
                this.playerHeartSprites[i].setFrame(1); // half
            } else {
                this.playerHeartSprites[i].setFrame(2); // empty
            }
        }

        // Monster hearts: up to 10 heart sprites
        const monsterHeartCount = this.monsterMaxHearts;
        for (let i = 0; i < this.monsterHeartSprites.length; i++) {
            if (i >= monsterHeartCount) {
                this.monsterHeartSprites[i].setVisible(false);
                continue;
            }
            this.monsterHeartSprites[i].setVisible(true);
            const fullThreshold = (i + 1) * 2;
            const halfThreshold = i * 2 + 1;
            if (this.monsterHearts >= fullThreshold) {
                this.monsterHeartSprites[i].setFrame(0); // full
            } else if (this.monsterHearts >= halfThreshold) {
                this.monsterHeartSprites[i].setFrame(1); // half
            } else {
                this.monsterHeartSprites[i].setFrame(2); // empty
            }
        }
    }

    // ==================== SET PLAYER POSE ====================
    setPlayerPose(pose) {
        const animKey = pose === 'hit' ? 'player-hurt' : 'player-' + pose;
        this.playerSprite.play(animKey);
        this.playerPose = pose;
    }

    // ==================== SHOW IMPACT EFFECT ====================
    showImpact(type, x, y) {
        const sprite = type === 'punch' ? this.impactPunch : this.impactKick;
        sprite.setPosition(x, y).setVisible(true).setAlpha(1);
        this.tweens.add({
            targets: sprite, alpha: 0, scaleX: 3, scaleY: 3,
            duration: 250, onComplete: () => {
                sprite.setVisible(false).setScale(2);
            }
        });
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

        this.playerSprite.setPosition(this.playerX, this.playerY);
        this.blockShield.setPosition(this.playerX, this.playerY - 24);

        // Block
        this.isBlocking = this.keyL.isDown && this.playerPose !== 'punch' && this.playerPose !== 'kick';
        if (this.isBlocking && this.playerPose !== 'block') this.setPlayerPose('block');
        else if (!this.isBlocking && this.playerPose === 'block') this.setPlayerPose('idle');
        this.blockShield.setVisible(this.isBlocking);

        // ===== MONSTER WALKS TOWARD PLAYER =====
        const dist = this.monsterX - this.playerX;
        if (dist > 70 && !this.monsterAttacking) {
            this.monsterX -= this.monsterSpeed;
        } else if (dist < 50) {
            this.monsterX += 0.3;
        }

        this.monsterSprite.setX(this.monsterX);
        this.eyeGlow.setX(this.monsterX);
        this.telegraphText.setX(this.monsterX);

        // Flash effects
        if (this.playerHitFlash > 0) {
            this.playerHitFlash -= delta;
            this.playerSprite.setAlpha(Math.sin(this.playerHitFlash * 0.02) > 0 ? 0.3 : 1);
            if (this.playerHitFlash <= 0) this.playerSprite.setAlpha(1);
        }
        if (this.monsterHitFlash > 0) {
            this.monsterHitFlash -= delta;
            this.monsterSprite.setAlpha(Math.sin(this.monsterHitFlash * 0.02) > 0 ? 0.3 : 1);
            if (this.monsterHitFlash <= 0) this.monsterSprite.setAlpha(1);
        }

        // Monster attack AI
        this.monsterAttackTimer -= delta;
        if (this.monsterAttackTimer <= 600 && !this.monsterTelegraph) {
            this.monsterTelegraph = true;
            this.telegraphText.setText('!! \u653b\u6483 !!').setAlpha(1);
            this.tweens.add({ targets: this.telegraphText, alpha: 0.3, duration: 120, yoyo: true, repeat: 3 });
        }
        if (this.monsterAttackTimer <= 0) {
            this.monsterAttack();
            this.monsterAttackTimer = this.monsterBaseAtkInterval * (0.8 + Math.random() * 0.6);
            this.monsterTelegraph = false;
            this.telegraphText.setAlpha(0);
        }

        this.updateHeartDisplay();
    }

    playerAttack(type) {
        if (this.gameOver || this.playerCooldown > 0) return;

        const dist = Math.abs(this.playerX - this.monsterX);
        let cooldown, label, range, heartDmg;

        if (type === 'punch') {
            cooldown = 400; label = 'PUNCH!'; range = 100; heartDmg = this.punchDmg;
        } else {
            cooldown = 750; label = 'KICK!'; range = 130; heartDmg = this.kickDmg;
        }

        if (dist > range) {
            this.showAction('TOO FAR!', '#888888', 360);
            this.playerCooldown = 200;
            return;
        }

        this.playerCooldown = cooldown;
        this.monsterHearts = Math.max(0, this.monsterHearts - heartDmg);
        this.monsterHitFlash = 300;

        this.setPlayerPose(type);
        this.time.delayedCall(300, () => { if (this.playerPose === type) this.setPlayerPose('idle'); });

        // Show monster attack frame briefly on hit for visual feedback
        this.monsterSprite.play(this.enemyAttackKey);
        this.time.delayedCall(200, () => { if (!this.gameOver) this.monsterSprite.play(this.enemyIdleKey); });

        this.showAction(label, '#FFD700', 450);

        // Show impact effect
        const hitX = this.monsterX - 20;
        const hitY = this.monsterBaseY - 40;
        this.showImpact(type, hitX, hitY);

        const dmgLabel = '-' + heartDmg;
        const dmg = this.add.text(this.monsterX, 360, dmgLabel, {
            fontSize: '12px', fontFamily: '"Press Start 2P"', color: '#ff4444',
            stroke: '#000', strokeThickness: 2
        }).setOrigin(0.5).setDepth(15);
        this.tweens.add({ targets: dmg, y: 310, alpha: 0, duration: 600, onComplete: () => dmg.destroy() });

        // Push monster back on hit
        this.monsterX += 20;
        this.tweens.add({
            targets: this.monsterSprite, x: this.monsterX + 8, duration: 50, yoyo: true, repeat: 2,
            onComplete: () => this.monsterSprite.setX(this.monsterX)
        });

        if (this.monsterHearts <= 0) this.endFight(true);
    }

    monsterAttack() {
        if (this.gameOver) return;

        // Monster attack animation
        this.monsterSprite.play(this.enemyAttackKey);
        this.time.delayedCall(400, () => { if (!this.gameOver) this.monsterSprite.play(this.enemyIdleKey); });

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
            this.setPlayerPose('hit');
            this.time.delayedCall(400, () => { if (!this.gameOver) this.setPlayerPose('idle'); });
        }

        this.playerHearts = Math.max(0, this.playerHearts);
        this.playerHitFlash = 300;

        this.tweens.add({
            targets: this.playerSprite, x: this.playerX - 15, duration: 50, yoyo: true, repeat: 2,
            onComplete: () => this.playerSprite.setX(this.playerX)
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
        for (let i = 0; i < count; i++) {
            const p = this.add.image(Math.random() * 800, -10 - Math.random() * 100, 'petal')
                .setScale(1 + Math.random())
                .setAlpha(0.3 + Math.random() * 0.3)
                .setDepth(18)
                .setTint(Phaser.Utils.Array.GetRandom([0xFFB7C5, 0xFFC0CB, 0xFFCCD5]));
            this.tweens.add({
                targets: p, x: p.x + 50 + Math.random() * 100, y: 620,
                angle: Math.random() * 360, duration: 5000 + Math.random() * 5000,
                delay: Math.random() * 4000, repeat: -1,
                onRepeat: () => { p.x = Math.random() * 800; p.y = -10; }
            });
        }
    }
}
