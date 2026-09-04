import { ABNTReference, CrossReferenceItem, TCCProject, TCCSection } from '../types';

/**
 * Formats a reference into standard ABNT NBR 6023:2018 string.
 */
export function formatABNTReference(ref: Partial<ABNTReference>): string {
  const authors = (ref.authors || 'AUTOR').trim();
  const title = (ref.title || 'Título').trim();
  const subtitle = ref.subtitle ? `: ${ref.subtitle.trim()}` : '';
  const city = ref.city ? `${ref.city.trim()}: ` : '';
  const publisher = ref.publisher ? `${ref.publisher.trim()}, ` : '';
  const year = ref.year ? `${ref.year.trim()}.` : '';
  const edition = ref.edition ? `${ref.edition.trim()} ed. ` : '';

  switch (ref.type) {
    case 'livro':
      return `${authors}. ${title}${subtitle}. ${edition}${city}${publisher}${year}`;

    case 'artigo': {
      const journal = ref.journal ? ` ${ref.journal.trim()}, ` : ' ';
      const volume = ref.volume ? `v. ${ref.volume.trim()}, ` : '';
      const number = ref.number ? `n. ${ref.number.trim()}, ` : '';
      const pages = ref.pages ? `${ref.pages.trim()}, ` : '';
      return `${authors}. ${title}${subtitle}.${journal}${volume}${number}${pages}${year}`;
    }

    case 'congresso': {
      const event = ref.event ? ` In: ${ref.event.toUpperCase()}, ` : '';
      const pages = ref.pages ? ` Anais [...]. ${city}${publisher}p. ${ref.pages.trim()}, ` : '';
      return `${authors}. ${title}${subtitle}.${event}${pages}${year}`;
    }

    case 'tese': {
      const degree = ref.degree ? ` (${ref.degree}) – ` : ' (Dissertação/Tese) – ';
      const institution = ref.publisher ? `${ref.publisher}, ` : '';
      return `${authors}. ${title}${subtitle}. ${year} ${degree}${institution}${city}${year}`;
    }

    case 'site': {
      const url = ref.url ? ` Disponível em: <${ref.url}>.` : '';
      const access = ref.accessDate ? ` Acesso em: ${ref.accessDate}.` : '';
      return `${authors}. ${title}${subtitle}. ${year}.${url}${access}`;
    }

    case 'legislacao': {
      return `${authors}. ${title}${subtitle}. ${ref.journal || 'Diário Oficial da União'}, ${city}${year}`;
    }

    default:
      return `${authors}. ${title}${subtitle}. ${city}${publisher}${year}`;
  }
}

/**
 * Generates author-date citation keys for text according to ABNT NBR 10520.
 */
export function generateCitationKeys(authors: string, year: string) {
  if (!authors) return { parenthetical: `(AUTOR, ${year || 's.d.'})`, narrative: `Autor (${year || 's.d.'})` };

  // Split authors by semicolon
  const authorList = authors.split(';').map(a => a.trim()).filter(Boolean);
  
  if (authorList.length === 0) {
    return { parenthetical: `(AUTOR, ${year || 's.d.'})`, narrative: `Autor (${year || 's.d.'})` };
  }

  // Extract last names (usually before comma or last word)
  const lastNames = authorList.map(a => {
    const parts = a.split(',');
    return parts[0].trim();
  });

  const yearStr = year ? year.trim() : 's.d.';

  if (lastNames.length === 1) {
    const upper = lastNames[0].toUpperCase();
    const capitalized = capitalizeWord(lastNames[0]);
    return {
      parenthetical: `(${upper}, ${yearStr})`,
      narrative: `${capitalized} (${yearStr})`,
    };
  }

  if (lastNames.length === 2) {
    const upper = `${lastNames[0].toUpperCase()}; ${lastNames[1].toUpperCase()}`;
    const capitalized = `${capitalizeWord(lastNames[0])} e ${capitalizeWord(lastNames[1])}`;
    return {
      parenthetical: `(${upper}, ${yearStr})`,
      narrative: `${capitalized} (${yearStr})`,
    };
  }

  if (lastNames.length === 3) {
    const upper = `${lastNames[0].toUpperCase()}; ${lastNames[1].toUpperCase()}; ${lastNames[2].toUpperCase()}`;
    const capitalized = `${capitalizeWord(lastNames[0])}, ${capitalizeWord(lastNames[1])} e ${capitalizeWord(lastNames[2])}`;
    return {
      parenthetical: `(${upper}, ${yearStr})`,
      narrative: `${capitalized} (${yearStr})`,
    };
  }

  // More than 3 authors: et al.
  const upperFirst = lastNames[0].toUpperCase();
  const capFirst = capitalizeWord(lastNames[0]);
  return {
    parenthetical: `(${upperFirst} et al., ${yearStr})`,
    narrative: `${capFirst} et al. (${yearStr})`,
  };
}

function capitalizeWord(word: string): string {
  if (!word) return '';
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
}

/**
 * Replaces cross-reference tokens like [ref:fig-1] with readable label "Figura 1"
 */
export function resolveCrossReferences(
  text: string,
  crossReferences: CrossReferenceItem[]
): string {
  let resolved = text;
  crossReferences.forEach((item) => {
    const prefix = item.type.charAt(0).toUpperCase() + item.type.slice(1);
    const label = `${prefix} ${item.number}`;
    // Replace [ref:id]
    const tokenRegex = new RegExp(`\\[ref:${item.id}\\]`, 'gi');
    resolved = resolved.replace(tokenRegex, label);
  });
  return resolved;
}

/**
 * Calculate estimated pages for table of contents (Sumário)
 */
export interface ComputedTOCItem {
  id: string;
  number: string;
  title: string;
  level: number;
  pageNumber: number;
  isPrimaria: boolean;
}

export function computeTableOfContents(project: TCCProject): ComputedTOCItem[] {
  // Count pre-textual pages (starting at Folha de Rosto = 2, Cover = 1 not numbered)
  let currentPage = 1; // Capa
  if (project.settings.includeTitlePage) currentPage++; // Folha de rosto
  if (project.settings.includeApprovalSheet) currentPage++; // Folha de aprovação
  if (project.settings.includeDedication && project.dedication) currentPage++;
  if (project.settings.includeAcknowledgments && project.acknowledgments) currentPage++;
  if (project.settings.includeEpigraph && project.epigraph?.quote) currentPage++;
  if (project.settings.includeResumo && project.resumo?.text) currentPage++;
  if (project.settings.includeAbstract && project.abstract?.text) currentPage++;
  
  const figures = project.crossReferences.filter(r => r.type === 'figura');
  if (project.settings.includeListOfFigures && figures.length > 0) currentPage++;
  
  const tables = project.crossReferences.filter(r => r.type === 'tabela' || r.type === 'quadro');
  if (project.settings.includeListOfTables && tables.length > 0) currentPage++;
  
  if (project.settings.includeListOfAcronyms && project.acronyms.length > 0) currentPage++;
  
  if (project.settings.includeTableOfContents) currentPage++; // Sumário

  // Now textual sections start! The first textual section (e.g. 1 INTRODUÇÃO) displays its page number
  const toc: ComputedTOCItem[] = [];

  project.sections.forEach((sec) => {
    if (sec.type === 'textual') {
      if (sec.level === 1) {
        // Level 1 primary sections start on a new page in ABNT
        currentPage++;
      }
      toc.push({
        id: sec.id,
        number: sec.number,
        title: sec.title,
        level: sec.level,
        pageNumber: currentPage,
        isPrimaria: sec.level === 1,
      });

      // Rough page estimate based on content length (~250 words per page in 1.5 line height)
      const wordCount = sec.content ? sec.content.split(/\s+/).filter(Boolean).length : 0;
      const extraPages = Math.floor(wordCount / 380);
      currentPage += extraPages;
    }
  });

  // Post-textual
  if (project.references.length > 0) {
    currentPage++;
    toc.push({
      id: 'referencias',
      number: '',
      title: 'REFERÊNCIAS',
      level: 1,
      pageNumber: currentPage,
      isPrimaria: true,
    });
  }

  if (project.appendices.length > 0) {
    project.appendices.forEach((app) => {
      currentPage++;
      toc.push({
        id: app.id,
        number: '',
        title: `APÊNDICE ${app.letter} – ${app.title.toUpperCase()}`,
        level: 1,
        pageNumber: currentPage,
        isPrimaria: true,
      });
    });
  }

  if (project.annexes.length > 0) {
    project.annexes.forEach((ann) => {
      currentPage++;
      toc.push({
        id: ann.id,
        number: '',
        title: `ANEXO ${ann.letter} – ${ann.title.toUpperCase()}`,
        level: 1,
        pageNumber: currentPage,
        isPrimaria: true,
      });
    });
  }

  return toc;
}

/**
 * Validate references against project text
 */
export function validateCitations(project: TCCProject) {
  const allText = project.sections.map(s => s.content).join(' ');
  
  const unusedReferences: ABNTReference[] = [];
  const matchedReferences: ABNTReference[] = [];

  project.references.forEach(ref => {
    const keys = generateCitationKeys(ref.authors, ref.year);
    // Search for author last name and year in text
    const authorLastName = ref.authors.split(';')[0]?.split(',')[0]?.trim() || '';
    const regex = new RegExp(`\\b${authorLastName}\\b`, 'i');
    
    if (regex.test(allText)) {
      matchedReferences.push(ref);
    } else {
      unusedReferences.push(ref);
    }
  });

  return {
    totalReferences: project.references.length,
    citedCount: matchedReferences.length,
    unusedReferences,
    matchedReferences,
  };
}

/**
 * Count total words and characters across the project
 */
export function getProjectStatistics(project: TCCProject) {
  let wordCount = 0;
  let charCount = 0;

  project.sections.forEach(s => {
    if (s.content) {
      const words = s.content.trim().split(/\s+/).filter(Boolean);
      wordCount += words.length;
      charCount += s.content.length;
    }
  });

  if (project.resumo?.text) {
    const resumoWords = project.resumo.text.trim().split(/\s+/).filter(Boolean).length;
    wordCount += resumoWords;
  }

  return {
    wordCount,
    charCount,
    estimatedPages: Math.max(1, Math.ceil(wordCount / 320)),
    totalFigures: project.crossReferences.filter(r => r.type === 'figura').length,
    totalTables: project.crossReferences.filter(r => r.type === 'tabela' || r.type === 'quadro').length,
    totalReferences: project.references.length,
  };
}
