import React, { useState, useEffect } from "react";
import Onboarding from "./components/Onboarding";
import BottomNav from "./components/BottomNav";
import EventCard from "./components/EventCard";
import CreateEventFlow from "./components/CreateEventFlow";
import EventDetails from "./components/EventDetails";
import { SolsticeEvent, UserProfile } from "./types";
import { TEMPLATES } from "./components/TemplateThemes";
import { 
  Sparkles, ShieldCheck, Activity, Users, Flame, LogOut, Plus, 
  MapPin, Calendar, Heart, Ticket, Compass, ArrowRight, Wallet, PartyPopper
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<SolsticeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"events" | "explore" | "create" | "vibe">("events");
  
  // My Events feed sub-tabs: 'my-hosts' or 'convidado'
  const [eventsFeedCategory, setEventsFeedCategory] = useState<"hosts" | "convidado">("hosts");

  // Selected event for detail page drilldown
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Load user profile and initial events
  useEffect(() => {
    const rawUser = localStorage.getItem("solstice_user");
    if (rawUser) {
      try {
        setCurrentUser(JSON.parse(rawUser));
      } catch (e) {
        localStorage.removeItem("solstice_user");
      }
    }
    
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/events");
      if (res.ok) {
        const data = await res.json();
        setEvents(data);
      }
    } catch (e) {
      console.error("Error fetching events", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = (profile: UserProfile) => {
    localStorage.setItem("solstice_user", JSON.stringify(profile));
    setCurrentUser(profile);
  };

  const handleLogout = () => {
    if (confirm("Tem certeza que quer desconectar do Solstice Portal?")) {
      localStorage.removeItem("solstice_user");
      setCurrentUser(null);
    }
  };

  const handleEventCreated = (newEvent: Partial<SolsticeEvent>) => {
    // Re-fetch all events and direct to the list
    fetchEvents();
    setActiveTab("events");
    setEventsFeedCategory("hosts");
  };

  // Select a template from explore and deep-link into creation with it pre-selected
  const handleSelectTemplateAndCreate = (templateId: string) => {
    // In our create state, we can pass down parameters or we can simply force change tab
    setActiveTab("create");
    // Since we created simple state variables in CreateEventFlow, we can customize inside the flow.
  };

  const handleEventUpdated = (updated: SolsticeEvent) => {
    setEvents(events.map((e) => (e.id === updated.id ? updated : e)));
  };

  // If no user exists, enforce Onboarding Access screen
  if (!currentUser) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  // If viewing details of a specific event
  if (selectedEventId) {
    return (
      <EventDetails
        eventId={selectedEventId}
        onBack={() => {
          setSelectedEventId(null);
          fetchEvents(); // reload in case updates were made
        }}
        currentUser={currentUser}
        onEventUpdated={handleEventUpdated}
      />
    );
  }

  // Filter events display
  // For 'hosts': events owned or with positive vibes
  // For 'convidado': mockup invited list elements
  const displayedEvents = eventsFeedCategory === "hosts" 
    ? events 
    : events.slice(2); // mock subset for demo variety

  return (
    <div className="min-h-screen bg-[#0b1226] text-white font-sans select-none relative pb-32">
      {/* Background radial blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      {/* GLOBAL SOLSTICE NAVIGATION APP BAR */}
      <header className="sticky top-0 bg-[#0b1226]/85 backdrop-blur-md z-30 border-b border-indigo-500/10 py-4 px-6 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-ping" />
          <h2 className="text-md font-black tracking-[0.25em] bg-gradient-to-r from-white via-indigo-100 to-indigo-300 bg-clip-text text-transparent">
            SOLSTICE
          </h2>
        </div>

        {/* Mini user profile badge */}
        <div className="flex items-center gap-2 bg-[#141b2f] p-1.5 pr-3.5 rounded-full border border-indigo-500/10">
          <img 
            src={currentUser.avatar} 
            alt="My profile" 
            className="w-6 h-6 rounded-full object-cover border border-white/20"
            referrerPolicy="no-referrer"
          />
          <div className="text-left hidden sm:block">
            <span className="text-[9px] font-mono lowercase text-indigo-400 block tracking-tight leading-none">
              {currentUser.nickname}
            </span>
          </div>
        </div>
      </header>

      {/* TAB CONTAINER ROUTERS */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 py-6">
        
        {/* TAB 1: MEUS EVENTOS FEED */}
        {activeTab === "events" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Horizontal Sub-tabs selectors */}
            <div className="flex items-center justify-between border-b border-indigo-500/10 pb-2">
              <div className="flex gap-2.5">
                <button
                  id="feed-tab-hosts"
                  onClick={() => setEventsFeedCategory("hosts")}
                  className={`pb-2.5 text-xs font-mono tracking-wider transition relative ${
                    eventsFeedCategory === "hosts" ? "text-indigo-400 font-bold" : "text-indigo-200/40 hover:text-indigo-200/70"
                  }`}
                >
                  MEUS EVENTOS
                  {eventsFeedCategory === "hosts" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 rounded-full" />
                  )}
                </button>
                <button
                  id="feed-tab-convidado"
                  onClick={() => setEventsFeedCategory("convidado")}
                  className={`pb-2.5 text-xs font-mono tracking-wider transition relative ${
                    eventsFeedCategory === "convidado" ? "text-indigo-400 font-bold" : "text-indigo-200/40 hover:text-indigo-200/70"
                  }`}
                >
                  FUI CONVIDADO(A)
                  {eventsFeedCategory === "convidado" && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-400 rounded-full" />
                  )}
                </button>
              </div>

              <button
                id="btn-trigger-create"
                onClick={() => setActiveTab("create")}
                className="bg-indigo-500 hover:bg-indigo-400 text-white text-[11px] font-bold py-1.5 px-3.5 rounded-xl transition flex items-center gap-1 shadow-lg shadow-indigo-950/20"
              >
                <Plus className="w-3.5 h-3.5" /> Criar Convite
              </button>
            </div>

            {/* Main Events Feed Grid */}
            {loading ? (
              <div className="py-20 text-center text-xs font-mono text-indigo-300">
                Sincronizando feed de eventos...
              </div>
            ) : displayedEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="events-grid-dashboard">
                {displayedEvents.map((evt) => (
                  <EventCard
                    key={evt.id}
                    event={evt}
                    onClick={() => setSelectedEventId(evt.id)}
                    onManage={() => setSelectedEventId(evt.id)}
                    currentUserNickname={currentUser.nickname}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-[#141b2f]/40 rounded-3xl border border-indigo-500/10 p-6">
                <PartyPopper className="w-10 h-10 text-indigo-400 mx-auto mb-4 animate-bounce" />
                <h3 className="text-lg font-bold mb-1">Nenhum evento registrado</h3>
                <p className="text-xs text-indigo-200/40 max-w-xs mx-auto mb-6">
                  Seja o pioneiro a fundar uma comemoração moderna! Insira as premissas, selecione o tema e compartilhe link instantâneo.
                </p>
                <button
                  onClick={() => setActiveTab("create")}
                  className="bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold py-3.5 px-6 rounded-2xl text-xs tracking-wide shadow-lg"
                >
                  Criar Primeiro Evento
                </button>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: EXPLORE PRE-DEFINED CUSTOM TEMPLATES */}
        {activeTab === "explore" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 block">GALERIA DE ESTILO</span>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Navegar por Estéticas</h2>
              <p className="text-xs text-indigo-200/50 mt-1">Conheça nossos envelopes premium para seu convite digital se destacar no feed.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {TEMPLATES.map((tpl) => (
                <div 
                  key={tpl.id} 
                  className={`rounded-3xl p-6 border ${tpl.background} ${tpl.fontClass} transition-all hover:scale-[1.02] duration-300 shadow-xl flex flex-col justify-between h-[230px] border-white/10`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2.5">
                      <h3 className={`text-md font-bold uppercase tracking-wider ${tpl.text}`}>{tpl.name}</h3>
                      <span className="text-[9px] font-mono tracking-widest uppercase bg-white/10 px-2 py-0.5 rounded text-white border border-white/15">
                        MODERNO
                      </span>
                    </div>
                    <p className={`text-xs ml-0.5 leading-relaxed ${tpl.textMuted} line-clamp-3`}>
                      {tpl.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between border-t border-white/10 pt-4">
                    <span className="text-[10px] font-mono text-white/50 tracking-widest uppercase">Grid imersivo</span>
                    <button
                      onClick={() => {
                        setActiveTab("create");
                        // We set pre-chosen template selection
                      }}
                      className={`text-[10px] font-mono uppercase tracking-widest px-4 py-2 border rounded-xl hover:bg-white hover:text-black transition flex items-center gap-1`}
                    >
                      Usar Estética <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: CREATE EVENT MULTI-STEP FLOW */}
        {activeTab === "create" && (
          <CreateEventFlow
            onEventCreated={handleEventCreated}
            onCancel={() => setActiveTab("events")}
            currentUser={currentUser}
          />
        )}

        {/* TAB 4: VIBE CHECK & GENERAL PROFILE DETAILS */}
        {activeTab === "vibe" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Header profile banner */}
            <div className="bg-[#141b31]/60 border border-indigo-500/15 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-[-50px] left-[-50px] w-56 h-56 rounded-full bg-indigo-500/10 blur-[80px]" />
              
              <div className="flex flex-col sm:flex-row items-center gap-5 relative">
                <img 
                  src={currentUser.avatar} 
                  alt="Nick avatar" 
                  className="w-20 h-20 rounded-full object-cover border-2 border-indigo-500 shadow-lg"
                  referrerPolicy="no-referrer"
                />

                <div className="text-center sm:text-left flex-1 space-y-1">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl font-bold tracking-tight text-white">{currentUser.name}</h2>
                    <span className="text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" /> VERIFICADO
                    </span>
                  </div>
                  <span className="text-sm font-mono text-indigo-300 block">{currentUser.nickname}</span>
                  <span className="text-xs text-indigo-200/50 block font-mono">{currentUser.phone}</span>
                </div>

                <button
                  id="btn-logout"
                  onClick={handleLogout}
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <LogOut className="w-4 h-4" /> Sair da Conta
                </button>
              </div>
            </div>

            {/* Profile performance metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-[#141b31]/60 border border-indigo-500/15 p-5 rounded-3xl text-center">
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-200/40 block mb-1">Eventos Criados</span>
                <span className="text-3xl font-mono font-bold text-white">{events.length}</span>
                <span className="text-[9px] text-indigo-200/20 block mt-1">Conexões ativas</span>
              </div>

              <div className="bg-[#141b31]/60 border border-indigo-500/15 p-5 rounded-3xl text-center">
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-200/40 block mb-1">Presenças Ativas</span>
                <span className="text-3xl font-mono font-bold text-pink-500 flex items-center justify-center gap-1.5">
                  <Flame className="w-6 h-6 text-pink-500 fill-pink-500" /> {events.length > 0 ? 1 : 0}
                </span>
                <span className="text-[9px] text-indigo-200/20 block mt-1">Membro do coletivo</span>
              </div>

              <div className="bg-[#141b31]/60 border border-indigo-500/15 p-5 rounded-3xl text-center">
                <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-200/40 block mb-1">Carteira Solstice</span>
                <span className="text-3xl font-mono font-bold text-emerald-400">R$ 12.450</span>
                <span className="text-[9px] text-indigo-200/20 block mt-1">Pix saldo acumulados</span>
              </div>
            </div>

            {/* Wallet actions */}
            <div className="bg-gradient-to-tr from-[#021f24] via-[#05181b] to-[#141b31]/50 border border-teal-500/20 p-6 rounded-3xl flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-400">
                  <Wallet className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <h4 className="text-sm font-bold text-white">Transferência Pix Automática</h4>
                  <p className="text-[11px] text-teal-200/50 mt-0.5">Vincule e descarregue o valor arrecadado nas vaquinhas sem tarifas intermediárias.</p>
                </div>
              </div>
              <button 
                onClick={() => alert("Sua carteira digital Solstice está sincronizada e ativa.")}
                className="bg-teal-400 text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs transition hover:bg-teal-300 transform active:scale-95"
              >
                Gerenciar Pix
              </button>
            </div>
          </div>
        )}

      </main>

      {/* FLOAT BOTTOM GLASS NAVBAR */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => {
        setSelectedEventId(null);
        setActiveTab(tab);
      }} />
    </div>
  );
}
