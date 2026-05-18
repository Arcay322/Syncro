import { signIn } from "@/auth"
import { Button } from "@/components/ui/button"
import { Diamond, Mail, Lock, Ticket } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="h-full flex flex-col items-center justify-center relative overflow-hidden px-4 bg-[#1b1012]">
      {/* Top Logo */}
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

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-sm">
        {/* Card border glow */}
        <div className="absolute -inset-[1px] bg-gradient-to-b from-[rgba(222,191,195,0.12)] to-transparent rounded-lg opacity-50" />
        
        <div className="relative bg-[#2c1a1d]/80 border border-[rgba(222,191,195,0.08)] rounded-lg p-8">
          {/* Select Profile */}
          <h2 className="text-center text-sm font-display font-semibold text-[#f4dde0] mb-6 tracking-wide">
            Select Profile
          </h2>

          {/* Profile avatars */}
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full border-2 border-[rgba(222,191,195,0.4)] overflow-hidden bg-[#3f3133] flex items-center justify-center">
                <span className="text-lg font-display text-[#f4dde0]">A</span>
              </div>
              <span className="text-[10px] text-[#9b8e8f] tracking-wider">Arnie</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-14 h-14 rounded-full border-2 border-[rgba(222,191,195,0.4)] overflow-hidden bg-[#3f3133] flex items-center justify-center">
                <span className="text-lg font-display text-[#f4dde0]">E</span>
              </div>
              <span className="text-[10px] text-[#9b8e8f] tracking-wider">Ella</span>
            </div>
          </div>

          {/* Private Access divider */}
          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-[rgba(245,197,24,0.2)]" />
            <div className="flex items-center gap-1.5">
              <Diamond className="w-2 h-2 text-[#debfc3]" />
              <span className="text-[8px] tracking-[0.2em] uppercase text-[#debfc3]">Private Access</span>
              <Diamond className="w-2 h-2 text-[#debfc3]" />
            </div>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-[rgba(245,197,24,0.2)]" />
          </div>

          {/* Google Auth Button styled as Enter the Theater */}
          <form
            action={async () => {
              "use server"
              await signIn("google", { redirectTo: "/" })
            }}
          >
            <Button 
              type="submit" 
              className="w-full h-11 gap-2 text-xs font-semibold tracking-[0.1em] uppercase rounded-md bg-[#debfc3] text-[#1b1012] hover:bg-[#d4b5b9] transition-colors" 
            >
              <Ticket className="w-4 h-4" />
              Enter the Theater
            </Button>
          </form>

          {/* Google hint */}
          <p className="text-center text-[9px] text-[#9b8e8f] mt-3 tracking-wider">
            Continue with Google
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 flex items-center gap-6">
        <span className="text-[9px] tracking-[0.15em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] cursor-pointer transition-colors">
          Archives
        </span>
        <span className="text-[9px] tracking-[0.15em] uppercase text-[#9b8e8f] hover:text-[#f4dde0] cursor-pointer transition-colors">
          Support
        </span>
      </div>
    </div>
  )
}
