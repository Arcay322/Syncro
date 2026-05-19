"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Diamond, Ticket } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isRegister, setIsRegister] = useState(false)
  const [loginId, setLoginId] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (isRegister) {
      try {
        const res = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name, username }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error || "Error al registrarse")
          setLoading(false)
          return
        }
        const result = await signIn("credentials", {
          username: email,
          password,
          redirect: false,
        })
        if (result?.ok) {
          router.push("/")
          router.refresh()
        } else {
          setError("Error al iniciar sesión")
        }
      } catch {
        setError("Error de conexión")
      }
    } else {
      const result = await signIn("credentials", {
        username: loginId,
        password,
        redirect: false,
      })
      if (result?.ok) {
        router.push("/")
        router.refresh()
      } else if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Usuario o contraseña incorrectos" : result.error)
      } else {
        setError("Error al iniciar sesión")
      }
    }
    setLoading(false)
  }

  const handleGoogle = () => {
    signIn("google", { callbackUrl: "/" })
  }

  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden px-4 bg-[#1b1012]">
      {/* Logo */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
        <div className="relative">
          <Diamond className="w-5 h-5 text-[#f5c518]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-[#1b1012]" />
          </div>
        </div>
        <span className="font-display text-lg font-semibold tracking-[0.2em] text-[#f5c518] uppercase">Syncro</span>
        <div className="h-[2px] w-16 bg-gradient-to-r from-transparent via-[#f5c518] to-transparent absolute -bottom-1 left-1/2 -translate-x-1/2" />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-sm">
        <div className="absolute -inset-[1px] bg-gradient-to-b from-[rgba(222,191,195,0.12)] to-transparent rounded-lg opacity-50" />
        
        <div className="relative bg-[#2c1a1d]/80 border border-[rgba(222,191,195,0.08)] rounded-lg p-8">
          <h2 className="text-center text-sm font-display font-semibold text-[#f4dde0] mb-6 tracking-wide">
            {isRegister ? "Crear cuenta" : "Iniciar sesión"}
          </h2>

          {error && (
            <p className="text-center text-xs text-[#ffb4ab] mb-4">{error}</p>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {isRegister ? (
              <>
                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#9b8e8f] mb-1.5 block">Nombre</label>
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 bg-[#1b1012] border-[rgba(222,191,195,0.15)] text-[#f4dde0] rounded-md text-sm focus:ring-1 focus:ring-[#debfc3]/30 focus:border-[#debfc3]/30"
                    placeholder="Tu nombre"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#9b8e8f] mb-1.5 block">Usuario (opcional)</label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="h-10 bg-[#1b1012] border-[rgba(222,191,195,0.15)] text-[#f4dde0] rounded-md text-sm focus:ring-1 focus:ring-[#debfc3]/30 focus:border-[#debfc3]/30"
                    placeholder="usuario123"
                  />
                </div>
                <div>
                  <label className="text-[10px] tracking-[0.15em] uppercase text-[#9b8e8f] mb-1.5 block">Correo electrónico</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-10 bg-[#1b1012] border-[rgba(222,191,195,0.15)] text-[#f4dde0] rounded-md text-sm focus:ring-1 focus:ring-[#debfc3]/30 focus:border-[#debfc3]/30"
                    placeholder="correo@ejemplo.com"
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="text-[10px] tracking-[0.15em] uppercase text-[#9b8e8f] mb-1.5 block">Usuario o correo</label>
                <Input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  required
                  className="h-10 bg-[#1b1012] border-[rgba(222,191,195,0.15)] text-[#f4dde0] rounded-md text-sm focus:ring-1 focus:ring-[#debfc3]/30 focus:border-[#debfc3]/30"
                  placeholder="usuario o correo"
                />
              </div>
            )}
            
            <div>
              <label className="text-[10px] tracking-[0.15em] uppercase text-[#9b8e8f] mb-1.5 block">Contraseña</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-10 bg-[#1b1012] border-[rgba(222,191,195,0.15)] text-[#f4dde0] rounded-md text-sm focus:ring-1 focus:ring-[#debfc3]/30 focus:border-[#debfc3]/30"
                placeholder="••••••••"
              />
            </div>

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full h-11 gap-2 text-xs font-semibold tracking-[0.1em] uppercase rounded-md bg-[#debfc3] text-[#1b1012] hover:bg-[#d4b5b9] transition-colors disabled:opacity-50" 
            >
              <Ticket className="w-4 h-4" />
              {loading ? "Cargando..." : isRegister ? "Crear cuenta" : "Entrar al teatro"}
            </Button>
          </form>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[rgba(222,191,195,0.15)]" />
            <span className="text-[8px] tracking-[0.2em] uppercase text-[#9b8e8f]">o</span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[rgba(222,191,195,0.15)]" />
          </div>

          <Button 
            onClick={handleGoogle}
            className="w-full h-10 gap-2 text-xs font-medium tracking-wider rounded-md bg-transparent border border-[rgba(222,191,195,0.2)] text-[#debfc3] hover:bg-[rgba(222,191,195,0.06)] transition-colors" 
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>

          <p className="text-center text-[10px] text-[#9b8e8f] mt-5 tracking-wider">
            {isRegister ? "¿Ya tienes cuenta?" : "¿No tienes cuenta?"}{" "}
            <button
              onClick={() => { setIsRegister(!isRegister); setError("") }}
              className="text-[#debfc3] hover:text-[#f4dde0] transition-colors underline underline-offset-2"
            >
              {isRegister ? "Iniciar sesión" : "Registrarse"}
            </button>
          </p>
        </div>
      </div>

      <div className="absolute bottom-8 flex items-center gap-6">
        <span className="text-[9px] tracking-[0.15em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] cursor-pointer transition-colors">
          Archivo
        </span>
        <span className="text-[9px] tracking-[0.15em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] cursor-pointer transition-colors">
          Soporte
        </span>
      </div>
    </div>
  )
}
