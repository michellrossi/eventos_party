import React from "react";
import { Ticket, Compass, PlusCircle, Activity } from "lucide-react";

interface BottomNavProps {
  activeTab: "events" | "explore" | "create" | "vibe";
  onTabChange: (tab: "events" | "explore" | "create" | "vibe") => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
interface NavItem {
    readonly id: "events" | "explore" | "create" | "vibe";
    readonly label: string;
    readonly icon: React.ComponentType<any>;
    readonly highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: "events", label: "Eventos", icon: Ticket },
    { id: "explore", label: "Descobrir", icon: Compass },
    { id: "create", label: "Celeste", icon: PlusCircle, highlight: true },
    { id: "vibe", label: "Vibe Check", icon: Activity },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 px-4 pb-6 pt-2 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none">
      <div className="max-w-md mx-auto bg-[#141b2f]/92 border border-indigo-500/15 backdrop-blur-lg rounded-2xl py-2 px-3 shadow-[0_10px_35px_rgba(0,0,0,0.5)] flex items-center justify-around pointer-events-auto">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                id="tab-btn-create"
                onClick={() => onTabChange(item.id)}
                className="relative -top-4 bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] text-white p-3.5 rounded-full transition duration-300 transform active:scale-90 flex items-center justify-center border-4 border-[#0b1226] shadow-xl"
                title="Criar Novo Evento"
              >
                <IconComponent className="w-5 h-5" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition duration-200 relative ${
                isActive ? "text-indigo-400 font-medium" : "text-indigo-200/40 hover:text-indigo-200/70"
              }`}
            >
              <IconComponent className="w-4.5 h-4.5 mb-1" />
              <span className="text-[10px] font-mono tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-1 h-1 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
