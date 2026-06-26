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
import { login } from "@/services/authService"
import { useAuthStore } from "@/store/auth.store"

interface LoginFormProps extends React.ComponentPropsWithoutRef<"div"> {
  role?: "vendor" | "guide" | "admin" | "default"
  registerHref?: string
}

const roleLabels: Record<string, string> = {
  vendor:  "Business Vendor",
  guide:   "Herd Guide",
  admin:   "Administrator",
  default: "Partner",
}

const roleUserType: Record<string, number> = {
  vendor:  2,
  guide:   1,
  admin:   99,
  default: 0,
}

const roleRedirects: Record<string, string> = {
  vendor:  "/vendor/dashboard",
  guide:   "/guide/dashboard",
  admin:   "/dashboard",
  default: "/dashboard",
}

export function LoginForm({
  className,
  role = "default",
  registerHref = "#",
  ...props
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail]               = useState("")
  const [password, setPassword]         = useState("")
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await login({ user_email: email, user_password: password })
      const expectedType = roleUserType[role]
      if (expectedType !== 0 && result.user?.user_type !== expectedType) {
        setError(`Akun ini bukan akun ${roleLabels[role]}. Gunakan halaman login yang sesuai.`)
        useAuthStore.getState().logout()
        return
      }
      window.location.href = roleRedirects[role]
    } catch (err: unknown) {
      const e = err as { detail?: string }
      setError(e?.detail || "Email atau password salah.")
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
                    <a href="#" className="ml-auto text-sm underline-offset-4 hover:underline">
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

                {error && (
                  <p className="text-sm rounded-md px-3 py-2 text-red-600 bg-red-50 border border-red-200">
                    {error}
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
