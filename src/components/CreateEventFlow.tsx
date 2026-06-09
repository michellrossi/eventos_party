import React, { useState } from "react";
import { TEMPLATES, getTemplateStyle } from "./TemplateThemes";
import { 
  Sparkles, Shield, Palette, CheckCircle, 
  MapPin, Calendar, FileText, ArrowRight, ArrowLeft, 
  DollarSign, Users, Sliders, CheckSquare, Eye, Copy, Share2
} from "lucide-react";
import { SolsticeEvent } from "../types";

interface CreateEventFlowProps {
  onEventCreated: (newEvent: Partial<SolsticeEvent>) => void;
  onCancel: () => void;
  currentUser: { name: string; avatar: string; nickname: string };
}

type StepType = "basics" | "configs" | "design" | "publish";

export default function CreateEventFlow({ onEventCreated, onCancel, currentUser }: CreateEventFlowProps) {
  const [activeStep, setActiveStep] = useState<StepType>("basics");
  
  // Event State details
  const [name, setName] = useState("");
  const [type, setType] = useState("outros");
  const [dateTime, setDateTime] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [allowPlusOne, setAllowPlusOne] = useState(true);
  const [peopleLimit, setPeopleLimit] = useState("");
  const [rsvpDeadline, setRsvpDeadline] = useState("");
  
  // Vaquinha State details
  const [vaquinhaEnabled, setVaquinhaEnabled] = useState(false);
  const [vaquinhaGoal, setVaquinhaGoal] = useState("");
  const [vaquinhaValuePerPerson, setVaquinhaValuePerPerson] = useState("");

  // Styling Details
  const [selectedTemplate, setSelectedTemplate] = useState("neon-tokyo");
  const [dressingCode, setDressingCode] = useState("Cyber Chic");

  // AI loading indicator
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

  // Publish / Share trigger
  const [showShareModal, setShowShareModal] = useState(false);
  const [createdEventId, setCreatedEventId] = useState("");

  // Trigger Gemini Copilot API to suggest details based on Name & Type
  const handleAISuggest = async () => {
    if (!name.trim()) {
      setAiError("Diga-nos o título do evento primeiro para darmos a sugestão!");
      return;
    }
    setAiLoading(true);
    setAiError("");
    try {
      const res = await fetch("/api/ai/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name, type })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.description) setDescription(data.description);
        if (data.dressingCode) setDressingCode(data.dressingCode);
      } else {
        setAiError(data.error || "IA temporariamente saturada. Tente digitar manualmente.");
      }
    } catch (e) {
      setAiError("Erro de comunicação com o copiloto de IA.");
    } finally {
      setAiLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!name.trim()) {
      alert("Por favor insira um nome para o evento.");
      return;
    }

    const compiledEvent: Partial<SolsticeEvent> = {
      name,
      type,
      dateTime,
      location,
      description,
      isPublic,
      requiresApproval,
      allowPlusOne,
      peopleLimit: peopleLimit ? Number(peopleLimit) : null,
      rsvpDeadline: rsvpDeadline || null,
      vaquinhaEnabled,
      vaquinhaGoal: vaquinhaGoal ? Number(vaquinhaGoal) : null,
      vaquinhaValuePerPerson: vaquinhaValuePerPerson ? Number(vaquinhaValuePerPerson) : null,
      selectedTemplate,
      dressingCode,
      backgroundColor: selectedTemplate === "neon-tokyo" ? "#0b1324" :
                       selectedTemplate === "ethereal" ? "#252321" :
                       selectedTemplate === "synthwave" ? "#180a2b" :
                       selectedTemplate === "liquid-glass" ? "#022a30" : 
                       selectedTemplate === "obsidian" ? "#050505" : "#1c0d12",
      fontFamily: selectedTemplate === "ethereal" ? "serif" :
                  selectedTemplate === "obsidian" || selectedTemplate === "neural" ? "mono" : "Outfit"
    };

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(compiledEvent)
      });
      const result = await res.json();
      if (res.ok) {
        setCreatedEventId(result.id);
        setShowShareModal(true);
        // Retain the actual event details back up to main app
        onEventCreated(result);
      } else {
        alert(result.error || "Erro ao salvar evento.");
      }
    } catch (err) {
      alert("Falha na gravação remota no servidor.");
    }
  };

  const handleCopyLink = () => {
    const shareUrl = `${window.location.origin}/invite/${createdEventId}`;
    navigator.clipboard.writeText(shareUrl);
    alert("Link copiado para a área de transferência! Prontinho para enviar!");
  };

  const currentTheme = getTemplateStyle(selectedTemplate);

  return (
    <div className="min-h-screen bg-[#0b1226] text-white pb-32 pt-6 px-4 md:px-8 select-none font-sans relative">
      <div className="absolute top-[-50px] right-[-50px] w-64 h-64 rounded-full bg-pink-500/5 blur-[80px]" />
      
      <div className="max-w-2xl mx-auto">
        {/* Header navigation breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <button 
            onClick={onCancel}
            className="text-xs text-indigo-300 hover:text-white flex items-center gap-1.5 font-mono"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Voltar ao Painel
          </button>
          <div className="text-right">
            <span className="text-[10px] font-mono tracking-widest text-indigo-400 block uppercase">Criação Celeste</span>
            <span className="text-sm font-semibold block">{name || "Novo Evento"}</span>
          </div>
        </div>

        {/* Tab switcher headers */}
        <div className="grid grid-cols-4 gap-2 mb-8 bg-[#141b31]/40 border border-indigo-500/10 p-2 rounded-2xl">
          <button
            onClick={() => setActiveStep("basics")}
            className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition ${
              activeStep === "basics" ? "bg-indigo-500 text-white" : "text-indigo-200/40 hover:text-indigo-200/60"
            }`}
          >
            <FileText className="w-4.5 h-4.5" />
            <span className="text-[9px] font-mono tracking-tight hidden sm:inline">Info Básicas</span>
          </button>

          <button
            onClick={() => setActiveStep("configs")}
            className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition ${
              activeStep === "configs" ? "bg-indigo-500 text-white" : "text-indigo-200/40 hover:text-indigo-200/60"
            }`}
          >
            <Shield className="w-4.5 h-4.5" />
            <span className="text-[9px] font-mono tracking-tight hidden sm:inline">Configurações</span>
          </button>

          <button
            onClick={() => setActiveStep("design")}
            className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition ${
              activeStep === "design" ? "bg-indigo-500 text-white" : "text-indigo-200/40 hover:text-indigo-200/60"
            }`}
          >
            <Palette className="w-4.5 h-4.5" />
            <span className="text-[9px] font-mono tracking-tight hidden sm:inline">Escolha Template</span>
          </button>

          <button
            onClick={() => setActiveStep("publish")}
            className={`py-3 rounded-xl flex flex-col items-center justify-center gap-1.5 transition ${
              activeStep === "publish" ? "bg-indigo-500 text-white" : "text-indigo-200/40 hover:text-indigo-200/60"
            }`}
          >
            <Eye className="w-4.5 h-4.5" />
            <span className="text-[9px] font-mono tracking-tight hidden sm:inline">Preview Final</span>
          </button>
        </div>

        {/* STEP 1: BASICS */}
        {activeStep === "basics" && (
          <div className="bg-[#141b2f]/60 backdrop-blur-md rounded-3xl p-6 border border-indigo-500/15 space-y-5 shadow-2xl animate-fadeIn">
            <div className="flex justify-between items-start border-b border-indigo-500/10 pb-4">
              <div>
                <h3 className="text-xl font-bold flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-400" /> Detalhes da Celebração</h3>
                <p className="text-xs text-indigo-200/50">Insira a identificação e premissas principais da celebração.</p>
              </div>
              <button
                type="button"
                onClick={handleAISuggest}
                disabled={aiLoading}
                className="bg-indigo-500/15 hover:bg-indigo-500/30 text-indigo-400 border border-indigo-500/30 px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition duration-200 disabled:opacity-40"
              >
                <Sparkles className="w-3.5 h-3.5 text-pink-400 fill-pink-400 animate-pulse" />
                {aiLoading ? "Copiloto Pensando..." : "Sugerir com Gemini IA"}
              </button>
            </div>

            {aiError && (
              <div className="text-xs text-rose-400 bg-rose-500/5 border border-rose-500/20 p-2.5 rounded-xl">
                {aiError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">Nome do Evento</label>
                <input
                  id="event-name-input"
                  type="text"
                  placeholder="Ex: Neon Pulse Party, Aniversário do Enzo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950/40 border border-indigo-500/15 focus:border-indigo-400 p-4 rounded-2xl outline-none font-sans text-sm text-white placeholder-indigo-200/20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">Tipo</label>
                  <select
                    id="event-type-select"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-indigo-500/15 focus:border-indigo-400 p-4 rounded-2xl outline-none text-sm text-indigo-200"
                  >
                    <option value="aniversario">Aniversário 🎂</option>
                    <option value="casamento">Casamento 💍</option>
                    <option value="churrasco">Churrasco 🥩</option>
                    <option value="formatura">Formatura 🎓</option>
                    <option value="outros">Outros 🔮</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">Data & Horário</label>
                  <input
                    id="event-date-input"
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-indigo-500/15 focus:border-indigo-400 p-4 rounded-2xl outline-none font-mono text-sm text-indigo-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">Localização</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-400">
                    <MapPin className="w-4 h-4" />
                  </span>
                  <input
                    id="event-location-input"
                    type="text"
                    placeholder="Ex: Galpão Techno Bloco 7, Casa do Sol, Rooftop..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-slate-950/40 border border-indigo-500/15 focus:border-indigo-400 p-4 pl-12 rounded-2xl outline-none font-sans text-sm text-white placeholder-indigo-200/20 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">Descrição do Convite</label>
                <textarea
                  id="event-description-input"
                  rows={4}
                  placeholder="A arte de celebrar começa no convite. Descreva os ritmos, vibe, DJs ou o segredo do rolê..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950/40 border border-indigo-500/15 focus:border-indigo-400 p-4 rounded-2xl outline-none font-sans text-sm text-white placeholder-indigo-200/20 transition-all resize-none leading-relaxed"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">Dress Code sugerido</label>
                <input
                  id="event-dress-input"
                  type="text"
                  placeholder="Ex: Cyber Chic, Neon, Total Black, Esporte Fino..."
                  value={dressingCode}
                  onChange={(e) => setDressingCode(e.target.value)}
                  className="w-full bg-slate-950/40 border border-indigo-500/15 focus:border-indigo-400 p-4 rounded-2xl outline-none font-sans text-sm text-white placeholder-indigo-200/20 transition-all"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-500/10 flex justify-end">
              <button
                id="btn-basics-next"
                onClick={() => setActiveStep("configs")}
                className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl px-6 py-3.5 text-xs font-semibold flex items-center gap-1.5 transition duration-200"
              >
                Próximas Configurações <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CONFIGS */}
        {activeStep === "configs" && (
          <div className="bg-[#141b2f]/60 backdrop-blur-md rounded-3xl p-6 border border-indigo-500/15 space-y-6 shadow-2xl animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-indigo-400" /> Parâmetros & Moeda</h3>
              <p className="text-xs text-indigo-200/50">Determine permissões particulares e habilitamento de fundos.</p>
            </div>

            <div className="space-y-4">
              {/* Toggle Switches */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <div>
                    <span className="font-semibold text-sm block">Evento Público</span>
                    <span className="text-[11px] text-indigo-200/40 block">Qualquer portador do link pode visualizar e RSVPear.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <div>
                    <span className="font-semibold text-sm block">Requer Aprovação de Convite</span>
                    <span className="text-[11px] text-indigo-200/40 block">Você precisará autorizar as confirmações no seu Dashboard.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={requiresApproval}
                    onChange={(e) => setRequiresApproval(e.target.checked)}
                    className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                  <div>
                    <span className="font-semibold text-sm block">Permitir +1 (Acompanhante)</span>
                    <span className="text-[11px] text-indigo-200/40 block">O convidado pode trazer acompanhante preenchendo no card.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={allowPlusOne}
                    onChange={(e) => setAllowPlusOne(e.target.checked)}
                    className="w-5 h-5 accent-indigo-500 cursor-pointer"
                  />
                </div>
              </div>

              {/* Numerical limits */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">Limite Máximo (Pessoas)</label>
                  <input
                    type="number"
                    placeholder="Ex: 150 (opcional)"
                    value={peopleLimit}
                    onChange={(e) => setPeopleLimit(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-indigo-500/15 focus:border-indigo-400 p-4 rounded-2xl outline-none font-mono text-sm text-indigo-200"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-2">Data Limite RSVP</label>
                  <input
                    type="date"
                    value={rsvpDeadline}
                    onChange={(e) => setRsvpDeadline(e.target.value)}
                    className="w-full bg-[#0a0f1d] border border-indigo-500/15 focus:border-indigo-400 p-4 rounded-2xl outline-none font-mono text-sm text-indigo-200"
                  />
                </div>
              </div>

              {/* Honeymoon Fund / Vaquinha Config */}
              <div className="pt-6 border-t border-indigo-500/10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="font-bold text-sm block flex items-center gap-1.5"><DollarSign className="w-4 h-4 text-emerald-400" /> Vaquinha / Fundo de Presente</span>
                    <span className="text-[11px] text-indigo-200/50 block">Arrecade contribuições Pix diretamente no convite.</span>
                  </div>
                  <input
                    id="checkbox-fund-enabled"
                    type="checkbox"
                    checked={vaquinhaEnabled}
                    onChange={(e) => setVaquinhaEnabled(e.target.checked)}
                    className="w-5 h-5 accent-emerald-500 cursor-pointer"
                  />
                </div>

                {vaquinhaEnabled && (
                  <div className="grid grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/40 border border-emerald-500/20 animate-fadeIn">
                    <div>
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1.5">Meta Total (R$)</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-indigo-200/40 font-mono">R$</span>
                        <input
                          id="fund-goal-input"
                          type="number"
                          placeholder="Ex: 5000"
                          value={vaquinhaGoal}
                          onChange={(e) => setVaquinhaGoal(e.target.value)}
                          className="w-full bg-[#0a0f1d] border border-indigo-500/15 focus:border-emerald-400 p-3 pl-8 rounded-xl outline-none text-xs font-mono text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <span className="block text-[10px] font-mono uppercase tracking-wider text-emerald-400 mb-1.5">Cota Recomendada (R$)</span>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-indigo-200/40 font-mono">R$</span>
                        <input
                          id="fund-quote-input"
                          type="number"
                          placeholder="Ex: 100"
                          value={vaquinhaValuePerPerson}
                          onChange={(e) => setVaquinhaValuePerPerson(e.target.value)}
                          className="w-full bg-[#0a0f1d] border border-indigo-500/15 focus:border-emerald-400 p-3 pl-8 rounded-xl outline-none text-xs font-mono text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-indigo-500/10 flex justify-between">
              <button
                onClick={() => setActiveStep("basics")}
                className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Passo Anterior
              </button>
              <button
                id="btn-configs-next"
                onClick={() => setActiveStep("design")}
                className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl px-6 py-3.5 text-xs font-semibold flex items-center gap-1.5 transition duration-200"
              >
                Prosseguir para Estilo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: DESIGN/TEMPLATES */}
        {activeStep === "design" && (
          <div className="bg-[#141b2f]/60 backdrop-blur-md rounded-3xl p-6 border border-indigo-500/15 space-y-6 shadow-2xl animate-fadeIn">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-2"><Palette className="w-5 h-5 text-indigo-400" /> Estética do Convite</h3>
              <p className="text-xs text-indigo-200/50">Selecione o tema imersivo e os grids de acabamento que envelopam as informações.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {TEMPLATES.map((tpl) => (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl.id)}
                  className={`p-4 rounded-2xl border text-left transition duration-300 ${
                    selectedTemplate === tpl.id 
                      ? "border-pink-500 bg-indigo-500/10 shadow-lg shadow-pink-950/20" 
                      : "border-indigo-500/10 bg-[#0a0f1d]/50 hover:bg-[#0a0f1d]"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="font-bold text-sm text-white">{tpl.name}</span>
                    {selectedTemplate === tpl.id && (
                      <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
                    )}
                  </div>
                  <p className="text-[11px] text-indigo-200/50 line-clamp-2 leading-relaxed">
                    {tpl.description}
                  </p>
                  
                  {/* Styling indicator pill snippet */}
                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-[9px] font-mono uppercase bg-slate-950/50 border border-indigo-500/10 px-2 py-0.5 rounded text-indigo-300">
                      {tpl.fontClass === "font-serif" ? "Serif" : tpl.fontClass === "font-mono" ? "Mono" : "Sans"}
                    </span>
                    <span className="text-[9px] font-mono uppercase bg-slate-950/50 border border-indigo-500/10 px-2 py-0.5 rounded text-pink-300">
                      Glow Check
                    </span>
                  </div>
                </button>
              ))}
            </div>

            <div className="pt-4 border-t border-indigo-500/10 flex justify-between">
              <button
                onClick={() => setActiveStep("configs")}
                className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Passo Anterior
              </button>
              <button
                id="btn-design-next"
                onClick={() => setActiveStep("publish")}
                className="bg-indigo-500 hover:bg-indigo-400 text-white rounded-2xl px-6 py-3.5 text-xs font-semibold flex items-center gap-1.5 transition duration-200"
              >
                Visualizar Preview <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: FINAL PREVIEW & PUBLISH */}
        {activeStep === "publish" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-[#141b2f]/60 border border-indigo-500/15 rounded-3xl p-6">
              <div className="mb-4">
                <span className="text-[10px] font-mono text-indigo-300 uppercase block tracking-wider">Amostra do Look-and-Feel final</span>
                <h4 className="text-sm font-bold text-indigo-200">Como seus convidados viverão este portal de eventos</h4>
              </div>

              {/* Physical Preview Mock Box */}
              <div className={`p-6 rounded-2xl ${currentTheme.background} ${currentTheme.fontClass} border shadow-2xl relative overflow-hidden transition-all duration-300`}>
                <div className="absolute top-[-100px] left-[-50px] w-56 h-56 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                
                {/* Simulated Header cover */}
                <div className="border-b border-white/10 pb-4 mb-4">
                  <span className="text-[9px] font-mono tracking-widest text-[#f59e0b] block uppercase">SOLSTICE PORTAL PRESENTS</span>
                  <h2 className={`text-2xl font-extrabold tracking-tight ${currentTheme.text} uppercase mt-1`}>
                    {name || "SOLSTICE PARTY TITLE"}
                  </h2>
                </div>

                <div className="space-y-4">
                  <p className={`text-xs leading-relaxed ${currentTheme.textMuted}`}>
                    {description || "O convite perfeito começa aqui. Selecione este tema para ter vibrações tecnológicas ou clássicas conforme sua comemoração."}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[9px] font-mono text-white/50 block uppercase">DATA & HORA</span>
                      <span className={`text-xs font-bold ${currentTheme.text} font-mono mt-1 block`}>
                        {dateTime ? new Date(dateTime).toLocaleString("pt-BR") : "Data Elegível em breve"}
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                      <span className="text-[9px] font-mono text-white/50 block uppercase">DRESS CODE</span>
                      <span className={`text-xs font-bold ${currentTheme.text} mt-1 block`}>
                        {dressingCode}
                      </span>
                    </div>
                  </div>

                  <div className="bg-white/5 border border-white/10 p-3 rounded-xl">
                    <span className="text-[9px] font-mono text-white/50 block uppercase">ENDEREÇO</span>
                    <span className={`text-xs font-semibold ${currentTheme.text} block mt-0.5`}>
                      {location || "Galpão Secreto, São Paulo"}
                    </span>
                  </div>

                  {vaquinhaEnabled && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl">
                      <div className="flex justify-between text-[10px] font-mono text-emerald-400">
                        <span>LUA DE MEL / COTA PRESENTE</span>
                        <span>{vaquinhaValuePerPerson ? `R$ ${vaquinhaValuePerPerson} por cota` : "Livre"}</span>
                      </div>
                      <div className="w-full bg-slate-950/40 h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-emerald-400 to-teal-500 h-full w-[25%]" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center text-[9px] font-mono text-white/40">
                  <span>CURADO POR @{currentUser.nickname}</span>
                  <span>SOLSTICE • EXCELÊNCIA DIGITAL</span>
                </div>
              </div>
            </div>

            {/* Action Bottom */}
            <div className="bg-[#141b2f]/60 border border-indigo-500/15 p-5 rounded-3xl flex justify-between items-center">
              <button
                onClick={() => setActiveStep("design")}
                className="text-xs text-indigo-300 font-semibold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Alterar Arte
              </button>
              
              <button
                id="btn-publish-submit"
                onClick={handlePublish}
                className="px-8 py-4 bg-gradient-to-r from-indigo-500 to-pink-500 hover:opacity-95 text-white rounded-2xl font-bold text-sm tracking-tight shadow-xl shadow-pink-950/30 flex items-center gap-2 transform active:scale-95 transition-all"
              >
                Publicar & Compartilhar <CheckCircle className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}

        {/* COMPILATION SUCCESS DIALOG MODAL */}
        {showShareModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-[#141b31] border border-indigo-500/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-white" />
              </div>

              <h3 className="text-xl font-bold tracking-tight mb-2 text-white">Evento Publicado!</h3>
              <p className="text-xs text-indigo-200/50 mb-6">
                O convite está envelopado na rede Solstice. Prontinho para arrastar o coletivo!
              </p>

              {/* Share link panel */}
              <div className="bg-slate-950/60 border border-indigo-500/15 p-3 rounded-2xl flex items-center justify-between mb-6">
                <span className="text-[11px] font-mono text-indigo-300 truncate text-left mr-2 block">
                  {window.location.origin}/invite/{createdEventId}
                </span>
                <button
                  id="btn-copy-success-link"
                  onClick={handleCopyLink}
                  className="bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30 p-2.5 rounded-xl transition flex-shrink-0"
                  title="Copiar Link"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>

              {/* WhatsApp direct share */}
              <a
                href={`https://api.whatsapp.com/send?text=Confirme sua presenca no meu evento Solstice! %F0%9F%AA%9E ${window.location.origin}/invite/${createdEventId}`}
                target="_blank"
                rel="noreferrer"
                className="w-full bg-[#25d366] text-black font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 mb-3.5 hover:opacity-90 transition"
              >
                <Share2 className="w-4 h-4" /> Enviar por WhatsApp
              </a>

              <button
                onClick={() => {
                  setShowShareModal(false);
                  onCancel(); // exit editor flow and go to feed
                }}
                className="w-full bg-white/5 text-slate-300 hover:bg-white/10 font-bold py-3 rounded-xl text-xs"
              >
                Ir para Meus Eventos
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
