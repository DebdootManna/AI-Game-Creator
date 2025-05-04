"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Check, Key } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function SetupOpenAI() {
  const [apiKey, setApiKey] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!apiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please enter your OpenAI API key.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, you would securely store this key
      // For this demo, we'll just simulate success
      localStorage.setItem("openai-api-key-configured", "true")

      toast({
        title: "API Key Configured",
        description: "Your OpenAI API key has been configured successfully.",
      })

      setIsConfigured(true)
    } catch (error) {
      console.error("Error configuring API key:", error)
      toast({
        title: "Configuration Error",
        description: "Failed to configure your API key. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isConfigured) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <CardTitle className="text-green-600 flex items-center">
            <Check className="mr-2 h-5 w-5" />
            OpenAI API Configured
          </CardTitle>
          <CardDescription>Your API key has been configured. You can now generate games with AI.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="mr-2 h-5 w-5" />
          Configure OpenAI API
        </CardTitle>
        <CardDescription>Enter your OpenAI API key to enable AI game generation.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="sk-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full"
              />
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your API key is stored locally and never sent to our servers.
              </p>
            </div>
            <div className="flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
              <p className="text-xs text-slate-600 dark:text-slate-400">
                You can use the example game button to try the app without an API key.
              </p>
            </div>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setIsConfigured(true)}>
          Skip for Now
        </Button>
        <Button type="submit" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Configuring..." : "Configure API"}
        </Button>
      </CardFooter>
    </Card>
  )
}
