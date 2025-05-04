"use client"

import { useState, useEffect } from "react"
import Editor, { type OnMount } from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { Loader2, Play, RotateCcw } from "lucide-react"
import { useGameStore } from "@/lib/game-store"
import { useToast } from "@/components/ui/use-toast"

interface CodeEditorProps {
  initialCode: string
  onCodeChange: (code: string) => void
  onRunCode: () => void
}

export default function CodeEditor({ initialCode, onCodeChange, onRunCode }: CodeEditorProps) {
  const [code, setCode] = useState(initialCode)
  const [isEditorReady, setIsEditorReady] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const { originalGameCode, setOriginalGameCode } = useGameStore()

  useEffect(() => {
    setCode(initialCode)
  }, [initialCode])

  const handleEditorDidMount: OnMount = () => {
    setIsEditorReady(true)
    setIsLoading(false)
  }

  const handleCodeChange = (value: string | undefined) => {
    if (value !== undefined) {
      setCode(value)
      onCodeChange(value)
    }
  }

  const handleReset = () => {
    if (originalGameCode) {
      setCode(originalGameCode)
      onCodeChange(originalGameCode)
      onRunCode()
      toast({
        title: "Code Reset",
        description: "The code has been reset to the original generated version.",
      })
    } else {
      toast({
        title: "Cannot Reset",
        description: "Original code not available.",
        variant: "destructive",
      })
    }
  }

  const handleRunCode = () => {
    onRunCode()
    toast({
      title: "Code Updated",
      description: "Your changes have been applied to the game preview.",
    })
  }

  return (
    <div className="flex flex-col h-full">
      <div className="border-b p-2 flex justify-between items-center bg-slate-50 dark:bg-slate-800">
        <div className="text-sm font-medium">Edit Game Code</div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            disabled={!isEditorReady || !originalGameCode}
            className="h-8"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
          <Button variant="default" size="sm" onClick={handleRunCode} disabled={!isEditorReady} className="h-8">
            <Play className="h-3.5 w-3.5 mr-1" />
            Run
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0">
        {isLoading && (
          <div className="h-full flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}
        <Editor
          height="100%"
          defaultLanguage="html"
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            wordWrap: "on",
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
          }}
          className={isLoading ? "hidden" : ""}
          theme="vs-dark"
        />
      </div>
    </div>
  )
}
