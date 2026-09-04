import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  AlignmentType,
  HeadingLevel,
  Header,
  PageNumber,
  convertMillimetersToTwip,
} from 'docx';
import { TCCProject } from '../types';
import {
  computeTableOfContents,
  resolveCrossReferences,
  formatABNTReference,
} from './abntFormatter';

/**
 * Downloads a Blob as a file in browser
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 200);
}

/**
 * Generates an ABNT-compliant Document object from a TCCProject.
 * Strictly adheres to NBR 14724:2011, NBR 6023:2018, NBR 10520:2023, and NBR 6028:2021.
 */
export function createDocxDocument(project: TCCProject): Document {
  const font = project.settings.fontFamily || 'Times New Roman';
  const margins = {
    top: convertMillimetersToTwip((project.settings.margins?.top ?? 3) * 10),
    bottom: convertMillimetersToTwip((project.settings.margins?.bottom ?? 2) * 10),
    left: convertMillimetersToTwip((project.settings.margins?.left ?? 3) * 10),
    right: convertMillimetersToTwip((project.settings.margins?.right ?? 2) * 10),
  };

  const lineSpacing15 = 360; // 1.5 lines in twips (240 * 1.5)
  const lineSpacingSingle = 240; // 1.0 line in twips
  const indent125 = convertMillimetersToTwip(12.5); // 1.25 cm first line indent
  const indentQuote40 = convertMillimetersToTwip(40); // 4.0 cm left indent for long quotes
  const indentNature80 = convertMillimetersToTwip(80); // 8.0 cm for nature note on title page

  // -------------------------------------------------------------
  // HELPER PARAGRAPH BUILDERS
  // -------------------------------------------------------------
  const emptyLine = (count = 1, lineSpacing = lineSpacingSingle) =>
    Array.from({ length: count }).map(
      () =>
        new Paragraph({
          children: [new TextRun({ text: '', font, size: 24 })],
          spacing: { line: lineSpacing, before: 0, after: 0 },
        })
    );

  // Standard Body Paragraph (NBR 14724: 12pt, 1.5 line, 1.25cm indent, justified)
  const createBodyParagraph = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, font, size: 24 })],
      alignment: AlignmentType.JUSTIFIED,
      indent: { firstLine: indent125 },
      spacing: { line: lineSpacing15, before: 0, after: 0 },
    });

  // Long Quote Paragraph (NBR 10520: 10pt, 1.0 line, 4cm left indent, no first line indent, justified)
  const createLongQuoteParagraph = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, font, size: 20 })],
      alignment: AlignmentType.JUSTIFIED,
      indent: { left: indentQuote40 },
      spacing: { line: lineSpacingSingle, before: 120, after: 120 },
    });

  // Section Heading Builder (NBR 6024:2012)
  const createHeadingParagraph = (
    number: string,
    title: string,
    level: number,
    isFirstTextual = false
  ) => {
    const fullText = number ? `${number} ${title}` : title;

    if (level === 1) {
      // Primary: Uppercase, Bold, starts on new page (NBR 14724)
      return new Paragraph({
        children: [
          new TextRun({
            text: fullText.toUpperCase(),
            bold: true,
            font,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: !isFirstTextual, // First textual section will be on new page naturally via section break
        spacing: { before: 240, after: 240, line: lineSpacing15 },
      });
    }

    if (level === 2) {
      // Secondary: Bold, Title Case
      return new Paragraph({
        children: [
          new TextRun({
            text: fullText,
            bold: true,
            font,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 180, line: lineSpacing15 },
      });
    }

    // Tertiary / Quaternary: Italic or normal
    return new Paragraph({
      children: [
        new TextRun({
          text: fullText,
          italics: true,
          font,
          size: 24,
        }),
      ],
      heading: HeadingLevel.HEADING_3,
      spacing: { before: 180, after: 120, line: lineSpacing15 },
    });
  };

  // -------------------------------------------------------------
  // 1. PRE-TEXTUAL SECTION CHILDREN
  // -------------------------------------------------------------
  const preTextualChildren: Paragraph[] = [];

  // --- CAPA (NBR 14724) ---
  if (project.settings.includeCover) {
    preTextualChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.institution.name.toUpperCase(),
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 0 },
      })
    );

    if (project.institution.facultyOrInstitute) {
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: project.institution.facultyOrInstitute.toUpperCase(),
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { line: lineSpacing15, before: 0, after: 0 },
        })
      );
    }

    if (project.institution.course) {
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `CURSO DE ${project.institution.course.toUpperCase()}`,
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { line: lineSpacing15, before: 0, after: 0 },
        })
      );
    }

    // Space before authors
    preTextualChildren.push(...emptyLine(4));

    // Authors
    project.authors.forEach((author) => {
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: author.name.toUpperCase(),
              bold: true,
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { line: lineSpacing15, before: 0, after: 0 },
        })
      );
    });

    // Space before Title
    preTextualChildren.push(...emptyLine(6));

    // Title & Subtitle
    const titleText = project.title.toUpperCase();
    const subtitleText = project.subtitle ? `: ${project.subtitle}` : '';
    preTextualChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: titleText,
            bold: true,
            font,
            size: 24,
          }),
          ...(project.subtitle
            ? [
                new TextRun({
                  text: subtitleText,
                  bold: false,
                  font,
                  size: 24,
                }),
              ]
            : []),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 0 },
      })
    );

    // Space before Footer
    preTextualChildren.push(...emptyLine(10));

    // City & Year
    preTextualChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.city.toUpperCase(),
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 0 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: project.year,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 0 },
      })
    );
  }

  // --- FOLHA DE ROSTO (NBR 14724) ---
  if (project.settings.includeTitlePage) {
    // Page break before title page
    if (preTextualChildren.length > 0) {
      preTextualChildren.push(
        new Paragraph({
          pageBreakBefore: true,
          children: [],
        })
      );
    }

    // Authors
    project.authors.forEach((author) => {
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: author.name.toUpperCase(),
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { line: lineSpacing15, before: 0, after: 0 },
        })
      );
    });

    preTextualChildren.push(...emptyLine(6));

    // Title
    preTextualChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.title.toUpperCase(),
            bold: true,
            font,
            size: 24,
          }),
          ...(project.subtitle
            ? [
                new TextRun({
                  text: `: ${project.subtitle}`,
                  font,
                  size: 24,
                }),
              ]
            : []),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 0 },
      })
    );

    preTextualChildren.push(...emptyLine(4));

    // Nature of work note (Indented from 8cm / center-right, size 10pt or 12pt, lineSpacingSingle)
    const natureText =
      project.natureOfWork ||
      (project.academicDegree === 'tecnico' || project.documentType === 'tcc_tecnico'
        ? `Trabalho de Conclusão de Curso apresentado ao Curso Técnico em ${project.institution.course} da ${project.institution.name}, como requisito parcial para a obtenção do diploma e habilitação profissional de Técnico em ${project.institution.course}.`
        : project.academicDegree === 'tecnologo'
        ? `Trabalho de Conclusão de Curso apresentado ao Curso Superior de Tecnologia em ${project.institution.course} da ${project.institution.name}, como requisito parcial para a obtenção do título de Tecnólogo em ${project.institution.course}.`
        : `Trabalho de Conclusão de Curso apresentado ao Curso de ${project.institution.course} da ${project.institution.name}, como requisito parcial para a obtenção do título de Bacharel.`);

    preTextualChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: natureText,
            font,
            size: 20, // 10pt according to NBR 14724 for nature note
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: indentNature80 },
        spacing: { line: lineSpacingSingle, before: 0, after: 120 },
      })
    );

    // Advisor info
    preTextualChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Orientador: ${project.advisor.title} ${project.advisor.name}`,
            font,
            size: 20,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: indentNature80 },
        spacing: { line: lineSpacingSingle, before: 0, after: 0 },
      })
    );

    if (project.coAdvisor?.name) {
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Coorientador: ${project.coAdvisor.title || ''} ${project.coAdvisor.name}`,
              font,
              size: 20,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          indent: { left: indentNature80 },
          spacing: { line: lineSpacingSingle, before: 0, after: 0 },
        })
      );
    }

    preTextualChildren.push(...emptyLine(8));

    // City & Year
    preTextualChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: project.city.toUpperCase(),
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 0 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: project.year,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 0 },
      })
    );
  }

  // --- FOLHA DE APROVAÇÃO ---
  if (project.settings.includeApprovalSheet) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: (project.authors[0]?.name || 'AUTOR').toUpperCase(),
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: project.title.toUpperCase(),
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 120, after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text:
              project.natureOfWork ||
              'Trabalho de Conclusão de Curso avaliado e aprovado pela banca examinadora.',
            font,
            size: 20,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: indentNature80 },
        spacing: { line: lineSpacingSingle, before: 0, after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `Aprovado em: ____ de _______________ de ${project.year}.`,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 180, after: 360 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'BANCA EXAMINADORA',
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 240, after: 360 },
      })
    );

    // Examination Board
    project.examinationBoard.forEach((member) => {
      preTextualChildren.push(
        ...emptyLine(2),
        new Paragraph({
          children: [
            new TextRun({
              text: '____________________________________________________',
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { line: lineSpacingSingle, before: 0, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${member.title} ${member.name}`,
              bold: true,
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { line: lineSpacingSingle, before: 0, after: 40 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${member.role} – ${member.institution}`,
              font,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { line: lineSpacingSingle, before: 0, after: 120 },
        })
      );
    });
  }

  // --- DEDICATÓRIA ---
  if (project.settings.includeDedication && project.dedication) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [],
      }),
      ...emptyLine(14),
      new Paragraph({
        children: [
          new TextRun({
            text: project.dedication,
            italics: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: indentNature80 },
        spacing: { line: lineSpacing15, before: 0, after: 0 },
      })
    );
  }

  // --- AGRADECIMENTOS ---
  if (project.settings.includeAcknowledgments && project.acknowledgments) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'AGRADECIMENTOS',
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 360 },
      }),
      createBodyParagraph(project.acknowledgments)
    );
  }

  // --- EPÍGRAFE ---
  if (project.settings.includeEpigraph && project.epigraph?.quote) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [],
      }),
      ...emptyLine(14),
      new Paragraph({
        children: [
          new TextRun({
            text: `"${project.epigraph.quote}"`,
            italics: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: indentNature80 },
        spacing: { line: lineSpacing15, before: 0, after: 60 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `(${project.epigraph.author}${project.epigraph.year ? `, ${project.epigraph.year}` : ''})`,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.RIGHT,
        spacing: { line: lineSpacingSingle, before: 0, after: 0 },
      })
    );
  }

  // --- RESUMO (NBR 6028) ---
  if (project.settings.includeResumo && project.resumo?.text) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'RESUMO',
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 360 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: project.resumo.text,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: lineSpacing15, before: 0, after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Palavras-chave: ',
            bold: true,
            font,
            size: 24,
          }),
          new TextRun({
            text: `${project.resumo.keywords.join('. ')}.`,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: lineSpacing15, before: 120, after: 0 },
      })
    );
  }

  // --- ABSTRACT ---
  if (project.settings.includeAbstract && project.abstract?.text) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'ABSTRACT',
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 360 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: project.abstract.text,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: lineSpacing15, before: 0, after: 240 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: 'Keywords: ',
            bold: true,
            font,
            size: 24,
          }),
          new TextRun({
            text: `${project.abstract.keywords.join('. ')}.`,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.JUSTIFIED,
        spacing: { line: lineSpacing15, before: 120, after: 0 },
      })
    );
  }

  // --- LISTA DE ILUSTRAÇÕES ---
  const figures = project.crossReferences.filter((r) => r.type === 'figura');
  if (project.settings.includeListOfFigures && figures.length > 0) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'LISTA DE ILUSTRAÇÕES',
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 360 },
      })
    );

    figures.forEach((fig) => {
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Figura ${fig.number} – ${fig.title}`,
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { line: lineSpacing15, before: 0, after: 60 },
        })
      );
    });
  }

  // --- LISTA DE TABELAS ---
  const tables = project.crossReferences.filter((r) => r.type === 'tabela' || r.type === 'quadro');
  if (project.settings.includeListOfTables && tables.length > 0) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'LISTA DE TABELAS',
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 360 },
      })
    );

    tables.forEach((tab) => {
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${tab.type === 'quadro' ? 'Quadro' : 'Tabela'} ${tab.number} – ${tab.title}`,
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { line: lineSpacing15, before: 0, after: 60 },
        })
      );
    });
  }

  // --- LISTA DE SIGLAS ---
  if (project.settings.includeListOfAcronyms && project.acronyms.length > 0) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'LISTA DE ABREVIATURAS E SIGLAS',
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 360 },
      })
    );

    project.acronyms.forEach((acr) => {
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${acr.acronym} `,
              bold: true,
              font,
              size: 24,
            }),
            new TextRun({
              text: `– ${acr.definition}`,
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.LEFT,
          spacing: { line: lineSpacing15, before: 0, after: 60 },
        })
      );
    });
  }

  // --- SUMÁRIO (NBR 6027) ---
  const toc = computeTableOfContents(project);
  if (project.settings.includeTableOfContents) {
    preTextualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'SUMÁRIO',
            bold: true,
            font,
            size: 24,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { line: lineSpacing15, before: 0, after: 360 },
      })
    );

    toc.forEach((item) => {
      const isPrimary = item.level === 1;
      const displayTitle = item.number ? `${item.number} ${item.title}` : item.title;
      preTextualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: isPrimary ? displayTitle.toUpperCase() : displayTitle,
              bold: isPrimary,
              font,
              size: 24,
            }),
            new TextRun({
              text: ` ............................................................................ ${item.pageNumber}`,
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.LEFT,
          indent: { left: item.level > 1 ? convertMillimetersToTwip((item.level - 1) * 8) : 0 },
          spacing: { line: lineSpacing15, before: 0, after: 40 },
        })
      );
    });
  }

  // -------------------------------------------------------------
  // 2. TEXTUAL & POST-TEXTUAL SECTION CHILDREN
  // (With Header containing top-right page numbering, 10pt)
  // -------------------------------------------------------------
  const textualChildren: Paragraph[] = [];
  const firstTextualPage = toc[0]?.pageNumber || 10;

  // Process textual sections
  let isFirstSection = true;
  project.sections.forEach((sec) => {
    if (sec.type === 'textual') {
      textualChildren.push(
        createHeadingParagraph(sec.number, sec.title, sec.level, isFirstSection)
      );
      isFirstSection = false;

      // Process section paragraphs
      if (sec.content) {
        // Resolve cross references tokens like [ref:fig-1]
        const resolvedContent = resolveCrossReferences(sec.content, project.crossReferences);

        // Split paragraphs
        const rawParagraphs = resolvedContent
          .split(/\n+/)
          .map((p) => p.trim())
          .filter(Boolean);

        rawParagraphs.forEach((para) => {
          // Check if paragraph is a long quote (> 3 lines or marked with > or indent)
          // Long quotes typically are > 200 characters and start with quote or explicit tag
          const isExplicitLongQuote =
            para.startsWith('>') ||
            para.startsWith('[citacao-longa]') ||
            (para.startsWith('"') && para.endsWith('"') && para.length > 180);

          if (isExplicitLongQuote) {
            const cleanQuote = para
              .replace(/^>\s*/, '')
              .replace(/^\[citacao-longa\]\s*/, '')
              .replace(/^"|"$/g, '');
            textualChildren.push(createLongQuoteParagraph(cleanQuote));
          } else {
            textualChildren.push(createBodyParagraph(para));
          }
        });
      }

      // Render figures associated with this chapter
      const textualSecs = project.sections.filter((s) => s.type === 'textual');
      const explicitlyAssigned = project.crossReferences.filter(
        (c) => c.type === 'figura' && c.targetSectionId === sec.id
      );
      const cited = project.crossReferences.filter(
        (c) =>
          c.type === 'figura' &&
          sec.content &&
          (sec.content.includes(`[ref:${c.id}]`) || sec.content.includes(c.id)) &&
          !explicitlyAssigned.some((a) => a.id === c.id)
      );
      const unassigned = project.crossReferences.filter(
        (c) =>
          c.type === 'figura' &&
          !c.targetSectionId &&
          !project.sections.some(
            (s) => s.content && (s.content.includes(`[ref:${c.id}]`) || s.content.includes(c.id))
          )
      );
      const secIdx = textualSecs.findIndex((s) => s.id === sec.id);
      const distributed =
        unassigned.length > 0 && textualSecs.length > 0 && secIdx >= 0
          ? unassigned.filter((_, idx) => idx % textualSecs.length === secIdx)
          : [];

      const secFigures = [...explicitlyAssigned, ...cited, ...distributed];

      secFigures.forEach((fig) => {
        // Caption above figure: Figura X – Title (10pt, bold)
        textualChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 240, after: 120 },
            children: [
              new TextRun({
                text: `Figura ${fig.number} – ${fig.title}`,
                bold: true,
                font,
                size: 20,
              }),
            ],
          })
        );

        // Caption below figure: Fonte (10pt)
        textualChildren.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 120, after: 240 },
            children: [
              new TextRun({
                text: fig.source || 'Fonte: Elaborado pelo autor (2025).',
                font,
                size: 20,
              }),
            ],
          })
        );
      });
    }
  });

  // --- REFERÊNCIAS (NBR 6023:2018: Elemento Pós-Textual Obrigatório) ---
  if (project.references && project.references.length > 0) {
    textualChildren.push(
      new Paragraph({
        pageBreakBefore: true,
        children: [
          new TextRun({
            text: 'REFERÊNCIAS',
            bold: true,
            font,
            size: 24,
          }),
        ],
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.LEFT,
        spacing: { before: 240, after: 240, line: lineSpacing15 },
      })
    );

    project.references.forEach((ref) => {
      const formatted = ref.formattedABNT || formatABNTReference(ref);
      textualChildren.push(
        new Paragraph({
          children: [
            new TextRun({
              text: formatted,
              font,
              size: 24,
            }),
          ],
          alignment: AlignmentType.LEFT, // NBR 6023 mandates LEFT alignment, NOT justified
          spacing: { line: lineSpacingSingle, before: 0, after: 240 }, // Single line spacing with empty space between
        })
      );
    });
  }

  // --- APÊNDICES ---
  if (project.appendices && project.appendices.length > 0) {
    project.appendices.forEach((app, idx) => {
      const letter = String.fromCharCode(65 + idx); // A, B, C...
      textualChildren.push(
        new Paragraph({
          pageBreakBefore: true,
          children: [
            new TextRun({
              text: `APÊNDICE ${letter} – ${app.title.toUpperCase()}`,
              bold: true,
              font,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 240, line: lineSpacing15 },
        }),
        createBodyParagraph(app.content)
      );
    });
  }

  // --- ANEXOS ---
  if (project.annexes && project.annexes.length > 0) {
    project.annexes.forEach((ann, idx) => {
      const letter = String.fromCharCode(65 + idx);
      textualChildren.push(
        new Paragraph({
          pageBreakBefore: true,
          children: [
            new TextRun({
              text: `ANEXO ${letter} – ${ann.title.toUpperCase()}`,
              bold: true,
              font,
              size: 24,
            }),
          ],
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 240, line: lineSpacing15 },
        }),
        createBodyParagraph(ann.content)
      );
    });
  }

  // -------------------------------------------------------------
  // 3. COMPOSE WORD DOCUMENT WITH SECTIONS
  // -------------------------------------------------------------
  const doc = new Document({
    title: project.title,
    description: project.natureOfWork,
    styles: {
      default: {
        document: {
          run: {
            font,
            size: 24,
          },
          paragraph: {
            spacing: { line: lineSpacing15 },
          },
        },
      },
    },
    sections: [
      // SECTION 1: Pre-textual elements (No page number in header)
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210), // A4: 210mm
              height: convertMillimetersToTwip(297), // A4: 297mm
            },
            margin: margins,
          },
        },
        children: preTextualChildren.length > 0 ? preTextualChildren : [new Paragraph('')],
      },
      // SECTION 2: Textual & Post-textual elements (Header with Page Number on TOP RIGHT, 10pt)
      {
        properties: {
          page: {
            size: {
              width: convertMillimetersToTwip(210),
              height: convertMillimetersToTwip(297),
            },
            margin: margins,
            pageNumbers: {
              start: firstTextualPage,
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    font,
                    size: 20, // 10pt pagination per NBR 14724
                  }),
                ],
                spacing: { before: 0, after: 0, line: lineSpacingSingle },
              }),
            ],
          }),
        },
        children: textualChildren.length > 0 ? textualChildren : [new Paragraph('')],
      },
    ],
  });

  return doc;
}

/**
 * Generates an ABNT-compliant .docx Blob from a TCCProject.
 */
export async function generateDocxBlob(project: TCCProject): Promise<Blob> {
  const doc = createDocxDocument(project);
  return await Packer.toBlob(doc);
}

/**
 * High-level export helper: converts project to docx and triggers browser download
 */
export async function exportProjectToDocx(project: TCCProject): Promise<void> {
  const blob = await generateDocxBlob(project);
  const cleanTitle = project.title
    .slice(0, 35)
    .replace(/[^a-zA-Z0-9À-ÿ]/g, '_')
    .replace(/_+/g, '_');
  const filename = `${cleanTitle || 'TCC'}_ABNT.docx`;
  downloadBlob(blob, filename);
}
