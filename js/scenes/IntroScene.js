class IntroScene extends Phaser.Scene {
    constructor() { super('IntroScene'); }

    preload() {
        this.load.image('bg-intro', 'assets/tiles/bg-intro.png');
        this.load.image('parchment', 'assets/ui/parchment.png');
        this.load.image('petal', 'assets/fx/petal.png');
    }

    create() {
        this.input.keyboard.removeAllListeners();
        this.registry.set('learnedMoves', { punch: false, kick: false, block: false });
        this.registry.set('beltIndex', 0);

        // ===== PIXEL ART BACKGROUND =====
        this.add.image(400, 300, 'bg-intro');

        // ===== PARCHMENT SCROLL =====
        const parchmentImg = this.add.image(400, 300, 'parchment');
        parchmentImg.setDisplaySize(680, 520);

        // ===== TITLE =====
        this.add.text(400, 95, '空手の旅', {
            fontSize: '28px', fontFamily: '"Press Start 2P"', color: '#8B0000'
        }).setOrigin(0.5);

        this.add.text(400, 140, 'KARATE JOURNEY', {
            fontSize: '14px', fontFamily: '"Press Start 2P"', color: '#5C3A1E',
            letterSpacing: 4
        }).setOrigin(0.5);

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
            fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#3B2510',
            align: 'center', lineSpacing: 8
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
        const prompt = this.add.text(400, 530, 'Press ENTER to begin', {
            fontSize: '10px', fontFamily: '"Press Start 2P"', color: '#8B0000'
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

    addPetals(count) {
        for (let i = 0; i < count; i++) {
            const petal = this.add.image(
                Math.random() * 800, -10 - Math.random() * 200, 'petal'
            ).setAlpha(0.5 + Math.random() * 0.4)
             .setDepth(20)
             .setScale(0.4 + Math.random() * 0.6)
             .setTint(Phaser.Utils.Array.GetRandom([
                 0xFFB7C5, 0xFFC0CB, 0xFFCCD5, 0xFF8FA8, 0xFFAABB
             ]));

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
