import { Pawn } from "./pawn";
import { Faction } from "./factionEnum";
import { GrapplingSprite } from "../pawnSprites/grapplingSprite";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Action } from "../actions/actionInterface";
import { PlayerPawn } from "./playerPawn";

export class Grappling extends PlayerPawn {
  public static MAX_LIFE: number = 3;
  public static ATTACK: number = 1;

  public constructor(pos: Phaser.Math.Vector2) {
    super(pos, Grappling.MAX_LIFE, Grappling.ATTACK);
  }

  public action(
    from: Phaser.Math.Vector2,
    dir: Phaser.Math.Vector2
  ): Array<Action> {
    const actions: Array<Action> = [];

    let to: Phaser.Math.Vector2 = from.clone().add(dir);
    while (this._grid.isPawnAlive(this) && this._grid.isCellFree(to)) {
      const enemyPawnsHit: Array<Pawn> = [];

      this.move(actions, from, to);

      const leftDir: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
        -dir.y,
        dir.x
      );
      const leftPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
        from.x + leftDir.x,
        from.y + leftDir.y
      );
      const leftCell: Pawn = this._grid.getCell(leftPos);
      const isLeftEnemy: boolean =
        leftCell && leftCell.faction === Faction.ENEMY;
      const rightDir: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
        dir.y,
        -dir.x
      );
      const rightPos: Phaser.Math.Vector2 = new Phaser.Math.Vector2(
        from.x + rightDir.x,
        from.y + rightDir.y
      );
      const rightCell: Pawn = this._grid.getCell(rightPos);
      const isRightEnemy: boolean =
        rightCell && rightCell.faction === Faction.ENEMY;

      if ((isLeftEnemy && !isRightEnemy) || (!isLeftEnemy && isRightEnemy)) {
        if (isLeftEnemy) {
          enemyPawnsHit.push(leftCell);
          this.attack(actions, leftCell);
          dir = leftDir;
        } else {
          enemyPawnsHit.push(rightCell);
          this.attack(actions, rightCell);
          dir = rightDir;
        }
      }

      this.enemiesReact(actions, from, to, enemyPawnsHit);

      from = to;
      to = from.clone().add(dir);
    }

    return actions;
  }

  protected _createPawnSprite(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): PawnSprite {
    return new GrapplingSprite(scene, x, y);
  }

  protected _clone(): Pawn {
    return new Grappling(this.pos ? this.pos.clone() : undefined);
  }
}
