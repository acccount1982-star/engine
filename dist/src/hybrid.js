import { createRealTimeArena } from "./arena.js";
import { createTurnBasedEngine } from "./turn-based.js";
export class HybridGameEngine {
    turnBased;
    arena;
    constructor(config = {}) {
        this.turnBased = createTurnBasedEngine(config);
        this.arena = createRealTimeArena(config.arena ?? { width: 640, height: 360 });
    }
    getSnapshot() {
        return {
            turnBased: this.turnBased.getSnapshot(),
            arena: this.arena.getSnapshot(),
        };
    }
    dispatch(command) {
        return command.type.startsWith("turn")
            ? this.turnBased.dispatch(command)
            : this.arena.dispatch(command);
    }
}
export function createHybridGameEngine(config = {}) {
    return new HybridGameEngine(config);
}
