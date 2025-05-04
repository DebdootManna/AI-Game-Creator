import { create } from "zustand"

interface GameState {
  gameCode: string
  originalGameCode: string | null
  gameGenerating: boolean
  setGameCode: (code: string) => void
  setOriginalGameCode: (code: string) => void
  setGameGenerating: (isGenerating: boolean) => void
}

export const useGameStore = create<GameState>((set) => ({
  gameCode: "",
  originalGameCode: null,
  gameGenerating: false,
  setGameCode: (code) => set({ gameCode: code }),
  setOriginalGameCode: (code) => set({ originalGameCode: code }),
  setGameGenerating: (isGenerating) => set({ gameGenerating: isGenerating }),
}))
