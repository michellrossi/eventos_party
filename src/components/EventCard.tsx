import React from "react";
import { SolsticeEvent } from "../types";
import { Calendar, MapPin, Users, Flame, Eye } from "lucide-react";

interface EventCardProps {
  key?: string;
  event: SolsticeEvent;
  onClick: () => void;
  onManage: () => void;
  currentUserNickname: string;
}

export default function EventCard({ event, onClick, onManage, currentUserNickname }: EventCardProps) {
  // Format Date beautifully
  const formatDateStr = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
      }).replace(/^\w/, (c) => c.toUpperCase());
    } catch (e) {
      return dateString;
    }
  };

  const statusColors = {
    ACTIVE: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    DRAFT: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    ENDED: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
  } as const;

  const statusLabels = {
    ACTIVE: "ATIVO",
    DRAFT: "RASCUNHO",
    ENDED: "ENCERRADO",
  } as const;

  return (
    <div className="group relative bg-[#141b31]/60 border border-indigo-500/15 overflow-hidden rounded-2xl shadow-xl transition-all hover:bg-[#141b31]/80 hover:border-indigo-500/30 flex flex-col h-full">
      {/* Event Cover Banner */}
      <div className="relative h-40 overflow-hidden w-full bg-slate-950">
        <img
          src={event.coverImage || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7"}
          alt={event.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141b31] via-[#141b31]/50 to-transparent" />
        
        {/* Status Tag */}
        <span className={`absolute top-4 right-4 text-[9px] font-mono tracking-widest border px-2.5 py-0.5 rounded-full ${statusColors[event.status]}`}>
          {statusLabels[event.status]}
        </span>
      </div>

      {/* Card Content body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-lg font-bold text-white tracking-tight mb-2 leading-tight">
            {event.name}
          </h4>
          
          <p className="text-xs text-indigo-200/50 line-clamp-2 mb-4 font-sans leading-relaxed">
            {event.description || "Sem descrição definida ainda."}
          </p>

          <div className="space-y-2 mb-4">
            <div className="flex items-center text-xs text-indigo-200/70 gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              <span className="font-mono">{formatDateStr(event.dateTime)}</span>
            </div>
            <div className="flex items-center text-xs text-indigo-200/70 gap-2">
              <MapPin className="w-4 h-4 text-pink-400" />
              <span className="truncate">{event.location}</span>
            </div>
          </div>
        </div>

        <div>
          {/* Guest Pile Count & Vibe Rating */}
          <div className="flex items-center justify-between border-t border-indigo-500/10 pt-4 mb-4">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span className="text-xs font-mono text-indigo-200/70">
                {event.guests?.length || 0} confirmados
              </span>
            </div>
            
            <div className="flex items-center gap-1 text-[10px] font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-lg">
              <Flame className="w-3 h-3 text-pink-500 fill-pink-500" />
              <span>Vibe {event.vibeScore || "0.0"}</span>
            </div>
          </div>

          {/* Action links */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <button
              onClick={onClick}
              className="w-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 text-xs py-2 px-3 rounded-xl border border-indigo-500/20 transition flex items-center justify-center gap-1"
            >
              <Eye className="w-3.5 h-3.5" /> Ver Convite
            </button>
            <button
              onClick={onManage}
              className="w-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-semibold text-xs py-2 px-3 rounded-xl transition shadow-lg shadow-pink-950/25 flex items-center justify-center"
            >
              Vibe Check ⚡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
