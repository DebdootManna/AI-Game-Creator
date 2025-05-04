"use client"

import { Button } from "@/components/ui/button"
import { Gamepad2 } from "lucide-react"
import { useGameStore } from "@/lib/game-store"
import { useToast } from "@/components/ui/use-toast"

export default function ExampleGameButton() {
  const { setGameCode, setGameGenerating, setOriginalGameCode } = useGameStore()
  const { toast } = useToast()

  const loadExampleGame = async () => {
    try {
      setGameGenerating(true)

      const response = await fetch("/api/example-game")
      if (!response.ok) {
        throw new Error("Failed to load example game")
      }

      const gameCode = await response.text()
      setGameCode(gameCode)
      setOriginalGameCode(gameCode)

      toast({
        title: "Example Game Loaded",
        description: "Press Space or Up Arrow to jump over obstacles!",
      })
    } catch (error) {
      console.error("Error loading example game:", error)
      toast({
        title: "Error",
        description: "Failed to load example game. Please try again.",
        variant: "destructive",
      })
    } finally {
      setGameGenerating(false)
    }
  }

  return (
    <Button variant="outline" className="w-full mt-4" onClick={loadExampleGame}>
      <Gamepad2 className="mr-2 h-4 w-4" />
      Load Example Game
    </Button>
  )
}
