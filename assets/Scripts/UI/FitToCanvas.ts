import { _decorator, Component, Node, UITransform, view, Canvas } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FitToCanvas')
export class FitToCanvas extends Component {
    @property(Node)
    canvasNode: Node | null = null;

    private _transform: UITransform | null = null;
    private _canvasTransform: UITransform | null = null;

    onLoad() {
        this._transform = this.getComponent(UITransform);
        this.resolveCanvas();
        this.applyFit();
        view.on('canvas-resize', this.applyFit, this);
    }

    onDestroy() {
        view.off('canvas-resize', this.applyFit, this);
    }

    start() {
        this.applyFit();
    }

    private resolveCanvas(): void {
        if (!this.canvasNode) {
            this.canvasNode = this.findCanvasNode(this.node);
        }

        this._canvasTransform = this.canvasNode?.getComponent(UITransform) ?? null;
    }

    private findCanvasNode(from: Node): Node | null {
        let current: Node | null = from;
        while (current) {
            if (current.getComponent(Canvas)) {
                return current;
            }
            current = current.parent;
        }
        return null;
    }

    private applyFit = (): void => {
        if (!this._transform) {
            this._transform = this.getComponent(UITransform);
        }
        if (!this._canvasTransform) {
            this.resolveCanvas();
        }
        if (!this._transform || !this._canvasTransform) {
            return;
        }

        const size = this._canvasTransform.contentSize;
        this.node.setScale(1, 1, 1);
        this._transform.setContentSize(size.width, size.height);
    };
}
