import { createHybridGameEngine } from "@lengend-nightmare/engine";

const engine = createHybridGameEngine({ seed: 1978 });
const firstMove = engine.dispatch({ type: "turn.action", actionId: "attack" });

console.info(firstMove.events);
console.info(engine.getSnapshot().turnBased);