import { Pawn } from "./pawn";
import { Soldier } from "./soldier";
import { Grappling } from "./grappling";
import { Assassin } from "./assassin";
import { Archer } from "./archer";
import { Warrior } from "./warrior";

export const pawnFactory: (a: typeof Pawn, b: Phaser.Math.Vector2) => Pawn = (
  pawnType: typeof Pawn,
  pos: Phaser.Math.Vector2
): Pawn => {
  switch (pawnType) {
    case Soldier: {
      return new Soldier(pos);
    }
    case Grappling: {
      return new Grappling(pos);
    }
    case Assassin: {
      return new Assassin(pos);
    }
    case Archer: {
      return new Archer(pos);
    }
    case Warrior: {
      return new Warrior(pos);
    }
  }
  return undefined;
};
