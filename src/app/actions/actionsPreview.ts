import { Action } from "./actionInterface";
import { MainScene } from "../scenes/mainScene";
import { ActionType } from "./actionTypeEnum";
export class ActionsPreview extends Phaser.GameObjects.Group {
  private static ACTION_REPLAY_BLINK_TIMESTEP: number = 340;
  private static ACTION_REPLAY_BLINK_OPACITY: number = 0.5;

  private previewActionsBlinkTimedEffect: Phaser.Time.TimerEvent;

  public constructor(scene: Phaser.Scene) {
    super(scene);
  }

  public clearActionsPreview(): void {
    if (this.previewActionsBlinkTimedEffect) {
      this.previewActionsBlinkTimedEffect.remove(false);
    }
    this.clear(true, true);
  }

  public previewActions(actions: Array<Action>): void {
    actions.forEach((action: Action): void => {
      this.previewAction(action);
    });

    let idx: number = 0;
    this.previewActionsBlinkTimedEffect = this.scene.time.addEvent({
      delay: ActionsPreview.ACTION_REPLAY_BLINK_TIMESTEP,
      startAt: ActionsPreview.ACTION_REPLAY_BLINK_TIMESTEP,
      callbackScope: this,
      loop: true,
      callback: (): void => {
        this.scene.tweens.add({
          targets: this.getChildren()[idx % this.getLength()],
          alpha: {
            getEnd: (): number => {
              return 1;
            },

            getStart: (): number => {
              return ActionsPreview.ACTION_REPLAY_BLINK_OPACITY;
            },
          },
          duration: ActionsPreview.ACTION_REPLAY_BLINK_TIMESTEP / 2,
          yoyo: true,
          ease: "Quad.easeOut",
        });
        idx += 1;
      },
    });
  }

  private previewAction(action: Action): void {
    let fromWorldPos: Phaser.Math.Vector2;
    let toWorldPos: Phaser.Math.Vector2;
    let midPoint: Phaser.Math.Vector2;
    let dir: Phaser.Math.Vector2;
    if (action.from) {
      fromWorldPos = (this.scene as MainScene).gridPosToWorldPos(action.from);
    }
    if (action.to) {
      toWorldPos = (this.scene as MainScene).gridPosToWorldPos(action.to);
    }
    if (action.from && action.to) {
      midPoint = fromWorldPos.clone().lerp(toWorldPos, 0.2);
      dir = action.to.clone().subtract(action.from);
    }
    switch (action.type) {
      case ActionType.MOVE: {
        const actionImage: Phaser.GameObjects.Image = this.scene.add.image(
          midPoint.x,
          midPoint.y,
          "moveIcon"
        );
        actionImage.setRotation(dir.angle());
        actionImage.setAlpha(ActionsPreview.ACTION_REPLAY_BLINK_OPACITY);
        this.add(actionImage);
        break;
      }
      case ActionType.ATTACK: {
        const actionContainer: Phaser.GameObjects.Container = this.scene.add.container(
          midPoint.x,
          midPoint.y
        );
        const actionImage: Phaser.GameObjects.Image = this.scene.add.image(
          0,
          0,
          "attackIcon"
        );
        actionImage.setRotation(dir.angle());
        actionImage.setAlpha(ActionsPreview.ACTION_REPLAY_BLINK_OPACITY);
        actionContainer.add(actionImage);

        const damagesText: Phaser.GameObjects.Text = this.scene.add
          .text(0, 0, action.damages.toString())
          .setOrigin(0.5, 0.4);
        actionContainer.add(damagesText);

        this.add(actionContainer);
        break;
      }
      case ActionType.PAWN_DESTROYED: {
        const actionImage: Phaser.GameObjects.Image = this.scene.add.image(
          fromWorldPos.x,
          fromWorldPos.y,
          "deathIcon"
        );
        actionImage.setAlpha(ActionsPreview.ACTION_REPLAY_BLINK_OPACITY);
        this.add(actionImage);
        break;
      }
    }
  }
}
