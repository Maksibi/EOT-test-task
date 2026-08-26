import {
    _decorator,
    Component,
    Node,
    input,
    Input,
    EventTouch,
    EventMouse,
    UITransform,
    Vec3,
    view,
    math,
    Vec2,
} from 'cc';
import { Collectable } from '../Fruits/Collectable';
import { GameSession } from '../Game/GameSession';

const { ccclass, property } = _decorator;

@ccclass('Basket')
export class Basket extends Component {
    @property(Node)
    View: Node | null = null;

    @property(Node)
    fruitsRoot: Node | null = null;

    @property
    edgePadding: number = 60;

    @property
    collectHalfWidth: number = 90;

    @property
    collectHalfHeight: number = 50;

    private _baseY: number = 0;
    private _parentUI: UITransform | null = null;
    private readonly _uiPos: Vec3 = new Vec3();
    private readonly _localPos: Vec3 = new Vec3();

    onLoad(): void {
        input.on(Input.EventType.TOUCH_MOVE, this.onPointerMove, this);
        input.on(Input.EventType.TOUCH_START, this.onPointerMove, this);
        input.on(Input.EventType.MOUSE_MOVE, this.onPointerMove, this);
    }

    onDestroy(): void {
        input.off(Input.EventType.TOUCH_MOVE, this.onPointerMove, this);
        input.off(Input.EventType.TOUCH_START, this.onPointerMove, this);
        input.off(Input.EventType.MOUSE_MOVE, this.onPointerMove, this);
    }

    start(): void {
        if (!this.View) {
            this.View = this.node.getChildByName('View');
        }
        this._baseY = this.node.position.y;
        this._parentUI = this.node.parent?.getComponent(UITransform) ?? null;
    }

    update(_deltaTime: number): void {
        if (!GameSession.instance?.isRunning) {
            return;
        }
        this.tryCollectNearby();
    }

    private onPointerMove(event: EventTouch | EventMouse): void {
        const ui: Vec2 = event.getUILocation();
        this.followUILocation(ui.x, ui.y);
    }

    private followUILocation(uiX: number, uiY: number): void {
        if (!GameSession.instance?.isRunning) {
            return;
        }

        const parentUI: UITransform | null = this.resolveParentUI();
        if (!parentUI) {
            return;
        }

        this._uiPos.set(uiX, uiY, 0);
        parentUI.convertToNodeSpaceAR(this._uiPos, this._localPos);

        const halfWidth: number = view.getVisibleSize().width * 0.5 - this.edgePadding;
        const x: number = math.clamp(this._localPos.x, -halfWidth, halfWidth);
        this.node.setPosition(x, this._baseY, this.node.position.z);
    }

    private resolveParentUI(): UITransform | null {
        if (!this._parentUI) {
            this._parentUI = this.node.parent?.getComponent(UITransform) ?? null;
        }
        return this._parentUI;
    }

    private tryCollectNearby(): void {
        const root: Node | null = this.fruitsRoot;
        if (!root) {
            return;
        }

        const basketPos: Readonly<Vec3> = this.node.worldPosition;
        const children: readonly Node[] = root.children;

        for (let i: number = children.length - 1; i >= 0; i--) {
            const fruitNode: Node = children[i];
            if (!fruitNode?.isValid) {
                continue;
            }

            const collectable: Collectable | null = fruitNode.getComponent(Collectable);
            if (!collectable) {
                continue;
            }

            if (this.overlaps(basketPos, fruitNode.worldPosition)) {
                collectable.collect();
            }
        }
    }

    private overlaps(basketPos: Readonly<Vec3>, fruitPos: Readonly<Vec3>): boolean {
        return Math.abs(fruitPos.x - basketPos.x) <= this.collectHalfWidth
            && Math.abs(fruitPos.y - basketPos.y) <= this.collectHalfHeight;
    }
}
