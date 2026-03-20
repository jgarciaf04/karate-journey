class CityScene extends Phaser.Scene {
    constructor() { super('CityScene'); }

    preload() {
        // Parallax background layers
        this.load.image('bg-city-sky', 'assets/tiles/bg-city-sky.png');
        this.load.image('bg-city-mountains', 'assets/tiles/bg-city-mountains.png');
        this.load.image('bg-city-trees', 'assets/tiles/bg-city-trees.png');
        this.load.image('bg-city-ground', 'assets/tiles/bg-city-ground.png');

        // Village tile sprites
        this.load.image('house-small', 'assets/tiles/house-small.png');
        this.load.image('house-medium', 'assets/tiles/house-medium.png');
        this.load.image('house-large', 'assets/tiles/house-large.png');
        this.load.image('temple', 'assets/tiles/temple.png');
        this.load.image('torii', 'assets/tiles/torii.png');
        this.load.image('lantern', 'assets/tiles/lantern.png');
        this.load.image('cherry-tree', 'assets/tiles/cherry-tree.png');
        this.load.image('market-stall', 'assets/tiles/market-stall.png');
        this.load.image('bridge', 'assets/tiles/bridge.png');
        this.load.image('dead-tree', 'assets/tiles/dead-tree.png');
        this.load.image('broken-torii', 'assets/tiles/broken-torii.png');

        // Player spritesheet (5 frames, 32x48 each)
        this.load.spritesheet('player', 'assets/sprites/player.png', {
            frameWidth: 32,
            frameHeight: 48
        });

        // Petal particle sprite
        this.load.image('petal', 'assets/fx/petal.png');
    }

    create() {
        this.cameras.main.fadeIn(800);
        const WORLD_W = 2800;

        this.cameras.main.setBounds(0, 0, WORLD_W, 600);

        // ===== PARALLAX BACKGROUND LAYERS =====

        // Sky (fixed, no scroll)
        this.add.image(400, 300, 'bg-city-sky').setScrollFactor(0);

        // Mountains (slow parallax)
        this.add.image(400, 375, 'bg-city-mountains').setScrollFactor(0.1);

        // Far trees (medium parallax)
        this.add.image(400, 375, 'bg-city-trees').setScrollFactor(0.3);

        // Ground layer (full scroll, 2800px wide centered at 1400)
        this.add.image(1400, 490, 'bg-city-ground').setScrollFactor(1.0);

        // ===== VILLAGE ELEMENTS =====

        // Start area: player's house + cherry tree
        this.add.image(80, 500, 'house-small').setOrigin(0.5, 1);
        this.add.image(200, 500, 'cherry-tree').setOrigin(0.5, 1);

        // Village section
        this.add.image(380, 500, 'cherry-tree').setOrigin(0.5, 1);
        this.add.image(500, 500, 'house-medium').setOrigin(0.5, 1);
        this.add.image(450, 500, 'lantern').setOrigin(0.5, 1);
        this.add.image(620, 500, 'lantern').setOrigin(0.5, 1);
        this.add.image(720, 500, 'house-small').setOrigin(0.5, 1);
        this.add.image(850, 500, 'cherry-tree').setOrigin(0.5, 1);

        // Market area
        this.add.image(1000, 500, 'house-large').setOrigin(0.5, 1);
        this.add.image(950, 500, 'lantern').setOrigin(0.5, 1);
        this.add.image(1100, 500, 'lantern').setOrigin(0.5, 1);
        this.add.image(1150, 500, 'market-stall').setOrigin(0.5, 1);
        this.add.image(1250, 500, 'market-stall').setOrigin(0.5, 1);
        this.add.image(1350, 500, 'cherry-tree').setOrigin(0.5, 1);

        // Temple area
        this.add.image(1500, 500, 'torii').setOrigin(0.5, 1);
        this.add.image(1650, 500, 'temple').setOrigin(0.5, 1);
        this.add.image(1580, 500, 'lantern').setOrigin(0.5, 1);
        this.add.image(1750, 500, 'lantern').setOrigin(0.5, 1);
        this.add.image(1850, 500, 'cherry-tree').setOrigin(0.5, 1);

        // Bridge over stream
        this.add.image(2010, 500, 'bridge').setOrigin(0.5, 1);

        // Outskirts - getting darker
        this.add.image(2150, 500, 'cherry-tree').setOrigin(0.5, 1);
        this.add.image(2250, 500, 'house-small').setOrigin(0.5, 1);

        // ===== DARK ZONE (demon territory) =====

        // Darkness overlay gradient - series of rectangles with increasing alpha
        for (let i = 0; i < 15; i++) {
            this.add.rectangle(2350 + i * 30 + 17, 300, 35, 600, 0x0A0A1A, i * 0.05);
        }

        // Dead trees
        this.add.image(2450, 500, 'dead-tree').setOrigin(0.5, 1);
        this.add.image(2550, 500, 'dead-tree').setOrigin(0.5, 1);

        // Broken torii
        this.add.image(2650, 500, 'broken-torii').setOrigin(0.5, 1);

        // Ominous glow (animated)
        const demonGlow = this.add.circle(2700, 420, 50, 0x440000, 0.3);
        this.tweens.add({
            targets: demonGlow, scaleX: 1.4, scaleY: 1.4, alpha: 0.1,
            duration: 1000, yoyo: true, repeat: -1
        });

        // "!!!" warning text
        this.add.text(2700, 340, '!!!', {
            fontSize: '22px', fontFamily: '"Press Start 2P"', color: '#ff0000',
            fontStyle: 'bold', stroke: '#000000', strokeThickness: 3
        }).setOrigin(0.5);

        // ===== PLAYER =====
        this.playerX = 150;
        this.playerBaseY = 435;
        this.playerY = this.playerBaseY;
        this.velocityY = 0;
        this.isOnGround = true;
        this.triggered = false;

        // Create player sprite from spritesheet, frame 0 (idle)
        const beltIndex = this.registry.get('beltIndex') || 0;
        const belt = BELTS[beltIndex];
        this.playerSprite = this.add.sprite(this.playerX, this.playerY, 'player', 0)
            .setDepth(5)
            .setScale(2)
            .setOrigin(0.5, 1);
        if (belt.color !== 0xFFFFFF) {
            this.playerSprite.setTint(belt.color);
        }

        // Define animations (guarded for scene restart)
        if (!this.anims.exists('player-idle')) {
            this.anims.create({ key: 'player-idle', frames: [{ key: 'player', frame: 0 }], frameRate: 1 });
            this.anims.create({ key: 'player-walk', frames: [{ key: 'player', frame: 1 }, { key: 'player', frame: 2 }], frameRate: 4, repeat: -1 });
        }
        this.playerSprite.play('player-idle');

        // Camera follows the player sprite
        this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0);

        // Cherry blossom petals
        this.addPetals(20);

        // ===== UI (fixed to camera) =====
        this.add.text(400, 575, 'A/D: Walk   SPACE: Jump   → Walk right to find the demon', {
            fontSize: '11px', fontFamily: '"Press Start 2P"', color: '#F5E6C8',
            backgroundColor: '#1A0A2Ecc', padding: { x: 10, y: 4 }
        }).setOrigin(0.5).setScrollFactor(0).setDepth(20);

        this.add.text(10, 10, belt.kanji + ' ' + belt.name + ' Belt  |  Moves: punch, kick, block', {
            fontSize: '11px', fontFamily: '"Press Start 2P"', color: '#F5E6C8',
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
        let walking = false;
        if (this.keyA.isDown && this.playerX > 30) {
            this.playerX -= speed;
            this.playerSprite.setFlipX(true);
            walking = true;
        }
        if (this.keyD.isDown && this.playerX < 2780) {
            this.playerX += speed;
            this.playerSprite.setFlipX(false);
            walking = true;
        }

        // Play walk or idle animation
        if (walking && this.playerSprite.anims.currentAnim?.key !== 'player-walk') {
            this.playerSprite.play('player-walk');
        } else if (!walking && this.playerSprite.anims.currentAnim?.key !== 'player-idle') {
            this.playerSprite.play('player-idle');
        }

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

        this.playerSprite.setPosition(this.playerX, this.playerY);

        if (!this.triggered && this.playerX > this.lairX) {
            this.triggered = true;
            this.cameras.main.fadeOut(800, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('FightScene');
            });
        }
    }

    addPetals(count) {
        for (let i = 0; i < count; i++) {
            const sx = Math.random() * 2800;
            const p = this.add.image(sx, -10 - Math.random() * 100, 'petal')
                .setAlpha(0.5 + Math.random() * 0.4)
                .setDepth(18);
            this.tweens.add({
                targets: p, x: sx + 60 + Math.random() * 120, y: 620,
                angle: Math.random() * 400, duration: 5000 + Math.random() * 5000,
                delay: Math.random() * 4000, repeat: -1,
                onRepeat: () => { p.x = this.playerX - 400 + Math.random() * 800; p.y = -10; }
            });
        }
    }
}
