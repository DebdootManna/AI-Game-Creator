"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useChat } from "ai/react"
import { Bot, User, Send, Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Card } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useGameStore } from "@/lib/game-store"

const EXAMPLE_PROMPTS = [
  "Create a simple jumping game like Chrome's dinosaur game",
  "Make a Pong clone with colorful graphics",
  "Build a simple platformer with a character that collects coins",
  "Create a snake game with keyboard controls",
]

export default function ChatInterface() {
  const { toast } = useToast()
  const [promptInput, setPromptInput] = useState("")
  const [extractingCode, setExtractingCode] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { setGameCode, setGameGenerating, setOriginalGameCode } = useGameStore()

  // Use the AI SDK's useChat hook
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload } = useChat({
    api: "/api/chat",
    onResponse: (response) => {
      // Indicate that we're starting to process the response
      setGameGenerating(true)
      console.log("Received response from API")
    },
    onFinish: (message) => {
      try {
        console.log("Chat finished, extracting game code")
        setExtractingCode(true)

        // Extract game code from the response
        const responseText = message.content
        console.log("Response content:", responseText.substring(0, 100) + "...")

        // Debug info for the user
        setDebugInfo(responseText)

        // Look for HTML code block
        const gameCodeMatch = responseText.match(/```html([\s\S]*?)```/)

        if (gameCodeMatch && gameCodeMatch[1]) {
          const extractedCode = gameCodeMatch[1].trim()
          console.log("Game code extracted successfully, length:", extractedCode.length)
          setOriginalGameCode(extractedCode)
          setGameCode(extractedCode)
          toast({
            title: "Game Generated!",
            description: "Your game has been created and is ready to play.",
          })
        } else {
          console.error("Failed to extract game code from response")
          toast({
            title: "Error Extracting Code",
            description: "Could not find game code in the response. Check the Code tab for the full response.",
            variant: "destructive",
          })

          // Try to find any HTML in the response as a fallback
          if (responseText.includes("<html>") && responseText.includes("</html>")) {
            const htmlStart = responseText.indexOf("<html>")
            const htmlEnd = responseText.lastIndexOf("</html>") + 7
            const possibleCode = responseText.substring(htmlStart - 9, htmlEnd)
            console.log("Found possible HTML code:", possibleCode.substring(0, 100) + "...")
            setGameCode(possibleCode)
          }
        }
      } catch (error) {
        console.error("Error processing response:", error)
        toast({
          title: "Error",
          description: "An error occurred while processing the game code.",
          variant: "destructive",
        })
      } finally {
        setExtractingCode(false)
        setGameGenerating(false)
      }
    },
    onError: (error) => {
      console.error("Chat error:", error)
      setGameGenerating(false)
      setExtractingCode(false)
      toast({
        title: "Error",
        description: error.message || "Failed to generate game. Please try again.",
        variant: "destructive",
      })
    },
  })

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]")
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [promptInput])

  const handleExampleClick = (example: string) => {
    setPromptInput(example)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (promptInput.trim()) {
      // Clear any previous debug info
      setDebugInfo(null)

      // Notify that we're starting to generate
      setGameGenerating(true)
      handleSubmit(e)
      setPromptInput("")
    }
  }

  const handleRetry = () => {
    setDebugInfo(null)
    setGameGenerating(true)
    reload()
  }

  return (
    <div className="flex flex-col h-[600px] border rounded-lg bg-white dark:bg-slate-900 shadow-sm">
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                <Bot className="h-8 w-8 text-slate-600 dark:text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">AI Game Creator Assistant</h3>
              <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-4">
                Describe the game you want to create, and I'll generate it for you instantly. No coding experience
                required!
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleExampleClick(example)}
                    className="text-xs"
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <Card
                key={index}
                className={cn(
                  "p-4 max-w-[85%]",
                  message.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted",
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                    {message.role === "user" ? (
                      <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    ) : (
                      <Bot className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                    )}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </Card>
            ))
          )}
          {isLoading && (
            <Card className="p-4 max-w-[85%] bg-muted">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <Bot className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Generating your game...</span>
                </div>
              </div>
            </Card>
          )}
          {extractingCode && (
            <Card className="p-4 max-w-[85%] bg-muted">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 flex-shrink-0">
                  <Bot className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <div className="flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm text-slate-600 dark:text-slate-400">Preparing game preview...</span>
                </div>
              </div>
            </Card>
          )}
          {error && (
            <Card className="p-4 max-w-[85%] bg-destructive text-destructive-foreground">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <p className="mb-2">Error: {error.message}</p>
                  <Button size="sm" variant="outline" onClick={handleRetry}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t">
        <form onSubmit={handleFormSubmit} className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={promptInput}
            onChange={(e) => {
              setPromptInput(e.target.value)
              handleInputChange(e)
            }}
            placeholder="Describe your game idea..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleFormSubmit(e)
              }
            }}
            disabled={isLoading || extractingCode}
          />
          <Button type="submit" size="icon" disabled={isLoading || extractingCode || !promptInput.trim()}>
            <Send className="h-5 w-5" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  )
}
