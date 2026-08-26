import { _decorator, Component, Prefab, Node, math, view } from 'cc';
import { CollectableData } from './CollectableData';
import { MovePattern } from '../Enums/MovePatterns';
import { GameSession } from '../Game/GameSession';

const { ccclass, property } = _decorator;

@ccclass('Collectable')
export abstract class Collectable extends Component {

    private static readonly BASE_FALL_SPEED = 200;
    private static readonly ZIGZAG_AMPLITUDE = 80;
    private static readonly ZIGZAG_FREQ = 3;
    private static readonly ACCEL = 120;
    private static readonly DESPAWN_MARGIN = 80;

    @property(Prefab)
    Data: Prefab | null = null;

    @property(Node)
    View: Node | null = null;

    private readonly PATTERNS: MovePattern[] = [
        MovePattern.Straight,
        MovePattern.Zigzag,
        MovePattern.WithAcceleration,
        MovePattern.WithRandomSpeed,
    ];

    private _movePattern: MovePattern = MovePattern.Straight;
    private _score: number = 0;
    private _speed: number = 0;
    private _livesDamage: number = 0;

    private _startX: number = 0;
    private _elapsed: number = 0;
    private _fallSpeed: number = 0;

    start() {
        if (!this.View) {
            this.View = this.node.getChildByName('View');
        }
        this.config();
        this._startX = this.node.position.x;
        this._elapsed = 0;
    }

    config(): void {
        if (!this.Data) {
            return;
        }

        const data = this.Data.data.getComponent(CollectableData);
        if (!data) {
            return;
        }

        this._score = data.score;
        this._speed = data.speed;
        this._livesDamage = data.livesDamage;
        this._movePattern = this.PATTERNS[math.randomRangeInt(0, this.PATTERNS.length - 1)];

        this._fallSpeed = Collectable.BASE_FALL_SPEED * this._speed;
        if (this._movePattern === MovePattern.WithRandomSpeed) {
            this._fallSpeed *= math.randomRange(0.7, 1.4);
        }
    }

    collect(): void {
        const session = GameSession.instance;
        if (!session?.isRunning) {
            return;
        }

        if (this._score !== 0) {
            session.addScore(this._score);
        }
        if (this._livesDamage > 0) {
            session.damageLives(this._livesDamage);
        }

        this.node.destroy();
    }

    update(deltaTime: number) {
        const session = GameSession.instance;
        if (!session?.isRunning) {
            return;
        }

        this._elapsed += deltaTime;
        const pos = this.node.position;

        switch (this._movePattern) {
            case MovePattern.Zigzag: {
                const x = this._startX
                    + Math.sin(this._elapsed * Collectable.ZIGZAG_FREQ) * Collectable.ZIGZAG_AMPLITUDE;
                const y = pos.y - this._fallSpeed * deltaTime;
                this.node.setPosition(x, y, pos.z);
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

        const visibleSize = view.getVisibleSize();
        const bottomY = -visibleSize.height * 0.5 - Collectable.DESPAWN_MARGIN;
        if (this.node.position.y < bottomY) {
            this.node.destroy();
        }
    }
}
