"use client"

import type React from "react"
import { useState, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Zap, Leaf, Sparkles } from "lucide-react"

export default function HighDetectorPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string>("")
  const [score, setScore] = useState<number | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setCapturedImage(reader.result as string)
        setAnalysis("")
        setScore(null)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleImageUpload(event)
  }

  const analyzeImage = async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    setAnalysis("")
    setScore(null)

    try {
      const response = await fetch("/api/analyze-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: capturedImage }),
      })

      const data = await response.json()
      setScore(data.score)
      setAnalysis(data.analysis)
    } catch (error) {
      console.error("Error analyzing image:", error)
      setAnalysis("Error analyzing image. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetApp = () => {
    setCapturedImage(null)
    setAnalysis("")
    setScore(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 sm:p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Card className="bg-gray-800/60 border-green-500/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-3xl sm:text-4xl font-bold flex items-center gap-2">
              <Leaf className="text-green-400" /> Elevated Detector
            </CardTitle>
            <CardDescription className="text-gray-300">
              Upload or capture a face photo to see if you&apos;re vibin&apos; with the clouds ☁️
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!capturedImage ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-24 sm:h-32"
                >
                  <Upload className="w-6 h-6" />
                  <span>Upload Image</span>
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-24 sm:h-32"
                >
                  <Camera className="w-6 h-6" />
                  <span>Take Photo</span>
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handleCapture}
                />
              </div>
            ) : (
              <div className="space-y-3">
                <Image
                  src={capturedImage || "/placeholder.svg"}
                  alt="Captured face"
                  width={600}
                  height={400}
                  className="w-full rounded-lg"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={analyzeImage}
                    disabled={isAnalyzing}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-11 md:h-10"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 mr-2" />
                        Analyze Face
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetApp}
                    variant="outline"
                    className="border-green-500 text-green-200 bg-transparent h-11 md:h-10"
                  >
                    Reset
                  </Button>
                </div>
              </div>
            )}

            {score !== null && (
              <div className="bg-gray-900/60 border border-green-500/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Sparkles className="text-green-400" /> Elevation Level
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-lg px-3 py-1 border-green-400 text-green-300 bg-green-900/30"
                  >
                    {score}%
                  </Badge>
                </div>
                <p className="text-gray-300 leading-relaxed">{analysis}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
