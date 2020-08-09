import * as Phaser from "phaser";

import { ManagerScene } from "./managerScene";
import { ResultScene } from "./resultScene";

export const run = (): void => {
  const scenes: Array<typeof Phaser.Scene> = [ManagerScene, ResultScene];

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
