'use client'

import { useState } from "react"
import Link from "next/link"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudentStatus, refreshCache } from "@/actions/xlsx.actions"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"

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
    } catch (error) {
      setResult({ error: 'An error occurred while fetching the result.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefreshCache = async () => {
    setRefreshMessage('Refreshing cache...')
    try {
      const result = await refreshCache()
      setRefreshMessage(result.message)
    } catch (error) {
      setRefreshMessage('Failed to refresh cache')
    }
    setTimeout(() => setRefreshMessage(''), 3000)
  }

  return (
    <div className="flex flex-col min-h-[100dvh]">
      <header className="bg-primary text-primary-foreground px-4 py-3 flex items-center justify-between">
        <Link href="#" className="font-medium" prefetch={false}>
          GIAIC Prep Partners
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check Your GIAIC Result</CardTitle>
            <CardDescription>Enter your roll number to see your quarter 1 result.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number</Label>
                <Input
                  id="rollNumber"
                  type="text"
                  placeholder="Enter your roll number"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  'Check Result'
                )}
              </Button>
            </form>
            {result && !result.error && (
              <div className={`mt-4 rounded-md ${result.status === 'Pass' ? 'bg-success/10 border-success' : 'bg-error/10 border-error'} border p-4`}>
                <div className="flex items-start gap-3">
                  {result.status === 'Pass' ? (
                    <CheckCircle className="h-6 w-6 text-success shrink-0" />
                  ) : (
                    <XCircle className="h-6 w-6 text-error shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold">{result.status === 'Pass' ? 'Congratulations!' : 'Keep pushing forward!'}</p>
                    <p>Roll Number: {result.rollNumber}</p>
                    <p>Status: {result.status}</p>
                    <p className="mt-2 text-sm">{result.message}</p>
                  </div>
                </div>
              </div>
            )}
            {result && result.error && (
              <div className="mt-4 rounded-md bg-error/10 border border-error text-error p-4">
                <div className="flex items-center gap-3">
                  <XCircle className="h-6 w-6 shrink-0" />
                  <p>{result.error}</p>
                </div>
              </div>
            )}
            {refreshMessage && (
              <div className="mt-4 text-sm text-muted-foreground">
                {refreshMessage}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
      <footer className="bg-muted text-muted-foreground px-4 py-3 flex items-center justify-between">
        <p className="text-sm">
          Made with love by <Link href="https://linkedin.com/in/growwithtalha-webdeveloper" className="font-medium">Talha Ali</Link>
        </p>
      </footer>
    </div>
  )
}
