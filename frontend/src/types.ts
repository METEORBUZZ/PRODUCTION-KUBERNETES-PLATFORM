export interface VoteData {
  cat: number;
  dog: number;
  total: number;
  catPercentage: number;
  dogPercentage: number;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  uptime?: number;
  database?: string;
}

export interface VersionInfo {
  version: string;
  gitSha: string;
  buildTime: string;
  environment: string;
}
