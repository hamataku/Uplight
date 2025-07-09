declare module 'midi-parser-js' {
  interface MidiTrackEvent {
    deltaTime: number
    type: number
    data: number[]
  }

  interface MidiData {
    timeDivision: number
    tracks: MidiTrackEvent[][]
  }

  export function parse(data: ArrayBuffer): MidiData
}
