export interface GovernanceIndex {
    version: string;
    generated: string;
    project: string;
    roadItems: Record<string, any>;
    capabilities: Record<string, any>;
    personas: Record<string, any>;
    contexts?: Record<string, any>;
    stats?: any;
}

export interface GovernanceRepository {
    saveSnapshot(snapshot: GovernanceIndex): Promise<string>;
    getLatestSnapshot(): Promise<GovernanceIndex | null>;
    getRoadItems(): Promise<any[]>;
    getCapabilityCoverage(): Promise<any[]>;
    getSnapshots(): Promise<GovernanceIndex[]>;
    deleteSnapshot(id: string): Promise<void>;
}
