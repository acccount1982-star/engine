import type { ArenaCommand, ArenaConfig, ArenaSnapshot, EngineTransition } from "./types.js";
export declare class RealTimeArena {
    private snapshot;
    private accumulator;
    private readonly gravity;
    private readonly initialEntities;
    constructor(config: ArenaConfig);
    getSnapshot(): ArenaSnapshot;
    dispatch(command: ArenaCommand): EngineTransition<ArenaSnapshot>;
    private tick;
}
export declare function createRealTimeArena(config: ArenaConfig): RealTimeArena;
//# sourceMappingURL=arena.d.ts.map