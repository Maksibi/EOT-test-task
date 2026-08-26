/** Named one-shot SFX ids used with AudioManager.sounds. */
export const SfxId = {
    Start: 'start',
    GameOver: 'game_over',
} as const;

export type SfxIdValue = (typeof SfxId)[keyof typeof SfxId];
