"use client"

import Image from "next/image"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function GuideLoginPage() {
  const [showPw, setShowPw]   = useState(false)
  const [email, setEmail]     = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState("")
  const [ok, setOk]           = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg("")
    setLoading(true)
    try {
      const params = new URLSearchParams()
      params.append("email", email)
      params.append("password", password)
      const res  = await fetch("https://www.custherds.com/guide/login/doLogin", {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    params.toString(),
      })
      const data = await res.json()
      if (data.status) {
        setOk(true)
        setMsg(data.msg || "Login successful! Redirecting\u2026")
        if (data.redirect) setTimeout(() => { window.location.href = data.redirect }, 800)
      } else {
        setOk(false)
        setMsg(data.msg || "Invalid email or password.")
      }
    } catch {
      setOk(false)
      setMsg("Network error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh w-full flex items-center justify-center bg-[#0a0a0a] p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="flex flex-col gap-6">

          {/* Logo */}
          <div className="flex items-center justify-center">
            <Image
              src="/logo-1.png"
              alt="Custherds"
              width={180}
              height={50}
              priority
              className="object-contain"
            />
          </div>

          {/* Card */}
          <Card className="bg-[#161616] border border-[#2a2a2a] rounded-2xl shadow-xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a84c]">
                <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A8.966 8.966 0 0112 15c2.21 0 4.21.797 5.879 2.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <CardTitle className="text-white text-2xl font-bold">Herd Guide</CardTitle>
              <CardDescription className="text-[#888] text-sm">
                Access your Custherds guide dashboard
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-5 mt-2">

                <div className="grid gap-2">
                  <Label htmlFor="email" className="text-[#ccc] text-sm font-semibold">
                    Email <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="guide@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="bg-[#1e1e1e] border-[#333] text-white placeholder:text-[#555] focus:border-[#c9a84c] h-11"
                  />
                </div>

                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-[#ccc] text-sm font-semibold">
                      Password <span className="text-red-400">*</span>
                    </Label>
                    <a href="/guide/forgot-password" className="text-xs text-[#c9a84c] hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPw ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="bg-[#1e1e1e] border-[#333] text-white placeholder:text-[#555] focus:border-[#c9a84c] h-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#c9a84c]"
                      aria-label={showPw ? "Hide password" : "Show password"}
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {msg && (
                  <p className={`text-sm rounded-lg px-3 py-2 ${
                    ok
                      ? "text-green-400 bg-green-400/10 border border-green-400/30"
                      : "text-red-400 bg-red-400/10 border border-red-400/30"
                  }`}>
                    {msg}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 bg-[#c9a84c] hover:bg-[#b8943f] text-white font-semibold rounded-lg"
                >
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Logging in&hellip;</> : "Login"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="text-center text-xs text-[#555]">
            Not a guide?{" "}
            <a href="https://custherds.ourtestcloud.my.id/login" className="text-[#c9a84c] hover:underline">
              Back to main login
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
