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
  MapPin, Calendar, Heart, Ticket, Compass, ArrowRight, Wallet, PartyPopper, Search
} from "lucide-react";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [events, setEvents] = useState<SolsticeEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"events" | "search" | "create" | "calendar" | "vibe">("events");
  
  // My Events feed sub-tabs: 'my-hosts' or 'convidado'
  const [eventsFeedCategory, setEventsFeedCategory] = useState<"hosts" | "convidado">("hosts");

  // Selected event for detail page drilldown
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);

  // Search screen states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchCategory, setSearchCategory] = useState("todos");

  // Calendar screen states
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string | null>(
    new Date().toISOString().split("T")[0]
  );

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

  // Search logic
  const filteredEvents = events.filter((evt) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesQuery =
      evt.name.toLowerCase().includes(query) ||
      (evt.description && evt.description.toLowerCase().includes(query)) ||
      evt.location.toLowerCase().includes(query);
    const matchesCategory =
      searchCategory === "todos" || evt.type === searchCategory;
    return matchesQuery && matchesCategory;
  });

  // Calendar logic
  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayIndex = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < firstDayIndex; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleMonthChange = (direction: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + direction, 1);
    setCurrentDate(newDate);
  };

  const calendarSelectedEvents = events.filter((evt) => {
    if (!selectedDateStr) return false;
    return evt.dateTime.split("T")[0] === selectedDateStr;
  });

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
    <div className="min-h-screen bg-[#0b1226] text-white font-sans select-none relative pb-32 overflow-x-hidden max-w-full">
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

        {/* TAB 2: BUSCA DE EVENTOS */}
        {activeTab === "search" && (
          <div className="space-y-6 animate-fadeIn">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 block">ENCONTRE SUA FESTA</span>
              <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Procurar Eventos</h2>
              <p className="text-xs text-indigo-200/50 mt-1">Busque eventos por título, descrição ou localização.</p>
            </div>

            {/* Campo de Busca */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-indigo-400/70" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pesquise por nome, local ou vibes..."
                className="block w-full pl-11 pr-4 py-3.5 bg-[#141b31]/80 border border-indigo-500/25 rounded-2xl text-sm placeholder-indigo-200/30 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400/50 shadow-2xl transition duration-200"
              />
            </div>

            {/* Filtros de Categoria */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
              {["todos", "aniversario", "churrasco", "casamento", "formatura", "outros"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`px-4 py-1.5 rounded-full text-xs font-mono capitalize transition-all border shrink-0 cursor-pointer ${
                    searchCategory === cat
                      ? "bg-gradient-to-r from-indigo-500 to-pink-500 border-transparent text-white font-bold shadow-md shadow-pink-500/10"
                      : "bg-[#141b31]/40 border-indigo-500/10 text-indigo-200/60 hover:text-indigo-200 hover:border-indigo-500/35"
                  }`}
                >
                  {cat === "todos" ? "Todos" : cat === "aniversario" ? "Aniversário" : cat}
                </button>
              ))}
            </div>

            {/* Resultados de Busca */}
            {filteredEvents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="search-grid">
                {filteredEvents.map((evt) => (
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
              <div className="text-center py-20 bg-[#141b31]/30 rounded-3xl border border-indigo-500/5">
                <Search className="w-10 h-10 text-indigo-400/30 mx-auto mb-3" />
                <p className="text-sm text-indigo-200/40">Nenhum evento encontrado para a sua busca.</p>
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CALENDÁRIO DE EVENTOS */}
        {activeTab === "calendar" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-center">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 block">AGENDA SOLSTICE</span>
                <h2 className="text-2xl font-bold tracking-tight text-white mt-1">Calendário</h2>
              </div>
              <div className="flex items-center gap-2 bg-[#141b31]/80 border border-indigo-500/15 rounded-2xl px-3 py-1.5 text-xs font-mono text-indigo-300">
                <button
                  onClick={() => handleMonthChange(-1)}
                  className="p-1 hover:text-white transition cursor-pointer"
                >
                  &lt;
                </button>
                <span className="min-w-[120px] text-center uppercase tracking-wide font-bold">
                  {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </span>
                <button
                  onClick={() => handleMonthChange(1)}
                  className="p-1 hover:text-white transition cursor-pointer"
                >
                  &gt;
                </button>
              </div>
            </div>

            {/* Grid do Calendário */}
            <div className="bg-[#141b31]/60 border border-indigo-500/15 rounded-3xl p-5 shadow-2xl">
              {/* Dias da semana */}
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((day) => (
                  <span key={day} className="text-[10px] font-mono font-bold text-indigo-200/40 py-1">
                    {day}
                  </span>
                ))}
              </div>

              {/* Dias do mês */}
              <div className="grid grid-cols-7 gap-1 text-center">
                {getCalendarDays().map((day, idx) => {
                  if (!day) {
                    return <div key={`empty-${idx}`} className="aspect-square" />;
                  }

                  const dateStr = day.toISOString().split("T")[0];
                  const hasEvents = events.some(
                    (evt) => evt.dateTime.split("T")[0] === dateStr
                  );
                  const isSelected = selectedDateStr === dateStr;
                  const isToday = new Date().toISOString().split("T")[0] === dateStr;

                  return (
                    <button
                      key={dateStr}
                      onClick={() => setSelectedDateStr(dateStr)}
                      className={`aspect-square flex flex-col items-center justify-center rounded-xl relative transition-all cursor-pointer ${
                        isSelected
                          ? "bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold scale-105 shadow-md shadow-pink-500/10"
                          : isToday
                          ? "border border-indigo-400 text-indigo-300 font-semibold"
                          : "hover:bg-indigo-500/10 text-indigo-200/70"
                      }`}
                    >
                      <span className="text-xs font-mono">{day.getDate()}</span>
                      {hasEvents && (
                        <span
                          className={`absolute bottom-1.5 w-1.5 h-1.5 rounded-full ${
                            isSelected ? "bg-white" : "bg-pink-500 animate-pulse shadow-[0_0_4px_rgba(236,72,153,0.8)]"
                          }`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Lista de Eventos para o Dia Selecionado */}
            <div className="space-y-4">
              <h3 className="text-xs font-mono tracking-widest text-indigo-200/50 uppercase">
                {selectedDateStr ? (
                  <>Eventos em {new Date(selectedDateStr + "T00:00:00").toLocaleDateString("pt-BR", { day: "2-digit", month: "long" })}</>
                ) : (
                  "Selecione um dia no calendário"
                )}
              </h3>

              {calendarSelectedEvents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {calendarSelectedEvents.map((evt) => (
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
                <div className="text-center py-12 bg-[#141b31]/30 rounded-3xl border border-indigo-500/5">
                  <p className="text-xs text-indigo-200/40">Nenhum evento programado para este dia.</p>
                </div>
              )}
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
