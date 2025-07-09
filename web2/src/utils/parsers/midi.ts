import * as Tone from 'tone'
import * as MidiParser from 'midi-parser-js'

interface Note {
  midi: number
  startTime: number
  duration: number
  velocity: number
}

interface ParsedSong {
  notes: Note[]
  duration: number
  tempo: number
}

export const parseMidiFile = (file: File): Promise<ParsedSong> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = (e) => {
      if (!e.target?.result) {
        reject(new Error('Failed to read file'))
        return
      }

      try {
        // MIDIファイルをパース
        const midiData = MidiParser.parse(e.target.result as ArrayBuffer)
        const ticksPerBeat = midiData.timeDivision
        const tempo = 120 // デフォルトのテンポ

        // ノートイベントを抽出
        const notes: Note[] = []
        let maxTime = 0

        midiData.tracks.forEach((track: any) => {
          let currentTime = 0
          
          track.forEach((event: any) => {
            currentTime += event.deltaTime * (60 / (tempo * ticksPerBeat))

            if (event.type === 9) { // Note On
              const startTime = currentTime
              
              // 対応するNote Offを探す
              const noteOff = track.find((e: any) => 
                e.type === 8 && e.data[0] === event.data[0]
              )
              
              if (noteOff) {
                const duration = noteOff.deltaTime * (60 / (tempo * ticksPerBeat))
                notes.push({
                  midi: event.data[0],
                  startTime,
                  duration,
                  velocity: event.data[1]
                })
                
                maxTime = Math.max(maxTime, startTime + duration)
              }
            }
          })
        })

        resolve({
          notes,
          duration: maxTime,
          tempo
        })
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error('Failed to read file'))
    }

    reader.readAsArrayBuffer(file)
  })
}
