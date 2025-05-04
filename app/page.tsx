import { Suspense } from "react"
import Navbar from "@/components/navbar"
import ChatInterface from "@/components/chat-interface"
import GamePreview from "@/components/game-preview"
import CommandPalette from "@/components/command-palette"
import ExampleGameButton from "@/components/example-game-button"
import SetupOpenAI from "@/components/setup-openai"
import { Toaster } from "@/components/ui/toaster"
import { Skeleton } from "@/components/ui/skeleton"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <Navbar />

      <div className="container mx-auto px-4 py-8 flex-1 flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-1/2 flex flex-col">
          <h1 className="text-4xl font-bold mb-2 text-slate-900 dark:text-white">AI Game Creator</h1>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Describe your game idea and watch it come to life instantly
          </p>

          <SetupOpenAI />

          <div className="mt-6">
            <Suspense
              fallback={
                <div className="h-[600px] w-full rounded-lg bg-white dark:bg-slate-900 border shadow-sm p-4 flex flex-col">
                  <div className="flex-1 space-y-4">
                    <Skeleton className="w-3/4 h-8" />
                    <Skeleton className="w-full h-24" />
                    <Skeleton className="w-2/3 h-8" />
                    <Skeleton className="w-full h-24" />
                  </div>
                  <div className="h-16 border-t mt-4 pt-4">
                    <div className="flex gap-2">
                      <Skeleton className="flex-1 h-12" />
                      <Skeleton className="w-12 h-12" />
                    </div>
                  </div>
                </div>
              }
            >
              <ChatInterface />
            </Suspense>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Game Preview</h2>
            <ExampleGameButton />
          </div>

          <GamePreview />
        </div>
      </div>

      <CommandPalette />
      <Toaster />
    </main>
  )
}
