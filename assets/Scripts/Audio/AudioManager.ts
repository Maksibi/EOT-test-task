import { _decorator, AudioClip, AudioSource, Component, math, Node } from 'cc';
import { SoundEntry } from './SoundEntry';

const { ccclass, property } = _decorator;

@ccclass('AudioManager')
export class AudioManager extends Component {
    public static instance: AudioManager | null = null;

    @property(AudioSource)
    musicSource: AudioSource | null = null;

    @property(AudioSource)
    sfxSource: AudioSource | null = null;

    @property(AudioClip)
    musicClip: AudioClip | null = null;

    @property({ type: [SoundEntry] })
    sounds: SoundEntry[] = [];

    @property({ type: [AudioClip] })
    collectClips: AudioClip[] = [];

    @property({ type: [AudioClip] })
    badCollectClips: AudioClip[] = [];

    @property
    playMusicOnStart: boolean = false;

    @property({ range: [0, 1, 0.01], slide: true })
    musicVolume: number = 0.6;

    @property({ range: [0, 1, 0.01], slide: true })
    sfxVolume: number = 1;

    private readonly _soundMap: Map<string, AudioClip> = new Map<string, AudioClip>();

    onLoad(): void {
        AudioManager.instance = this;
        this.ensureSources();
        this.rebuildSoundMap();
        this.applyVolumes();
    }

    start(): void {
        if (this.playMusicOnStart && this.musicClip) {
            this.playMusic(this.musicClip);
        }
    }

    onDestroy(): void {
        if (AudioManager.instance === this) {
            AudioManager.instance = null;
        }
    }

    playMusic(clip?: AudioClip | null, loop: boolean = true): void {
        const source: AudioSource | null = this.musicSource;
        const music: AudioClip | null = clip ?? this.musicClip;
        if (!source || !music) {
            return;
        }

        if (source.clip === music && source.playing) {
            source.loop = loop;
            return;
        }

        source.stop();
        source.clip = music;
        source.loop = loop;
        source.play();
    }

    stopMusic(): void {
        this.musicSource?.stop();
    }

    pauseMusic(): void {
        this.musicSource?.pause();
    }

    resumeMusic(): void {
        if (!this.musicSource?.clip) {
            return;
        }
        this.musicSource.play();
    }

    /** Play a named clip from `sounds`, or a direct AudioClip. */
    playSfx(clipOrId: AudioClip | string | null | undefined, volumeScale: number = 1): void {
        if (!clipOrId || !this.sfxSource) {
            return;
        }

        const clip: AudioClip | null = typeof clipOrId === 'string'
            ? this._soundMap.get(clipOrId) ?? null
            : clipOrId;

        if (!clip) {
            return;
        }

        this.sfxSource.playOneShot(clip, volumeScale);
    }

    playRandomSfx(clips: AudioClip[], volumeScale: number = 1): void {
        const clip: AudioClip | null = this.pickRandomClip(clips);
        if (!clip || !this.sfxSource) {
            return;
        }
        this.sfxSource.playOneShot(clip, volumeScale);
    }

    playCollectSfx(volumeScale: number = 1): void {
        this.playRandomSfx(this.collectClips, volumeScale);
    }

    playBadCollectSfx(volumeScale: number = 1): void {
        this.playRandomSfx(this.badCollectClips, volumeScale);
    }

    setMusicVolume(volume: number): void {
        this.musicVolume = math.clamp01(volume);
        if (this.musicSource) {
            this.musicSource.volume = this.musicVolume;
        }
    }

    setSfxVolume(volume: number): void {
        this.sfxVolume = math.clamp01(volume);
        if (this.sfxSource) {
            this.sfxSource.volume = this.sfxVolume;
        }
    }

    private pickRandomClip(clips: AudioClip[]): AudioClip | null {
        if (!clips.length) {
            return null;
        }
        return clips[math.randomRangeInt(0, clips.length - 1)] ?? null;
    }

    private ensureSources(): void {
        if (!this.musicSource) {
            this.musicSource = this.getOrAddSource('Music');
        }
        if (!this.sfxSource) {
            this.sfxSource = this.getOrAddSource('SFX');
        }
    }

    private getOrAddSource(childName: string): AudioSource {
        let child: Node | null = this.node.getChildByName(childName);
        if (!child) {
            child = new Node(childName);
            this.node.addChild(child);
        }
        return child.getComponent(AudioSource) ?? child.addComponent(AudioSource);
    }

    private rebuildSoundMap(): void {
        this._soundMap.clear();
        for (const entry: SoundEntry of this.sounds) {
            if (!entry?.id || !entry.clip) {
                continue;
            }
            this._soundMap.set(entry.id, entry.clip);
        }
    }

    private applyVolumes(): void {
        if (this.musicSource) {
            this.musicSource.volume = this.musicVolume;
        }
        if (this.sfxSource) {
            this.sfxSource.volume = this.sfxVolume;
        }
    }
}
