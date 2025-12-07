export type ScenarioType = 'MARKET' | 'CHAT_REBATE' | 'CHAT_IMPERSONATION' | 'CHAT_CRYPTO' | 'CHAT_SERVICE' | null;

export interface Message {
  id: string;
  sender: 'user' | 'scammer' | 'system' | 'mascot';
  text: string;
  isBlurred?: boolean; // For sensitive info simulation
  timestamp: number;
}

export interface GameState {
  wallet: number;
  currentScenario: ScenarioType;
  gameStatus: 'playing' | 'won' | 'lost' | 'menu';
  feedback: string | null;
  score: number;
}

export interface ChatScenarioConfig {
  title: string;
  initialMessage: string;
  scammerPersona: string;
  goal: string; // What the user needs to avoid
  difficulty: number; // 1-5 stars
  platform: 'wechat' | 'sms' | 'dating' | 'service'; // UI theme hint
}