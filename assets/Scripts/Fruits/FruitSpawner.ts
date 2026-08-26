import { _decorator, Component, Node, Prefab, instantiate, math, view } from 'cc';
import { GameSession } from '../Game/GameSession';

const { ccclass, property } = _decorator;

@ccclass('FruitSpawner')
export class FruitSpawner extends Component {

    private static readonly SPAWN_Y_OFFSET = 80;
    private static readonly SPAWN_X_PADDING = 60;

    @property([Prefab])
    fruitPrefabs: Prefab[] = [];

    @property(Prefab)
    fruitPrefab: Prefab | null = null;

    @property
    spawnInterval: number = 1;

    @property(Node)
    spawnRoot: Node | null = null;

    private _timer: number = 0;
    private _wasRunning: boolean = false;

    update(deltaTime: number) {
        const session = GameSession.instance;
        const isRunning = !!session?.isRunning;

        if (isRunning && !this._wasRunning) {
            this.clearSpawned();
            this._timer = 0;
        } else if (!isRunning && this._wasRunning) {
            this.clearSpawned();
            this._timer = 0;
        }

        this._wasRunning = isRunning;

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

    private getPrefabs(): Prefab[] {
        if (this.fruitPrefabs.length > 0) {
            return this.fruitPrefabs;
        }
        return this.fruitPrefab ? [this.fruitPrefab] : [];
    }

    private spawnFruit(): void {
        const prefabs = this.getPrefabs();
        if (!prefabs.length) {
            return;
        }

        const prefab = prefabs[math.randomRangeInt(0, prefabs.length - 1)];
        if (!prefab) {
            return;
        }

        const parent = this.spawnRoot ?? this.node;
        const fruit = instantiate(prefab);
        fruit.layer = parent.layer;
        parent.addChild(fruit);

        const visibleSize = view.getVisibleSize();
        const halfWidth = visibleSize.width * 0.5 - FruitSpawner.SPAWN_X_PADDING;
        const x = math.randomRange(-halfWidth, halfWidth);
        const y = visibleSize.height * 0.5 + FruitSpawner.SPAWN_Y_OFFSET;
        fruit.setPosition(x, y, 0);
    }

    private clearSpawned(): void {
        const parent = this.spawnRoot ?? this.node;
        parent.removeAllChildren();
    }
}
