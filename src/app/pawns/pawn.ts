import { Faction } from "./factionEnum";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Grid } from "../grid/grid";
import { ActionType } from "../actions/actionTypeEnum";
import { Action } from "../actions/actionInterface";
import { EnemyPawn } from "./enemyPawn";

export abstract class Pawn {
  private static nextId: number = 0;

  protected _grid: Grid;

  // @ts-ignore
  private _id: number;
  private _pos: Phaser.Math.Vector2;
  private _faction: Faction;
  // @ts-ignore
  private _maxLife: number;
  // @ts-ignore
  private _life: number;
  private _attackDamages: number;
  private _pawnSprite: PawnSprite;

  public constructor(
    pos: Phaser.Math.Vector2,
    faction: Faction,
    life: number,
    attackDamages: number,
    pawnSprite?: PawnSprite
  ) {
    this._id = Pawn.nextId;
    Pawn.nextId += 1;
    this._pos = pos;
    this._faction = faction;
    this._maxLife = life;
    this._life = life;
    this._attackDamages = attackDamages;
    this._pawnSprite = pawnSprite;
  }

  public get pos(): Phaser.Math.Vector2 {
    return this._pos;
  }

  public set pos(pos: Phaser.Math.Vector2) {
    this._pos = pos;
  }

  public get pawnSprite(): PawnSprite {
    return this._pawnSprite;
  }

  public get faction(): Faction {
    return this._faction;
  }

  public get attackDamages(): number {
    return this._attackDamages;
  }

  public get life(): number {
    return this._life;
  }

  public set grid(grid: Grid) {
    this._grid = grid;
  }

  public changeLife(lifeChange: number): Array<Action> {
    this._life = Math.max(0, this._life + lifeChange);

    if (this._life <= 0) {
      const deathAction: Action = {
        type: ActionType.PAWN_DESTROYED,
        from: this.pos.clone(),
        targetPawnSprite: this.pawnSprite,
      };
      this._grid.destroyPawn(this);

      return [deathAction];
    }

    return [];
  }

  public resetPos(): void {
    this._pos = undefined;
  }

  public createPawnSprite(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): PawnSprite {
    this._pawnSprite = this._createPawnSprite(scene, x, y);
    return this._pawnSprite;
  }

  public clone(): Pawn {
    const pawnClone: Pawn = this._clone();
    pawnClone._pawnSprite = this._pawnSprite;
    pawnClone._life = this._life;
    return pawnClone;
  }

  protected attack(actions: Array<Action>, targetPawn: Pawn): void {
    actions.push({
      type: ActionType.ATTACK,
      from: this.pos.clone(),
      to: targetPawn.pos.clone(),
      fromPawnSprite: this.pawnSprite,
      targetPawnSprite: targetPawn.pawnSprite,
      attackingFaction: this.faction,
      targetPawnNewLife: targetPawn.life - this._attackDamages,
      damages: this._attackDamages,
    });
    const deathActions: Array<Action> = targetPawn.changeLife(
      -this._attackDamages
    );
    deathActions.forEach((deathAction: Action): void => {
      actions.push(deathAction);
    });
  }

  protected enemiesReact(
    actions: Array<Action>,
    from: Phaser.Math.Vector2,
    to: Phaser.Math.Vector2,
    enemyPawnsHit: Array<Pawn>
  ): void {
    this._grid.getEnemyPawns().forEach((pawn: EnemyPawn): void => {
      const pawnHit: boolean =
        enemyPawnsHit.filter(
          (otherPawn: EnemyPawn): boolean => pawn === otherPawn
        ).length > 0;
      const currentReactActions: Array<Action> = pawn.react(from, to, pawnHit);
      currentReactActions.forEach((reactAction: Action): void => {
        actions.push(reactAction);
      });
    });
  }

  protected move(
    actions: Array<Action>,
    from: Phaser.Math.Vector2,
    to: Phaser.Math.Vector2
  ): void {
    this._grid.movePawn(from, to);
    actions.push({
      type: ActionType.MOVE,
      from: from.clone(),
      to: to.clone(),
      fromPawnSprite: this.pawnSprite,
    });
  }

  protected abstract _createPawnSprite(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): PawnSprite;

  protected abstract _clone(): Pawn;
}
