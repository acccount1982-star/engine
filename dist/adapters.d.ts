import type { EngineTransition, RestoreResult, TurnBasedSnapshot, TurnCommand } from "./types.js";
import type { TurnBasedEngine } from "./turn-based.js";
export interface SyncStorage {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
    removeItem(key: string): void;
}
export interface AsyncStorage {
    getItem(key: string): Promise<string | null>;
    setItem(key: string, value: string): Promise<void>;
    removeItem(key: string): Promise<void>;
}
export interface TurnBasedStorageAdapter {
    load(): RestoreResult;
    save(): void;
    clear(): void;
}
export interface AsyncTurnBasedStorageAdapter {
    load(): Promise<RestoreResult>;
    save(): Promise<void>;
    clear(): Promise<void>;
}
export interface TurnBasedClientAdapter {
    getSnapshot(): TurnBasedSnapshot;
    dispatch(command: TurnCommand): EngineTransition<TurnBasedSnapshot>;
    subscribe(listener: (snapshot: TurnBasedSnapshot) => void): () => void;
}
export declare function createTurnBasedStorageAdapter(engine: TurnBasedEngine, storage: SyncStorage, key?: string): TurnBasedStorageAdapter;
export declare function createAsyncTurnBasedStorageAdapter(engine: TurnBasedEngine, storage: AsyncStorage, key?: string): AsyncTurnBasedStorageAdapter;
export declare function connectTurnBasedEngine(engine: TurnBasedEngine): TurnBasedClientAdapter;
//# sourceMappingURL=adapters.d.ts.map