import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CollectableData')
export class CollectableData extends Component {
    @property()
    score: number = 0;

    @property()
    speed: number = 0;

    @property()
    livesDamage: number = 0;
}