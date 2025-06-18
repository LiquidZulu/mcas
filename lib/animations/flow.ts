import {
    all,
    any,
    chain,
    spawn,
    ThreadGenerator,
    waitUntil,
} from '@motion-canvas/core';

export const after = (eventName: string, ...threads: ThreadGenerator[]) =>
    chain(waitUntil(eventName), all(...threads));

// runs otherTasks whilst running task
// operates like any, but it definitely finishes task
export function* whilst(
    task: ThreadGenerator,
    ...otherTasks: ThreadGenerator[]
): ThreadGenerator {
    for (const t of otherTasks) {
        spawn(t);
    }
    yield* task;
}

// definitely finishes otherTasks, doesn't care if task is finished yet
export function* others(
    task: ThreadGenerator,
    ...otherTasks: ThreadGenerator[]
): ThreadGenerator {
    spawn(task);
    yield* all(...otherTasks);
}
