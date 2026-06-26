'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { login } from '@/services/authService'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn)

  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  if (isLoggedIn) {
    router.replace('/dashboard')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login({ user_email: email, user_password: password })
      router.replace('/dashboard')
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setError(e?.detail || 'Email atau password salah.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">Custherds</h1>
          <p className="text-slate-400 text-sm mt-1">Backoffice Panel</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl">Masuk</CardTitle>
            <CardDescription className="text-slate-400">
              Login dengan akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <Alert variant="destructive" className="border-red-800 bg-red-900/30">
                  <AlertDescription className="text-red-300">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-300">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@custherds.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPass ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    className="bg-slate-700 border-slate-600 text-white placeholder:text-slate-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium"
              >
                {loading ? (
                  <><Loader2 size={16} className="mr-2 animate-spin" /> Masuk...</>
                ) : 'Masuk'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-slate-500 text-xs mt-6">
          &copy; {new Date().getFullYear()} Custherds. All rights reserved.
        </p>
      </div>
    </div>
  )
}
