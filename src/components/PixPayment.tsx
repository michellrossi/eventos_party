import React, { useState, useEffect } from "react";
import { SolsticeEvent } from "../types";
import { Check, Copy, RefreshCw, Smartphone, ShieldCheck, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PixPaymentProps {
  event: SolsticeEvent;
  currentUser: { name: string; avatar: string; nickname: string };
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function PixPayment({ event, currentUser, amount, onSuccess, onCancel }: PixPaymentProps) {
  const [copied, setCopied] = useState(false);
  const [paymentState, setPaymentState] = useState<"pending" | "verifying" | "success">("pending");
  const [progress, setProgress] = useState(0);

  // Formatar valor do Pix
  const formattedAmount = amount.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

  // Chave Pix Copia e Cola fictícia gerada para o evento
  const pixKey = `00020101021226370014br.gov.bcb.pix2580solstice.vaquinha@pix.coletivo.digital5204000053039865406${amount.toFixed(2)}5802BR5924Solstice Coletivo Ltda6009Sao Paulo62070503***6304`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pixKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Simular confirmação automática em tempo real
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Inicia verificação após 1.5s
    timer = setTimeout(() => {
      setPaymentState("verifying");
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (paymentState === "verifying") {
      let interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setPaymentState("success");
            return 100;
          }
          return prev + 20; // Incrementa a cada 800ms
        });
      }, 800);

      return () => clearInterval(interval);
    }
  }, [paymentState]);

  // Ao finalizar com sucesso, aguarda a animação e dispara callback
  useEffect(() => {
    if (paymentState === "success") {
      const timer = setTimeout(() => {
        onSuccess();
      }, 3000); // 3 segundos de celebração antes de voltar
      return () => clearTimeout(timer);
    }
  }, [paymentState, onSuccess]);

  return (
    <div className="min-h-screen bg-[#0b1226] text-white flex flex-col items-center justify-between pb-8 pt-4 font-sans select-none relative overflow-hidden">
      {/* Background radial blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      {/* Botão flutuante de Voltar */}
      <div className="w-full max-w-md px-6 flex justify-between items-center z-10">
        <button
          onClick={onCancel}
          className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-mono transition"
        >
          <ArrowLeft className="w-4 h-4" /> Cancelar
        </button>
        <div className="flex items-center space-x-1.5 bg-[#141b2f] p-1 pr-3 rounded-full border border-indigo-500/10">
          <img
            src={currentUser.avatar}
            alt="My profile"
            className="w-5 h-5 rounded-full object-cover border border-white/20"
          />
          <span className="text-[10px] font-mono text-indigo-300">
            {currentUser.nickname}
          </span>
        </div>
      </div>

      {/* Container Principal de Checkout */}
      <div className="w-full max-w-md px-6 flex-1 flex flex-col justify-center py-6 space-y-6 z-10">
        
        {/* Cabeçalho de Preços */}
        <div className="text-center space-y-1">
          <span className="text-[10px] font-bold tracking-[0.25em] text-indigo-300/60 uppercase font-mono block">
            Cota de Participação
          </span>
          <h1 className="text-4xl font-extrabold text-cyan-400 font-mono tracking-tight">
            {formattedAmount}
          </h1>
          <p className="text-xs text-indigo-200/60 max-w-[280px] mx-auto leading-relaxed">
            Sua contribuição para tornar este evento inesquecível.
          </p>
        </div>

        {/* Card do QR Code e Ações */}
        <div className="bg-[#141b2f]/80 backdrop-blur-sm border border-indigo-500/10 rounded-[32px] p-6 flex flex-col items-center space-y-5 shadow-2xl relative">
          
          {/* QR Code Container */}
          <div className="w-64 h-64 rounded-[28px] overflow-hidden bg-gradient-to-tr from-indigo-950/30 via-slate-900 to-indigo-900/20 border border-white/5 shadow-inner flex items-center justify-center p-6 relative group">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
            
            {/* SVG customizado do QR code */}
            <div className="bg-white p-3 rounded-3xl shadow-lg relative z-10 w-full h-full flex items-center justify-center">
              <div className="bg-black p-3.5 rounded-2xl w-full h-full flex items-center justify-center relative">
                <svg viewBox="0 0 100 100" className="w-full h-full text-white fill-current">
                  {/* Position Detectors (Cantos) */}
                  {/* Top Left */}
                  <rect x="5" y="5" width="22" height="22" rx="3" fill="none" stroke="white" strokeWidth="4" />
                  <rect x="11" y="11" width="10" height="10" rx="1" fill="white" />
                  
                  {/* Top Right */}
                  <rect x="73" y="5" width="22" height="22" rx="3" fill="none" stroke="white" strokeWidth="4" />
                  <rect x="79" y="11" width="10" height="10" rx="1" fill="white" />
                  
                  {/* Bottom Left */}
                  <rect x="5" y="73" width="22" height="22" rx="3" fill="none" stroke="white" strokeWidth="4" />
                  <rect x="11" y="79" width="10" height="10" rx="1" fill="white" />

                  {/* Alignment Pattern */}
                  <rect x="75" y="75" width="10" height="10" rx="1" fill="none" stroke="white" strokeWidth="2" />
                  <rect x="79" y="79" width="2" height="2" fill="white" />

                  {/* Faux QR Data Pixels */}
                  <g opacity="0.95">
                    {/* Linhas horizontais e verticais simulando blocos */}
                    <rect x="32" y="5" width="4" height="8" rx="0.5" />
                    <rect x="40" y="9" width="8" height="4" rx="0.5" />
                    <rect x="52" y="5" width="12" height="4" rx="0.5" />
                    <rect x="60" y="13" width="4" height="12" rx="0.5" />
                    
                    <rect x="32" y="17" width="12" height="4" rx="0.5" />
                    <rect x="48" y="21" width="16" height="4" rx="0.5" />
                    <rect x="36" y="25" width="4" height="8" rx="0.5" />
                    
                    <rect x="5" y="32" width="8" height="4" rx="0.5" />
                    <rect x="17" y="32" width="12" height="4" rx="0.5" />
                    <rect x="32" y="32" width="16" height="4" rx="0.5" />
                    <rect x="52" y="32" width="24" height="4" rx="0.5" />
                    <rect x="80" y="32" width="15" height="4" rx="0.5" />
                    
                    <rect x="13" y="40" width="4" height="12" rx="0.5" />
                    <rect x="25" y="40" width="12" height="4" rx="0.5" />
                    <rect x="41" y="40" width="4" height="8" rx="0.5" />
                    <rect x="49" y="44" width="8" height="4" rx="0.5" />
                    <rect x="61" y="40" width="16" height="4" rx="0.5" />
                    <rect x="81" y="40" width="8" height="12" rx="0.5" />

                    <rect x="5" y="52" width="12" height="4" rx="0.5" />
                    <rect x="21" y="48" width="4" height="12" rx="0.5" />
                    <rect x="33" y="52" width="12" height="4" rx="0.5" />
                    <rect x="49" y="52" width="4" height="8" rx="0.5" />
                    <rect x="57" y="52" width="16" height="4" rx="0.5" />
                    <rect x="77" y="56" width="12" height="4" rx="0.5" />

                    <rect x="9" y="60" width="16" height="4" rx="0.5" />
                    <rect x="29" y="60" width="4" height="12" rx="0.5" />
                    <rect x="37" y="64" width="12" height="4" rx="0.5" />
                    <rect x="53" y="60" width="8" height="4" rx="0.5" />
                    <rect x="65" y="60" width="4" height="12" rx="0.5" />
                    <rect x="73" y="64" width="4" height="8" rx="0.5" />

                    <rect x="33" y="72" width="16" height="4" rx="0.5" />
                    <rect x="53" y="72" width="4" height="12" rx="0.5" />
                    <rect x="61" y="76" width="8" height="4" rx="0.5" />
                    
                    <rect x="33" y="84" width="4" height="12" rx="0.5" />
                    <rect x="41" y="80" width="16" height="4" rx="0.5" />
                    <rect x="61" y="84" width="12" height="4" rx="0.5" />
                    
                    <rect x="33" y="92" width="20" height="4" rx="0.5" />
                    <rect x="57" y="92" width="8" height="4" rx="0.5" />
                  </g>
                </svg>
                
                {/* Logo Central do Pix estilizado */}
                <div className="absolute bg-black p-1.5 rounded-lg border border-white/10 flex items-center justify-center w-8 h-8">
                  <svg viewBox="0 0 100 100" className="w-full h-full text-[#32b1a6] fill-current">
                    <path d="M50 15 L85 50 L50 85 L15 50 Z" />
                    <path d="M50 30 L70 50 L50 70 L30 50 Z" fill="black" />
                    <path d="M50 40 L60 50 L50 60 L40 50 Z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Badge: QR Code gerado com sucesso */}
          <div className="flex items-center gap-1.5 bg-[#1f2945]/40 border border-indigo-500/10 px-4 py-1.5 rounded-full text-[11px] text-indigo-300 font-mono">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
            <span>QR Code gerado com sucesso</span>
          </div>

          {/* Botões de Ação */}
          <div className="w-full space-y-2.5">
            {/* Botão Copiar Chave Pix */}
            <button
              onClick={handleCopy}
              className={`w-full py-4 rounded-full text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 select-none cursor-pointer ${
                copied
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-950/30"
                  : "bg-[#9faefd] hover:bg-[#b5c2ff] text-[#0b1226] hover:shadow-lg hover:shadow-indigo-500/20 active:scale-[0.98]"
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Chave Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar Chave Pix</span>
                </>
              )}
            </button>

            {/* Botão Confirmação Automática */}
            <div className="w-full relative overflow-hidden rounded-full border border-indigo-500/15">
              <button
                disabled={paymentState === "success"}
                className={`w-full py-3.5 text-xs font-semibold flex items-center justify-center gap-2 bg-[#12192c] hover:bg-[#18223d] text-indigo-300/80 transition-all select-none`}
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    paymentState === "verifying" ? "animate-spin text-cyan-400" : ""
                  }`}
                />
                <span>
                  {paymentState === "pending" && "Confirmação Automática"}
                  {paymentState === "verifying" && "Confirmando em tempo real..."}
                  {paymentState === "success" && "Pagamento Confirmado!"}
                </span>
              </button>
              
              {/* Barra de Progresso Interna da Verificação */}
              {paymentState === "verifying" && (
                <div
                  className="absolute bottom-0 left-0 h-[2px] bg-cyan-400 transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Passos de Instrução */}
        <div className="space-y-3">
          {/* Passo 1 */}
          <div className="bg-[#12192c]/50 border border-indigo-500/5 rounded-2xl p-4 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-[#1e273f] border border-indigo-500/10 flex items-center justify-center font-mono font-bold text-xs text-indigo-300 flex-shrink-0">
              1
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-white">Abra o app do seu banco</h3>
              <p className="text-[11px] text-indigo-200/50 leading-relaxed">
                Vá para a seção Pix e selecione "Pagar com QR Code" ou "Pix Copia e Cola".
              </p>
            </div>
          </div>

          {/* Passo 2 */}
          <div className="bg-[#12192c]/50 border border-indigo-500/5 rounded-2xl p-4 flex gap-4 items-start">
            <div className="w-8 h-8 rounded-full bg-[#1c2e36] border border-cyan-500/10 flex items-center justify-center font-mono font-bold text-xs text-cyan-400 flex-shrink-0">
              2
            </div>
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-white">Finalize o pagamento</h3>
              <p className="text-[11px] text-indigo-200/50 leading-relaxed">
                Após o pagamento, o sistema identificará automaticamente sua cota em até 2 minutos.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Rodapé Seguro */}
      <div className="w-full max-w-md px-6 flex items-center justify-center gap-1 text-[10px] text-indigo-300/40 z-10 font-mono">
        <ShieldCheck className="w-3.5 h-3.5 text-indigo-500/30" />
        <span>Pagamento processado em ambiente criptografado e seguro</span>
      </div>

      {/* Animação / Overlay de Sucesso (Celebration) */}
      <AnimatePresence>
        {paymentState === "success" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#0b1226] z-50 flex flex-col items-center justify-center space-y-6"
          >
            {/* Confetti blast container */}
            <div className="relative w-48 h-48 flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-32 h-32 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center"
              >
                <Check className="w-16 h-16 text-emerald-400 stroke-[3]" />
              </motion.div>

              {/* Decorative particles */}
              {[...Array(12)].map((_, i) => {
                const angle = (i * 36) * (Math.PI / 180);
                const x = Math.cos(angle) * 70;
                const y = Math.sin(angle) * 70;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ x, y, opacity: 0, scale: [0.5, 1, 0] }}
                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                    className={`absolute w-2.5 h-2.5 rounded-full ${
                      i % 3 === 0
                        ? "bg-emerald-400"
                        : i % 3 === 1
                        ? "bg-cyan-400"
                        : "bg-yellow-400"
                    }`}
                  />
                );
              })}
            </div>

            <div className="text-center space-y-2">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/5 text-[10px] font-extrabold font-mono tracking-widest text-emerald-400 uppercase shadow-md animate-pulse">
                PAGAMENTO RECONHECIDO
              </span>
              <h2 className="text-2xl font-black text-white tracking-tight">
                Cota Confirmada!
              </h2>
              <p className="text-xs text-indigo-200/50 max-w-xs leading-relaxed">
                Seu Pix de {formattedAmount} foi identificado. A vaquinha do evento foi atualizada com sucesso.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
