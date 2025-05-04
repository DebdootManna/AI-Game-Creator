"use client"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Play, RefreshCw, Code, Maximize2, Minimize2, Loader2, Edit } from "lucide-react"
import { useGameStore } from "@/lib/game-store"
import { cn } from "@/lib/utils"
import { useToast } from "@/components/ui/use-toast"
import dynamic from "next/dynamic"

// Dynamically import the CodeEditor component to avoid SSR issues with Monaco
const CodeEditor = dynamic(() => import("@/components/code-editor"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <Loader2 className="h-10 w-10 animate-spin text-slate-400" />
    </div>
  ),
})

export default function GamePreview() {
  const { gameCode, gameGenerating } = useGameStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const [currentCode, setCurrentCode] = useState("")
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Update current code when game code changes
  useEffect(() => {
    if (gameCode) {
      setCurrentCode(gameCode)
    }
  }, [gameCode])

  const resetGame = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      setIsLoading(true)
      setTimeout(() => {
        if (iframeRef.current && iframeRef.current.contentWindow) {
          try {
            iframeRef.current.contentWindow.location.reload()
          } catch (error) {
            console.error("Error reloading iframe:", error)
            toast({
              title: "Error",
              description: "Failed to reload the game. Please try generating a new game.",
              variant: "destructive",
            })
          } finally {
            setIsLoading(false)
          }
        }
      }, 300)
    }
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [])

  const updateGamePreview = () => {
    if (currentCode) {
      setIsLoading(true)
      setLoadError(false)
      console.log("Loading game code into iframe, length:", currentCode.length)

      // Short delay to ensure loading state is visible
      const loadTimeout = setTimeout(() => {
        try {
          if (iframeRef.current) {
            const iframe = iframeRef.current
            const iframeDoc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document)

            if (iframeDoc) {
              iframeDoc.open()

              // Wrap the code in proper HTML if it doesn't already have it
              let fullCode = currentCode
              if (!currentCode.includes("<!DOCTYPE html>")) {
                fullCode = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      margin: 0;
      overflow: hidden;
      background: #f8f9fa;
    }
    canvas {
      display: block;
    }
  </style>
</head>
<body>
  ${currentCode}
</body>
</html>`
              }

              iframeDoc.write(fullCode)
              iframeDoc.close()

              // Give the iframe some time to load content
              setTimeout(() => {
                setIsLoading(false)
              }, 1000)
            } else {
              console.error("Could not access iframe document")
              setLoadError(true)
              setIsLoading(false)
            }
          }
        } catch (error) {
          console.error("Error loading game in iframe:", error)
          setLoadError(true)
          setIsLoading(false)
          toast({
            title: "Error",
            description: "Failed to load the game in the preview. Please try again.",
            variant: "destructive",
          })
        }
      }, 500)

      return () => {
        clearTimeout(loadTimeout)
      }
    }
  }

  // Update preview when game code changes
  useEffect(() => {
    updateGamePreview()
  }, [gameCode])

  return (
    <div
      ref={containerRef}
      className={cn(
        "border rounded-lg bg-white dark:bg-slate-900 shadow-sm h-[600px] flex flex-col",
        isFullscreen && "fixed inset-0 z-50 h-screen w-screen rounded-none border-none",
      )}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="border-b p-2 flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="preview" className="flex items-center gap-1">
              <Play className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="code" className="flex items-center gap-1">
              <Code className="h-4 w-4" />
              Code
            </TabsTrigger>
            <TabsTrigger value="editor" className="flex items-center gap-1">
              <Edit className="h-4 w-4" />
              Editor
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={resetGame} disabled={isLoading || !gameCode}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              <span className="sr-only">Reset Game</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleFullscreen} disabled={!gameCode}>
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              <span className="sr-only">{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="preview" className="h-full m-0 p-0 data-[state=active]:flex">
            {gameGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Loader2 className="h-10 w-10 text-slate-400 dark:text-slate-600 animate-spin" />
                    </div>
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-600">
                      Generating...
                    </div>
                  </div>
                  <div className="space-y-2 text-center">
                    <h3 className="text-lg font-medium">Creating Your Game</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs">
                      Please wait while the AI generates your game. This may take a moment...
                    </p>
                    <div className="flex justify-center">
                      <div className="animate-pulse mt-4 space-y-2">
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded w-28"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : gameCode && !isLoading ? (
              <iframe ref={iframeRef} title="Game Preview" className="w-full h-full border-0" sandbox="allow-scripts" />
            ) : isLoading ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Loader2 className="h-10 w-10 text-slate-400 dark:text-slate-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium mb-2">Loading Game...</h3>
                <p className="text-center max-w-md">Setting up your game preview. Just a moment...</p>
              </div>
            ) : loadError ? (
              <div className="h-full flex flex-col items-center justify-center text-red-500 dark:text-red-400 p-4">
                <div className="w-24 h-24 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
                  <Code className="h-10 w-10 text-red-500 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Failed to Load Game</h3>
                <p className="text-center max-w-md">
                  There was a problem loading the game. Please try generating a new game.
                </p>
                <Button variant="outline" className="mt-4" onClick={resetGame}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reload
                </Button>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Play className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Game Generated Yet</h3>
                <p className="text-center max-w-md">
                  Describe your game idea in the chat to see it come to life here. Try something like "Create a simple
                  jumping game" or "Make a snake game".
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="code" className="h-full m-0 p-0 data-[state=active]:flex">
            {gameGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Loader2 className="h-10 w-10 text-slate-400 dark:text-slate-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium mb-2">Generating Code...</h3>
                <div className="max-w-md w-full bg-slate-50 dark:bg-slate-800 rounded-lg p-4 overflow-hidden">
                  <div className="animate-pulse space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/5"></div>
                  </div>
                </div>
              </div>
            ) : gameCode ? (
              <pre className="h-full overflow-auto p-4 text-sm bg-slate-50 dark:bg-slate-950 text-slate-800 dark:text-slate-200 w-full">
                <code>{gameCode}</code>
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Code className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Code Generated Yet</h3>
                <p className="text-center max-w-md">
                  Once you generate a game, you'll be able to view and edit its code here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="editor" className="h-full m-0 p-0 data-[state=active]:flex flex-col">
            {gameGenerating ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Loader2 className="h-10 w-10 text-slate-400 dark:text-slate-600 animate-spin" />
                </div>
                <h3 className="text-lg font-medium mb-2">Generating Code...</h3>
                <p className="text-center max-w-md">
                  Please wait while the AI generates your game code. You'll be able to edit it soon...
                </p>
              </div>
            ) : gameCode ? (
              <CodeEditor initialCode={currentCode} onCodeChange={setCurrentCode} onRunCode={updateGamePreview} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-500 dark:text-slate-400 p-4">
                <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                  <Edit className="h-10 w-10 text-slate-400 dark:text-slate-600" />
                </div>
                <h3 className="text-lg font-medium mb-2">No Code to Edit</h3>
                <p className="text-center max-w-md">
                  Generate a game first, then you can edit and customize its code here.
                </p>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
