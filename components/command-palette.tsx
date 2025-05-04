"use client"

import { useEffect, useState } from "react"
import { Command } from "cmdk"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { RefreshCw, Download, Moon, Sun, Monitor, Search, Gamepad2 } from "lucide-react"
import { useTheme } from "next-themes"
import { useGameStore } from "@/lib/game-store"
import { useToast } from "@/components/ui/use-toast"

export default function CommandPalette() {
  const [open, setOpen] = useState(false)
  const { setTheme } = useTheme()
  const { gameCode, setGameCode } = useGameStore()
  const { toast } = useToast()

  // Toggle the menu when ⌘K is pressed
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const resetChat = () => {
    // Clear local storage chat history
    localStorage.removeItem("ai-chat-history")
    // Reload the page to reset the chat
    window.location.reload()
    setOpen(false)
  }

  const downloadGame = () => {
    if (!gameCode) {
      toast({
        title: "No game to download",
        description: "Generate a game first before downloading.",
        variant: "destructive",
      })
      setOpen(false)
      return
    }

    // Create a zip file with the game code
    const blob = new Blob([gameCode], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "ai-generated-game.html"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Game downloaded",
      description: "Your game has been downloaded as an HTML file.",
    })

    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 gap-0 max-w-[450px]">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Type a command or search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden">
            <Command.Empty>No results found.</Command.Empty>

            <Command.Group heading="Game">
              <Command.Item onSelect={resetChat} className="flex items-center gap-2 px-2 py-1.5 text-sm">
                <RefreshCw className="h-4 w-4" />
                <span>Reset Chat & Game</span>
              </Command.Item>
              <Command.Item
                onSelect={downloadGame}
                className="flex items-center gap-2 px-2 py-1.5 text-sm"
                disabled={!gameCode}
              >
                <Download className="h-4 w-4" />
                <span>Download Game</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Theme">
              <Command.Item
                onSelect={() => {
                  setTheme("light")
                  setOpen(false)
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm"
              >
                <Sun className="h-4 w-4" />
                <span>Light Mode</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setTheme("dark")
                  setOpen(false)
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm"
              >
                <Moon className="h-4 w-4" />
                <span>Dark Mode</span>
              </Command.Item>
              <Command.Item
                onSelect={() => {
                  setTheme("system")
                  setOpen(false)
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm"
              >
                <Monitor className="h-4 w-4" />
                <span>System Theme</span>
              </Command.Item>
            </Command.Group>

            <Command.Group heading="Examples">
              <Command.Item
                onSelect={() => {
                  // Set a sample game prompt
                  const examplePrompt = "Create a simple platformer game with a character that jumps and collects coins"
                  // You would typically trigger the chat with this prompt
                  setOpen(false)
                  // For demo purposes, just show a toast
                  toast({
                    title: "Example Selected",
                    description: `Prompt: "${examplePrompt}" - Use the chat to send this prompt.`,
                  })
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-sm"
              >
                <Gamepad2 className="h-4 w-4" />
                <span>Platformer Game</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
