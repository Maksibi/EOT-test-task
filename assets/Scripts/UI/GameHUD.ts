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

    onLoad() {
        if (!this.tapToStartPrompt) {
            this.createTapPrompt();
        } else {
            this._tapToStartLabel = this.tapToStartPrompt.getComponent(Label)
                ?? this.tapToStartPrompt.getComponentInChildren(Label);
        }
    }

    update() {
        const session = GameSession.instance;
        if (!session) {
            return;
        }

        if (this.scoreLabel) {
            this.scoreLabel.string = `Score: ${session.score}`;
        }
        if (this.livesLabel) {
            this.livesLabel.string = `Lives: ${session.lives}`;
        }
        if (this.timerLabel) {
            this.timerLabel.string = this.formatTime(session.timeLeft);
        }

        if (this.tapToStartPrompt) {
            const showPrompt = !session.isRunning;
            this.tapToStartPrompt.active = showPrompt;
            if (showPrompt && this._tapToStartLabel) {
                this._tapToStartLabel.string = session.tapPromptText;
            }
        }
    }

    private createTapPrompt(): void {
        const node = new Node('TapToStart');
        node.layer = this.node.layer;
        this.node.addChild(node);

        const transform = node.addComponent(UITransform);
        transform.setContentSize(700, 80);

        const label = node.addComponent(Label);
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
        const totalSeconds = Math.ceil(timeLeft);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        const secondsText = seconds < 10 ? `0${seconds}` : `${seconds}`;
        return `${minutes}:${secondsText}`;
    }
}
