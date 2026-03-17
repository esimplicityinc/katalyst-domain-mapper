/**
 * Common Cypher query templates for Neo4j
 * These queries help scanners orient themselves and find relevant methods
 */

/**
 * Cypher query templates
 */
export const CYPHER_QUERIES = {
  /**
   * Find methods commonly addressing similar findings
   */
  FIND_SIMILAR_METHODS: `
    MATCH (f:Finding)-[:RELATES_TO_METHOD]->(m:Method)
    WHERE f.title CONTAINS $keyword
    WITH m, count(f) as frequency
    ORDER BY frequency DESC
    LIMIT $limit
    RETURN m, frequency
  `,

  /**
   * Get scan history for a repository
   */
  GET_SCAN_HISTORY: `
    MATCH (r:Repository {name: $repoName})-[:HAS_SCAN]->(s:Scan)
    RETURN s
    ORDER BY s.scanDate DESC
    LIMIT $limit
  `,

  /**
   * Get latest scan for repository
   */
  GET_LATEST_SCAN: `
    MATCH (r:Repository {name: $repoName})-[:HAS_SCAN]->(s:Scan)
    RETURN s
    ORDER BY s.scanDate DESC
    LIMIT 1
  `,

  /**
   * Find methods by keyword
   */
  FIND_METHODS_BY_KEYWORD: `
    MATCH (k:Keyword {value: $keyword})<-[:HAS_KEYWORD]-(m:Method)
    RETURN m
  `,

  /**
   * Get observation evidence for method
   */
  GET_METHOD_EVIDENCE: `
    MATCH (m:Method {methodId: $methodId})-[:SUPPORTED_BY]->(o:Observation)
    RETURN o
    ORDER BY o.dateDocumented DESC
  `,

  /**
   * Get methods for a field guide
   */
  GET_FIELD_GUIDE_METHODS: `
    MATCH (fg:FieldGuide {id: $fieldGuideId})-[:CONTAINS]->(m:Method)
    RETURN m
    ORDER BY m.maturity, m.title
  `,

  /**
   * Recommend methods for scan based on findings
   */
  RECOMMEND_METHODS_FOR_SCAN: `
    MATCH (s:Scan {id: $scanId})-[:HAS_FINDING]->(f:Finding)
    MATCH (f)-[:RELATES_TO_METHOD]->(m:Method)
    WITH m, count(f) as relevance
    ORDER BY relevance DESC
    LIMIT $limit
    RETURN m, relevance
  `,

  /**
   * Find methods that commonly appear together in scans
   */
  FIND_RELATED_METHODS: `
    MATCH (m1:Method {methodId: $methodId})<-[:RELATES_TO_METHOD]-(f:Finding)<-[:HAS_FINDING]-(s:Scan)
    MATCH (s)-[:HAS_FINDING]->(f2:Finding)-[:RELATES_TO_METHOD]->(m2:Method)
    WHERE m1 <> m2
    WITH m2, count(DISTINCT s) as coOccurrence
    ORDER BY coOccurrence DESC
    LIMIT $limit
    RETURN m2, coOccurrence
  `,

  /**
   * Get scan with all dimensions and subscores
   */
  GET_SCAN_DETAILED: `
    MATCH (s:Scan {id: $scanId})
    OPTIONAL MATCH (s)-[:HAS_DIMENSION]->(d:Dimension)
    OPTIONAL MATCH (d)-[:HAS_SUBSCORE]->(ss:SubScore)
    RETURN s, collect(DISTINCT d) as dimensions, collect(DISTINCT ss) as subscores
  `,

  /**
   * Track score improvement over time
   */
  GET_SCORE_TREND: `
    MATCH (r:Repository {name: $repoName})-[:HAS_SCAN]->(s:Scan)
    RETURN s.scanDate as date, s.overallScore as score
    ORDER BY s.scanDate ASC
  `,

  /**
   * Find repositories with similar maturity level
   */
  FIND_SIMILAR_REPOSITORIES: `
    MATCH (r1:Repository)-[:HAS_SCAN]->(s1:Scan {id: $scanId})
    MATCH (r2:Repository)-[:HAS_SCAN]->(s2:Scan)
    WHERE r1 <> r2
      AND abs(s1.overallScore - s2.overallScore) <= $threshold
    WITH r2, s2
    ORDER BY s2.scanDate DESC
    RETURN DISTINCT r2, collect(s2)[0] as latestScan
    LIMIT $limit
  `,

  /**
   * Get all findings for a scan with linked methods
   */
  GET_SCAN_FINDINGS_WITH_METHODS: `
    MATCH (s:Scan {id: $scanId})-[:HAS_FINDING]->(f:Finding)
    OPTIONAL MATCH (f)-[:RELATES_TO_METHOD]->(m:Method)
    RETURN f, collect(m) as methods
    ORDER BY f.severity
  `,

  /**
   * Get maturity progression path
   */
  GET_MATURITY_PATH: `
    MATCH (r:Repository {name: $repoName})-[:HAS_SCAN]->(s:Scan)
    RETURN s.scanDate as date, s.maturityLevel as level, s.overallScore as score
    ORDER BY s.scanDate ASC
  `,

  /**
   * Find external methods from specific framework
   */
  GET_FRAMEWORK_METHODS: `
    MATCH (fw:Framework {name: $frameworkName})<-[:EXTERNAL_FROM]-(m:Method)
    RETURN m
    ORDER BY m.title
  `,

  /**
   * Create or update repository node
   */
  UPSERT_REPOSITORY: `
    MERGE (r:Repository {name: $name})
    SET r.url = $url,
        r.techStack = $techStack,
        r.isMonorepo = $isMonorepo,
        r.lastScannedAt = $lastScannedAt
    ON CREATE SET r.id = $id, r.createdAt = $createdAt
    RETURN r
  `,

  /**
   * Create scan with relationships
   */
  CREATE_SCAN: `
    MATCH (r:Repository {name: $repoName})
    CREATE (s:Scan {
      id: $id,
      overallScore: $overallScore,
      maturityLevel: $maturityLevel,
      scanDate: $scanDate,
      scannerVersion: $scannerVersion,
      assessmentMode: $assessmentMode,
      executiveSummary: $executiveSummary
    })
    CREATE (r)-[:HAS_SCAN {scannedAt: $scanDate}]->(s)
    RETURN s
  `,

  // ─── Practice Area Queries ────────────────────────────────────────────

  /**
   * Get all practice areas with their competencies
   */
  GET_PRACTICE_AREAS_WITH_COMPETENCIES: `
    MATCH (pa:PracticeArea)
    OPTIONAL MATCH (pa)-[hc:HAS_COMPETENCY]->(c:Competency)
    WITH pa, c, hc
    ORDER BY hc.order ASC
    RETURN pa,
      collect({
        competency: c,
        required: hc.required,
        order: hc.order
      }) as competencies
    ORDER BY pa.dimension, pa.title
  `,

  /**
   * Get team adoption summary across all practice areas
   */
  GET_TEAM_ADOPTION_SUMMARY: `
    MATCH (pa:PracticeArea)-[:ADOPTED_BY_TEAM]->(ta:TeamAdoption)
    OPTIONAL MATCH (ta)-[ev:EVIDENCED_BY]->(s:Scan)
    WITH pa, ta, collect(s) as scans
    RETURN pa.title as practiceArea,
      pa.dimension as dimension,
      ta.teamName as team,
      ta.adoptionLevel as adoptionLevel,
      ta.score as score,
      ta.adoptionDate as adoptionDate,
      size(scans) as evidenceCount
    ORDER BY pa.dimension, pa.title, ta.teamName
  `,

  /**
   * Get competency prerequisite chain for a given competency
   * Returns the full dependency graph showing what must be learned first
   */
  GET_COMPETENCY_PREREQUISITE_CHAIN: `
    MATCH path = (target:Competency {slug: $competencySlug})<-[:DEPENDS_ON_COMPETENCY*0..]-(prerequisite:Competency)
    WITH nodes(path) as chain, relationships(path) as deps
    UNWIND range(0, size(chain) - 1) as idx
    WITH chain[idx] as competency,
      CASE WHEN idx < size(deps) THEN deps[idx].dependencyType ELSE null END as dependencyType,
      idx as depth
    RETURN DISTINCT competency.slug as slug,
      competency.title as title,
      competency.level as level,
      dependencyType,
      depth
    ORDER BY depth DESC
  `,

  /**
   * Get team adoption for a specific practice area with evidence
   */
  GET_TEAM_ADOPTION_WITH_EVIDENCE: `
    MATCH (pa:PracticeArea {slug: $practiceAreaSlug})-[:ADOPTED_BY_TEAM]->(ta:TeamAdoption)
    OPTIONAL MATCH (ta)-[ev:EVIDENCED_BY]->(s:Scan)
    RETURN ta.teamName as team,
      ta.adoptionLevel as adoptionLevel,
      ta.score as score,
      ta.adoptionDate as adoptionDate,
      collect({
        scanDate: s.scanDate,
        overallScore: s.overallScore,
        dimension: ev.relevantDimension,
        strength: ev.evidenceStrength
      }) as evidence
    ORDER BY ta.score DESC
  `,

  /**
   * Get individual competency assessments for a practice area
   */
  GET_INDIVIDUAL_ASSESSMENTS: `
    MATCH (pa:PracticeArea {slug: $practiceAreaSlug})-[:ADOPTED_BY_PERSON]->(ia:IndividualAdoption)
    OPTIONAL MATCH (ia)-[:ASSESSED_IN]->(c:Competency)
    RETURN ia.personName as person,
      ia.proficiencyLevel as proficiency,
      ia.assessmentDate as assessmentDate,
      ia.selfAssessed as selfAssessed,
      collect({
        competency: c.title,
        level: c.level
      }) as competencyAssessments
    ORDER BY ia.proficiencyLevel DESC, ia.personName
  `,
} as const;

/**
 * Query parameter types for type safety
 */
export interface FindSimilarMethodsParams {
  keyword: string;
  limit?: number;
}

export interface GetScanHistoryParams {
  repoName: string;
  limit?: number;
}

export interface GetLatestScanParams {
  repoName: string;
}

export interface FindMethodsByKeywordParams {
  keyword: string;
}

export interface GetMethodEvidenceParams {
  methodId: string;
}

export interface GetFieldGuideMethodsParams {
  fieldGuideId: string;
}

export interface RecommendMethodsForScanParams {
  scanId: string;
  limit?: number;
}

export interface FindRelatedMethodsParams {
  methodId: string;
  limit?: number;
}

export interface GetScanDetailedParams {
  scanId: string;
}

export interface GetScoreTrendParams {
  repoName: string;
}

export interface FindSimilarRepositoriesParams {
  scanId: string;
  threshold?: number;
  limit?: number;
}

export interface GetScanFindingsWithMethodsParams {
  scanId: string;
}

export interface GetMaturityPathParams {
  repoName: string;
}

export interface GetFrameworkMethodsParams {
  frameworkName: string;
}

export interface UpsertRepositoryParams {
  id: string;
  name: string;
  url?: string;
  techStack: string[];
  isMonorepo: boolean;
  createdAt: string;
  lastScannedAt?: string;
}

export interface CreateScanParams {
  id: string;
  repoName: string;
  overallScore: number;
  maturityLevel: string;
  scanDate: string;
  scannerVersion: string;
  assessmentMode: "standard" | "critical";
  executiveSummary?: string;
}

export interface GetPracticeAreasWithCompetenciesParams {
  // No parameters required — returns all practice areas
}

export interface GetTeamAdoptionSummaryParams {
  // No parameters required — returns full summary
}

export interface GetCompetencyPrerequisiteChainParams {
  competencySlug: string;
}

export interface GetTeamAdoptionWithEvidenceParams {
  practiceAreaSlug: string;
}

export interface GetIndividualAssessmentsParams {
  practiceAreaSlug: string;
}
