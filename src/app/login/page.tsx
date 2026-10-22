import { LogIn, Sparkles, Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto my-12 bg-white border border-border rounded-3xl p-8 shadow-sm text-center space-y-6">
      <div className="w-12 h-12 bg-blue-50 text-[#2776db] rounded-2xl flex items-center justify-center mx-auto">
        <Sparkles className="w-6 h-6" />
      </div>

      <div>
        <h2 className="text-2xl font-extrabold text-foreground">
          Iniciar Sesión
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          Acceso exclusivo para Yanina (Estudiante) y Abel (Administrador).
        </p>
      </div>

      <div className="p-4 bg-[#f8fafc] border border-border rounded-2xl text-xs text-muted-foreground space-y-2 text-left">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Shield className="w-4 h-4 text-[#169477]" />
          <span>Acceso Restringido por Lista Blanca</span>
        </div>
        <p>
          Para mantener la privacidad de tus apuntes y calendario, el inicio de sesión con Google requiere que tu correo esté registrado en la lista de acceso autorizada.
        </p>
      </div>

      <form action="/api/auth/signin/google" method="POST">
        <button
          type="submit"
          className="w-full py-3.5 px-4 bg-hero hover:bg-[#202f4a] text-white font-bold text-sm rounded-2xl shadow-sm transition flex items-center justify-center gap-2"
        >
          <LogIn className="w-4 h-4" />
          <span>Continuar con Google</span>
        </button>
      </form>
    </div>
  );
}
