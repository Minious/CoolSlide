import * as Phaser from "phaser";

import { Level001 } from "./levels/level001";

export const run = (): void => {
  const scenes: Array<typeof Phaser.Scene> = [Level001];

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 700,
    height: 500,
    backgroundColor: "#DDD",
    parent: "game",
    // @ts-ignore
    pixelArt: true,
    scene: scenes,
  };

  // Creates the Phaser canvas and start the game
  // @ts-ignore: noUnusedLocals error
  const game: Phaser.Game = new Phaser.Game(config);
};
