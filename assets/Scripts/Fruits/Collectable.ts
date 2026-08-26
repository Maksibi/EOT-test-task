import { _decorator, Component, Prefab, Node, math, view, Vec3 } from 'cc';
import { CollectableData } from './CollectableData';
import { MovePattern } from '../Enums/MovePatterns';
import { GameSession } from '../Game/GameSession';
import { AudioManager } from '../Audio/AudioManager';

const { ccclass, property } = _decorator;

@ccclass('Collectable')
export class Collectable extends Component {
    private static readonly BASE_FALL_SPEED: number = 200;
    private static readonly ZIGZAG_AMPLITUDE: number = 80;
    private static readonly ZIGZAG_FREQ: number = 3;
    private static readonly ACCEL: number = 120;
    private static readonly DESPAWN_MARGIN: number = 80;

    private static readonly PATTERNS: readonly MovePattern[] = [
        MovePattern.Straight,
        MovePattern.Zigzag,
        MovePattern.WithAcceleration,
        MovePattern.WithRandomSpeed,
    ];

    /** Config prefab with CollectableData (serialized name kept for existing prefabs). */
    @property(Prefab)
    Data: Prefab | null = null;

    @property(Node)
    View: Node | null = null;

    private _movePattern: MovePattern = MovePattern.Straight;
    private _score: number = 0;
    private _speed: number = 0;
    private _livesDamage: number = 0;
    private _startX: number = 0;
    private _elapsed: number = 0;
    private _fallSpeed: number = 0;

    get isHarmful(): boolean {
        return this._livesDamage > 0;
    }

    start(): void {
        if (!this.View) {
            this.View = this.node.getChildByName('View');
        }
        this.applyConfig();
        this._startX = this.node.position.x;
        this._elapsed = 0;
    }

    collect(): void {
        const session: GameSession | null = GameSession.instance;
        if (!session?.isRunning) {
            return;
        }

        if (this._score !== 0) {
            session.addScore(this._score);
        }

        if (this.isHarmful) {
            session.damageLives(this._livesDamage);
            AudioManager.instance?.playBadCollectSfx();
        } else if (this._score !== 0) {
            AudioManager.instance?.playCollectSfx();
        }

        this.node.destroy();
    }

    update(deltaTime: number): void {
        if (!GameSession.instance?.isRunning) {
            return;
        }

        this._elapsed += deltaTime;
        this.applyMovement(deltaTime);
        this.despawnIfBelowScreen();
    }

    /** Kept for callers/tests that used the old name. */
    config(): void {
        this.applyConfig();
    }

    private applyConfig(): void {
        if (!this.Data) {
            return;
        }

        const data: CollectableData | null = this.Data.data.getComponent(CollectableData);
        if (!data) {
            return;
        }

        this._score = data.score;
        this._speed = data.speed;
        this._livesDamage = data.livesDamage;
        this._movePattern = Collectable.PATTERNS[
            math.randomRangeInt(0, Collectable.PATTERNS.length - 1)
        ];

        this._fallSpeed = Collectable.BASE_FALL_SPEED * this._speed;
        if (this._movePattern === MovePattern.WithRandomSpeed) {
            this._fallSpeed *= math.randomRange(0.7, 1.4);
        }
    }

    private applyMovement(deltaTime: number): void {
        const pos: Readonly<Vec3> = this.node.position;

        switch (this._movePattern) {
            case MovePattern.Zigzag: {
                const x: number = this._startX
                    + Math.sin(this._elapsed * Collectable.ZIGZAG_FREQ) * Collectable.ZIGZAG_AMPLITUDE;
                this.node.setPosition(x, pos.y - this._fallSpeed * deltaTime, pos.z);
                break;
            }
            case MovePattern.WithAcceleration: {
                this._fallSpeed += Collectable.ACCEL * deltaTime;
                this.node.setPosition(pos.x, pos.y - this._fallSpeed * deltaTime, pos.z);
                break;
            }
            case MovePattern.Straight:
            case MovePattern.WithRandomSpeed:
            default: {
                this.node.setPosition(pos.x, pos.y - this._fallSpeed * deltaTime, pos.z);
                break;
            }
        }
    }

    private despawnIfBelowScreen(): void {
        const bottomY: number = -view.getVisibleSize().height * 0.5 - Collectable.DESPAWN_MARGIN;
        if (this.node.position.y < bottomY) {
            this.node.destroy();
        }
    }
}
