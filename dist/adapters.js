export function createTurnBasedStorageAdapter(engine, storage, key = "lengend-nightmare-save") {
    return {
        load: () => {
            const saved = storage.getItem(key);
            return saved ? engine.restore(saved) : { ok: true, migrated: false, snapshot: engine.getSnapshot() };
        },
        save: () => storage.setItem(key, engine.serialize()),
        clear: () => storage.removeItem(key),
    };
}
export function createAsyncTurnBasedStorageAdapter(engine, storage, key = "lengend-nightmare-save") {
    return {
        load: async () => {
            const saved = await storage.getItem(key);
            return saved ? engine.restore(saved) : { ok: true, migrated: false, snapshot: engine.getSnapshot() };
        },
        save: async () => storage.setItem(key, engine.serialize()),
        clear: async () => storage.removeItem(key),
    };
}
export function connectTurnBasedEngine(engine) {
    const listeners = new Set();
    return {
        getSnapshot: () => engine.getSnapshot(),
        dispatch: (command) => {
            const transition = engine.dispatch(command);
            if (transition.accepted) {
                const snapshot = engine.getSnapshot();
                listeners.forEach((listener) => listener(snapshot));
            }
            return transition;
        },
        subscribe: (listener) => {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}
