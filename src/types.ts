
export interface GroundingSource {
  uri: string;
  title: string;
}

export interface AnalysisResultData {
  isReplaceable: boolean;
  replacementConfidence: number;
  analysisSummary: string;
  automationFlow: string[];
  sources?: GroundingSource[];
}