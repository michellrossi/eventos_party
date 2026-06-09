import React from "react";
import { Ticket, Search, Plus, Calendar, Activity } from "lucide-react";

interface BottomNavProps {
  activeTab: "events" | "search" | "create" | "calendar" | "vibe";
  onTabChange: (tab: "events" | "search" | "create" | "calendar" | "vibe") => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  interface NavItem {
    readonly id: "events" | "search" | "create" | "calendar" | "vibe";
    readonly label: string;
    readonly icon: React.ComponentType<any>;
    readonly highlight?: boolean;
  }

  const navItems: NavItem[] = [
    { id: "events", label: "Eventos", icon: Ticket },
    { id: "search", label: "Buscar", icon: Search },
    { id: "create", label: "Criar", icon: Plus, highlight: true },
    { id: "calendar", label: "Calendário", icon: Calendar },
    { id: "vibe", label: "Vibe Check", icon: Activity },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-[#0c1228]/95 border-t border-indigo-500/20 backdrop-blur-xl shadow-[0_-8px_30px_rgba(0,0,0,0.7)] pb-safe-bottom">
      <div className="max-w-md mx-auto flex items-center justify-around h-16 px-2 relative">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          if (item.highlight) {
            return (
              <button
                key={item.id}
                id="tab-btn-create"
                onClick={() => onTabChange(item.id)}
                className="relative -top-5 bg-gradient-to-r from-indigo-500 to-pink-500 hover:shadow-[0_0_25px_rgba(236,72,153,0.6)] text-white p-4 rounded-full transition duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center border-4 border-[#0c1228] shadow-2xl z-50 cursor-pointer"
                title="Criar Novo Evento"
              >
                <IconComponent className="w-6 h-6" />
              </button>
            );
          }

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition duration-200 relative cursor-pointer ${
                isActive ? "text-indigo-400 font-semibold scale-105" : "text-indigo-200/50 hover:text-indigo-200/80"
              }`}
            >
              <IconComponent className="w-5 h-5 mb-0.5" />
              <span className="text-[9px] font-mono tracking-tight">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-[-4px] w-1.5 h-1.5 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

