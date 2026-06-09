import React, { useState } from "react";
import { SolsticeEvent, VibePhoto } from "../types";
import { 
  Menu, Sparkles, Filter, Plus, LayoutGrid, UploadCloud, Flame, Settings, 
  ArrowLeft, Heart, X, Image as ImageIcon, MessageSquare
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface EventGalleryProps {
  event: SolsticeEvent;
  currentUser: { name: string; avatar: string; nickname: string };
  onBack: () => void;
  onLikePhoto: (photoId: string) => void;
  onAddPhoto: (url: string) => Promise<void>;
}

export default function EventGallery({ 
  event, 
  currentUser, 
  onBack, 
  onLikePhoto, 
  onAddPhoto 
}: EventGalleryProps) {
  const [activeTab, setActiveTab] = useState<"gallery" | "upload" | "stories" | "settings">("gallery");
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [filterMode, setFilterMode] = useState<"recent" | "likes">("recent");

  // Fotos pré-definidas premium de alta estética neon para sugestão rápida
  const PRESET_PHOTOS = [
    "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1541388224302-d549cc83612f?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1506157786151-b8491531f063?w=600&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1518495973542-4542c06a5843?w=600&auto=format&fit=crop&q=80",
  ];

  // Ordenação de fotos do feed
  const sortedPhotos = [...(event.vibeWall || [])].sort((a, b) => {
    if (filterMode === "likes") {
      return (b.likes || 0) - (a.likes || 0);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  // Foto destaque da noite (Momentos Épicos) - a mais curtida ou a primeira do array
  const epicPhoto = (event.vibeWall || []).reduce((max, photo) => 
    (photo.likes || 0) > (max.likes || 0) ? photo : max, 
    (event.vibeWall || [])[0]
  );

  const handleAddPhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let urlToSubmit = newPhotoUrl.trim();
    
    // Se o usuário não colar um link, sorteia uma foto estética neon aleatória dos presets
    if (!urlToSubmit) {
      const randomIndex = Math.floor(Math.random() * PRESET_PHOTOS.length);
      urlToSubmit = PRESET_PHOTOS[randomIndex];
    }

    await onAddPhoto(urlToSubmit);
    setNewPhotoUrl("");
    setShowUploadModal(false);
  };

  return (
    <div className="min-h-screen bg-[#0b1226] text-white pb-24 font-sans select-none relative overflow-x-hidden">
      {/* Background radial blurs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-pink-500/5 blur-[120px] pointer-events-none" />

      {/* HEADER: Event Memories */}
      <header className="sticky top-0 bg-[#0b1226]/85 backdrop-blur-md z-30 border-b border-indigo-500/10 py-4 px-6 flex items-center justify-between">
        <button onClick={onBack} className="text-indigo-300 hover:text-white transition p-1">
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm font-semibold tracking-wide text-indigo-100 uppercase font-mono">
          Event Memories
        </h2>
        <div className="flex items-center gap-2">
          <img 
            src={currentUser.avatar} 
            alt="Profile" 
            className="w-7 h-7 rounded-full object-cover border border-white/20"
          />
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="max-w-md mx-auto px-5 pt-6 space-y-6">
        
        {/* MOMENTOS ÉPICOS SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold tracking-tight text-white">
              Momentos Épicos
            </h3>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-[9px] font-bold font-mono tracking-widest text-indigo-300 uppercase shadow-md">
              <Sparkles className="w-3 h-3 text-indigo-400" /> AI CURATED
            </span>
          </div>

          {/* Epic Card Destaque */}
          {epicPhoto ? (
            <div className="relative rounded-[32px] overflow-hidden border border-white/5 shadow-2xl h-[380px] group">
              <img 
                src={epicPhoto.url} 
                alt="Epic Moment" 
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              {/* Radial gradient background to overlay text */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
              
              {/* Top Banner overlay */}
              <div className="absolute top-4 left-6 right-6">
                <span className="text-[10px] font-mono tracking-[0.2em] text-white/50 block font-semibold">
                  {event.name.toUpperCase()}
                </span>
                <span className="text-[9px] font-mono text-pink-400 font-bold tracking-widest">
                  IMMERSIVE EVENT
                </span>
              </div>

              {/* Bottom Card text & interactive badges */}
              <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                <div className="space-y-1 text-left">
                  <span className="inline-block px-3 py-1 rounded-full bg-[#1b253b]/80 border border-white/5 text-[9px] font-bold font-mono text-indigo-300 tracking-wider">
                    DESTAQUE DA NOITE
                  </span>
                  <h4 className="text-xl font-extrabold text-white leading-tight">
                    A energia do Solstice
                  </h4>
                </div>

                {/* Social guest bubbles */}
                <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full pl-2 pr-3.5 py-1.5 border border-white/5">
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=50" className="inline-block h-5 w-5 rounded-full ring-1 ring-black object-cover" />
                    <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=50" className="inline-block h-5 w-5 rounded-full ring-1 ring-black object-cover" />
                  </div>
                  <span className="text-[9px] font-mono text-white/70 ml-1.5 font-semibold">
                    +{epicPhoto.likes || 14}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-[#141b2f]/40 border border-indigo-500/10 rounded-[32px] py-16 text-center text-xs text-indigo-200/40 font-mono">
              Fotos enviadas aparecerão em destaque aqui.
            </div>
          )}
        </div>

        {/* FEED DA GALERIA SECTION */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="text-left">
              <h3 className="text-lg font-bold tracking-tight text-white">
                Feed da Galeria
              </h3>
              <span className="text-[11px] text-indigo-200/40 block">
                Atualizado recentemente
              </span>
            </div>

            <button 
              onClick={() => setFilterMode(filterMode === "recent" ? "likes" : "recent")}
              className={`p-2.5 rounded-full border transition-all duration-300 ${
                filterMode === "likes" 
                  ? "bg-indigo-500 border-indigo-400 text-white" 
                  : "bg-[#141b2f] border-indigo-500/15 text-indigo-300 hover:text-white"
              }`}
              title="Filtrar fotos"
            >
              <Filter className="w-4 h-4" />
            </button>
          </div>

          {/* Assymmetric Pinterest-Style Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Coluna 1 */}
            <div className="flex flex-col gap-4">
              {sortedPhotos.filter((_, idx) => idx % 2 === 0).map((photo) => (
                <div 
                  key={photo.id} 
                  className="relative rounded-[24px] overflow-hidden border border-white/5 bg-[#141b2f]/40 group flex flex-col"
                >
                  <img 
                    src={photo.url} 
                    alt="Vibe Check" 
                    className="w-full object-cover rounded-[24px] transition-transform duration-500 group-hover:scale-102"
                    style={{ minHeight: "160px", maxHeight: "300px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Photo details on hover */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] font-mono text-white/80 tracking-tight">
                      @{photo.authorName.split(" ")[0]}
                    </span>
                    <button 
                      onClick={() => onLikePhoto(photo.id)}
                      className="bg-black/55 hover:bg-black/85 text-pink-400 border border-white/5 rounded-full p-1.5 transition flex items-center gap-0.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                      <span className="text-[8px] font-mono text-white font-bold">{photo.likes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Coluna 2 */}
            <div className="flex flex-col gap-4 pt-6">
              {sortedPhotos.filter((_, idx) => idx % 2 !== 0).map((photo) => (
                <div 
                  key={photo.id} 
                  className="relative rounded-[24px] overflow-hidden border border-white/5 bg-[#141b2f]/40 group flex flex-col"
                >
                  <img 
                    src={photo.url} 
                    alt="Vibe Check" 
                    className="w-full object-cover rounded-[24px] transition-transform duration-500 group-hover:scale-102"
                    style={{ minHeight: "120px", maxHeight: "280px" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Photo details on hover */}
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-[9px] font-mono text-white/80 tracking-tight">
                      @{photo.authorName.split(" ")[0]}
                    </span>
                    <button 
                      onClick={() => onLikePhoto(photo.id)}
                      className="bg-black/55 hover:bg-black/85 text-pink-400 border border-white/5 rounded-full p-1.5 transition flex items-center gap-0.5"
                    >
                      <Heart className="w-3.5 h-3.5 fill-pink-500 text-pink-500" />
                      <span className="text-[8px] font-mono text-white font-bold">{photo.likes || 0}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {sortedPhotos.length === 0 && (
            <div className="text-center py-20 bg-[#141b2f]/30 border border-indigo-500/5 rounded-3xl p-6">
              <ImageIcon className="w-8 h-8 text-indigo-400/40 mx-auto mb-3" />
              <h4 className="text-sm font-semibold">Nenhuma foto no feed</h4>
              <p className="text-[11px] text-indigo-200/30 max-w-xs mx-auto mt-1">
                Seja o primeiro a carregar um registro marcante e compartilhe a energia com o grupo!
              </p>
            </div>
          )}
        </div>
      </main>

      {/* FLOATING ACTION UPLOAD BUTTON */}
      <button 
        onClick={() => setShowUploadModal(true)}
        className="fixed bottom-24 right-6 bg-[#9faefd] text-[#0b1226] hover:bg-[#b5c2ff] rounded-full p-4.5 shadow-2xl transition duration-300 hover:scale-105 active:scale-95 z-40 border border-[#b5c2ff]/30 shadow-indigo-950/50 cursor-pointer"
        title="Enviar foto para a galeria"
      >
        <Plus className="w-6 h-6 stroke-[3]" />
      </button>

      {/* FLOAT BOTTOM GLASS NAVBAR (Gallery, Upload, Stories, Settings) */}
      <div className="fixed bottom-5 left-0 right-0 z-40 flex justify-center px-4 pointer-events-none">
        <nav className="bg-[#12192d]/80 border border-indigo-500/15 backdrop-blur-xl px-6 py-2.5 rounded-full flex justify-between items-center gap-8 shadow-2xl pointer-events-auto max-w-[340px] w-full">
          <button 
            onClick={() => setActiveTab("gallery")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "gallery" ? "text-indigo-400" : "text-indigo-300/45 hover:text-indigo-300/70"
            }`}
          >
            <LayoutGrid className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono">Gallery</span>
          </button>

          <button 
            onClick={() => setShowUploadModal(true)}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "upload" ? "text-indigo-400" : "text-indigo-300/45 hover:text-indigo-300/70"
            }`}
          >
            <UploadCloud className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono">Upload</span>
          </button>

          <button 
            onClick={() => alert("Histórias coletivas sendo geradas pela IA...")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "stories" ? "text-indigo-400" : "text-indigo-300/45 hover:text-indigo-300/70"
            }`}
          >
            <Flame className="w-5 h-5 animate-pulse text-pink-500" />
            <span className="text-[9px] font-bold font-mono">Stories</span>
          </button>

          <button 
            onClick={() => alert("Configurações da galeria de fotos")}
            className={`flex flex-col items-center gap-1 transition ${
              activeTab === "settings" ? "text-indigo-400" : "text-indigo-300/45 hover:text-indigo-300/70"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[9px] font-bold font-mono">Settings</span>
          </button>
        </nav>
      </div>

      {/* MODAL PARA UPLOAD DE FOTOS */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#141b2f] border border-indigo-500/10 rounded-[32px] p-6 max-w-sm w-full space-y-4 shadow-2xl relative"
            >
              <button 
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 text-indigo-300/50 hover:text-white transition p-1"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-center space-y-1">
                <h4 className="text-lg font-bold text-white">Compartilhar Foto</h4>
                <p className="text-xs text-indigo-200/50">
                  Insira o link da foto para atualizar o mural do rolê.
                </p>
              </div>

              <form onSubmit={handleAddPhotoSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono tracking-wider uppercase text-indigo-300/60 mb-1.5 ml-1">
                    Link da Imagem
                  </label>
                  <input
                    type="url"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Cole um link de imagem do Unsplash ou web"
                    className="w-full bg-[#0b101f] border border-indigo-500/10 focus:border-indigo-400/50 p-3 rounded-2xl outline-none text-xs text-white placeholder-slate-600 transition"
                  />
                  <span className="text-[9px] text-indigo-200/20 mt-1 block ml-1">
                    *Deixe em branco para sortear um clique neon automático da IA.
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-full text-xs font-bold transition duration-300 bg-[#9faefd] text-[#0b1226] hover:bg-[#b5c2ff] flex items-center justify-center gap-1.5"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Publicar no Mural</span>
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
