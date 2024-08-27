'use client'

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import confetti from 'canvas-confetti'
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudentStatus, refreshCache } from "@/actions/xlsx.actions"
import { Loader2, CheckCircle, XCircle, RefreshCw, Trophy, Target } from "lucide-react"

export default function Component() {
  const [rollNumber, setRollNumber] = useState('')
  const [result, setResult] = useState<{ rollNumber?: string; status?: string; message?: string; error?: string } | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshMessage, setRefreshMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)
    try {
      const status = await getStudentStatus(rollNumber)
      setResult(status)
      if (status.status === 'Pass') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }
    } catch (error) {
      setResult({ error: 'An error occurred while fetching the result.' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-[100dvh] bg-gradient-to-b from-primary/10 to-primary/5">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <Link href="#" className="font-medium text-lg" prefetch={false}>
          GIAIC Prep Partners
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Check Your GIAIC Result</CardTitle>
            <CardDescription className="text-center">Enter your roll number to see your quarter 1 result.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  type="number"
                  min={6}
                  max={6}
                  placeholder="Enter your roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                  className="text-center text-lg"
                />
              </div>
              <Button type="submit" className="w-full text-lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Result'
                )}
              </Button>
            </form>
            <AnimatePresence mode="wait">
              {result && !result.error && (
                <motion.div
                  key={result.status}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`mt-6 rounded-lg ${result.status === 'Pass' ? 'bg-success/20' : 'bg-error/20'} p-6 text-center`}
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 500, damping: 30 }}
                    className="mb-4"
                  >
                    {result.status === 'Pass' ? (
                      <Trophy className="h-16 w-16 text-success mx-auto" />
                    ) : (
                      <Target className="h-16 w-16 text-error mx-auto" />
                    )}
                  </motion.div>
                  <h3 className="text-2xl font-bold mb-2">
                    {result.status === 'Pass' ? 'Congratulations!' : 'Keep pushing forward!'}
                  </h3>
                  <p className="text-lg mb-2">Roll Number: {result.rollNumber}</p>
                  <p className="text-xl font-semibold mb-4">Status: {result.status}</p>
                  <p className="text-sm italic">{result.message}</p>
                </motion.div>
              )}
              {result && result.error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 rounded-lg bg-error/20 p-6 text-center"
                >
                  <XCircle className="h-12 w-12 text-error mx-auto mb-4" />
                  <p className="text-lg font-semibold">{result.error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            {refreshMessage && (
              <div className="mt-4 text-sm text-muted-foreground text-center">
                {refreshMessage}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="bg-muted text-muted-foreground px-4 py-3 text-center">
        <p className="text-sm">
          Made with ❤️ by <Link href="https://linkedin.com/in/growwithtalha-webdeveloper" className="font-medium underline text-primary">Talha Ali</Link>
        </p>
      </footer>
    </div>
  )
}
