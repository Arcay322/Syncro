import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Film, Tv, Users } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="min-h-full flex flex-col items-center justify-center relative overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-amber-500/5 blur-[120px] pointer-events-none" />
      
      {/* Floating icons decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <Film className="absolute top-[20%] left-[15%] w-8 h-8 text-amber-500/10 rotate-12" />
        <Tv className="absolute top-[30%] right-[18%] w-10 h-10 text-amber-500/10 -rotate-6" />
        <Users className="absolute bottom-[25%] left-[20%] w-6 h-6 text-amber-500/10 rotate-3" />
      </div>

      <div className="relative z-10 flex flex-col items-center text-center gap-8 max-w-sm px-6">
        {/* Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
            <Film className="w-10 h-10 text-background" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center shadow-lg">
            <Users className="w-4 h-4 text-background" />
          </div>
        </div>

        {/* Text */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight text-foreground">
            Syncro
          </h1>
          <p className="text-muted-foreground text-base leading-relaxed">
            Tu espacio compartido para series y películas. Lleva el registro de lo que ves junto a alguien especial.
          </p>
        </div>

        {/* Features */}
        <div className="flex gap-6 text-sm text-muted-foreground">
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Film className="w-5 h-5 text-amber-400" />
            </div>
            <span>Watchlist</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-400" />
            </div>
            <span>Compartido</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Tv className="w-5 h-5 text-amber-400" />
            </div>
            <span>Progreso</span>
          </div>
        </div>

        {/* Login button */}
        <form
          action={async () => {
            "use server"
            await signIn("google", { redirectTo: "/" })
          }}
          className="w-full"
        >
          <Button 
            type="submit" 
            className="w-full gap-3 h-12 text-base font-medium rounded-xl bg-foreground text-background hover:bg-foreground/90 transition-all" 
            size="lg"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </Button>
        </form>

        <p className="text-xs text-muted-foreground/60">
          Inicia sesión para sincronizar tu watchlist
        </p>
      </div>
    </div>
  )
}
