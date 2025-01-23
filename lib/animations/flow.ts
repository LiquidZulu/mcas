import { chain, ThreadGenerator, waitUntil } from '@motion-canvas/core';

export const after = (eventName: string, thread: ThreadGenerator) =>
    chain(waitUntil(eventName), thread);
