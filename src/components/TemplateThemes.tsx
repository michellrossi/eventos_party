import React from "react";

export interface TemplateStyle {
  id: string;
  name: string;
  background: string;
  cardBg: string;
  text: string;
  textMuted: string;
  accent: string;
  accentHover: string;
  border: string;
  fontClass: string;
  description: string;
}

export const TEMPLATES: TemplateStyle[] = [
  {
    id: "neon-tokyo",
    name: "Neo Tokyo",
    background: "bg-[#0b1224]",
    cardBg: "bg-[#141b31]/80 backdrop-blur-md",
    text: "text-white",
    textMuted: "text-indigo-200/75",
    accent: "bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]",
    accentHover: "hover:shadow-[0_0_25px_rgba(236,72,153,0.5)]",
    border: "border-indigo-500/30",
    fontClass: "font-sans",
    description: "Espaço profundo, neon roxo e vibrações cyberpunk."
  },
  {
    id: "ethereal",
    name: "Ethereal Minimal",
    background: "bg-[#252321]",
    cardBg: "bg-[#302e2c]/90 border border-[#42403d]",
    text: "text-[#f8f5f0]",
    textMuted: "text-[#c2beb5]",
    accent: "bg-[#f59e0b] text-[#1a1816] font-medium shadow-none",
    accentHover: "hover:bg-[#d97706]",
    border: "border-[#4c4a47]",
    fontClass: "font-serif",
    description: "Sofisticação, luz de velas, tons terrosos e fontes clássicas."
  },
  {
    id: "synthwave",
    name: "Synthwave 80s",
    background: "bg-[#180a2b]",
    cardBg: "bg-[#27153f]/85 border-2 border-pink-500/40",
    text: "text-yellow-300",
    textMuted: "text-pink-300",
    accent: "bg-pink-500 text-black font-extrabold tracking-wider shadow-[4px_4px_0px_#facc15]",
    accentHover: "hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#facc15]",
    border: "border-pink-500",
    fontClass: "font-sans uppercase",
    description: "Gradients retro, amarelo cintilante e grades estéticas."
  },
  {
    id: "liquid-glass",
    name: "Liquid Glass",
    background: "bg-teal-980 bg-gradient-to-br from-[#022a30] via-[#051f24] to-[#01140c]",
    cardBg: "bg-white/10 backdrop-blur-xl border border-white/20 shadow-xl",
    text: "text-white",
    textMuted: "text-teal-200/80",
    accent: "bg-teal-400 text-slate-950 font-semibold backdrop-blur-sm",
    accentHover: "hover:bg-teal-300",
    border: "border-teal-400/20",
    fontClass: "font-sans",
    description: "Mármore líquido, vidro fosco e reflexos ultramodernos."
  },
  {
    id: "obsidian",
    name: "Obsidian Tech",
    background: "bg-[#050505]",
    cardBg: "bg-[#121212]/95 border border-neutral-800",
    text: "text-neutral-100",
    textMuted: "text-neutral-500",
    accent: "bg-white text-black font-bold tracking-tight",
    accentHover: "hover:bg-neutral-200",
    border: "border-neutral-800",
    fontClass: "font-mono",
    description: "Preto profundo absoluto, divisórios simétricos e fontes técnicas."
  },
  {
    id: "horizon",
    name: "Horizon Dust",
    background: "bg-[#1c0d12] bg-gradient-to-b from-[#1c0d12] via-[#2d121c] to-[#120a10]",
    cardBg: "bg-[#3e1f2b]/80 border border-rose-500/20 shadow-2xl shadow-rose-950/20",
    text: "text-[#ffebf0]",
    textMuted: "text-rose-300/80",
    accent: "bg-rose-500 text-white font-medium shadow-lg shadow-rose-950/40",
    accentHover: "hover:bg-rose-400",
    border: "border-rose-500/20",
    fontClass: "font-sans",
    description: "Por do sol cósmico, tons degradê de violeta, rosa quente e bruma."
  },
  {
    id: "pop-art",
    name: "Pop Memphis",
    background: "bg-[#faea39]",
    cardBg: "bg-white border-4 border-black shadow-[8px_8px_0px_#000000]",
    text: "text-black",
    textMuted: "text-black/70 font-semibold",
    accent: "bg-[#ff4b82] text-white border-3 border-black font-black uppercase shadow-[4px_4px_0px_#000000]",
    accentHover: "hover:bg-[#ff1e62] hover:shadow-[2px_2px_0px_#000000]",
    border: "border-black border-2",
    fontClass: "font-sans",
    description: "Grito de cores Memphis 90s, contornos grossos e alto impacto."
  },
  {
    id: "neural",
    name: "Neural Network",
    background: "bg-[#090b11]",
    cardBg: "bg-[#101422]/90 border border-cyan-800/40 shadow-inner",
    text: "text-[#e2f1ff]",
    textMuted: "text-cyan-200/60",
    accent: "bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold",
    accentHover: "hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_10px_rgba(34,211,238,0.3)]",
    border: "border-cyan-500/20",
    fontClass: "font-mono",
    description: "Nós conectados, matriz digital holográfica e tons aqua-blue."
  }
];

export function getTemplateStyle(id: string): TemplateStyle {
  return TEMPLATES.find((t) => t.id === id) || TEMPLATES[0];
}
