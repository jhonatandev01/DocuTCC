export type DocumentType = 'monografia' | 'artigo' | 'relatorio_tecnico' | 'projeto_pesquisa' | 'tcc_tecnico';
export type AcademicDegree = 'tecnico' | 'bacharelado' | 'licenciatura' | 'tecnologo' | 'especializacao' | 'mestrado' | 'doutorado';

export interface Author {
  id: string;
  name: string;
  email?: string;
  lattes?: string;
  orcid?: string;
  courseOrDepartment?: string;
}

export interface Advisor {
  name: string;
  title: string; // Prof. Dr., Profª. Ma., etc.
  institution: string;
}

export interface BoardMember {
  id: string;
  name: string;
  title: string;
  role: 'Presidente' | 'Examinador Interno' | 'Examinador Externo' | 'Orientador';
  institution: string;
}

export interface Epigraph {
  quote: string;
  author: string;
  year?: string;
  source?: string;
}

export interface AcronymItem {
  id: string;
  acronym: string;
  definition: string;
}

export interface SymbolItem {
  id: string;
  symbol: string;
  definition: string;
}

export interface TCCSection {
  id: string;
  number: string; // "1", "1.1", "1.1.1", "2" etc. or "" for unnumbered
  title: string;
  level: 1 | 2 | 3 | 4;
  content: string;
  type: 'pre-textual' | 'textual' | 'post-textual';
  isOptional?: boolean;
}

export type CrossReferenceType = 'figura' | 'tabela' | 'quadro' | 'grafico' | 'equacao';

export interface CrossReferenceItem {
  id: string; // e.g. "fig-1", "tab-1"
  type: CrossReferenceType;
  number: number;
  title: string;
  source: string;
  contentUrl?: string; // image url or base64
  formulaLatex?: string; // LaTeX equation
  tableHeaders?: string[];
  tableRows?: string[][];
  notes?: string;
  targetSectionId?: string; // ID of the section this item belongs to
  aiAnalysis?: string; // AI generated description/contextual paragraph
}

export type ReferenceType = 'livro' | 'artigo' | 'congresso' | 'tese' | 'site' | 'legislacao' | 'outro';

export interface ABNTReference {
  id: string;
  type: ReferenceType;
  authors: string; // e.g., "SILVA, João da; SANTOS, Maria"
  title: string;
  subtitle?: string;
  publisher?: string;
  city?: string;
  year: string;
  edition?: string;
  journal?: string; // Revista / Periódico
  volume?: string;
  number?: string;
  pages?: string; // "p. 45-62"
  url?: string;
  accessDate?: string; // "Acesso em: 15 mai. 2024."
  event?: string; // Nome do congresso
  degree?: string; // Dissertação (Mestrado) / Tese (Doutorado)
  formattedABNT: string;
  citationKey: string; // "SILVA; SANTOS, 2024"
}

export interface AppendixItem {
  id: string;
  letter: string; // "A", "B"
  title: string;
  content: string;
}

export interface AnnexItem {
  id: string;
  letter: string; // "A", "B"
  title: string;
  content: string;
}

export interface TCCProjectSettings {
  fontFamily: 'Times New Roman' | 'Arial';
  fontSize: 12;
  lineSpacing: 1.5;
  margins: {
    top: number; // 3 cm
    left: number; // 3 cm
    right: number; // 2 cm
    bottom: number; // 2 cm
  };
  includeCover: boolean;
  includeTitlePage: boolean;
  includeApprovalSheet: boolean;
  includeDedication: boolean;
  includeAcknowledgments: boolean;
  includeEpigraph: boolean;
  includeResumo: boolean;
  includeAbstract: boolean;
  includeListOfFigures: boolean;
  includeListOfTables: boolean;
  includeListOfAcronyms: boolean;
  includeTableOfContents: boolean;
  showGridGuide: boolean;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface TCCProject {
  id: string;
  title: string;
  subtitle?: string;
  documentType: DocumentType;
  academicDegree: AcademicDegree;
  institution: {
    name: string; // ex: Universidade de São Paulo
    facultyOrInstitute?: string; // ex: Instituto de Ciências Matemáticas e de Computação
    department?: string; // ex: Departamento de Sistemas de Informação
    course: string; // ex: Bacharelado em Ciência da Computação
    campus?: string; // ex: Campus São Carlos
  };
  authors: Author[];
  advisor: Advisor;
  coAdvisor?: Advisor;
  city: string;
  stateOrCountry?: string;
  year: string;
  submissionDate?: string;
  natureOfWork: string; // Nota explicativa da folha de rosto
  examinationBoard: BoardMember[];
  dedication?: string;
  acknowledgments?: string;
  epigraph?: Epigraph;
  resumo: {
    text: string;
    keywords: string[];
  };
  abstract: {
    text: string;
    keywords: string[];
  };
  acronyms: AcronymItem[];
  symbols: SymbolItem[];
  sections: TCCSection[];
  crossReferences: CrossReferenceItem[];
  references: ABNTReference[];
  appendices: AppendixItem[];
  annexes: AnnexItem[];
  groundingSources?: GroundingSource[];
  settings: TCCProjectSettings;
  lastModified: string;
}

export interface ABNTAuditIssue {
  id: string;
  category: 'citacoes' | 'formatacao' | 'linguagem' | 'estrutura' | 'referencias';
  severity: 'alta' | 'media' | 'baixa';
  title: string;
  description: string;
  norma: 'NBR 14724' | 'NBR 6023' | 'NBR 10520' | 'NBR 6028';
  location?: string;
  suggestedFix?: string;
}

export interface ABNTAuditResult {
  score: number; // 0 a 100
  summary: string;
  passedChecksCount: number;
  totalChecksCount: number;
  checklist: {
    name: string;
    status: 'pass' | 'warning' | 'fail';
    details: string;
  }[];
  issues: ABNTAuditIssue[];
}

export interface TCCGenerationRequest {
  topic: string;
  course: string;
  degree: AcademicDegree;
  documentType: DocumentType;
  objectives: string;
  methodology: string;
  technologies?: string;
  authorName?: string;
  advisorName?: string;
  institutionName?: string;
  city?: string;
  year?: string;
}

export type ViewTab =
  | 'metadata'
  | 'secoes'
  | 'citacoes'
  | 'referencias_cruzadas'
  | 'preview'
  | 'assistente_ia'
  | 'gerador_ia'
  | 'auditoria'
  | 'scripts'
  | 'editor'
  | 'citations'
  | 'cross_references'
  | 'ai_assistant';
