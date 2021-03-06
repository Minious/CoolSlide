import { Pawn } from "./pawn";
import { Soldier } from "./soldier";
import { Grappling } from "./grappling";
import { Assassin } from "./assassin";
import { Archer } from "./archer";
import { Warrior } from "./warrior";
import { PawnType } from "./pawnTypeEnum";

export const pawnFactory: (
  pawnType: PawnType,
  pos: Phaser.Math.Vector2
) => Pawn = (pawnType: PawnType, pos: Phaser.Math.Vector2): Pawn => {
  switch (pawnType) {
    case PawnType.Soldier: {
      return new Soldier(pos);
    }
    case PawnType.Grappling: {
      return new Grappling(pos);
    }
    case PawnType.Assassin: {
      return new Assassin(pos);
    }
    case PawnType.Archer: {
      return new Archer(pos);
    }
    case PawnType.Warrior: {
      return new Warrior(pos);
    }
  }
  return undefined;
};
