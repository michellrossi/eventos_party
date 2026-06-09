import React, { useState, useEffect } from "react";
import { SolsticeEvent, Guest, Contribution, VibePhoto } from "../types";
import { getTemplateStyle } from "./TemplateThemes";
import { 
  CheckCircle, XCircle, HelpCircle, DollarSign, Calendar, MapPin, 
  Flame, Music, UploadCloud, Heart, Edit3, Settings, Copy, Share2, 
  ChevronLeft, Users, ShieldAlert, Award, Grid, ListCollapse, ToggleLeft, Sparkles
} from "lucide-react";
import PixPayment from "./PixPayment";
import EventGallery from "./EventGallery";

interface EventDetailsProps {
  eventId: string;
  onBack: () => void;
  currentUser: { name: string; avatar: string; nickname: string; phone?: string };
  onEventUpdated: (updatedEvent: SolsticeEvent) => void;
}

export default function EventDetails({ eventId, onBack, currentUser, onEventUpdated }: EventDetailsProps) {
  const [event, setEvent] = useState<SolsticeEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"organizer" | "guest">("guest");
  const [organizerTab, setOrganizerTab] = useState<"pagos" | "pendentes">("pagos");
  const [organizerMainTab, setOrganizerMainTab] = useState<"finance" | "reception" | "broadcast" | "retro">("finance");
  
  // Pro check-in scanner states
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [scanStatus, setScanStatus] = useState<"idle" | "scanning" | "success" | "fail">("idle");
  const [scannedGuest, setScannedGuest] = useState<Guest | null>(null);
  const [checkedInIds, setCheckedInIds] = useState<string[]>([]);
  const [searchCheckIn, setSearchCheckIn] = useState("");

  // Communication & History states
  const [broadcastMessage, setBroadcastMessage] = useState("");
  const [showTxHistory, setShowTxHistory] = useState(false);
  const [retroSlideIdx, setRetroSlideIdx] = useState(0);
  const [retroMusic, setRetroMusic] = useState(false);

  // RSVP Form state details
  const [rsvpName, setRsvpName] = useState(currentUser.name);
  const [rsvpPhone, setRsvpPhone] = useState(currentUser.phone || "");
  const [rsvpStatus, setRsvpStatus] = useState<Guest["status"]>("VOU");
  const [isSubmittingRSVP, setIsSubmittingRSVP] = useState(false);
  const [rsvpSuccess, setRsvpSuccess] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);
  const [showPixPayment, setShowPixPayment] = useState(false);
  const [pixPaymentData, setPixPaymentData] = useState<{
    amount: number;
    contributorName: string;
    message: string;
  } | null>(null);
  const [showGalleryView, setShowGalleryView] = useState(false);

  // Check if they already have an RSVP record in the event guests list on load
  useEffect(() => {
    if (event && event.guests) {
      const alreadyConfirmed = event.guests.some(
        (g) => g.name.toLowerCase().trim() === currentUser.name.toLowerCase().trim()
      );
      if (alreadyConfirmed) {
        setRsvpSuccess(true);
      }
    }
  }, [event, currentUser.name]);

  // Fund Form state details
  const [contribAmount, setContribAmount] = useState("");
  const [contribName, setContribName] = useState(currentUser.name);
  const [contribMessage, setContribMessage] = useState("");
  const [isSubmittingFund, setIsSubmittingFund] = useState(false);

  // Vibe Wall state details
  const [vibeUrlInput, setVibeUrlInput] = useState("");
  const [isAddingVibe, setIsAddingVibe] = useState(false);

  // Edit details panel inside organizer dashboard
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editDress, setEditDress] = useState("");

  const refreshEvent = async () => {
    try {
      const res = await fetch(`/api/events/${eventId}`);
      if (res.ok) {
        const data = await res.json();
        setEvent(data);
        setEditName(data.name);
        setEditLocation(data.location);
        setEditDescription(data.description);
        setEditDress(data.dressingCode);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshEvent();
    // Default to organizer view if creator is current user (or simple auto detection)
    setViewMode("guest");
  }, [eventId]);

  if (loading || !event) {
    return (
      <div className="min-h-screen bg-[#0b1226] text-white flex flex-col items-center justify-center p-12">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <span className="text-xs font-mono text-indigo-300">Carregando portal do evento...</span>
      </div>
    );
  }

  if (showPixPayment && pixPaymentData) {
    return (
      <PixPayment
        event={event}
        currentUser={currentUser}
        amount={pixPaymentData.amount}
        onCancel={() => {
          setShowPixPayment(false);
          setPixPaymentData(null);
        }}
        onSuccess={async () => {
          try {
            const res = await fetch(`/api/events/${eventId}/fund`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contributorName: pixPaymentData.contributorName,
                contributorAvatar: currentUser.avatar,
                amount: pixPaymentData.amount,
                message: pixPaymentData.message
              })
            });
            if (res.ok) {
              const updated = await res.json();
              setEvent(updated);
              onEventUpdated(updated);
              setContribAmount("");
              setContribMessage("");
            }
          } catch (e) {
            console.error("Erro ao registrar pagamento no servidor:", e);
          } finally {
            setShowPixPayment(false);
            setPixPaymentData(null);
          }
        }}
      />
    );
  }
  // Preset Vibe Wall picture assets so users can click to quickly append instead of searching URLs
  const WALL_PRESETS = [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1541388224302-d549cc83612f?w=500&auto=format&fit=crop&q=60",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60"
  ];

  // Template design object
  const currentTheme = getTemplateStyle(event.selectedTemplate);

  // Handlers
  const handleRSVPSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      alert("Por favor, digite seu nome.");
      return;
    }

    setIsSubmittingRSVP(true);
    try {
       const res = await fetch(`/api/events/${eventId}/rsvp`, {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({
           name: rsvpName.trim(),
           phone: rsvpPhone.trim(),
           status: rsvpStatus,
           avatar: currentUser.avatar
         })
       });
       if (res.ok) {
         const updated = await res.json();
         setEvent(updated);
         onEventUpdated(updated);
         setRsvpSuccess(true);
       }
    } catch (e) {
      alert("Erro ao confirmar presença.");
    } finally {
      setIsSubmittingRSVP(false);
    }
  };

  const handleFundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(contribAmount);
    if (!contribName.trim() || isNaN(amount) || amount <= 0) {
      alert("Por favor, digite um nome e quantia válidos.");
      return;
    }

    setPixPaymentData({
      amount,
      contributorName: contribName.trim(),
      message: contribMessage.trim()
    });
    setShowPixPayment(true);
  };

  const handleAddVibeWallPic = async (imgUrl: string) => {
    if (!imgUrl) return;
    setIsAddingVibe(true);
    try {
      const res = await fetch(`/api/events/${eventId}/vibe-wall`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: imgUrl,
          authorName: currentUser.name,
          authorAvatar: currentUser.avatar
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setEvent(updated);
        onEventUpdated(updated);
        setVibeUrlInput("");
      }
    } catch (e) {
      alert("Erro ao carregar imagem.");
    } finally {
      setIsAddingVibe(false);
    }
  };

  const handleLikeVibeCheck = async (photoId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/vibe-wall/${photoId}/like`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        setEvent(updated);
        onEventUpdated(updated);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          location: editLocation,
          description: editDescription,
          dressingCode: editDress
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setEvent(updated);
        onEventUpdated(updated);
        setIsEditing(false);
        alert("Detalhes atualizados com sucesso!");
      }
    } catch (e) {
      alert("Erro ao salvar alterações.");
    }
  };

  const handleCopyInviteLink = () => {
    const inviteUrl = `${window.location.origin}/invite/${eventId}`;
    navigator.clipboard.writeText(inviteUrl);
    alert("Link de convite do portal copiado!");
  };

  const handleAddToCalendar = () => {
    if (!event) return;
    try {
      const startTime = new Date(event.dateTime);
      const endTime = new Date(startTime.getTime() + 3 * 60 * 60 * 1000); // 3 hour event duration by default
      
      const formatDate = (date: Date) => {
        return date.toISOString().replace(/-|:|\.\d\d\d/g, "");
      };
      
      const gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
        event.name
      )}&dates=${formatDate(startTime)}/${formatDate(endTime)}&details=${encodeURIComponent(
        event.description || "Evento Exclusivo na rede Solstice"
      )}&location=${encodeURIComponent(event.location)}`;
      
      window.open(gCalUrl, "_blank");
    } catch (err) {
      console.error("Erro ao gerar link de calendário:", err);
    }
  };

  const handleCopyPixKey = () => {
    try {
      navigator.clipboard.writeText("solstice.vaquinha@pix.coletivo.digital");
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2400);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTogglePaid = async (guestId: string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/guests/${guestId}/toggle-paid`, {
        method: "POST"
      });
      if (res.ok) {
        const updated = await res.json();
        setEvent(updated);
        onEventUpdated(updated);
      }
    } catch (err) {
      console.error("Erro ao alterar status de pagamento:", err);
    }
  };

  const handleSendWhatsAppReminder = (guest: Guest) => {
    if (!event) return;
    const valueStr = event.vaquinhaValuePerPerson 
      ? `R$ ${event.vaquinhaValuePerPerson.toFixed(2).replace(".", ",")}` 
      : "contribuição sugerida";
    const pixKey = "solstice.vaquinha@pix.coletivo.digital";
    
    const message = `Olá, ${guest.name}! Só passando para enviar o lembrete da vaquinha do evento *${event.name}*. 🚀\n\nValor sugerido: *${valueStr}*\nChave Pix Copia e Cola: *${pixKey}*\n\nConfirme sua presença e envie o comprovante pelo link: ${window.location.origin}/invite/${event.id}\n\nTamo junto!`;
    
    const cleanPhone = guest.phone ? guest.phone.replace(/\D/g, "") : "";
    
    let isMobile = false;
    if (typeof window !== "undefined") {
      isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    }
    
    const baseUrl = isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com/send";
    
    let url = "";
    if (cleanPhone) {
      let formattedPhone = cleanPhone;
      if (cleanPhone.length >= 10 && cleanPhone.length <= 11 && !cleanPhone.startsWith("55")) {
        formattedPhone = "55" + cleanPhone;
      }
      url = `${baseUrl}?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    } else {
      url = `${isMobile ? "https://api.whatsapp.com/send" : "https://web.whatsapp.com"}/send?text=${encodeURIComponent(message)}`;
    }
    
    window.open(url, "_blank");
  };

  // Pre-calculations for metrics
  const confirmedGuests = event.guests?.filter((g) => g.status === "VOU") || [];
  const maybeGuests = event.guests?.filter((g) => g.status === "TALVEZ") || [];
  const declinedGuests = event.guests?.filter((g) => g.status === "NÃO VOU") || [];
  
  const confirmedPercent = event.guests?.length 
    ? Math.round((confirmedGuests.length / event.guests.length) * 100) 
    : 100;

  const vaquinhaPercent = event.vaquinhaGoal 
    ? Math.min(100, Math.round(((event.vaquinhaCollected || 0) / event.vaquinhaGoal) * 100))
    : 50;

  if (showGalleryView) {
    return (
      <EventGallery
        event={event}
        currentUser={currentUser}
        onBack={() => {
          setShowGalleryView(false);
          refreshEvent();
        }}
        onLikePhoto={handleLikeVibeCheck}
        onAddPhoto={async (url) => {
          await handleAddVibeWallPic(url);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b1226] text-white pb-32 font-sans relative select-none">
      {/* Floating Header */}
      <div className="sticky top-0 bg-[#0b1226]/80 backdrop-blur-md z-40 border-b border-indigo-500/10 py-3 px-4 flex items-center justify-between">
        <button 
          onClick={onBack}
          className="text-xs text-indigo-300 hover:text-white flex items-center gap-1 font-mono"
        >
          <ChevronLeft className="w-4 h-4" /> Portais
        </button>

        {/* View mode toggle pill capsule */}
        <div className="bg-[#141b2f] border border-indigo-500/15 p-1 rounded-full flex gap-1">
          <button
            onClick={() => setViewMode("guest")}
            className={`px-3 py-1 text-[10px] font-bold tracking-tight rounded-full transition ${
              viewMode === "guest" ? "bg-indigo-500 text-white" : "text-indigo-200/40 hover:text-indigo-200/60"
            }`}
          >
            Modo Convidado
          </button>
          <button
            id="btn-mode-organizer"
            onClick={() => setViewMode("organizer")}
            className={`px-3 py-1 text-[10px] font-bold tracking-tight rounded-full transition ${
              viewMode === "organizer" ? "bg-indigo-500 text-white" : "text-indigo-200/40 hover:text-indigo-200/60"
            }`}
          >
            Modo Organizador
          </button>
        </div>

        <button 
          onClick={handleCopyInviteLink}
          className="text-indigo-400 hover:text-white transition"
          title="Copiar link"
        >
          <Share2 className="w-4 h-4" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-indigo-200/40 font-mono">Verificando rede...</div>
      ) : viewMode === "guest" ? (
        
        /* ==================== MODO CONVIDADO (INVITE TEMPLATE VIEW) ==================== */
        <div className={`p-4 sm:p-8 ${currentTheme.background} ${currentTheme.fontClass} min-h-screen transition-colors duration-500`}>
          <div className="max-w-xl mx-auto space-y-6">
            
            {rsvpSuccess ? (
              /* ==================== SCREEN CONFIRMED CELEBRATION ==================== */
              <div className="space-y-6 animate-fadeIn">
                
                {/* 3D PARTY POPPER VISUAL STAGED WITH GRADIENT BACKGROUND */}
                <div className="flex flex-col items-center">
                  <div className="w-64 h-64 rounded-[32px] overflow-hidden bg-gradient-to-tr from-indigo-950/40 via-purple-900/10 to-pink-950/20 border border-indigo-500/10 shadow-2xl flex items-center justify-center p-4 relative group">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
                    
                    {/* Handcrafted animated vector Party Popper */}
                    <svg viewBox="0 0 200 200" className="w-48 h-48 select-none transition-transform duration-500 group-hover:scale-105">
                      <defs>
                        <linearGradient id="coneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#f43f5e" />
                          <stop offset="60%" stopColor="#d946ef" />
                          <stop offset="100%" stopColor="#8b5cf6" />
                        </linearGradient>
                        <linearGradient id="greenStrip" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#10b981" />
                          <stop offset="100%" stopColor="#059669" />
                        </linearGradient>
                        <linearGradient id="cyanStrip" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#06b6d4" />
                          <stop offset="100%" stopColor="#0891b2" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="6" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>

                      {/* Sparkles / Confetti Blast */}
                      <g className="animate-[pulse_2s_infinite]">
                        {/* Golden Stars */}
                        <path d="M 45,35 L 48,41 L 55,42 L 50,46 L 51,53 L 45,49 L 39,53 L 40,46 L 35,42 L 42,41 Z" fill="#facc15" filter="url(#glow)" />
                        <path d="M 145,25 L 147,29 L 152,30 L 148,34 L 149,39 L 145,36 L 141,39 L 142,34 L 138,30 L 143,29 Z" fill="#facc15" />
                        <path d="M 95,15 L 97,18 L 101,19 L 98,22 L 99,26 L 95,24 L 91,26 L 92,22 L 89,19 L 93,18 Z" fill="#fb7185" />
                        
                        {/* Circles of color */}
                        <circle cx="120" cy="40" r="5" fill="#f43f5e" />
                        <circle cx="70" cy="50" r="4.5" fill="#10b981" />
                        <circle cx="155" cy="55" r="4" fill="#06b6d4" />
                        <circle cx="35" cy="70" r="5" fill="#d946ef" />
                        <circle cx="85" cy="25" r="3" fill="#a78bfa" />
                      </g>

                      {/* Streamlines cascading */}
                      <path d="M 100,50 Q 80,30 110,20" fill="none" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" className="animate-bounce" />
                      <path d="M 115,55 Q 135,35 125,15" fill="none" stroke="#a78bfa" strokeWidth="2.5" strokeLinecap="round" />
                      <path d="M 85,60 Q 65,45 80,30" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />

                      {/* Main Tilted Popper Device */}
                      <g transform="translate(45, 125) rotate(-35)">
                        {/* Cone back glow */}
                        <ellipse cx="40" cy="15" rx="32" ry="12" fill="#d946ef" opacity="0.3" filter="url(#glow)" />

                        {/* Metallic Striped Cone */}
                        <path d="M 10,75 L 70,75 L 55,15 L 25,15 Z" fill="url(#coneGrad)" />
                        
                        {/* Highlight stripes */}
                        <path d="M 15,60 L 65,60 L 60,45 L 20,45 Z" fill="url(#greenStrip)" />
                        <path d="M 20,45 L 60,45 L 55,30 L 25,30 Z" fill="#fbbf24" />
                        <path d="M 25,30 L 55,30 L 51,20 L 29,20 Z" fill="url(#cyanStrip)" />

                        {/* Mouth Rim ellipse */}
                        <ellipse cx="40" cy="15" rx="15" ry="5" fill="#1e1b4b" />
                        
                        {/* Streamer tails */}
                        <path d="M 40,75 Q 30,95 45,115" fill="none" stroke="#f43f5e" strokeWidth="2" />
                        <path d="M 45,75 Q 55,90 40,105" fill="none" stroke="#a78bfa" strokeWidth="1.5" />
                      </g>
                    </svg>
                  </div>
                  
                  {/* Status Badging text */}
                  <div className="text-center mt-6 space-y-3">
                    <span className="inline-flex items-center px-4 py-1 rounded-full border border-pink-500/30 bg-pink-500/5 text-[10px] font-extrabold font-mono tracking-widest text-pink-300 uppercase shadow-md">
                      RSVP CONCLUÍDO
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                      Presença Confirmada!
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-300 max-w-sm mx-auto leading-relaxed">
                      Prepare o look e a energia! Mal podemos esperar para celebrar esse momento com você.
                    </p>
                  </div>
                </div>

                {/* ATALHOS / CORE ACTION BUTTONS */}
                <div className="grid grid-cols-1 gap-2.5 max-w-sm mx-auto">
                  <button
                    id="btn-add-to-calendar"
                    onClick={handleAddToCalendar}
                    className="w-full py-4 rounded-3xl text-xs font-black tracking-wider uppercase transition-all duration-300 bg-[#a5b4fc] text-[#0b1226] hover:bg-[#b4c2ff] hover:shadow-lg hover:shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Adicionar à Agenda</span>
                  </button>

                  <button
                    id="btn-share-invite-success"
                    onClick={handleCopyInviteLink}
                    className="w-full py-4 rounded-3xl text-xs font-extrabold tracking-wider uppercase transition-all duration-300 bg-[#12192c] text-slate-300 border border-slate-800/80 hover:bg-[#18233d] hover:text-white flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Share2 className="w-4 h-4 text-indigo-400" />
                    <span>Compartilhar Evento</span>
                  </button>

                  {/* Option to change response */}
                  <button
                    type="button"
                    onClick={() => setRsvpSuccess(false)}
                    className="text-[10px] font-mono text-slate-500 hover:text-indigo-400 transition underline pt-1 text-center cursor-pointer"
                  >
                    Alterar Minha Opção de Resposta
                  </button>
                </div>

                {/* TAILORED "VAQUINHA DO EVENTO" CARD */}
                {event.vaquinhaEnabled && (
                  <div className="bg-[#12192c] border border-indigo-500/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-5">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-sm font-bold tracking-wide text-white">
                          Vaquinha do Evento
                        </h3>
                        <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                          Sua contribuição ajuda a tornar este momento ainda mais inesquecível!
                        </p>
                      </div>
                      
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center opacity-80">
                        {/* Small hand-heart or heart icon */}
                        <Heart className="w-4 h-4 text-[#a5b4fc]" />
                      </div>
                    </div>

                    {/* Integrated PIX payment terminal */}
                    <div className="bg-[#0b101f] border border-slate-800/60 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-center sm:text-left">
                        <span className="block text-[8px] font-mono tracking-wider text-slate-500 uppercase">VALOR SUGERIDO</span>
                        <span className="text-lg font-black text-white font-mono">
                          R$ {event.vaquinhaValuePerPerson || "150,00"}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          id="btn-pay-quota-pix"
                          onClick={() => {
                            const amount = event.vaquinhaValuePerPerson || 150;
                            setPixPaymentData({
                              amount,
                              contributorName: currentUser.name,
                              message: "Contribuição de cota do evento"
                            });
                            setShowPixPayment(true);
                          }}
                          className="py-3 px-5 rounded-xl text-xs font-bold bg-indigo-500 hover:bg-indigo-400 text-white transition duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer"
                        >
                          <DollarSign className="w-3.5 h-3.5" />
                          <span>Pagar Cota</span>
                        </button>

                        <button
                          id="btn-copy-pix-key"
                          onClick={handleCopyPixKey}
                          className={`py-3 px-4 rounded-xl text-xs font-bold transition duration-300 flex items-center justify-center gap-1.5 select-none cursor-pointer ${
                            copiedPix 
                              ? "bg-emerald-500 text-white" 
                              : "bg-white text-[#0b1226] hover:bg-slate-100"
                          }`}
                        >
                          {copiedPix ? (
                            <>
                              <CheckCircle className="w-3.5 h-3.5" />
                              <span>Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Social proof of participants */}
                    <div className="flex items-center gap-2.5 pt-2">
                      <div className="flex -space-x-2.5 overflow-hidden">
                        {(event.guests || []).filter(g=>g.status === "VOU").slice(0, 3).map((g, idx) => (
                          <img
                            key={g.id || idx}
                            src={g.avatar}
                            className="inline-block h-6 w-6 rounded-full ring-2 ring-[#12192c] object-cover"
                            alt="Convidado"
                          />
                        ))}
                        {(event.guests || []).filter(g=>g.status === "VOU").length === 0 && (
                          <>
                            <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" className="inline-block h-6 w-6 rounded-full ring-2 ring-[#12192c] object-cover" />
                            <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" className="inline-block h-6 w-6 rounded-full ring-2 ring-[#12192c] object-cover" />
                          </>
                        )}
                      </div>
                      <span className="text-[11px] font-medium text-slate-400">
                        <strong>
                          {Math.max((event.guests || []).filter(g=>g.status === "VOU").length, 12)}
                        </strong> já confirmaram presença para a festa
                      </span>
                    </div>
                  </div>
                )}

                {/* TAILORED LOCATION CARD WITH GOOGLE MAPS SHORTCUT */}
                <div className="bg-[#12192c] border border-indigo-500/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 flex-shrink-0">
                      <MapPin className="w-5 h-5 animate-bounce" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 font-mono">
                        LOCALIZAÇÃO
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-semibold">
                        {event.location}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 pl-13">
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#a5b4fc] hover:text-[#b4c2ff] hover:underline transition"
                    >
                      <span>Ver no Google Maps</span>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
                    </a>
                  </div>
                </div>

                {/* TAILORED DRESS CODE CARD WITH GORGEOUS CAPSULE TAGS */}
                <div className="bg-[#12192c] border border-indigo-500/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-4">
                  <div className="flex gap-3 items-start">
                    <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 flex-shrink-0">
                      {/* T-shirt / hanger icon */}
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.38 3.46L16 2.14a1 1 0 0 0-1.25.73l-1.51 5a1 1 0 0 0 .15.85L16 11.2V21a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l-.02-10a1 1 0 0 0-.25-.66l-1.35-1.5z"></path><path d="M4 2v18a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V2"></path></svg>
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400 font-mono">
                        DRESS CODE
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-semibold font-sans">
                        {event.dressingCode || "Venha na sua melhor vibe."}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 pl-13">
                    {(() => {
                      const baseCode = (event.dressingCode || "Futurista Confortável").toLowerCase();
                      const tags = ["Chic", "Cibernético"];
                      if (baseCode.includes("chic") || baseCode.includes("social") || baseCode.includes("fino")) {
                        tags.push("Chic");
                      }
                      if (baseCode.includes("futuro") || baseCode.includes("metal") || baseCode.includes("ciber") || baseCode.includes("cyber")) {
                        tags.push("Cibernético");
                      }
                      if (baseCode.includes("confort") || baseCode.includes("casual")) {
                        tags.push("Confortável");
                      }
                      const uniqueTags = Array.from(new Set(tags));
                      return uniqueTags.map(tg => (
                        <span 
                          key={tg} 
                          className="px-4 py-1.5 rounded-full border border-slate-800/80 bg-slate-900/40 text-[10px] font-bold font-mono tracking-wider text-slate-300 hover:text-white transition cursor-default"
                        >
                          {tg}
                        </span>
                      ));
                    })()}
                  </div>
                </div>

              </div>
            ) : (
              /* ==================== SCREEN FOR UNSUBMITTED RSVP (FORM STATE) ==================== */
              <div className="space-y-6">
                
                {/* Centered Top Branding Section */}
                <div className="flex flex-col items-center text-center mt-4 mb-6 space-y-3 px-4 animate-fadeIn">
                  <span className="inline-flex items-center px-5 py-1.5 rounded-full border border-pink-500/30 bg-pink-500/5 text-[10px] font-bold font-mono tracking-widest text-pink-300 uppercase shadow-sm">
                    EVENTO EXCLUSIVO
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white focus:outline-none">
                    Você foi convidado!
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-300 max-w-sm leading-relaxed">
                    Confirme sua presença para a grande noite. Mal podemos esperar para celebrar com você.
                  </p>
                </div>

                {/* TACTILE & MINIMALIST SUA PRESENÇA CARD */}
                <div className="bg-[#12192c] border border-indigo-500/10 rounded-[32px] p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn" style={{ animationDelay: "100ms" }}>
                  <h3 className="text-xs font-bold tracking-widest uppercase text-slate-400/80 font-mono">
                    SUA PRESENÇA
                  </h3>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { status: "VOU" as const, emoji: "🎉", label: "Vou!" },
                      { status: "NÃO VOU" as const, emoji: "😢", label: "Não vou" },
                      { status: "TALVEZ" as const, emoji: "🤔", label: "Talvez" }
                    ].map((item) => {
                      const isSelected = rsvpStatus === item.status;
                      return (
                        <button
                          key={item.status}
                          type="button"
                          onClick={() => setRsvpStatus(item.status)}
                          className={`py-5 px-1 rounded-3xl border transition-all duration-300 flex flex-col items-center justify-center gap-1.5 focus:outline-none group select-none ${
                            isSelected
                              ? "bg-[#18233d] border-indigo-400 text-white shadow-[0_4px_20px_rgba(99,102,241,0.2)] scale-[1.03]"
                              : "bg-[#0b101f]/40 border-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-[#0e162b]"
                          }`}
                        >
                          <span className={`text-4xl transition-transform duration-300 ${isSelected ? "scale-110" : "group-hover:scale-105"}`}>
                            {item.emoji}
                          </span>
                          <span className="text-[11px] font-bold tracking-tight mt-0.5">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Minimal identification forms */}
                  <form onSubmit={handleRSVPSubmit} className="space-y-4 pt-2">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-slate-400/60 mb-1.5 ml-1">Seu Nome Completo</label>
                        <input
                          id="guest-rsvp-name"
                          type="text"
                          value={rsvpName}
                          onChange={(e) => setRsvpName(e.target.value)}
                          placeholder="Nome completo"
                          className="w-full bg-[#0b101f] border border-slate-800 focus:border-indigo-500/75 p-4 rounded-2xl outline-none text-sm text-white placeholder-slate-600 transition"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono tracking-wider uppercase text-slate-400/60 mb-1.5 ml-1">Seu Telefone / WhatsApp</label>
                        <input
                          id="guest-rsvp-phone"
                          type="tel"
                          value={rsvpPhone}
                          onChange={(e) => setRsvpPhone(e.target.value)}
                          placeholder="Ex: (11) 99999-9999"
                          className="w-full bg-[#0b101f] border border-slate-800 focus:border-indigo-500/75 p-4 rounded-2xl outline-none text-sm text-white placeholder-slate-600 transition"
                        />
                      </div>
                    </div>

                    <button
                      id="btn-guest-submit-rsvp"
                      type="submit"
                      disabled={isSubmittingRSVP}
                      className="w-full py-4 rounded-full text-xs font-black tracking-wider uppercase transition-all duration-300 bg-[#a5b4fc] text-[#0b1226] hover:bg-[#b4c2ff] hover:shadow-lg hover:shadow-indigo-500/10 flex items-center justify-center gap-2 mt-2"
                    >
                      <span>{isSubmittingRSVP ? "Gravando presença..." : "Confirmar Resposta"}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                  </form>
                </div>

                {/* EVENT LOCATION & TIME DETAILS CARD */}
                <div className="bg-[#12192c] border border-indigo-500/10 rounded-[32px] overflow-hidden shadow-2xl animate-fadeIn" style={{ animationDelay: "200ms" }}>
                  <div className="h-56 relative w-full overflow-hidden bg-slate-950">
                    <img 
                      referrerPolicy="no-referrer"
                      src={event.coverImage || "https://images.unsplash.com/photo-1541388224302-d549cc83612f"} 
                      alt={event.name} 
                      className="w-full h-full object-cover opacity-90 brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#12192c] via-[#12192c]/30 to-transparent" />
                  </div>

                  <div className="p-6 sm:p-8 space-y-4">
                    <h2 className="text-md sm:text-lg font-bold tracking-wide text-white">
                      {event.name}
                    </h2>

                    <div className="space-y-3.5">
                      <div className="flex items-start gap-3">
                        <div className="w-4 h-4 flex items-center justify-center text-indigo-400 mt-0.5">
                          <MapPin className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-slate-300 font-medium">
                          {event.location}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 flex items-center justify-center text-indigo-400">
                          <Calendar className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-slate-300 font-medium">
                          {(() => {
                            try {
                              const d = new Date(event.dateTime);
                              const months = [
                                "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
                                "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
                              ];
                              const day = d.getDate().toString().padStart(2, '0');
                              const month = months[d.getMonth()];
                              const hours = d.getHours().toString().padStart(2, '0');
                              const minutes = d.getMinutes().toString().padStart(2, '0');
                              return `${day} de ${month} às ${hours}:${minutes}`;
                            } catch (e) {
                              return event.dateTime;
                            }
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* HONEYMOON FUND / VAQUINHA ELEMENT */}
                {event.vaquinhaEnabled && (
                  <div className={`p-6 rounded-3xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-xl`}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className={`text-md font-bold tracking-tight uppercase ${currentTheme.text} flex items-center gap-1.5`}>
                        <DollarSign className="w-4.5 h-4.5 text-emerald-400" /> Lua de Mel / Vaquinha do Evento
                      </h3>
                      {event.vaquinhaValuePerPerson && (
                        <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-lg">
                          Sugerido R$ {event.vaquinhaValuePerPerson}
                        </span>
                      )}
                    </div>

                    {/* Progress Indicators */}
                    <div className="space-y-2 mb-6">
                      <div className="flex justify-between text-xs font-mono text-white/50">
                        <span>Arrecadado: <strong className={`${currentTheme.text}`}>R$ {event.vaquinhaCollected || 0}</strong></span>
                        {event.vaquinhaGoal && <span>Meta: R$ {event.vaquinhaGoal}</span>}
                      </div>
                      <div className="w-full bg-slate-950/30 h-2.5 rounded-full overflow-hidden border border-white/5 select-none">
                        <div 
                          className="bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${Math.min(
                              100, 
                              event.vaquinhaGoal ? Math.round(((event.vaquinhaCollected || 0) / event.vaquinhaGoal) * 100) : 40
                            )}%` 
                          }}
                        />
                      </div>
                    </div>

                    {/* Contribution dispatcher */}
                    <form onSubmit={handleFundSubmit} className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">Doador(a)</label>
                          <input
                            id="guest-contrib-name"
                            type="text"
                            value={contribName}
                            onChange={(e) => setContribName(e.target.value)}
                            placeholder="Nome"
                            className="w-full bg-slate-950/40 border border-white/10 p-3 rounded-xl outline-none text-xs text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">Valor (R$)</label>
                          <input
                            id="guest-contrib-amount"
                            type="number"
                            value={contribAmount}
                            onChange={(e) => setContribAmount(e.target.value)}
                            placeholder="Ex: 100"
                            className="w-full bg-slate-950/40 border border-white/10 p-3 rounded-xl outline-none text-xs font-mono text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[10px] font-mono tracking-widest uppercase text-white/40 mb-1">Mensagem de Carinho (opcional)</label>
                        <input
                          id="guest-contrib-message"
                          type="text"
                          value={contribMessage}
                          onChange={(e) => setContribMessage(e.target.value)}
                          placeholder="Deixe uma mensagem pros organizadores"
                          className="w-full bg-slate-950/40 border border-white/10 p-3 rounded-xl outline-none text-xs text-white"
                        />
                      </div>

                      {/* Preset quick contribution quotas */}
                      <div className="flex gap-2 justify-between">
                        {[50, 100, 200].map((presetAmt) => (
                          <button
                            key={presetAmt}
                            type="button"
                            onClick={() => setContribAmount(String(presetAmt))}
                            className="flex-1 py-2 rounded-lg bg-white/5 border border-white/5 text-xs font-mono text-white/70 hover:bg-white/10 hover:text-white"
                          >
                            + R$ {presetAmt}
                          </button>
                        ))}
                      </div>

                      <button
                        id="btn-guest-submit-fund"
                        type="submit"
                        disabled={isSubmittingFund}
                        className="w-full py-3.5 rounded-2xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-[#091b11] uppercase tracking-wider transition"
                      >
                        {isSubmittingFund ? "Processando Pix..." : "Contribuir Pix para Vaquinha 💸"}
                      </button>
                    </form>

                    {/* Live Transactions feed */}
                    {event.contributions?.length > 0 && (
                      <div className="mt-5 border-t border-white/10 pt-4 space-y-3">
                        <span className="text-[9px] font-mono tracking-wider text-emerald-400 block uppercase">Historico de Contribuições</span>
                        <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                          {event.contributions.map((ct) => (
                            <div key={ct.id} className="bg-slate-950/30 p-2.5 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <img src={ct.contributorAvatar} className="w-6 h-6 rounded-full object-cover" />
                                <div>
                                  <span className="font-semibold block">{ct.contributorName}</span>
                                  {ct.message && <span className="text-[10px] text-white/40 italic block">"{ct.message}"</span>}
                                </div>
                              </div>
                              <span className="font-mono font-bold text-emerald-400">R$ {ct.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* DYNAMIC VIBE WALL SHOT SHARING CARD */}
            <div className={`p-6 rounded-3xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-xl`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-md font-bold tracking-tight uppercase ${currentTheme.text} flex items-center gap-1.5`}>
                  <Music className="w-4.5 h-4.5 text-pink-400" /> Mural de Vibes Coletivo
                </h3>
                <button
                  onClick={() => setShowGalleryView(true)}
                  className="text-[11px] font-bold text-indigo-400 hover:text-white transition flex items-center gap-1 font-mono uppercase bg-indigo-500/10 px-3 py-1.5 rounded-xl border border-indigo-500/20"
                >
                  Ver Galeria Completa ➔
                </button>
              </div>

              {/* Uploader field */}
              <div className="space-y-4 mb-6">
                <div>
                  <span className="block text-[10px] font-mono tracking-widest uppercase text-white/40 mb-2">Compartilhar Foto do Rolê (Cole o Link)</span>
                  <div className="flex gap-2">
                    <input
                      id="vibe-url-input"
                      type="text"
                      value={vibeUrlInput}
                      onChange={(e) => setVibeUrlInput(e.target.value)}
                      placeholder="Cole um link de imagem do rolê ou web"
                      className="flex-1 bg-slate-950/40 border border-white/10 p-3 rounded-xl outline-none text-xs text-white"
                    />
                    <button
                      id="btn-vibe-submit"
                      onClick={() => handleAddVibeWallPic(vibeUrlInput)}
                      disabled={isAddingVibe || !vibeUrlInput.trim()}
                      className="px-4 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs transition disabled:opacity-40"
                    >
                      Mural
                    </button>
                  </div>
                </div>

                {/* Presets Grid */}
                <div className="space-y-2">
                  <span className="block text-[9px] font-mono text-white/30 uppercase">Selecione uma foto da galeria Solstice para testar:</span>
                  <div className="grid grid-cols-4 gap-2">
                    {WALL_PRESETS.map((pUrl, pi) => (
                      <button
                        key={pi}
                        type="button"
                        onClick={() => handleAddVibeWallPic(pUrl)}
                        className="h-12 rounded-lg overflow-hidden border border-white/10 relative hover:border-pink-500 hover:scale-105 transition"
                      >
                        <img src={pUrl} alt={`p-${pi}`} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/20 flex items-center justify-center text-[10px] text-white font-bold font-mono">+ Add</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Wall Output Photos Feed */}
              {event.vibeWall?.length > 0 ? (
                <div className="grid grid-cols-2 gap-3.5">
                  {event.vibeWall.map((v) => (
                    <div key={v.id} className="relative rounded-2xl overflow-hidden group bg-slate-950 border border-indigo-500/10">
                      <img src={v.url} alt="vibe-wall" className="w-full h-32 object-cover" />
                      
                      {/* Gradient tag overlay */}
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2.5 flex items-center justify-between text-[11px]">
                        <div className="flex items-center gap-1">
                          <img src={v.authorAvatar} alt="av" className="w-4 h-4 rounded-full object-cover border border-white/20" />
                          <span className="text-white/80 font-semibold truncate max-w-[65px]">{v.authorName}</span>
                        </div>
                        
                        <button
                          onClick={() => handleLikeVibeCheck(v.id)}
                          className="flex items-center gap-1 bg-white/15 px-2 py-0.5 rounded-full hover:bg-white/30 transition text-pink-400"
                        >
                          <Heart className="w-3 h-3 fill-pink-500 text-pink-500" />
                          <span className="text-[10px] font-mono text-white">{v.likes || 0}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 border border-dashed border-white/10 rounded-2xl text-xs text-white/30">
                  Nenhuma Vibe compartilhada no Mural ainda. Seja o primeiro a postar!
                </div>
              )}
            </div>

            {/* CONFIRMED ATTENDEES COLLAPSIBLE ACCORDION */}
            <div className={`p-6 rounded-3xl ${currentTheme.cardBg} border ${currentTheme.border} shadow-xl`}>
              <div className="flex justify-between items-center mb-4">
                <h3 className={`text-md font-bold tracking-tight uppercase ${currentTheme.text} flex items-center gap-1.5`}>
                  <Users className="w-4.5 h-4.5" /> Quem vai no Rolê ({confirmedGuests.length})
                </h3>
              </div>

              {event.guests?.length > 0 ? (
                <div className="space-y-2">
                  {event.guests.map((g) => (
                    <div key={g.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/20 border border-white/5">
                      <div className="flex items-center gap-2">
                        <img src={g.avatar} className="w-7 h-7 rounded-full object-cover" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold">{g.name}</span>
                          {g.phone && <span className="text-[9px] text-[#a5b4fc]/70 font-mono">{g.phone}</span>}
                        </div>
                      </div>
                      <span className={`text-[9px] font-mono font-bold px-2.5 py-0.5 rounded-full ${
                        g.status === "VOU" 
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                          : g.status === "TALVEZ" ? "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20" : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}>
                        {g.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-xs text-white/30">Sem respostas de convidados ainda.</div>
              )}
            </div>

          </div>
        </div>
      ) : (
        
        /* ==================== MODO ORGANIZADOR (DETALHAMENTO DA VAQUINHA) ==================== */
        <div id="organizer-dashboard" className="p-4 sm:p-8 max-w-2xl mx-auto space-y-6 animate-fadeIn">
          
          {/* Main Organizer Tabs */}
          <div className="flex bg-[#141b2f]/80 border border-indigo-500/15 p-1 rounded-2xl overflow-x-auto gap-1">
            {[
              { id: "finance" as const, label: "Financeiro 💸" },
              { id: "reception" as const, label: "Check-in / Portaria 🔑" },
              { id: "broadcast" as const, label: "Comunicar 📣" },
              { id: "retro" as const, label: "Retrospectiva 📸" }
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setOrganizerMainTab(tab.id)}
                className={`flex-1 px-3 py-2 text-[11px] font-bold rounded-xl whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  organizerMainTab === tab.id 
                    ? "bg-indigo-500 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-indigo-200/50 hover:text-indigo-200/80 hover:bg-white/5"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {organizerMainTab === "finance" && (
            <>
              {/* Quick Header Panel with Edit Toggle */}
              <div className="flex justify-between items-center bg-[#141b2f]/40 backdrop-blur-md border border-indigo-500/10 p-4 rounded-3xl">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-[#a5b4fc]">ORGANIZADOR</span>
                  <h2 className="text-sm font-semibold text-white">Controles da Vaquinha</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  className="bg-indigo-500/15 text-indigo-400 px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition hover:bg-indigo-500/30 cursor-pointer"
                >
                  <Edit3 className="w-4 h-4" /> {isEditing ? "Fechar Editor" : "Editar Dados"}
                </button>
              </div>

            {/* Editing Segment if toggled */}
            {isEditing && (
              <form onSubmit={handleSaveDetails} className="space-y-4 p-4 rounded-2xl bg-slate-950/50 border border-indigo-500/10 mb-6 animate-fadeIn">
                <span className="text-[10px] font-mono uppercase tracking-widest text-pink-400 block border-b border-indigo-500/5 pb-2">Editor Rápido de Detalhes</span>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-1">Título do Evento</label>
                    <input
                      type="text"
                      className="w-full bg-[#0b1226] border border-indigo-500/20 p-2.5 rounded-xl outline-none text-xs"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-1">Localização</label>
                    <input
                      type="text"
                      className="w-full bg-[#0b1226] border border-indigo-500/20 p-2.5 rounded-xl outline-none text-xs"
                      value={editLocation}
                      onChange={(e) => setEditLocation(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-1">Dressing Code</label>
                    <input
                      type="text"
                      className="w-full bg-[#0b1226] border border-indigo-500/20 p-2.5 rounded-xl outline-none text-xs"
                      value={editDress}
                      onChange={(e) => setEditDress(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-1">Descrição</label>
                    <textarea
                      rows={3}
                      className="w-full bg-[#0b1226] border border-indigo-500/20 p-2.5 rounded-xl outline-none text-xs resize-none"
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-indigo-200/40 font-bold px-3 py-1.5 rounded-xl hover:bg-white/5">Cancelar</button>
                  <button type="submit" className="text-xs bg-indigo-500 text-white font-bold p-1.5 px-4 rounded-xl hover:bg-indigo-400">Salvar Alterações</button>
                </div>
              </form>
            )}

          {/* Quick Details Editor Form */}
          {isEditing && (
            <form onSubmit={handleSaveDetails} className="space-y-4 p-5 rounded-[32px] bg-slate-950/50 border border-indigo-500/10 animate-fadeIn">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#a5b4fc] block border-b border-indigo-500/5 pb-2">Editar Meta & Informações</span>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-1">Meta Ideal (R$)</label>
                    <input
                      type="number"
                      className="w-full bg-[#0b1226] border border-indigo-500/20 p-2.5 rounded-xl outline-none text-xs text-white"
                      value={event.vaquinhaGoal || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEvent({ ...event, vaquinhaGoal: val });
                      }}
                      placeholder="Ex: 15000"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-1">Meta Sugerida/Pessoa (R$)</label>
                    <input
                      type="number"
                      className="w-full bg-[#0b1226] border border-indigo-500/20 p-2.5 rounded-xl outline-none text-xs text-white"
                      value={event.vaquinhaValuePerPerson || ""}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setEvent({ ...event, vaquinhaValuePerPerson: val });
                      }}
                      placeholder="Ex: 100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-1">Título da Vaquinha</label>
                  <input
                    type="text"
                    className="w-full bg-[#0b1226] border border-indigo-500/20 p-2.5 rounded-xl outline-none text-xs text-white"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-1">Slogan / Descrição Curta</label>
                  <textarea
                    rows={2}
                    className="w-full bg-[#0b1226] border border-indigo-500/20 p-2.5 rounded-xl outline-none text-xs text-white resize-none"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => setIsEditing(false)} className="text-xs text-indigo-200/40 font-bold px-3 py-1.5 rounded-xl hover:bg-white/5">Cancelar</button>
                <button type="submit" className="text-xs bg-indigo-500 text-white font-bold px-4 py-1.5 rounded-xl hover:bg-indigo-400">Salvar</button>
              </div>
            </form>
          )}

          {/* CARD 1: MAIN FINANCIAL PROGRESS STATUS */}
          <div className="bg-[#12192c]/90 border border-indigo-500/10 rounded-[32px] p-8 sm:p-10 shadow-2xl space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            {/* Label pill inside card top */}
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/60 text-[10px] font-bold font-mono tracking-widest text-[#a5b4fc] uppercase">
              VAQUINHA DO EVENTO
            </div>

            {/* Event Name */}
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight font-sans">
              {event.name}
            </h1>

            {/* Event Slogan */}
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans max-w-lg">
              {event.description || "Gerenciamento financeiro em tempo real para o projeto de arrecadação coletiva."}
            </p>

            {/* Row of stats */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60 font-sans">
              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">
                  ARRECADADO
                </span>
                <span className="text-2xl sm:text-3xl font-black text-indigo-200 block tracking-tight">
                  R$ {(event.vaquinhaCollected || 0).toLocaleString("pt-BR")}
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase block">
                  META FINAL
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white block tracking-tight">
                  R$ {(event.vaquinhaGoal || 15000).toLocaleString("pt-BR")}
                </span>
              </div>
            </div>

            {/* Bar de Progresso e rodapé de progresso */}
            <div className="space-y-3 pt-2">
              <div className="w-full bg-slate-950/45 h-3 px-1 flex items-center rounded-full border border-slate-800/60 select-none overflow-hidden relative">
                <div 
                  className="bg-[#9aa7ff] shadow-[0_0_15px_rgba(154,167,255,0.7)] h-1.5 rounded-full transition-all duration-75" 
                  style={{ width: `${vaquinhaPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-xs font-mono font-bold">
                <span className="text-[#a5b4fc]/90 animate-pulse">
                  {vaquinhaPercent}% concluído
                </span>
                <span className="text-slate-400">
                  {event.vaquinhaCollected >= (event.vaquinhaGoal || 15000) ? (
                    <span className="text-emerald-400">Meta superada! 🎉</span>
                  ) : (
                    `Faltam R$ ${((event.vaquinhaGoal || 15000) - (event.vaquinhaCollected || 0)).toLocaleString("pt-BR")}`
                  )}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-500/10 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTxHistory(true)}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-bold underline cursor-pointer"
              >
                Ver Histórico Financeiro Completo ➔
              </button>
            </div>
          </div>

          {/* CARD 2: CONFIRMED PAYMENTS SUMMARY */}
          <div className="bg-[#12192c]/90 border border-indigo-500/10 rounded-[32px] p-6 text-center flex flex-col items-center justify-center space-y-2 shadow-2xl relative overflow-hidden">
            <div className="w-12 h-12 rounded-full bg-cyan-400/10 flex items-center justify-center text-[#2edbde] shadow-[0_0_15px_rgba(46,219,222,0.15)]">
              <Users className="w-6 h-6" />
            </div>
            <div className="space-y-0.5">
              <div className="text-3xl font-black font-sans tracking-tight text-white leading-tight">
                {event.guests?.filter(g => g.paid).length || 0} / {event.guests?.filter(g => g.status === 'VOU' || g.status === 'TALVEZ').length || 0}
              </div>
              <div className="text-[10px] font-bold font-mono tracking-widest text-[#2edbde] uppercase">
                PESSOAS PAGAS
              </div>
            </div>
          </div>

          {/* CARD 3: SHARE LINK ACCESS */}
          <div 
            onClick={handleCopyInviteLink}
            className="bg-[#12192c]/90 border border-indigo-500/10 rounded-[32px] p-6 text-center flex flex-col items-center justify-center space-y-2 shadow-2xl relative overflow-hidden cursor-pointer hover:border-pink-500/35 transition duration-300"
          >
            <div className="w-12 h-12 rounded-full bg-pink-500/15 flex items-center justify-center text-pink-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <svg className="w-5 h-5 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="8.59" y1="10.49" x2="15.42" y2="6.51"></line></svg>
            </div>
            <div className="space-y-0.5">
              <div className="text-[10px] font-bold font-mono tracking-widest text-pink-400 uppercase">
                LINK DE ENVIO DE PAGAMENTO
              </div>
              <div className="text-xs font-semibold tracking-tight text-slate-300 underline decoration-pink-500/40">
                Compartilhar Link Invite ou Pix
              </div>
            </div>
          </div>

          {/* CARD 4: GUESTS LIST MANAGEMENT WITH STATUS SEGMENTS */}
          <div className="space-y-6 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white font-sans">
                Gerenciamento de Convidados
              </h2>
              
              {/* Tab options built to resemble the reference layout */}
              <div className="bg-[#141b2f] border border-slate-800 p-1.5 rounded-full flex gap-1 shadow-inner self-start">
                <button
                  onClick={() => setOrganizerTab("pagos")}
                  className={`px-5 py-2 text-xs font-bold tracking-tight rounded-full transition-all duration-300 ${
                    organizerTab === "pagos"
                      ? "bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pagos
                </button>
                <button
                  onClick={() => setOrganizerTab("pendentes")}
                  className={`px-5 py-2 text-xs font-bold tracking-tight rounded-full transition-all duration-300 ${
                    organizerTab === "pendentes"
                      ? "bg-[#6366f1] text-white shadow-lg shadow-indigo-500/20"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Pendentes
                </button>
              </div>
            </div>

            {/* Dynamic Loop output based on selected sub list */}
            <div className="space-y-3 animate-fadeIn">
              {(() => {
                const isViewPagos = organizerTab === "pagos";
                const activeList = event.guests?.filter((g) => {
                  const confirmed = g.status === "VOU" || g.status === "TALVEZ";
                  return isViewPagos ? (confirmed && g.paid) : (confirmed && !g.paid);
                }) || [];

                if (activeList.length === 0) {
                  return (
                    <div className="text-center py-10 bg-[#12192c]/40 border border-slate-800/50 rounded-[32px] text-xs text-slate-400/80">
                      Nenhum convidado nessa categoria ainda.
                    </div>
                  );
                }

                return activeList.map((g) => (
                  <div 
                    key={g.id} 
                    className="bg-[#12192c] rounded-[32px] border border-indigo-500/10 p-5 flex items-center justify-between shadow-xl flex-wrap sm:flex-nowrap gap-4"
                  >
                    {/* Left: Avatar with glowing back ring & identification details */}
                    <div className="flex items-center gap-4">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#6366f1] to-pink-500 blur-[2px] opacity-75" />
                        <img 
                          src={g.avatar} 
                          alt={g.name} 
                          className="w-12 h-12 rounded-full object-cover relative border border-[#12192c] z-10" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="space-y-0.5 text-left">
                        <h4 className="text-sm font-extrabold text-white font-sans">{g.name}</h4>
                        <p className="text-[11px] text-indigo-300/85 font-medium leading-tight">
                          {g.phone ? `Whats: ${g.phone}` : "Sem telefone"} • Confirmado em {new Date(g.confirmedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                    </div>

                    {/* Right: Interactive Badge or Reminder option */}
                    <div className="flex-shrink-0 flex items-center gap-2 w-full sm:w-auto justify-end">
                      {isViewPagos ? (
                        <button
                          onClick={() => handleTogglePaid(g.id)}
                          className="border border-[#2edbde]/45 bg-[#2edbde]/10 text-[#2edbde] text-[10px] font-black tracking-widest px-4 py-2 rounded-full hover:bg-rose-500/15 hover:border-rose-500 hover:text-rose-400 transition"
                          title="Clique para revogar pagamento"
                        >
                          PAGO
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleTogglePaid(g.id)}
                            className="border border-slate-700 bg-slate-800 text-slate-300 text-[10px] font-black tracking-widest px-4 py-2 rounded-full hover:border-[#2edbde] hover:bg-[#2edbde]/10 hover:text-[#2edbde] transition"
                            title="Marcar como Pago manualmente"
                          >
                            PAGAR
                          </button>
                          
                          <button
                            onClick={() => handleSendWhatsAppReminder(g)}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white p-2.5 rounded-full hover:shadow-lg hover:shadow-emerald-500/35 transition-all duration-300 flex items-center justify-center h-10 w-10 cursor-pointer"
                            title="Enviar cobrança / link Pix pelo WhatsApp"
                          >
                            <svg className="w-5 h-5 fill-white" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.1 1.448 4.7 1.449 5.4 0 9.8-4.399 9.8-9.799-.002-2.615-1.012-5.074-2.86-6.924C16.435 1.93 13.982.93 11.998.93c-5.4 0-9.8 4.4-9.8 9.8 0 1.8.5 3.5 1.4 5.1l-.8 3.3 3.3-.8zM17.487 14.39c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.28-.47-2.45-1.51-.9-.8-1.53-1.8-1.7-2.1-.18-.3-.02-.47.13-.62.14-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.62-.93-2.22-.24-.59-.49-.51-.68-.52-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.28.3-1.07 1.05-1.07 2.56s1.1 2.97 1.25 3.17c.15.2 2.16 3.29 5.23 4.61.73.31 1.3.5 1.74.64.73.23 1.4.2 1.93.12.59-.09 1.78-.73 2.03-1.43.25-.7.25-1.29.18-1.42-.07-.13-.27-.2-.57-.35z"/>
                            </svg>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
          </>
          )}

          {/* TRANSACTION HISTORY MODAL (17) */}
          {showTxHistory && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
              <div className="bg-[#141b31] border border-indigo-500/20 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative space-y-4">
                <div className="flex justify-between items-center border-b border-indigo-500/10 pb-3">
                  <h3 className="text-md font-bold flex items-center gap-1.5 text-white">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                    Histórico Financeiro do Evento
                  </h3>
                  <button onClick={() => setShowTxHistory(false)} className="text-slate-400 hover:text-white text-xs font-mono border border-slate-800 rounded-lg px-2.5 py-1 cursor-pointer">Fechar</button>
                </div>

                <div className="overflow-x-auto max-h-80 pr-1">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-indigo-500/10 text-indigo-200/40 font-mono">
                        <th className="py-2">Data/Hora</th>
                        <th className="py-2">Doador(a)</th>
                        <th className="py-2">Mensagem</th>
                        <th className="py-2 text-right">Valor</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-indigo-500/5">
                      {(event.contributions || []).map((ct) => (
                        <tr key={ct.id}>
                          <td className="py-2.5 font-mono text-slate-500">{new Date(ct.createdAt).toLocaleString("pt-BR")}</td>
                          <td className="py-2.5 font-semibold text-white flex items-center gap-1.5">
                            <img src={ct.contributorAvatar} className="w-5 h-5 rounded-full object-cover" />
                            {ct.contributorName}
                          </td>
                          <td className="py-2.5 text-slate-400 italic">"{ct.message || "Sem recado"}"</td>
                          <td className="py-2.5 text-right font-mono font-bold text-emerald-400">R$ {ct.amount.toLocaleString("pt-BR")}</td>
                        </tr>
                      ))}
                      {(event.contributions || []).length === 0 && (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500">Nenhuma transação registrada ainda.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => alert("Relatório PDF gerado e pronto para download (Simulado).")} 
                    className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl px-4 py-2 text-xs font-semibold cursor-pointer"
                  >
                    Exportar Comprovante PDF
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RECEPTION & PORTARIA CHECK-IN VIEW (27, 28, 29) */}
          {organizerMainTab === "reception" && (
            <div className="space-y-6 animate-fadeIn">
              {/* Stats card */}
              <div className="bg-[#12192c]/90 border border-indigo-500/10 rounded-[32px] p-6 space-y-4 shadow-2xl">
                <span className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold font-mono tracking-widest text-indigo-400 uppercase">
                  Controle de Portaria & Check-in (Pro)
                </span>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950/40 p-4 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">PRESENTES REAIS</span>
                    <span className="text-2xl font-black text-white font-mono">
                      {checkedInIds.length} / {confirmedGuests.length}
                    </span>
                  </div>
                  <div className="bg-slate-950/40 p-4 rounded-2xl text-center space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 block uppercase">PICO DE CHEGADA</span>
                    <span className="text-2xl font-black text-pink-400 font-mono">23:45</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowQRScanner(true);
                    setScanStatus("scanning");
                    setScannedGuest(null);
                  }}
                  className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 rounded-2xl text-xs font-bold uppercase tracking-wider text-white hover:opacity-95 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h3v3H7z"></path><path d="M14 7h3v3h-3z"></path><path d="M7 14h3v3H7z"></path><path d="M14 14h3v3h-3z"></path></svg>
                  Escanear QR Code de Entrada
                </button>
              </div>

              {/* QR scanner simulated viewport (28) */}
              {showQRScanner && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
                  <div className="bg-[#141b31] border border-indigo-500/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative space-y-6 text-center">
                    <div className="flex justify-between items-center border-b border-indigo-500/10 pb-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Leitor QR Code Simulado</span>
                      <button onClick={() => setShowQRScanner(false)} className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer">Fechar</button>
                    </div>

                    {scanStatus === "scanning" && (
                      <div className="space-y-4">
                        {/* Simulated camera screen */}
                        <div className="w-56 h-56 mx-auto bg-slate-950 rounded-2xl border-2 border-indigo-500/30 relative overflow-hidden flex items-center justify-center">
                          {/* Laser scanning line */}
                          <div className="absolute left-0 right-0 h-0.5 bg-pink-500 top-1/2 shadow-[0_0_8px_rgba(236,72,153,1)] animate-[bounce_2s_infinite]" />
                          <svg className="w-16 h-16 text-indigo-500/20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="M7 7h3v3H7z"></path><path d="M14 7h3v3h-3z"></path><path d="M7 14h3v3H7z"></path><path d="M14 14h3v3h-3z"></path></svg>
                        </div>
                        
                        <p className="text-xs text-indigo-200/40">Selecione um convidado para simular o escaneamento de seu ingresso QR Code:</p>
                        <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 text-left">
                          {confirmedGuests.map(g => (
                            <button
                              key={g.id}
                              onClick={() => {
                                setScannedGuest(g);
                                setScanStatus("success");
                                setCheckedInIds(prev => Array.from(new Set([...prev, g.id])));
                              }}
                              className="w-full p-2 bg-slate-950/40 hover:bg-indigo-500/10 border border-indigo-500/10 rounded-xl text-xs flex items-center gap-2 text-white cursor-pointer"
                            >
                              <img src={g.avatar} className="w-5 h-5 rounded-full object-cover" />
                              <span className="truncate">{g.name}</span>
                            </button>
                          ))}
                          {confirmedGuests.length === 0 && (
                            <p className="text-xs text-slate-500 text-center py-2">Sem convidados confirmados para testar.</p>
                          )}
                        </div>
                      </div>
                    )}

                    {scanStatus === "success" && scannedGuest && (
                      <div className="space-y-4 py-4 animate-fadeIn">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500 flex items-center justify-center mx-auto text-emerald-400">
                          <svg className="w-10 h-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"></polyline></svg>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-white">Check-in Realizado!</h4>
                          <p className="text-xs text-emerald-400 font-mono mt-1 uppercase tracking-widest">INGRESSO VÁLIDO & VERIFICADO</p>
                        </div>
                        <div className="bg-slate-950/40 p-3 rounded-xl border border-indigo-500/10 flex items-center gap-3 text-left">
                          <img src={scannedGuest.avatar} className="w-9 h-9 rounded-full object-cover" />
                          <div>
                            <span className="text-xs font-bold block text-white">{scannedGuest.name}</span>
                            <span className="text-[10px] text-indigo-200/40 block">Ticket #{scannedGuest.id}</span>
                          </div>
                        </div>
                        <button 
                          onClick={() => setScanStatus("scanning")} 
                          className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Escanear Próximo
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Relatório pós-evento metrics (29) */}
              <div className="bg-[#12192c]/90 border border-indigo-500/10 rounded-[32px] p-6 space-y-4 shadow-2xl text-left">
                <h3 className="text-xs font-mono font-bold tracking-widest text-[#a5b4fc] uppercase">Relatório Final Executivo</h3>
                
                {/* Horizontal custom bar charts */}
                <div className="space-y-3 pt-2">
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Presença Real vs Confirmada</span>
                      <span className="font-bold">{checkedInIds.length} / {confirmedGuests.length}</span>
                    </div>
                    <div className="w-full bg-slate-950/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-indigo-500 h-full rounded-full" 
                        style={{ width: `${confirmedGuests.length ? (checkedInIds.length / confirmedGuests.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Cotas de Vaquinha Pagas</span>
                      <span className="font-bold">{(event.guests || []).filter(g=>g.paid).length} / {(event.guests || []).length}</span>
                    </div>
                    <div className="w-full bg-slate-950/40 h-2.5 rounded-full overflow-hidden border border-white/5">
                      <div 
                        className="bg-pink-500 h-full rounded-full" 
                        style={{ width: `${(event.guests || []).length ? ((event.guests || []).filter(g=>g.paid).length / (event.guests || []).length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button 
                    onClick={() => alert("Relatório Executivo exportado em formato PDF (Simulado).")} 
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 px-4 py-2 rounded-xl font-bold cursor-pointer"
                  >
                    Exportar Relatório Pro
                  </button>
                </div>
              </div>

              {/* Guest check-in list search & toggle */}
              <div className="bg-[#12192c]/90 border border-indigo-500/10 rounded-[32px] p-6 space-y-4 shadow-2xl text-left">
                <h3 className="text-xs font-mono font-bold tracking-widest text-[#a5b4fc] uppercase">Check-in Manual</h3>
                <input
                  type="text"
                  placeholder="Pesquisar convidado por nome..."
                  value={searchCheckIn}
                  onChange={(e) => setSearchCheckIn(e.target.value)}
                  className="w-full bg-slate-950/40 border border-indigo-500/15 p-3.5 rounded-2xl outline-none text-xs text-white"
                />

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {confirmedGuests.filter(g => g.name.toLowerCase().includes(searchCheckIn.toLowerCase())).map(g => {
                    const isCheckedIn = checkedInIds.includes(g.id);
                    return (
                      <div key={g.id} className="flex items-center justify-between p-2 rounded-xl bg-slate-950/20 border border-white/5">
                        <div className="flex items-center gap-2">
                          <img src={g.avatar} className="w-7 h-7 rounded-full object-cover" />
                          <span className="text-xs font-semibold text-white">{g.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            if (isCheckedIn) {
                              setCheckedInIds(prev => prev.filter(id => id !== g.id));
                            } else {
                              setCheckedInIds(prev => [...prev, g.id]);
                            }
                          }}
                          className={`text-[9px] font-mono font-bold px-3 py-1.5 rounded-full border transition cursor-pointer ${
                            isCheckedIn
                              ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                              : "bg-slate-850 border-slate-700 text-slate-400 hover:text-white"
                          }`}
                        >
                          {isCheckedIn ? "PRESENTE" : "PENDENTE"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* BROADCAST VIEW (23) */}
          {organizerMainTab === "broadcast" && (
            <div className="bg-[#12192c]/90 border border-indigo-500/10 rounded-[32px] p-6 space-y-5 shadow-2xl text-left animate-fadeIn">
              <span className="inline-flex items-center px-4 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[10px] font-bold font-mono tracking-widest text-pink-400 uppercase">
                Mensagem Geral para Convidados (Pro)
              </span>

              <p className="text-xs text-slate-400 leading-relaxed">
                Dispare atualizações sobre o local, lembretes de última hora ou atualizações de vaquinha para todos os convidados confirmados por WhatsApp de uma vez.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-2">Mensagem do Comunicado</label>
                  <textarea
                    rows={4}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    placeholder="Ex: Pessoal, o local do evento foi atualizado! Venham no endereço indicado no portal..."
                    className="w-full bg-slate-950/40 border border-indigo-500/15 focus:border-indigo-400 p-4 rounded-2xl outline-none text-xs text-white resize-none"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!broadcastMessage.trim()) {
                      alert("Digite um recado para enviar!");
                      return;
                    }
                    const messageText = `Comunicado Solstice: *${event.name}*\n\n${broadcastMessage}`;
                    const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(messageText)}`;
                    window.open(shareUrl, "_blank");
                    alert("Redirecionando para o envio em massa via WhatsApp.");
                  }}
                  className="w-full py-3.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.1 1.448 4.7 1.449 5.4 0 9.8-4.399 9.8-9.799-.002-2.615-1.012-5.074-2.86-6.924C16.435 1.93 13.982.93 11.998.93c-5.4 0-9.8 4.4-9.8 9.8 0 1.8.5 3.5 1.4 5.1l-.8 3.3 3.3-.8zM17.487 14.39c-.3-.15-1.78-.88-2.05-.98-.28-.1-.48-.15-.68.15-.2.3-.78.98-.95 1.18-.18.2-.35.23-.65.08-.3-.15-1.28-.47-2.45-1.51-.9-.8-1.53-1.8-1.7-2.1-.18-.3-.02-.47.13-.62.14-.13.3-.35.45-.53.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.07-.15-.68-1.62-.93-2.22-.24-.59-.49-.51-.68-.52-.17-.01-.37-.01-.57-.01-.2 0-.52.07-.79.37-.28.3-1.07 1.05-1.07 2.56s1.1 2.97 1.25 3.17c.15.2 2.16 3.29 5.23 4.61.73.31 1.3.5 1.74.64.73.23 1.4.2 1.93.12.59-.09 1.78-.73 2.03-1.43.25-.7.25-1.29.18-1.42-.07-.13-.27-.2-.57-.35z"/></svg>
                  Disparar Mensagem pelo WhatsApp
                </button>
              </div>
            </div>
          )}

          {/* RETROSPECTIVE VIEW (21) */}
          {organizerMainTab === "retro" && (
            <div className="bg-[#12192c]/90 border border-indigo-500/10 rounded-[32px] p-6 space-y-5 shadow-2xl text-left animate-fadeIn">
              <span className="inline-flex items-center px-4 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-bold font-mono tracking-widest text-indigo-400 uppercase">
                Retrospectiva Automática de Inteligência Artificial
              </span>

              <p className="text-xs text-slate-400 leading-relaxed">
                Nossa IA reuniu os melhores momentos, presença e marcos financeiros do evento para criar esta retrospectiva inesquecível.
              </p>

              {/* Simulated Slideshow Viewport */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-3xl p-6 relative overflow-hidden h-72 flex flex-col justify-between">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl pointer-events-none" />
                
                {/* Header of slide */}
                <div className="flex justify-between items-center text-[10px] font-mono text-indigo-300">
                  <span>SLIDE {retroSlideIdx + 1} DE 4</span>
                  <button 
                    type="button" 
                    onClick={() => setRetroMusic(!retroMusic)}
                    className={`px-2 py-0.5 rounded border text-[9px] cursor-pointer ${retroMusic ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "border-slate-800 text-slate-400"}`}
                  >
                    {retroMusic ? "♫ Música On" : "🔇 Música Off"}
                  </button>
                </div>

                {/* Body of slide */}
                <div className="flex-1 flex items-center justify-center p-4">
                  {retroSlideIdx === 0 && (
                    <div className="text-center space-y-1.5 animate-fadeIn">
                      <h4 className="text-sm font-bold font-mono text-indigo-200">RITMO & PRESENÇA</h4>
                      <p className="text-2xl font-black text-white">{confirmedGuests.length} Presenças Ativas</p>
                      <p className="text-[10px] text-slate-500">Membros participando do rolê.</p>
                    </div>
                  )}

                  {retroSlideIdx === 1 && (
                    <div className="text-center space-y-2 animate-fadeIn w-full">
                      <h4 className="text-sm font-bold font-mono text-[#a5b4fc]">MURAL DE VIBES</h4>
                      <div className="flex justify-center gap-2">
                        {event.vibeWall?.slice(0, 3).map((v, vi) => (
                          <img key={v.id || vi} src={v.url} className="w-16 h-16 rounded-xl object-cover border border-white/10" />
                        ))}
                        {(event.vibeWall || []).length === 0 && (
                          <p className="text-xs text-slate-500">Sem fotos no Mural ainda para mostrar.</p>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500">{(event.vibeWall || []).length} fotos compartilhadas pelo coletivo.</p>
                    </div>
                  )}

                  {retroSlideIdx === 2 && (
                    <div className="text-center space-y-1.5 animate-fadeIn">
                      <h4 className="text-sm font-bold font-mono text-emerald-400">FINANCEIRO INTEGRADO</h4>
                      <p className="text-2xl font-black text-white">R$ {event.vaquinhaCollected || 0} Acumulado</p>
                      <p className="text-[10px] text-slate-500">Saldo gerado para vaquinha no Pix.</p>
                    </div>
                  )}

                  {retroSlideIdx === 3 && (
                    <div className="text-center space-y-1.5 animate-fadeIn">
                      <h4 className="text-sm font-bold font-mono text-pink-400">STATUS DE VIBE CHECK</h4>
                      <p className="text-3xl font-black bg-gradient-to-r from-pink-500 to-indigo-500 bg-clip-text text-transparent">Vibe {event.vibeScore || "9.8"} ⚡</p>
                      <p className="text-[10px] text-slate-500">Parabéns! A meta da comemoração foi concluída!</p>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => setRetroSlideIdx(prev => Math.max(0, prev - 1))}
                    disabled={retroSlideIdx === 0}
                    className="text-xs text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    Anterior
                  </button>
                  <button 
                    onClick={() => setRetroSlideIdx(prev => Math.min(3, prev + 1))}
                    disabled={retroSlideIdx === 3}
                    className="text-xs text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
                  >
                    Próximo
                  </button>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => alert("Retrospectiva compartilhada nos Stories (Simulado).")}
                  className="flex-1 py-3 bg-pink-500 hover:bg-pink-400 text-white rounded-xl text-xs font-bold text-center cursor-pointer"
                >
                  Compartilhar como Story 📱
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
