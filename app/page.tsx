"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Camera, Upload, Zap, Leaf, Sparkles } from "lucide-react"

const CannabisLeafBackground = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-10">
    {/* Large decorative leaves */}
    <div className="absolute top-10 left-10 transform rotate-12">
      <Leaf className="w-24 h-24 text-green-400" />
    </div>
    <div className="absolute top-32 right-16 transform -rotate-45">
      <Leaf className="w-32 h-32 text-green-300" />
    </div>
    <div className="absolute bottom-20 left-20 transform rotate-45">
      <Leaf className="w-28 h-28 text-green-500" />
    </div>
    <div className="absolute bottom-40 right-10 transform -rotate-12">
      <Leaf className="w-20 h-20 text-green-400" />
    </div>
    <div className="absolute top-1/2 left-1/4 transform -rotate-30">
      <Leaf className="w-16 h-16 text-green-300" />
    </div>
    <div className="absolute top-1/3 right-1/3 transform rotate-60">
      <Leaf className="w-18 h-18 text-green-500" />
    </div>

    {/* Mobile-specific smaller leaves */}
    <div className="md:hidden">
      <div className="absolute top-16 right-4 transform rotate-30">
        <Leaf className="w-12 h-12 text-green-400" />
      </div>
      <div className="absolute bottom-32 left-4 transform -rotate-45">
        <Leaf className="w-14 h-14 text-green-300" />
      </div>
    </div>
  </div>
)

export default function HighDetectorPage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [result, setResult] = useState<{ score: number; analysis: string } | null>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [isWebcamActive, setIsWebcamActive] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsWebcamActive(true)
      }
    } catch (error) {
      console.error("Error accessing webcam:", error)
      alert("Could not access webcam. Please check permissions.")
    }
  }

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
      videoRef.current.srcObject = null
      setIsWebcamActive(false)
    }
  }

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current
      const video = videoRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      const ctx = canvas.getContext("2d")
      if (ctx) {
        ctx.drawImage(video, 0, 0)
        const imageData = canvas.toDataURL("image/jpeg", 0.8)
        setCapturedImage(imageData)
        stopWebcam()
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!capturedImage) return

    setIsAnalyzing(true)
    setResult(null)

    try {
      const response = await fetch("/api/analyze-face", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: capturedImage }),
      })

      if (!response.ok) {
        throw new Error("Analysis failed")
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Error analyzing image:", error)
      alert("Analysis failed. Please try again.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetApp = () => {
    setCapturedImage(null)
    setResult(null)
    stopWebcam()
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-600"
    if (score >= 60) return "bg-green-500"
    if (score >= 40) return "bg-green-400"
    return "bg-gray-500"
  }

  const getScoreEmoji = (score: number) => {
    if (score >= 80) return "🌿"
    if (score >= 60) return "😵‍💫"
    if (score >= 40) return "😌"
    return "😊"
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-4 relative">
      <CannabisLeafBackground />

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-6 md:mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Leaf className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white font-sans">High Detector</h1>
            <Sparkles className="w-6 h-6 md:w-8 md:h-8 text-green-400" />
          </div>
          <p className="text-green-200 text-base md:text-lg px-4">
            AI-powered analysis to detect your elevated state 🌿
          </p>
          <Badge variant="secondary" className="mt-2 bg-green-800 text-green-200">
            For Entertainment Purposes Only
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Camera/Upload Section */}
          <Card className="bg-white/10 backdrop-blur-md border-green-500/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <Camera className="w-5 h-5" />
                Capture Your Face
              </CardTitle>
              <CardDescription className="text-green-200 text-sm md:text-base">
                Use your webcam or upload a photo for analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!capturedImage && !isWebcamActive && (
                <div className="space-y-3">
                  <Button onClick={startWebcam} className="w-full bg-green-600 hover:bg-green-700 h-11 md:h-10">
                    <Camera className="w-4 h-4 mr-2" />
                    Start Webcam
                  </Button>
                  <div className="text-center text-green-200 text-sm">or</div>
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full border-green-500 text-green-200 hover:bg-green-800 h-11 md:h-10"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              )}

              {isWebcamActive && (
                <div className="space-y-3">
                  <video ref={videoRef} autoPlay playsInline className="w-full rounded-lg" />
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button onClick={capturePhoto} className="flex-1 bg-green-600 hover:bg-green-700 h-11 md:h-10">
                      <Zap className="w-4 h-4 mr-2" />
                      Capture
                    </Button>
                    <Button
                      onClick={stopWebcam}
                      variant="outline"
                      className="border-red-500 text-red-400 bg-transparent h-11 md:h-10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}

              {capturedImage && (
                <div className="space-y-3">
                  <img src={capturedImage || "/placeholder.svg"} alt="Captured face" className="w-full rounded-lg" />
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
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card className="bg-white/10 backdrop-blur-md border-green-500/30">
            <CardHeader className="pb-4">
              <CardTitle className="text-white flex items-center gap-2 text-lg md:text-xl">
                <Leaf className="w-5 h-5" />
                Analysis Results
              </CardTitle>
              <CardDescription className="text-green-200 text-sm md:text-base">
                AI assessment of your elevated state
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!result && !isAnalyzing && (
                <div className="text-center py-8 md:py-12 text-green-300">
                  <Leaf className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm md:text-base px-4">Capture or upload a photo to get started!</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="text-center py-8 md:py-12">
                  <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-2 border-green-400 mx-auto mb-4"></div>
                  <p className="text-green-200 text-sm md:text-base">Analyzing your face...</p>
                  <p className="text-xs md:text-sm text-green-300 mt-2">This may take a few seconds</p>
                </div>
              )}

              {result && (
                <div className="space-y-4 md:space-y-6">
                  <div className="text-center">
                    <div className="text-4xl md:text-6xl mb-2">{getScoreEmoji(result.score)}</div>
                    <div
                      className={`inline-flex items-center px-4 py-2 md:px-6 md:py-3 rounded-full text-white font-bold text-xl md:text-2xl ${getScoreColor(result.score)}`}
                    >
                      {result.score}% Elevated
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-3 md:p-4">
                    <h3 className="text-white font-semibold mb-2 text-sm md:text-base">AI Analysis:</h3>
                    <p className="text-green-200 leading-relaxed text-sm md:text-base">{result.analysis}</p>
                  </div>

                  <div className="text-center">
                    <Button onClick={resetApp} className="bg-green-600 hover:bg-green-700 h-11 md:h-10">
                      Try Again
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Disclaimer */}
        <div className="mt-6 md:mt-8 text-center">
          <Card className="bg-white/5 backdrop-blur-sm border-green-500/20">
            <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
              <p className="text-green-300 text-xs md:text-sm leading-relaxed">
                ⚠️ This is a fun entertainment app and should not be used for any serious purposes. Results are generated
                by AI and are not medically or legally accurate.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
