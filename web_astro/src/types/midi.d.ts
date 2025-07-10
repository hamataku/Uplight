interface MIDIMessageEvent {
  data: Uint8Array;
}

interface MIDIInput {
  onmidimessage: ((event: { data: number[] }) => void) | null;
  name: string;
}

interface MIDIOutput {
  send: (data: number[]) => void;
}

interface MIDIAccess {
  inputs: Map<string, MIDIInput>;
  outputs: Map<string, MIDIOutput>;
}

interface Navigator {
  requestMIDIAccess(): Promise<MIDIAccess>;
}
