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

  // Central de Notificações states
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "Marcus P. confirmou presença no seu evento 'Neon Genesis'", type: "rsvp", time: "Há 10 min", eventId: "neon-genesis" },
    { id: 2, text: "Julia Mendes enviou uma cota de R$ 100 para a vaquinha", type: "payment", time: "Há 30 min", eventId: "neon-genesis" },
    { id: 3, text: "Ana Flávia adicionou uma nova foto ao Mural de Vibes", type: "photo", time: "Há 2 horas", eventId: "neon-genesis" },
    { id: 4, text: "Sua meta de arrecadação atingiu 83% do objetivo final!", type: "alert", time: "Há 4 horas", eventId: "neon-genesis" }
  ]);

  // Configurações & Assinaturas states
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [prefNotifications, setPrefNotifications] = useState(true);
  const [prefPrivacy, setPrefPrivacy] = useState(true);
  const [prefTheme, setPrefTheme] = useState("dark");
  const [prefLanguage, setPrefLanguage] = useState("pt-BR");

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

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          {/* Notification bell button */}
          <button
            onClick={() => setShowNotifications(true)}
            className="p-2 bg-[#141b2f] border border-indigo-500/10 hover:border-indigo-500/30 rounded-full text-indigo-300 hover:text-white transition relative cursor-pointer"
            title="Notificações"
          >
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.8)] animate-pulse" />
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
          </button>

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
                className="bg-teal-400 text-slate-950 font-bold px-5 py-3 rounded-2xl text-xs transition hover:bg-teal-300 transform active:scale-95 cursor-pointer"
              >
                Gerenciar Pix
              </button>
            </div>

            {/* Configurações & Planos PRO */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="bg-[#141b31]/60 border border-indigo-500/15 p-5 rounded-3xl hover:border-indigo-500/40 hover:bg-[#141b31]/90 transition text-left cursor-pointer flex flex-col gap-3 justify-between"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Configurações</h4>
                  <p className="text-[10px] text-indigo-200/40 mt-0.5">Notificações, Privacidade e Idioma.</p>
                </div>
              </button>

              <button 
                onClick={() => setShowPlanModal(true)}
                className="bg-gradient-to-tr from-[#1f0d2c] to-[#141b31]/50 border border-pink-500/25 p-5 rounded-3xl hover:border-pink-500/50 hover:from-[#2a123b] transition text-left cursor-pointer flex flex-col gap-3 justify-between"
              >
                <div className="w-9 h-9 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider font-mono flex items-center gap-1.5">
                    Assinatura 
                    {isPro && <span className="text-[8px] bg-pink-500 text-white px-1.5 py-0.5 rounded font-mono font-black">PRO</span>}
                  </h4>
                  <p className="text-[10px] text-indigo-200/40 mt-0.5">{isPro ? "Gerenciar benefícios PRO ativos." : "Conhecer planos Solstice PRO."}</p>
                </div>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* CENTRAL DE NOTIFICAÇÕES (SLIDE-OVER PANEL) */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity" onClick={() => setShowNotifications(false)} />
          
          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-[#0c1228] border-l border-indigo-500/20 shadow-2xl flex flex-col">
              <div className="p-6 border-b border-indigo-500/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                  <h3 className="text-lg font-bold">Central de Notificações</h3>
                </div>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-white text-xs font-mono border border-slate-800 rounded-lg px-2.5 py-1 cursor-pointer">Fechar</button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id} 
                    onClick={() => {
                      setSelectedEventId(notif.eventId);
                      setShowNotifications(false);
                    }}
                    className="p-4 bg-[#141b31]/60 border border-indigo-500/10 hover:border-indigo-500/30 rounded-2xl transition duration-200 cursor-pointer flex gap-3 items-start"
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      {notif.type === "rsvp" ? "🎉" : notif.type === "payment" ? "💸" : notif.type === "photo" ? "📸" : "🔔"}
                    </div>
                    <div className="flex-1 text-left space-y-1">
                      <p className="text-xs text-slate-200 font-medium leading-relaxed">{notif.text}</p>
                      <span className="text-[10px] text-slate-500 font-mono block">{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS MODAL VIEW */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#141b31] border border-indigo-500/20 w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center border-b border-indigo-500/10 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Configurações Gerais
              </h3>
              <button onClick={() => setShowSettingsModal(false)} className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer">Fechar</button>
            </div>

            <div className="space-y-4">
              {/* Notif checkbox */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="text-left">
                  <span className="text-xs font-bold block">Notificações Push / WhatsApp</span>
                  <span className="text-[9px] text-slate-500 block">Receba avisos instantâneos de novos convidados e pagamentos.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefNotifications} 
                  onChange={(e) => setPrefNotifications(e.target.checked)} 
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Privacy checkbox */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                <div className="text-left">
                  <span className="text-xs font-bold block">Perfil Público na Rede</span>
                  <span className="text-[9px] text-slate-500 block">Permita que amigos encontrem seu perfil ao criar convites.</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={prefPrivacy} 
                  onChange={(e) => setPrefPrivacy(e.target.checked)} 
                  className="w-4 h-4 accent-indigo-500 cursor-pointer"
                />
              </div>

              {/* Theme Selector */}
              <div>
                <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-2 text-left">Tema Visual</label>
                <div className="grid grid-cols-3 gap-2">
                  {["dark", "neon", "glass"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setPrefTheme(t)}
                      className={`py-2 text-xs font-mono capitalize border rounded-xl cursor-pointer ${
                        prefTheme === t 
                          ? "bg-indigo-500 border-transparent text-white font-bold" 
                          : "bg-slate-950/40 border-slate-800 text-slate-400 hover:text-white"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <label className="block text-[10px] font-mono text-indigo-300 uppercase mb-2 text-left">Idioma</label>
                <select
                  value={prefLanguage}
                  onChange={(e) => setPrefLanguage(e.target.value)}
                  className="w-full bg-slate-950/40 border border-indigo-500/15 focus:border-indigo-400 p-3 rounded-xl outline-none text-xs text-indigo-200"
                >
                  <option value="pt-BR">Português (Brasil)</option>
                  <option value="en-US">English (United States)</option>
                  <option value="es-ES">Español (España)</option>
                </select>
              </div>
            </div>

            <button 
              onClick={() => {
                setShowSettingsModal(false);
                alert("Preferências gravadas com sucesso!");
              }} 
              className="w-full py-3 bg-gradient-to-r from-indigo-500 to-pink-500 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer"
            >
              Salvar Configurações
            </button>
          </div>
        </div>
      )}

      {/* PLAN & SUBSCRIPTION MODAL VIEW */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-[#141b31] border border-indigo-500/20 w-full max-w-md rounded-3xl p-6 shadow-2xl relative space-y-6">
            <div className="flex justify-between items-center border-b border-indigo-500/10 pb-4">
              <h3 className="text-lg font-bold flex items-center gap-2">
                <svg className="w-5 h-5 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg>
                Planos & Assinatura
              </h3>
              <button onClick={() => setShowPlanModal(false)} className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer">Fechar</button>
            </div>

            <div className="space-y-4">
              {/* Current plan banner */}
              <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-2xl text-left">
                <span className="text-[9px] font-mono text-indigo-400 uppercase tracking-widest block">PLANO ATUAL</span>
                <div className="flex justify-between items-center mt-1">
                  <h4 className="text-md font-bold text-white">{isPro ? "Solstice Pro Lite" : "Solstice Free"}</h4>
                  <span className="text-xs font-mono text-indigo-300 font-semibold">{isPro ? "R$ 49,90 /mês" : "Gratuito"}</span>
                </div>
              </div>

              {/* Comparative list of features */}
              <div className="space-y-3">
                <span className="block text-[10px] font-mono text-slate-400 uppercase text-left">Benefícios do Upgrade</span>
                <div className="space-y-2 text-left text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Check-in Digital & Portaria Pro:</strong> Scanner de QR Code e relatórios.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Álbum Ilimitado:</strong> Upload de fotos sem limites de resolução ou tamanho.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Vaquinha Sem Taxas:</strong> Receba cotas integralmente no Pix direto para sua chave.</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-400">✓</span>
                    <span><strong>Domínio e Templates Exclusivos:</strong> Layouts VIP com links customizados.</span>
                  </div>
                </div>
              </div>

              {/* Upgrade Trigger or Downgrade */}
              <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl space-y-3">
                {isPro ? (
                  <div className="space-y-3 text-left">
                    <p className="text-xs text-slate-300">Sua assinatura está ativa. Próxima renovação em 09/07/2026.</p>
                    <button 
                      onClick={() => {
                        setIsPro(false);
                        alert("Assinatura cancelada com sucesso!");
                      }} 
                      className="w-full py-2.5 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                    >
                      Cancelar Assinatura PRO
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 text-left">
                    <div className="text-left">
                      <span className="text-[10px] font-mono text-pink-400 uppercase block">OFERTA ESPECIAL</span>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">Assine o **Solstice Pro** por apenas **R$ 29,90/mês** no plano anual e tenha portaria ilimitada.</p>
                    </div>
                    <button 
                      onClick={() => {
                        setIsPro(true);
                        alert("Parabéns! Assinatura Solstice PRO ativada via Pix Simulado!");
                      }} 
                      className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] text-white rounded-xl text-xs font-bold transition duration-200 cursor-pointer"
                    >
                      Fazer Upgrade para PRO ⚡
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* FLOAT BOTTOM GLASS NAVBAR */}
      <BottomNav activeTab={activeTab} onTabChange={(tab) => {
        setSelectedEventId(null);
        setActiveTab(tab);
      }} />
    </div>
  );
}
