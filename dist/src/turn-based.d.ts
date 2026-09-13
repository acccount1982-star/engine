import { deserializeTurnBasedSnapshot } from "./save.js";
import type { CampaignAction, CampaignDefinition, EngineTransition, TurnBasedEngineConfig, TurnBasedSnapshot, TurnCommand } from "./types.js";
export declare class TurnBasedEngine {
    readonly campaign: CampaignDefinition;
    private readonly random;
    private snapshot;
    constructor(config?: TurnBasedEngineConfig);
    getSnapshot(): TurnBasedSnapshot;
    dispatch(command: TurnCommand): EngineTransition<TurnBasedSnapshot>;
    serialize(): string;
    restore(input: string): ReturnType<typeof deserializeTurnBasedSnapshot>;
}
export declare function createTurnBasedEngine(config?: TurnBasedEngineConfig): TurnBasedEngine;
export declare function actionById(campaign: CampaignDefinition, actionId: string): CampaignAction | undefined;
//# sourceMappingURL=turn-based.d.ts.map