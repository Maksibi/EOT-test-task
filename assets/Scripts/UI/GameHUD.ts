import { _decorator, Component, Node, Label, RichText, UITransform, Color } from 'cc';
import { GameSession } from '../Game/GameSession';

const { ccclass, property } = _decorator;

@ccclass('GameHUD')
export class GameHUD extends Component {
    @property(RichText)
    scoreLabel: RichText | null = null;

    @property(RichText)
    livesLabel: RichText | null = null;

    @property(RichText)
    timerLabel: RichText | null = null;

    @property(Node)
    tapToStartPrompt: Node | null = null;

    private _tapToStartLabel: Label | null = null;

    onLoad(): void {
        if (!this.tapToStartPrompt) {
            this.createTapPrompt();
            return;
        }

        this._tapToStartLabel = this.tapToStartPrompt.getComponent(Label)
            ?? this.tapToStartPrompt.getComponentInChildren(Label);
    }

    update(): void {
        const session: GameSession | null = GameSession.instance;
        if (!session) {
            return;
        }

        this.refreshStats(session);
        this.refreshPrompt(session);
    }

    private refreshStats(session: GameSession): void {
        if (this.scoreLabel) {
            this.scoreLabel.string = `Score: ${session.score}`;
        }
        if (this.livesLabel) {
            this.livesLabel.string = `Lives: ${session.lives}`;
        }
        if (this.timerLabel) {
            this.timerLabel.string = this.formatTime(session.timeLeft);
        }
    }

    private refreshPrompt(session: GameSession): void {
        if (!this.tapToStartPrompt) {
            return;
        }

        const showPrompt: boolean = !session.isRunning;
        this.tapToStartPrompt.active = showPrompt;
        if (showPrompt && this._tapToStartLabel) {
            this._tapToStartLabel.string = session.tapPromptText;
        }
    }

    private createTapPrompt(): void {
        const node: Node = new Node('TapToStart');
        node.layer = this.node.layer;
        this.node.addChild(node);

        const transform: UITransform = node.addComponent(UITransform);
        transform.setContentSize(700, 80);

        const label: Label = node.addComponent(Label);
        label.string = 'Tap to start';
        label.fontSize = 48;
        label.lineHeight = 56;
        label.horizontalAlign = Label.HorizontalAlign.CENTER;
        label.verticalAlign = Label.VerticalAlign.CENTER;
        label.color = new Color(255, 255, 255, 255);
        label.isBold = true;
        node.setPosition(0, 0, 0);

        this.tapToStartPrompt = node;
        this._tapToStartLabel = label;
    }

    private formatTime(timeLeft: number): string {
        const totalSeconds: number = Math.ceil(timeLeft);
        const minutes: number = Math.floor(totalSeconds / 60);
        const seconds: number = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
    }
}
