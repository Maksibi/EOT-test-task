import { _decorator, Component, Node, Prefab, instantiate, math, view, Size } from 'cc';
import { GameSession } from '../Game/GameSession';

const { ccclass, property } = _decorator;

interface SpawnPosition {
    x: number;
    y: number;
    z: number;
}

@ccclass('FruitSpawner')
export class FruitSpawner extends Component {
    private static readonly SPAWN_Y_OFFSET: number = 80;
    private static readonly SPAWN_X_PADDING: number = 60;

    @property([Prefab])
    fruitPrefabs: Prefab[] = [];

    /** Fallback when `fruitPrefabs` is empty. */
    @property(Prefab)
    fruitPrefab: Prefab | null = null;

    @property
    spawnInterval: number = 1;

    @property(Node)
    spawnRoot: Node | null = null;

    private _timer: number = 0;
    private _wasRunning: boolean = false;

    update(deltaTime: number): void {
        const isRunning: boolean = !!GameSession.instance?.isRunning;
        this.syncWithSession(isRunning);

        if (!isRunning) {
            return;
        }

        this._timer += deltaTime;
        if (this._timer < this.spawnInterval) {
            return;
        }

        this._timer = 0;
        this.spawnFruit();
    }

    private syncWithSession(isRunning: boolean): void {
        if (isRunning === this._wasRunning) {
            return;
        }

        this.clearSpawned();
        this._timer = 0;
        this._wasRunning = isRunning;
    }

    private getPrefabs(): Prefab[] {
        if (this.fruitPrefabs.length > 0) {
            return this.fruitPrefabs;
        }
        return this.fruitPrefab ? [this.fruitPrefab] : [];
    }

    private spawnFruit(): void {
        const prefabs: Prefab[] = this.getPrefabs();
        if (!prefabs.length) {
            return;
        }

        const prefab: Prefab | undefined = prefabs[math.randomRangeInt(0, prefabs.length - 1)];
        if (!prefab) {
            return;
        }

        const parent: Node = this.spawnRoot ?? this.node;
        const fruit: Node = instantiate(prefab);
        fruit.layer = parent.layer;
        parent.addChild(fruit);

        const pos: SpawnPosition = this.randomSpawnPosition();
        fruit.setPosition(pos.x, pos.y, pos.z);
    }

    private randomSpawnPosition(): SpawnPosition {
        const visibleSize: Size = view.getVisibleSize();
        const halfWidth: number = visibleSize.width * 0.5 - FruitSpawner.SPAWN_X_PADDING;
        return {
            x: math.randomRange(-halfWidth, halfWidth),
            y: visibleSize.height * 0.5 + FruitSpawner.SPAWN_Y_OFFSET,
            z: 0,
        };
    }

    private clearSpawned(): void {
        const parent: Node = this.spawnRoot ?? this.node;
        parent.removeAllChildren();
    }
}
