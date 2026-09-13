export declare class SeededRandom {
    private state;
    constructor(seed: number);
    next(): number;
    integer(min: number, max: number): number;
    getState(): number;
    setState(state: number): void;
}
//# sourceMappingURL=random.d.ts.map