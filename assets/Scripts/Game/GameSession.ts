import { _decorator, Component, input, Input, EventTouch, EventMouse } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('GameSession')
export class GameSession extends Component {
    public static instance: GameSession | null = null;

    @property
    startLives: number = 3;

    @property
    levelDuration: number = 60;

    private _score: number = 0;
    private _lives: number = 0;
    private _timeLeft: number = 0;
    private _isRunning: boolean = false;
    private _hasStartedOnce: boolean = false;

    get score(): number {
        return this._score;
    }

    get lives(): number {
        return this._lives;
    }

    get timeLeft(): number {
        return this._timeLeft;
    }

    get isRunning(): boolean {
        return this._isRunning;
    }

    get tapPromptText(): string {
        return this._hasStartedOnce ? 'Tap to restart' : 'Tap to start';
    }

    onLoad() {
        GameSession.instance = this;
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.on(Input.EventType.MOUSE_UP, this.onMouseUp, this);
    }

    onDestroy() {
        input.off(Input.EventType.TOUCH_END, this.onTouchEnd, this);
        input.off(Input.EventType.MOUSE_UP, this.onMouseUp, this);
        if (GameSession.instance === this) {
            GameSession.instance = null;
        }
    }

    start() {
        this.resetSession(false);
    }

    beginSession(): void {
        this.resetSession(true);
    }

    addScore(amount: number): void {
        if (!this._isRunning || amount === 0) {
            return;
        }
        this._score += amount;
    }

    damageLives(amount: number): void {
        if (!this._isRunning || amount <= 0) {
            return;
        }
        this._lives = Math.max(0, this._lives - amount);
        if (this._lives <= 0) {
            this._isRunning = false;
        }
    }

    update(deltaTime: number) {
        if (!this._isRunning) {
            return;
        }

        this._timeLeft = Math.max(0, this._timeLeft - deltaTime);
        if (this._timeLeft <= 0) {
            this._isRunning = false;
        }
    }

    private onTouchEnd(_event: EventTouch) {
        this.tryStartFromInput();
    }

    private onMouseUp(event: EventMouse) {
        // Left button only (desktop preview)
        if (event.getButton() !== EventMouse.BUTTON_LEFT) {
            return;
        }
        this.tryStartFromInput();
    }

    private tryStartFromInput(): void {
        if (this._isRunning) {
            return;
        }
        this.beginSession();
    }

    private resetSession(running: boolean): void {
        this._score = 0;
        this._lives = this.startLives;
        this._timeLeft = this.levelDuration;
        this._isRunning = running;
        if (running) {
            this._hasStartedOnce = true;
        }
    }
}
