import type { CampaignDefinition, RestoreResult, TurnBasedSnapshot } from "./types.js";
export declare const SAVE_FORMAT = "lengend-nightmare-engine-save";
export declare const SAVE_VERSION = 1;
export declare function serializeTurnBasedSnapshot(snapshot: TurnBasedSnapshot): string;
export declare function deserializeTurnBasedSnapshot(input: string, campaign: CampaignDefinition, fallback: TurnBasedSnapshot): RestoreResult;
//# sourceMappingURL=save.d.ts.map