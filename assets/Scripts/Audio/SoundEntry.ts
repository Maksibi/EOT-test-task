import { _decorator, AudioClip } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('SoundEntry')
export class SoundEntry {
    @property
    id: string = '';

    @property(AudioClip)
    clip: AudioClip | null = null;
}
