export const SAVE_FORMAT = "lengend-nightmare-engine-save";
export const SAVE_VERSION = 1;
function isRecord(value) {
    return typeof value === "object" && value !== null;
}
function error(message) {
    return { code: "INVALID_SAVE", message };
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
function numericOr(value, fallback) {
    const numeric = typeof value === "number" ? value : typeof value === "string" ? Number(value) : Number.NaN;
    return Number.isFinite(numeric) ? numeric : fallback;
}
export function serializeTurnBasedSnapshot(snapshot) {
    const save = {
        format: SAVE_FORMAT,
        version: SAVE_VERSION,
        snapshot,
    };
    return JSON.stringify(save);
}
export function deserializeTurnBasedSnapshot(input, campaign, fallback) {
    try {
        const parsed = JSON.parse(input);
        const raw = isRecord(parsed) && parsed.format === SAVE_FORMAT && isRecord(parsed.snapshot)
            ? parsed.snapshot
            : parsed;
        if (!isRecord(raw)) {
            return { ok: false, migrated: false, snapshot: fallback, error: error("Save data must be an object.") };
        }
        const levelNumber = clamp(numericOr(raw.currentLevel, 1), 1, campaign.levels.length);
        const level = campaign.levels[levelNumber - 1];
        const legacy = raw.formatVersion !== 1;
        const discovered = Array.isArray(raw.discovered)
            ? raw.discovered
                .filter((value) => typeof value === "string")
                .map((value) => campaign.levels.find((candidate) => candidate.enemy.id === value || candidate.enemy.name === value)?.enemy.id ?? value)
            : [];
        const phase = raw.phase === "complete" || raw.phase === "defeat"
            ? raw.phase
            : raw.completed === true
                ? "complete"
                : numericOr(raw.playerHp, fallback.playerHp) <= 0
                    ? "defeat"
                    : "active";
        const snapshot = {
            ...fallback,
            ...raw,
            formatVersion: 1,
            mode: "turn-based",
            campaignId: campaign.id,
            currentLevel: levelNumber,
            level,
            playerHp: clamp(numericOr(raw.playerHp, fallback.playerHp), 0, campaign.player.maxHp),
            playerMaxHp: campaign.player.maxHp,
            enemyHp: clamp(numericOr(raw.enemyHp, level.enemy.hp), 0, level.enemy.hp),
            energy: clamp(numericOr(raw.energy, fallback.energy), 0, campaign.player.maxEnergy),
            maxEnergy: campaign.player.maxEnergy,
            turn: Math.max(1, Math.floor(numericOr(raw.turn, 1))),
            victories: clamp(numericOr(raw.victories, 0), 0, campaign.levels.length),
            discovered,
            upgrades: Array.isArray(raw.upgrades) ? raw.upgrades.filter((value) => typeof value === "string") : [],
            activeLog: Array.isArray(raw.activeLog) ? raw.activeLog.filter((value) => typeof value === "string").slice(0, 6) : fallback.activeLog,
            guarded: raw.guarded === true,
            phase,
            seed: Math.trunc(numericOr(raw.seed, fallback.seed)),
            rngState: Math.trunc(numericOr(raw.rngState, fallback.rngState)),
        };
        return { ok: true, migrated: legacy, snapshot };
    }
    catch {
        return { ok: false, migrated: false, snapshot: fallback, error: error("Save data could not be decoded.") };
    }
}
