/*
 * See: https://github.com/bbc/audiowaveform/blob/master/doc/DataFormat.md
 *      https://github.com/LiquidZulu/motion-canvas-audio-visualiser
 *
 * "Array of minimum and maximum waveform data points, interleaved.
 * The example shows a two channel waveform data file. Depending on
 * bits, each value may be in the range -128 to +127 or -32768 to
 * +32767."
 *
 * You need to normalise based upon the range that you told
 * audiowaveform to use.
 */

import { ReferenceArray, waitFor } from '@motion-canvas/core';

export type AudiowaveformJSON = { data: number[] } & Record<string, unknown>;
export type AudioAmplitudes = number[];
export type AudioHiLo = [number, number][]

export function audiowaveformAmplitudes(
  json: AudiowaveformJSON,
  range = 32768
): AudioAmplitudes {
  let proc: number[] = [];
  for (let i = 0; i < json.data.length; i += 2) {
    proc.push(
      maxNormalise(json.data[i], json.data[i + 1], range)
    );
  }
  return proc;
}

function maxNormalise(hi: number, lo: number, range: number) {
  return Math.max(Math.abs(hi), Math.abs(lo)) / range;
}

export function audiowaveformHiLo(
    json: AudiowaveformJSON,
    range = 32768
): AudioHiLo {
    let proc: [number,number][] = [];
    for ( let i=0; i < json.data.length; i += 2 ) {
        proc.push([json.data[i] / (range - 1), json.data[i+1] / range])
    }

    return proc;
}

// returns a number from 1 down to 0 to indicate how far through the animation that node is
export function getCompleteness(arrayLength: number, index: number ){
    if (arrayLength <= 0) return 0;
    return 1 - (index / (arrayLength - 1));
}

export function* animateWaveform<T>(
    data: AudioHiLo | AudioAmplitudes,
    nodes: ReferenceArray<T>,
    animator: (completeness: number) => (hi: number, lo: number, node: T) => void,
    duration: number
){
    let normalisedData: AudioHiLo = [];

    if( typeof data[0] === 'number' ){
        for ( let datum of data as AudioAmplitudes ){
            normalisedData.push([datum,datum])
        }
    }
    else {
        normalisedData = data as AudioHiLo;
    }

    console.log(normalisedData)

    const animators = new Array(data.length).fill(animator).map( (a, i) => a(getCompleteness(nodes.length, i)) );

    let currentValues: AudioHiLo = new Array(nodes.length).fill([0, 0]);
    for (const datum of normalisedData) {
        currentValues.pop();
        currentValues.unshift(datum);
        for (let i = 0; i < nodes.length; ++i) {
            const [hi, lo] = currentValues[i];
            animators[i](hi, lo, nodes[i]);
        }
        yield* waitFor(duration);
    }
}
