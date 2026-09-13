import { RealTimeArena } from "./arena.js";
import { TurnBasedEngine } from "./turn-based.js";
import type { EngineTransition, HybridCommand, HybridEngineConfig, HybridSnapshot, TurnBasedSnapshot } from "./types.js";
export declare class HybridGameEngine {
    readonly turnBased: TurnBasedEngine;
    readonly arena: RealTimeArena;
    constructor(config?: HybridEngineConfig);
    getSnapshot(): HybridSnapshot;
    dispatch(command: HybridCommand): EngineTransition<TurnBasedSnapshot> | EngineTransition<ReturnType<RealTimeArena["getSnapshot"]>>;
}
export declare function createHybridGameEngine(config?: HybridEngineConfig): HybridGameEngine;
//# sourceMappingURL=hybrid.d.ts.map