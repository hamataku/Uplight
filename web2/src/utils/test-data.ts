// テスト用のMIDIデータ
export const testSong = {
  notes: [
    // C Major スケール上昇
    { midi: 60, startTime: 0, duration: 0.5, velocity: 100 },    // C4
    { midi: 62, startTime: 0.5, duration: 0.5, velocity: 100 },  // D4
    { midi: 64, startTime: 1.0, duration: 0.5, velocity: 100 },  // E4
    { midi: 65, startTime: 1.5, duration: 0.5, velocity: 100 },  // F4
    { midi: 67, startTime: 2.0, duration: 0.5, velocity: 100 },  // G4
    { midi: 69, startTime: 2.5, duration: 0.5, velocity: 100 },  // A4
    { midi: 71, startTime: 3.0, duration: 0.5, velocity: 100 },  // B4
    { midi: 72, startTime: 3.5, duration: 0.5, velocity: 100 },  // C5
    // C Major スケール下降
    { midi: 72, startTime: 4.0, duration: 0.5, velocity: 100 },  // C5
    { midi: 71, startTime: 4.5, duration: 0.5, velocity: 100 },  // B4
    { midi: 69, startTime: 5.0, duration: 0.5, velocity: 100 },  // A4
    { midi: 67, startTime: 5.5, duration: 0.5, velocity: 100 },  // G4
    { midi: 65, startTime: 6.0, duration: 0.5, velocity: 100 },  // F4
    { midi: 64, startTime: 6.5, duration: 0.5, velocity: 100 },  // E4
    { midi: 62, startTime: 7.0, duration: 0.5, velocity: 100 },  // D4
    { midi: 60, startTime: 7.5, duration: 0.5, velocity: 100 },  // C4
  ],
  duration: 8.0,
  tempo: 120
}
