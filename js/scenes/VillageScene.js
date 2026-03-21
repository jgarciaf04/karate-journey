class VillageScene extends Phaser.Scene {
    constructor() { super('VillageScene'); }

    preload() {
        this.load.image('bg-village', 'assets/tiles/bg-village.png');
        this.load.image('petal', 'assets/fx/petal.png');
        this.load.spritesheet('player', 'assets/sprites/player.png', { frameWidth: 48, frameHeight: 48 });
        this.load.spritesheet('sensei', 'assets/sprites/sensei.png', { frameWidth: 32, frameHeight: 48 });
    }

    create() {
        this.cameras.main.fadeIn(800);
        this.input.keyboard.removeAllListeners();

        const beltIndex = this.registry.get('beltIndex') || 0;
        this.currentBelt = BELTS[beltIndex];

        // Background (scaled to fit 800x600)
        this.add.image(400, 300, 'bg-village').setDisplaySize(800, 600).setDepth(0);

        // Sensei starts near left side, will walk to the dojo door
        this.senseiSprite = this.add.sprite(180, 520, 'sensei', 0).setDepth(5).setScale(2).setOrigin(0.5, 1);
        if (!this.anims.exists('sensei-idle')) {
            this.anims.create({ key: 'sensei-idle', frames: [{ key: 'sensei', frame: 0 }], frameRate: 1 });
            this.anims.create({ key: 'sensei-teaching', frames: [{ key: 'sensei', frame: 1 }], frameRate: 1 });
        }
        this.senseiSprite.play('sensei-idle');

        // Player starts further left
        this.playerX = 100;
        this.playerY = 530;
        this.playerSprite = this.add.sprite(this.playerX, this.playerY, 'player', 0).setDepth(5).setScale(2).setOrigin(0.5, 1);
        if (this.currentBelt.color !== 0xFFFFFF) {
            this.playerSprite.setTint(this.currentBelt.color);
        }
        if (!this.anims.exists('player-idle')) {
            this.anims.create({ key: 'player-idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1 });
            this.anims.create({ key: 'player-walk', frames: [{ key: 'player', frame: 1 }, { key: 'player', frame: 2 }], frameRate: 4, repeat: -1 });
        }
        this.playerSprite.play('player-idle');

        // Petals
        this.addPetals(12);

        // UI - belt info
        this.add.text(10, 10, this.currentBelt.kanji + ' ' + this.currentBelt.name + ' Belt', {
            fontSize: '11px', fontFamily: '"Press Start 2P"', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 8, y: 4 }
        }).setDepth(20);

        // Controls hint
        this.controlsText = this.add.text(400, 575, 'A/D: Walk   Walk to the dojo door!', {
            fontSize: '8px', fontFamily: '"Press Start 2P"', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setDepth(20);

        // Sensei speech bubble
        this.senseiSpeech = this.add.text(180, 460, '"Follow me,\n young one."', {
            fontSize: '7px', fontFamily: '"Press Start 2P"', color: '#3B2510',
            backgroundColor: '#F5E6C8dd', padding: { x: 8, y: 5 },
            align: 'center'
        }).setOrigin(0.5).setDepth(20);

        // Phase: 'sensei_walks', 'player_follows', 'entering'
        this.phase = 'sensei_walks';
        this.senseiTargetX = 400; // dojo door center
        this.senseiAtDoor = false;
        this.triggered = false;

        // Door zone (center of the dojo gate in the background)
        this.doorX = 400;
        this.doorY = 500;

        // After brief pause, sensei starts walking
        this.time.delayedCall(1500, () => {
            this.senseiSpeech.setText('"Come, let us\n train."');
            this.phase = 'player_follows';

            // Sensei walks to door
            this.tweens.add({
                targets: this.senseiSprite,
                x: this.doorX, y: this.doorY,
                duration: 3000, ease: 'Linear',
                onComplete: () => {
                    this.senseiAtDoor = true;
                    this.senseiSpeech.setPosition(this.doorX, this.doorY - 60);
                    this.senseiSpeech.setText('"Enter the dojo.\nPress ENTER."');
                    this.senseiSprite.play('sensei-teaching');
                }
            });
        });

        // Controls
        this.keyA = this.input.keyboard.addKey('A');
        this.keyD = this.input.keyboard.addKey('D');
        this.input.keyboard.on('keydown-ENTER', () => this.enterDojo());
    }

    enterDojo() {
        if (!this.senseiAtDoor || this.triggered) return;
        // Player must be near the door
        const dist = Math.abs(this.playerX - this.doorX);
        if (dist > 80) {
            this.controlsText.setText('Get closer to the dojo door!');
            return;
        }
        this.triggered = true;
        this.controlsText.setText('');
        this.senseiSpeech.setText('');

        // Walk into door (scale down to simulate entering)
        this.tweens.add({
            targets: [this.playerSprite, this.senseiSprite],
            y: this.doorY - 30, scaleX: 1, scaleY: 1, alpha: 0,
            duration: 800, ease: 'Quad.easeIn'
        });

        this.cameras.main.fadeOut(1000, 0, 0, 0);
        this.cameras.main.once('camerafadeoutcomplete', () => {
            this.scene.start('TrainingScene');
        });
    }

    update() {
        if (this.phase !== 'player_follows' || this.triggered) return;

        const speed = 2.5;
        let walking = false;

        if (this.keyA.isDown && this.playerX > 30) {
            this.playerX -= speed;
            this.playerSprite.setFlipX(true);
            walking = true;
        } else if (this.keyD.isDown && this.playerX < 750) {
            this.playerX += speed;
            this.playerSprite.setFlipX(false);
            walking = true;
        }

        if (walking && this.playerSprite.anims.currentAnim?.key !== 'player-walk') {
            this.playerSprite.play('player-walk');
        } else if (!walking && this.playerSprite.anims.currentAnim?.key !== 'player-idle') {
            this.playerSprite.play('player-idle');
        }

        this.playerSprite.setX(this.playerX);

        // Update controls text when near door
        if (this.senseiAtDoor && Math.abs(this.playerX - this.doorX) < 80) {
            this.controlsText.setText('Press ENTER to enter the dojo');
        }
    }

    addPetals(count) {
        for (let i = 0; i < count; i++) {
            const p = this.add.image(Math.random() * 800, -10 - Math.random() * 100, 'petal')
                .setAlpha(0.5 + Math.random() * 0.4).setDepth(15);
            this.tweens.add({
                targets: p, x: p.x + 60 + Math.random() * 120, y: 620,
                angle: Math.random() * 400, duration: 5000 + Math.random() * 5000,
                delay: Math.random() * 4000, repeat: -1,
                onRepeat: () => { p.x = Math.random() * 800; p.y = -10; }
            });
        }
    }
}
