import { Faction } from "./factionEnum";
import { PawnSprite } from "../pawnSprites/pawnSprite";
import { Grid } from "../grid/grid";

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
  private _attack: number;
  private _pawnSprite: PawnSprite;

  public constructor(
    pos: Phaser.Math.Vector2,
    faction: Faction,
    life: number,
    attack: number,
    pawnSprite?: PawnSprite
  ) {
    this._id = Pawn.nextId;
    Pawn.nextId += 1;
    this._pos = pos;
    this._faction = faction;
    this._maxLife = life;
    this._life = life;
    this._attack = attack;
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

  public set pawnSprite(pawnSprite: PawnSprite) {
    this._pawnSprite = pawnSprite;
  }

  public get faction(): Faction {
    return this._faction;
  }

  public get attack(): number {
    return this._attack;
  }

  public set grid(grid: Grid) {
    this._grid = grid;
  }

  public set life(life: number) {
    this._life = Math.max(0, life);
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
    pawnClone.pawnSprite = this.pawnSprite;
    pawnClone.life = this.life;
    return pawnClone;
  }

  protected abstract _createPawnSprite(
    scene: Phaser.Scene,
    x: number,
    y: number
  ): PawnSprite;

  protected abstract _clone(): Pawn;
}
