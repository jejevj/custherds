"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Eye, EyeOff, Loader2 } from "lucide-react"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  role?: "vendor" | "guide" | "default"
  loginEndpoint?: string
  registerHref?: string
}

const roleLabels: Record<string, string> = {
  vendor: "Business Vendor",
  guide:  "Herd Guide",
  default: "Partner",
}

// Default redirect per role
const roleRedirects: Record<string, string> = {
  vendor: "/vendor/dashboard",
  guide:  "/guide/dashboard",
  default: "/dashboard/analytics",
}

export function LoginForm({
  className,
  role = "default",
  loginEndpoint,
  registerHref = "#",
  ...props
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [loading, setLoading]           = useState(false)
  const [msg, setMsg]                   = useState("")
  const [ok, setOk]                     = useState(false)

  // TODO: Remove demo mode and re-enable API validation before production
  const DEMO_MODE = true

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setMsg("")
    setLoading(true)

    if (DEMO_MODE) {
      // Demo: langsung redirect tanpa validasi
      setOk(true)
      setMsg("Login successful! Redirecting\u2026")
      const redirectUrl = roleRedirects[role] || roleRedirects["default"]
      setTimeout(() => { window.location.href = redirectUrl }, 800)
      setLoading(false)
      return
    }

    // Production: validasi via API
    if (!loginEndpoint) { setLoading(false); return }
    try {
      const params = new URLSearchParams()
      params.append("email",    email)
      params.append("password", password)
      const res  = await fetch(loginEndpoint, {
        method:  "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body:    params.toString(),
      })
      const data = await res.json()
      if (data.status) {
        setOk(true)
        setMsg(data.msg || "Login successful! Redirecting\u2026")
        const redirectUrl = data.redirect || roleRedirects[role] || roleRedirects["default"]
        setTimeout(() => { window.location.href = redirectUrl }, 800)
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Welcome back</CardTitle>
          <CardDescription>
            Sign in as {roleLabels[role]}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                      href="#"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </a>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {msg && (
                  <p className={cn(
                    "text-sm rounded-md px-3 py-2",
                    ok
                      ? "text-green-600 bg-green-50 border border-green-200"
                      : "text-red-600 bg-red-50 border border-red-200"
                  )}>
                    {msg}
                  </p>
                )}

                {DEMO_MODE && (
                  <p className="text-xs text-center text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
                    ⚠️ Demo mode aktif — login tanpa validasi
                  </p>
                )}

                <Button type="submit" className="w-full h-9" disabled={loading}>
                  {loading
                    ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Logging in&hellip;</>
                    : "Login"
                  }
                </Button>
              </div>
              <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <a href={registerHref} className="underline underline-offset-4">
                  Sign up
                </a>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:hover:text-primary">
        By clicking continue, you agree to our{" "}
        <a href="https://custherds.ourtestcloud.my.id/terms">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
