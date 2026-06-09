import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Phone, CheckCircle2, User, Sparkles, MessageSquare, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { UserProfile } from "../types";

// Dynamic preset avatars to quickly style your profile
const PRESET_AVATARS = [
  "https://lh3.googleusercontent.com/aida-public/AB6AXuC5OEoHxs6KaUj6UAXJGK6T0fvLGe8SXtA4edUFsgCPdAsachgS2chJvIrmbZsOSVq3EnZVTcRU1qHyWtTiafWDQptWfcQT7Dvz2xYIywGavKY0vb88pATMNb_seU5fyiYERFCmg_QFMyrEyWRalLHSd_HRVcqKZmHTkzAwBObJvaF6AnPyZstDAHkngnlxnJPCK_QgOD56JIv-57NxP5yYYBvHWKI-cX5XOr4JopQTISES6QKBajxlbkLKpdmHxvvshia8vi7cJ50",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDRt0uDEqwQNtWX2A0BwPnCJUimTVmoSDxw3BzVAob7Na5khcKEXfXlOSXkwlnlHUwv3GKV4g33Wyr30V5l70Kn8JRO8uVd-9ErpczCfuvGX8gO6q9iQekuCyVm7NOD7pXSVECEPVC_slHVxJAJUNwLUf3nJl5DGdgqlDZ0nzf7_tfzrmOcyRqbtp2-jzOYvlJkuYNdEcL8A0keNdc0KlK9s-scxiPEW-vykuKSFwl_dEnz_hQuBOAtcScWafWeeaTwmXdVx6oF_h0",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuArK61BoYc5JbkwTVZVVeIdEBKTCLNx2Ittz7BonYrIJr5dR4I9_iqgNTl_t2I21c7YCxhBVU4afxtoI8E78ecrnxc9ViZD1QJONKGhl4bXLu_XT6Gdm37W15E7pspZPXBLQ2TKko3zCBwJJRRWaSnGXJ3I9R4qRxF6X1Py4OBo5d9h-1_ylmo_A4tB1asmcNhWOJN1dlcbX2Jty4z3r0noPPoIwkPAD9pYDYOVscxCTueTD3CpzAGlhc9tB0nUlYYQ3Wk9NRBzhM4",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBKSXNBNDcgkW_kpuFWxy1K4JoCFRnRGhlKTWH5wBdFiYIUK-ooXMPzi4WByrNnVgqDmcw5C22I3Znylon5Zy5rVxsUaOrkCUZZDHeF2ODRPhptaqNTYltg3cJDgWcVy6nkB7K41jrXJoYQByHFaPIbfkLsQnoteEz4Bu6qMmtmR77R-EONvLb_DIU2i6k0MYVhLqdPCee2eyb_OdO_IGJ-ZOS33FAqPrPFGPhrtMYPXtVi43v3ZB3tXaIgkw2Zvohq0OM3PcX_-j8",
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDTvR68CIdpGj8BByAomS78_0mO-qC86Hnco_8mP8t5Uu1000oM880M880M880"
];

interface OnboardingProps {
  onComplete: (user: UserProfile) => void;
}

type OnboardingStep = "welcome" | "phone" | "otp" | "profile";

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(59);
  const [name, setName] = useState("");
  const [nickname, setNickname] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Re-send countdown
  useEffect(() => {
    if (step === "otp" && countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [step, countdown]);

  // Phone input formatting (Brazil standard: (XX) XXXXX-XXXX)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.substring(0, 11);

    if (val.length > 7) {
      val = `(${val.substring(0, 2)}) ${val.substring(2, 7)}-${val.substring(7)}`;
    } else if (val.length > 2) {
      val = `(${val.substring(0, 2)}) ${val.substring(2)}`;
    } else if (val.length > 0) {
      val = `(${val}`;
    }
    setPhone(val);
    setErrorMsg("");
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setErrorMsg("Por favor, digite um celular válido com DDD.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone })
      });
      const data = await res.json();
      if (res.ok) {
        setCountdown(59);
        setStep("otp");
      } else {
        setErrorMsg(data.error || "Algo deu errado. Tente novamente.");
      }
    } catch (err) {
      setErrorMsg("Erro na conexão com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  // OTP input mechanics
  const handleOtpInput = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const nextCode = [...otpCode];
    nextCode[index] = value.substring(value.length - 1);
    setOtpCode(nextCode);

    // Auto focus next box
    if (value && index < 5) {
      const nextEl = document.getElementById(`otp-input-${index + 1}`);
      nextEl?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpCode[index] && index > 0) {
      const prevEl = document.getElementById(`otp-input-${index - 1}`);
      prevEl?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otpCode.join("");
    if (fullCode.length < 6) {
      setErrorMsg("Por favor, digite o código completo de 6 dígitos.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: fullCode })
      });
      const data = await res.json();
      if (res.ok) {
        setStep("profile");
        setErrorMsg("");
      } else {
        setErrorMsg(data.error || "Dados inválidos ou código incorreto.");
      }
    } catch (err) {
      setErrorMsg("Erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg("Seu nome completo é necessário.");
      return;
    }
    const safeNick = nickname.trim().startsWith("@") ? nickname.trim() : `@${nickname.trim() || name.split(" ")[0].toLowerCase()}`;

    const profile: UserProfile = {
      name: name.trim(),
      nickname: safeNick,
      phone: phone,
      avatar: selectedAvatar,
      isRegistered: true
    };

    onComplete(profile);
  };

  const handleSkipOrMock = () => {
    // Quick bypass so developers can test quickly
    setName("Lucas Silva");
    setNickname("@lucas_s");
    setPhone("+55 (11) 98888-7777");
    setSelectedAvatar(PRESET_AVATARS[1]);
    
    const profile: UserProfile = {
      name: "Lucas Silva",
      nickname: "@lucas_s",
      phone: "+55 (11) 98888-7777",
      avatar: PRESET_AVATARS[1],
      isRegistered: true
    };
    onComplete(profile);
  };

  return (
    <div className="min-h-screen bg-[#0b1226] text-white flex flex-col items-center justify-between p-6 md:p-12 relative overflow-hidden font-sans select-none">
      {/* Background soft blurs */}
      <div className="absolute top-[-100px] left-[-100px] w-96 h-96 rounded-full bg-indigo-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 rounded-full bg-pink-600/10 blur-[120px] pointer-events-none" />

      {/* Header bar / Logo */}
      <div className="w-full flex items-center justify-between max-w-md z-15">
        <div className="flex items-center space-x-2">
          <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse" />
          <h1 className="text-xl font-bold tracking-[0.2em] bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
            SOLSTICE
          </h1>
        </div>
        {(step === "phone" || step === "otp") && (
          <button 
            onClick={handleSkipOrMock}
            className="text-xs text-indigo-400 font-mono tracking-tight hover:text-white transition duration-200"
          >
            Acesso Rápido ⚡
          </button>
        )}
      </div>

      {/* Main card box with clean animation */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-center py-8 z-10">
        <AnimatePresence mode="wait">
          {step === "welcome" && (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="text-center"
              id="welcome-screen"
            >
              <div className="relative inline-block mb-8">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center shadow-[0_8px_30px_rgb(99,102,241,0.25)] relative overflow-hidden">
                  <Sparkles className="w-10 h-10 text-white animate-pulse" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 translate-x-[-100%] animate-[shimmer_2s_infinite]" />
                </div>
                <span className="absolute -bottom-2 -right-2 bg-[#141b31]/90 border border-indigo-500/30 rounded-full py-1 px-3 text-[10px] font-mono tracking-wider flex items-center gap-1">
                  v1.2 LIVE
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 inline-block">
                A arte de celebrar, <br />
                <span className="bg-gradient-to-r from-indigo-400 via-pink-400 to-rose-400 bg-clip-text text-transparent">
                  na sua frequência.
                </span>
              </h2>

              <p className="text-sm md:text-base text-indigo-200/60 leading-relaxed mb-10 max-w-xs mx-auto">
                Crie convites imersivos, organize vaquinhas inteligentes, colecione memórias em tempo real.
              </p>

              <div className="space-y-4">
                <button
                  id="btn-get-started"
                  onClick={() => setStep("phone")}
                  className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white py-4 rounded-2xl font-semibold hover:opacity-95 transform active:scale-[0.98] transition-all shadow-lg shadow-indigo-950/40 flex items-center justify-center gap-2"
                >
                  Começar Experiência <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setStep("phone")}
                  className="w-full bg-white/5 text-slate-300 py-3.5 rounded-2xl text-xs font-medium hover:bg-white/10 active:scale-[0.99] transition duration-200"
                >
                  Já tenho conta
                </button>
              </div>
            </motion.div>
          )}

          {step === "phone" && (
            <motion.div
              key="phone"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-[#141b31]/60 backdrop-blur-md rounded-3xl p-6 border border-indigo-500/20 shadow-2xl"
              id="phone-screen"
            >
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4">
                  <Phone className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Seu Acesso</h3>
                <p className="text-xs text-indigo-200/50">
                  Informe o seu número para receber o código de segurança Solstice.
                </p>
              </div>

              <form onSubmit={handleSendOTP} className="space-y-5">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">
                    Número do Celular
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-indigo-200/40 font-mono">
                      +55
                    </span>
                    <input
                      id="phone-input"
                      type="tel"
                      placeholder="(11) 99999-9999"
                      value={phone}
                      onChange={handlePhoneChange}
                      className="w-full bg-slate-950/40 border border-indigo-500/20 focus:border-pink-500 p-4 pl-12 rounded-2xl text-white outline-none font-mono tracking-wide placeholder-indigo-200/20 text-sm transition-all"
                      autoFocus
                    />
                  </div>
                </div>

                {errorMsg && (
                  <div className="text-xs text-rose-400 flex items-center gap-1 bg-rose-500/5 p-2.5 rounded-xl border border-rose-500/20">
                    <CheckCircle2 className="w-4 h-4 text-rose-500 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  id="btn-send-otp"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-95 text-white py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transform active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? "Processando..." : "Receber Código"}
                </button>
              </form>

              <div className="mt-6 pt-5 border-t border-indigo-500/10 flex items-center justify-between text-[11px] text-indigo-200/40">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5" /> Conexão Segura</span>
                <span>Termos & Privacidade</span>
              </div>
            </motion.div>
          )}

          {step === "otp" && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="w-full bg-[#141b31]/60 backdrop-blur-md rounded-3xl p-6 border border-indigo-500/20 shadow-2xl"
              id="otp-screen"
            >
              <div className="mb-6">
                <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 mb-4 animate-pulse">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold tracking-tight mb-2">Verifique o Código</h3>
                <p className="text-xs text-indigo-200/50">
                  Enviamos uma senha de 6 dígitos para o número <span className="text-indigo-300 font-mono">{phone}</span>.
                </p>
              </div>

              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <div>
                  <div className="flex justify-between gap-2">
                    {otpCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-input-${index}`}
                        type="text"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpInput(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-12 h-14 bg-slate-950/40 border-2 border-indigo-500/20 focus:border-pink-500 text-center text-xl font-mono text-white rounded-xl outline-none transition"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </div>

                {errorMsg && (
                  <div className="text-xs text-rose-400 flex items-center gap-1 bg-rose-500/5 p-2.5 rounded-xl border border-rose-500/20">
                    <CheckCircle2 className="w-4 h-4 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  id="btn-verify"
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-95 text-white py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transform active:scale-95 transition disabled:opacity-50"
                >
                  {loading ? "Verificando..." : "Verificar e Prosseguir"}
                </button>
              </form>

              <div className="mt-6 flex flex-col items-center justify-center gap-3 text-xs text-indigo-200/40">
                {countdown > 0 ? (
                  <span>Reenviar código em <strong className="text-indigo-300 font-mono">{countdown}s</strong></span>
                ) : (
                  <button 
                    onClick={() => {
                      setCountdown(59);
                      setErrorMsg("");
                    }}
                    className="text-indigo-400 font-semibold hover:underline"
                  >
                    Reenviar Código OTP
                  </button>
                )}
                <div className="flex gap-4 mt-1 border-t border-indigo-500/10 pt-4 w-full justify-center">
                  <span className="flex items-center gap-1 text-[11px]"><MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> WhatsApp</span>
                  <span className="flex items-center gap-1 text-[11px]"><Phone className="w-3.5 h-3.5 text-blue-400" /> SMS</span>
                </div>
              </div>
            </motion.div>
          )}

          {step === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-[#141b31]/60 backdrop-blur-md rounded-3xl p-6 border border-indigo-500/20 shadow-2xl"
              id="profile-screen"
            >
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold tracking-tight mb-2">Cria Sua Vibe</h3>
                <p className="text-xs text-indigo-200/50">
                  Como o coletivo deve te chamar nos portais de eventos?
                </p>
              </div>

              <form onSubmit={handleCompleteRegister} className="space-y-5">
                {/* Avatar customizer */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-full border-2 border-indigo-500 bg-slate-950/60 overflow-hidden flex items-center justify-center relative shadow-lg">
                      <img 
                        referrerPolicy="no-referrer"
                        src={selectedAvatar} 
                        alt="Selecione seu Avatar" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="absolute bottom-0 right-0 bg-indigo-500 p-1.5 rounded-full border border-[#141b31]">
                      <Sparkles className="w-3 h-3 text-white" />
                    </span>
                  </div>
                  
                  {/* Avatar Picker List */}
                  <div className="flex gap-2.5 mt-1 overflow-x-auto py-1 max-w-full">
                    {PRESET_AVATARS.map((av, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(av)}
                        className={`w-9 h-9 rounded-full overflow-hidden border-2 flex-shrink-0 transition ${selectedAvatar === av ? "border-pink-500 scale-105" : "border-transparent opacity-60 hover:opacity-100"}`}
                      >
                        <img referrerPolicy="no-referrer" src={av} alt={`av-${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-1.5">
                      Nome Completo
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-300/40">
                        <User className="w-4 h-4" />
                      </span>
                      <input
                        id="profile-name-input"
                        type="text"
                        placeholder="Como está no seu ID"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          setErrorMsg("");
                        }}
                        className="w-full bg-slate-950/40 border border-indigo-500/20 focus:border-pink-500 p-3.5 pl-11 rounded-2xl text-white outline-none text-sm placeholder-indigo-200/20 transition-all font-sans"
                        autoFocus
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-1.5">
                      Como quer ser chamado(a)?
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 font-mono text-indigo-400 text-sm">
                        @
                      </span>
                      <input
                        id="profile-nick-input"
                        type="text"
                        placeholder="nickname"
                        value={nickname.replace("@", "")}
                        onChange={(e) => {
                          setNickname(e.target.value);
                          setErrorMsg("");
                        }}
                        className="w-full bg-slate-950/40 border border-indigo-500/20 focus:border-pink-500 p-3.5 pl-9 rounded-2xl text-white outline-none font-mono text-sm placeholder-indigo-200/20 transition-all"
                      />
                    </div>
                  </div>
                </div>

                {errorMsg && (
                  <div className="text-xs text-rose-400 flex items-center gap-1 bg-rose-500/5 p-2.5 rounded-xl border border-rose-500/20">
                    <CheckCircle2 className="w-4 h-4 text-rose-500" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  id="btn-complete-profile"
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-95 text-white py-4 rounded-2xl text-sm font-semibold flex items-center justify-center gap-2 transform active:scale-95 transition-all"
                >
                  Concluir Perfil <CheckCircle2 className="w-4 h-4" />
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer / Copyright */}
      <div className="text-center text-[10px] text-indigo-200/20 font-mono tracking-widest uppercase mt-4">
        Solstice Inc. • Celebrando o Futuro
      </div>
    </div>
  );
}
