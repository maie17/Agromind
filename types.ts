
export enum BusinessUnit {
  GRAINS = 'Comercialización de granos',
  FINANCE = 'Financiación',
  INPUTS = 'Insumos',
  DIGITAL = 'Servicios digitales',
  RISK = 'Gestión de riesgo / cobertura'
}

export enum Priority {
  LOW = 'Baja',
  MEDIUM = 'Media',
  HIGH = 'Alta'
}

export interface Opportunity {
  id: string;
  unit: BusinessUnit;
  justification: string;
  detectedQuote: string;
  priority: Priority;
  recommendedAction: string;
  suggestedTiming: string;
}

export interface MeetingAnalysis {
  summary: string;
  customerSentiment: string;
  mainTopics: string[];
  opportunities: Opportunity[];
  nextBestAction: string;
}

export interface StoredAnalysis extends MeetingAnalysis {
  id: string;
  timestamp: number;
  clientName?: string;
}

export type View = 'home' | 'recording' | 'result';

export interface AnalysisState {
  view: View;
  isAnalyzing: boolean;
  result: MeetingAnalysis | null;
  error: string | null;
  history: StoredAnalysis[];
}
