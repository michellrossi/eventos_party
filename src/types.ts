/**
 * Types representing events, guests, fund contributions, and user sessions.
 */

export interface Guest {
  id: string;
  name: string;
  phone?: string;
  avatar: string;
  status: 'VOU' | 'TALVEZ' | 'NÃO VOU';
  confirmedAt: string;
  paid?: boolean;
}

export interface Contribution {
  id: string;
  contributorName: string;
  contributorAvatar: string;
  amount: number;
  message?: string;
  createdAt: string;
}

export interface VibePhoto {
  id: string;
  url: string;
  authorName: string;
  authorAvatar: string;
  createdAt: string;
  likes: number;
}

export interface SolsticeEvent {
  id: string;
  name: string;
  type: string; // 'aniversario' | 'churrasco' | 'casamento' | 'formatura' | 'outros'
  dateTime: string;
  location: string;
  description: string;
  
  // Configurations
  isPublic: boolean;
  requiresApproval: boolean;
  allowPlusOne: boolean;
  peopleLimit?: number | null;
  rsvpDeadline?: string | null;
  
  // Finance (Vaquinha)
  vaquinhaEnabled: boolean;
  vaquinhaGoal?: number | null;
  vaquinhaCollected: number;
  vaquinhaValuePerPerson?: number | null;
  
  // Design details
  selectedTemplate: string; // 'neon-tokyo' | 'ethereal' | 'synthwave' | 'liquid-glass' | 'obsidian' | 'horizon' | 'pop-art' | 'neural'
  backgroundColor: string; // Color code
  fontFamily: 'Outfit' | 'serif' | 'mono';
  coverImage?: string;
  
  // Party Vibe metrics
  vibeScore: number;
  djSetlistReady: boolean;
  dressingCode: string;
  
  // Interactive lists
  guests: Guest[];
  contributions: Contribution[];
  vibeWall: VibePhoto[];
  
  status: 'ACTIVE' | 'DRAFT' | 'ENDED';
}

export interface UserProfile {
  name: string;
  nickname: string;
  phone: string;
  avatar: string;
  isRegistered: boolean;
}
