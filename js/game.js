// Belt progression data
const BELTS = [
    { name: 'White',  color: 0xFFFFFF, hex: '#FFFFFF', kanji: '白帯', examMoves: 3,  examTime: 3000, effectScale: 0,
      enemy: { name: 'Street Thug', kanji: '悪漢', hearts: 4,  speed: 0.25, atkInterval: 3200, type: 'thug' },
      punchDmg: 1, kickDmg: 2 },
    { name: 'Yellow', color: 0xDAA520, hex: '#DAA520', kanji: '黄帯', examMoves: 5,  examTime: 2800, effectScale: 0.2,
      enemy: { name: 'Bandit', kanji: '盗賊', hearts: 5,  speed: 0.3, atkInterval: 2900, type: 'bandit' },
      punchDmg: 1, kickDmg: 2 },
    { name: 'Orange', color: 0xFF8C00, hex: '#FF8C00', kanji: '橙帯', examMoves: 6,  examTime: 2600, effectScale: 0.35,
      enemy: { name: 'Warrior', kanji: '戦士', hearts: 6,  speed: 0.35, atkInterval: 2600, type: 'warrior' },
      punchDmg: 1, kickDmg: 2 },
    { name: 'Green',  color: 0x228B22, hex: '#228B22', kanji: '緑帯', examMoves: 7,  examTime: 2400, effectScale: 0.5,
      enemy: { name: 'Ninja', kanji: '忍者', hearts: 7,  speed: 0.45, atkInterval: 2300, type: 'ninja' },
      punchDmg: 2, kickDmg: 3 },
    { name: 'Blue',   color: 0x1E90FF, hex: '#1E90FF', kanji: '青帯', examMoves: 8,  examTime: 2200, effectScale: 0.7,
      enemy: { name: 'Samurai', kanji: '侍', hearts: 8,  speed: 0.5, atkInterval: 2000, type: 'samurai' },
      punchDmg: 2, kickDmg: 3 },
    { name: 'Brown',  color: 0x8B4513, hex: '#8B4513', kanji: '茶帯', examMoves: 9,  examTime: 2000, effectScale: 0.85,
      enemy: { name: 'Dark Monk', kanji: '暗僧', hearts: 9,  speed: 0.55, atkInterval: 1800, type: 'monk' },
      punchDmg: 2, kickDmg: 4 },
    { name: 'Black',  color: 0x111111, hex: '#111111', kanji: '黒帯', examMoves: 10, examTime: 1800, effectScale: 1.0,
      enemy: { name: 'Oni Demon', kanji: '鬼', hearts: 10, speed: 0.65, atkInterval: 1500, type: 'oni' },
      punchDmg: 3, kickDmg: 5 },
];

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    pixelArt: true,
    backgroundColor: '#0a0a1a',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
    },
    scene: [IntroScene, VillageScene, TrainingScene, CityScene, FightScene, VictoryScene, GameOverScene],
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);
