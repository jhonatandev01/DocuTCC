import React, { useRef, useState } from 'react';
import {
  Printer,
  Download,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  Layers,
  HelpCircle,
} from 'lucide-react';
import { TCCProject } from '../types';
import {
  computeTableOfContents,
  resolveCrossReferences,
} from '../utils/abntFormatter';
import { exportProjectToDocx } from '../utils/exportDocx';
import jsPDF from 'jspdf';
import { toJpeg, toPng } from 'html-to-image';

interface ABNTDocumentPreviewProps {
  project: TCCProject;
  onPrint: () => void;
}

export const ABNTDocumentPreview: React.FC<ABNTDocumentPreviewProps> = ({
  project,
  onPrint,
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [isExportingPDF, setIsExportingPDF] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const documentRef = useRef<HTMLDivElement>(null);

  const toc = computeTableOfContents(project);
  const figures = project.crossReferences.filter((r) => r.type === 'figura');
  const tables = project.crossReferences.filter((r) => r.type === 'tabela' || r.type === 'quadro');

  // Font family style
  const fontClass =
    project.settings.fontFamily === 'Arial' ? 'font-abnt-sans' : 'font-abnt-serif';

  // Direct DOCX export using 'docx' library with full ABNT formatting preservation
  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportProjectToDocx(project);
    } catch (err) {
      console.error('Erro ao gerar documento .docx:', err);
      alert('Não foi possível gerar o arquivo Word (.docx). Verifique o console para mais detalhes.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  // Direct PDF generation using html-to-image & jsPDF (compatible with Tailwind v4 and modern color formats)
  const handleDirectDownloadPDF = async () => {
    if (!documentRef.current) return;
    try {
      setIsExportingPDF(true);

      const pages = documentRef.current.querySelectorAll('.abnt-page-sheet');
      if (pages.length === 0) {
        alert('Nenhuma página do documento encontrada para exportação.');
        return;
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      for (let i = 0; i < pages.length; i++) {
        const pageEl = pages[i] as HTMLElement;
        let imgData: string;
        try {
          imgData = await toJpeg(pageEl, {
            quality: 0.95,
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            skipFonts: true,
            cacheBust: true,
          });
        } catch (_jpegErr) {
          imgData = await toPng(pageEl, {
            backgroundColor: '#ffffff',
            pixelRatio: 2,
            skipFonts: true,
            cacheBust: true,
          });
        }

        if (i > 0) {
          pdf.addPage('a4', 'portrait');
        }
        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
      }

      const fileName = `${project.title
        .slice(0, 30)
        .replace(/[^a-zA-Z0-9]/g, '_')}_ABNT.pdf`;
      pdf.save(fileName);
    } catch (err) {
      console.error('Erro ao gerar PDF:', err);
      alert('Não foi possível renderizar o PDF direto. Você pode usar o botão "Imprimir / Salvar PDF" para salvar via navegador.');
    } finally {
      setIsExportingPDF(false);
    }
  };

  // Find page number for TOC item
  const getPageForSection = (sectionId: string): number => {
    const item = toc.find((t) => t.id === sectionId);
    return item ? item.pageNumber : 1;
  };

  return (
    <div className="space-y-4">
      {/* Top Preview Controls Bar */}
      <div className="no-print bg-slate-900/95 border border-slate-800 rounded-2xl p-4 shadow-xl flex flex-wrap items-center justify-between gap-3 sticky top-16 z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-amber-400" />
            Visualização ABNT NBR 14724:2011 (Folhas A4 Reais)
          </span>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
            Margens: 3-3-2-2 cm | Fonte: {project.settings.fontFamily} 12pt
          </span>
        </div>

        {/* Zoom & Print Buttons */}
        <div className="flex items-center gap-2">
          {/* Zoom controls */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs text-slate-300">
            <button
              type="button"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              className="p-1 hover:text-white"
              title="Reduzir Zoom"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="px-2 font-mono text-[11px]">{zoom}%</span>
            <button
              type="button"
              onClick={() => setZoom(Math.min(130, zoom + 10))}
              className="p-1 hover:text-white"
              title="Aumentar Zoom"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setZoom(100)}
              className="px-1.5 py-0.5 hover:text-white text-[10px] text-amber-400"
              title="Resetar para 100%"
            >
              100%
            </button>
          </div>

          {/* Export Word (.docx) ABNT */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm border border-blue-400/40 transition-all disabled:opacity-50 cursor-pointer"
            title="Exportar TCC para Microsoft Word (.docx) com margens e formatação ABNT preservadas"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span>{isExportingDocx ? 'Gerando .docx...' : 'Exportar Word (.docx)'}</span>
          </button>

          <button
            type="button"
            onClick={handleDirectDownloadPDF}
            disabled={isExportingPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
            title="Download direto do PDF gerado pelo sistema"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>{isExportingPDF ? 'Renderizando PDF...' : 'Baixar PDF'}</span>
          </button>

          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 shadow-sm transition-all"
            title="Abre diálogo do navegador para impressão ou Salvar em PDF"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir / Salvar PDF</span>
          </button>
        </div>
      </div>

      {/* Zoomable Container */}
      <div className="overflow-x-auto pb-12 flex justify-center bg-slate-950/80 rounded-2xl p-4 sm:p-8 border border-slate-800">
        <div
          ref={documentRef}
          style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top center' }}
          className={`space-y-8 transition-transform duration-150 abnt-print-container ${fontClass}`}
        >
          {/* ========================================================= */}
          {/* 1. CAPA (NBR 14724: Elemento Obrigatório) */}
          {/* ========================================================= */}
          {project.settings.includeCover && (
            <div className="abnt-page-sheet flex flex-col justify-between text-center select-text">
              {/* Top: Institution */}
              <div>
                <h2 className="text-[12pt] font-bold uppercase tracking-wider text-black">
                  {project.institution.name}
                </h2>
                {project.institution.facultyOrInstitute && (
                  <h3 className="text-[12pt] font-bold uppercase tracking-wider text-black mt-1">
                    {project.institution.facultyOrInstitute}
                  </h3>
                )}
                <h3 className="text-[12pt] font-bold uppercase tracking-wider text-black mt-1">
                  {project.institution.course}
                </h3>
              </div>

              {/* Author(s) */}
              <div className="mt-12">
                {project.authors.map((auth) => (
                  <div
                    key={auth.id}
                    className="text-[12pt] font-bold uppercase tracking-wide text-black"
                  >
                    {auth.name}
                  </div>
                ))}
              </div>

              {/* Center: Title & Subtitle */}
              <div className="my-auto py-12">
                <h1 className="text-[14pt] font-bold uppercase tracking-wide text-black leading-snug">
                  {project.title}
                </h1>
                {project.subtitle && (
                  <h2 className="text-[12pt] font-normal text-black mt-2">
                    {project.subtitle}
                  </h2>
                )}
              </div>

              {/* Bottom: City & Year */}
              <div className="mt-auto">
                <div className="text-[12pt] font-bold uppercase text-black">
                  {project.city}
                </div>
                <div className="text-[12pt] font-bold text-black mt-1">
                  {project.year}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. FOLHA DE ROSTO (NBR 14724: Elemento Obrigatório) */}
          {/* ========================================================= */}
          {project.settings.includeTitlePage && (
            <div className="abnt-page-sheet flex flex-col justify-between text-center select-text page-break-before">
              {/* Authors */}
              <div>
                {project.authors.map((auth) => (
                  <div
                    key={auth.id}
                    className="text-[12pt] font-bold uppercase tracking-wide text-black"
                  >
                    {auth.name}
                  </div>
                ))}
              </div>

              {/* Title & Subtitle */}
              <div className="mt-16">
                <h1 className="text-[14pt] font-bold uppercase tracking-wide text-black leading-snug">
                  {project.title}
                </h1>
                {project.subtitle && (
                  <h2 className="text-[12pt] font-normal text-black mt-2">
                    {project.subtitle}
                  </h2>
                )}
              </div>

              {/* Nature of work: recuo de 8cm da margem esquerda (lado direito da folha) */}
              <div className="my-auto py-8">
                <div className="abnt-nature-box ml-auto w-[55%] text-justify text-[10pt] leading-[1.2] text-black">
                  <p className="whitespace-pre-line">{project.natureOfWork}</p>
                  <p className="mt-4">
                    <strong>Orientador:</strong> {project.advisor.name}
                  </p>
                  {project.coAdvisor?.name && (
                    <p className="mt-1">
                      <strong>Coorientador:</strong> {project.coAdvisor.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Bottom: City & Year */}
              <div className="mt-auto">
                <div className="text-[12pt] font-bold uppercase text-black">
                  {project.city}
                </div>
                <div className="text-[12pt] font-bold text-black mt-1">
                  {project.year}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 3. FOLHA DE APROVAÇÃO (NBR 14724: Elemento Obrigatório para TCC defendido) */}
          {/* ========================================================= */}
          {project.settings.includeApprovalSheet && (
            <div className="abnt-page-sheet flex flex-col justify-between text-center select-text page-break-before">
              {/* Author */}
              <div>
                {project.authors.map((auth) => (
                  <div
                    key={auth.id}
                    className="text-[12pt] font-bold uppercase tracking-wide text-black"
                  >
                    {auth.name}
                  </div>
                ))}
              </div>

              {/* Title */}
              <div className="mt-6">
                <h1 className="text-[13pt] font-bold uppercase tracking-wide text-black">
                  {project.title}
                </h1>
                {project.subtitle && (
                  <h2 className="text-[12pt] font-normal text-black mt-1">
                    {project.subtitle}
                  </h2>
                )}
              </div>

              {/* Nature note */}
              <div className="my-4">
                <div className="abnt-nature-box ml-auto w-[55%] text-justify text-[10pt] leading-[1.2] text-black">
                  <p className="whitespace-pre-line">{project.natureOfWork}</p>
                </div>
              </div>

              {/* Approval Date */}
              <div className="text-center text-[11pt] text-black my-4">
                Aprovado em: {project.submissionDate || '____ de _______________ de 2025'}.
              </div>

              {/* Examination Board Signatures */}
              <div className="space-y-8 my-auto pt-4">
                <div className="text-[11pt] font-bold uppercase text-black mb-4">
                  BANCA EXAMINADORA
                </div>

                {project.examinationBoard.map((member) => (
                  <div key={member.id} className="max-w-md mx-auto text-center">
                    <div className="border-t border-black pt-1">
                      <div className="text-[11pt] font-bold text-black">
                        {member.name}
                      </div>
                      <div className="text-[10pt] text-black">
                        {member.title} – {member.institution}
                      </div>
                      <div className="text-[10pt] italic text-black">
                        {member.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-auto pt-4">
                <div className="text-[12pt] font-bold uppercase text-black">
                  {project.city}
                </div>
                <div className="text-[12pt] font-bold text-black">
                  {project.year}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 4. DEDICATÓRIA & EPÍGRAFE */}
          {/* ========================================================= */}
          {project.settings.includeDedication && project.dedication && (
            <div className="abnt-page-sheet flex flex-col justify-end select-text page-break-before">
              <div className="ml-auto w-[55%] text-justify text-[12pt] leading-[1.5] text-black mb-12 italic">
                {project.dedication}
              </div>
            </div>
          )}

          {project.settings.includeAcknowledgments && project.acknowledgments && (
            <div className="abnt-page-sheet select-text page-break-before">
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                AGRADECIMENTOS
              </h2>
              <div className="space-y-4 text-justify text-[12pt] leading-[1.5] text-black">
                {project.acknowledgments.split('\n\n').map((p, idx) => (
                  <p key={idx} className="abnt-paragraph" style={{ textIndent: '1.25cm' }}>
                    {p}
                  </p>
                ))}
              </div>
            </div>
          )}

          {project.settings.includeEpigraph && project.epigraph?.quote && (
            <div className="abnt-page-sheet flex flex-col justify-end select-text page-break-before">
              <div className="ml-auto w-[55%] text-justify text-[12pt] leading-[1.5] text-black mb-12">
                <p className="italic">“{project.epigraph.quote}”</p>
                <p className="text-right font-bold mt-2">
                  ({project.epigraph.author}
                  {project.epigraph.year ? `, ${project.epigraph.year}` : ''})
                </p>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 5. RESUMO (NBR 6028) */}
          {/* ========================================================= */}
          {project.settings.includeResumo && project.resumo?.text && (
            <div className="abnt-page-sheet select-text page-break-before">
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                RESUMO
              </h2>
              <p className="text-justify text-[12pt] leading-[1.5] text-black">
                {project.resumo.text}
              </p>
              <div className="mt-8 text-[12pt] leading-[1.5] text-black">
                <strong>Palavras-chave:</strong>{' '}
                {project.resumo.keywords.join('. ')}.
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. ABSTRACT */}
          {/* ========================================================= */}
          {project.settings.includeAbstract && project.abstract?.text && (
            <div className="abnt-page-sheet select-text page-break-before">
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                ABSTRACT
              </h2>
              <p className="text-justify text-[12pt] leading-[1.5] text-black">
                {project.abstract.text}
              </p>
              <div className="mt-8 text-[12pt] leading-[1.5] text-black">
                <strong>Keywords:</strong>{' '}
                {project.abstract.keywords.join('. ')}.
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 7. LISTA DE ILUSTRAÇÕES (FIGURAS) */}
          {/* ========================================================= */}
          {project.settings.includeListOfFigures && figures.length > 0 && (
            <div className="abnt-page-sheet select-text page-break-before">
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                LISTA DE ILUSTRAÇÕES
              </h2>
              <div className="space-y-3 text-[12pt] leading-[1.5] text-black">
                {figures.map((fig) => (
                  <div key={fig.id} className="flex justify-between items-baseline gap-2">
                    <span className="truncate">
                      Figura {fig.number} – {fig.title}
                    </span>
                    <span className="flex-1 border-b border-dotted border-black mx-1"></span>
                    <span>{getPageForSection(project.sections[0]?.id || '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 8. LISTA DE TABELAS */}
          {/* ========================================================= */}
          {project.settings.includeListOfTables && tables.length > 0 && (
            <div className="abnt-page-sheet select-text page-break-before">
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                LISTA DE TABELAS
              </h2>
              <div className="space-y-3 text-[12pt] leading-[1.5] text-black">
                {tables.map((tab) => (
                  <div key={tab.id} className="flex justify-between items-baseline gap-2">
                    <span className="truncate">
                      {tab.type === 'tabela' ? 'Tabela' : 'Quadro'} {tab.number} –{' '}
                      {tab.title}
                    </span>
                    <span className="flex-1 border-b border-dotted border-black mx-1"></span>
                    <span>{getPageForSection(project.sections[0]?.id || '')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 9. LISTA DE SIGLAS E ABREVIATURAS */}
          {/* ========================================================= */}
          {project.settings.includeListOfAcronyms && project.acronyms.length > 0 && (
            <div className="abnt-page-sheet select-text page-break-before">
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                LISTA DE ABREVIATURAS E SIGLAS
              </h2>
              <div className="space-y-2 text-[12pt] leading-[1.5] text-black">
                {project.acronyms.map((acr) => (
                  <div key={acr.id} className="flex gap-4">
                    <span className="font-bold min-w-[80px]">{acr.acronym}</span>
                    <span>{acr.definition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 10. SUMÁRIO AUTOMÁTICO (NBR 6027) */}
          {/* ========================================================= */}
          {project.settings.includeTableOfContents && (
            <div className="abnt-page-sheet select-text page-break-before">
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                SUMÁRIO
              </h2>
              <div className="space-y-2 text-[12pt] leading-[1.5] text-black">
                {toc.map((item) => (
                  <div
                    key={item.id}
                    className={`flex justify-between items-baseline gap-2 ${
                      item.isPrimaria ? 'font-bold uppercase mt-3' : 'font-normal pl-4'
                    }`}
                  >
                    <span className="truncate">
                      {item.number ? `${item.number} ` : ''}
                      {item.title}
                    </span>
                    <span className="flex-1 border-b border-dotted border-black mx-1"></span>
                    <span className="font-bold">{item.pageNumber}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 11. ELEMENTOS TEXTUAIS (CAPÍTULOS DO TCC) */}
          {/* ========================================================= */}
          {project.sections.map((section, secIdx) => {
            const pageNumber = getPageForSection(section.id);
            const isPrimary = section.level === 1;

            return (
              <div
                key={section.id}
                className={`abnt-page-sheet select-text relative ${
                  isPrimary ? 'page-break-before' : ''
                }`}
              >
                {/* ABNT Page Number (Top Right Corner at 2cm from top edge) */}
                <div className="absolute top-[20mm] right-[20mm] text-[10pt] font-normal text-black select-none">
                  {pageNumber}
                </div>

                {/* Section Heading */}
                <div className="mb-6">
                  {isPrimary ? (
                    <h2 className="text-[12pt] font-bold uppercase text-black leading-snug">
                      {section.number} {section.title}
                    </h2>
                  ) : section.level === 2 ? (
                    <h3 className="text-[12pt] font-normal uppercase text-black leading-snug mt-6">
                      {section.number} {section.title}
                    </h3>
                  ) : (
                    <h4 className="text-[12pt] font-bold text-black leading-snug mt-4">
                      {section.number} {section.title}
                    </h4>
                  )}
                </div>

                {/* Section Content Paragraphs */}
                <div className="space-y-4 text-justify text-[12pt] leading-[1.5] text-black">
                  {section.content.split('\n\n').map((para, pIdx) => {
                    const trimmed = para.trim();
                    if (!trimmed) return null;

                    // Direct Long Quote (> 3 lines, indented 4cm, font 10, single line-height)
                    if (trimmed.startsWith('>')) {
                      const quoteText = trimmed.replace(/^>\s*/, '');
                      return (
                        <div
                          key={pIdx}
                          className="abnt-quote-long ml-[4cm] text-[10pt] leading-[1.0] text-justify my-4 text-black"
                        >
                          {resolveCrossReferences(quoteText, project.crossReferences)}
                        </div>
                      );
                    }

                    return (
                      <p
                        key={pIdx}
                        className="abnt-paragraph text-[12pt] leading-[1.5] text-justify text-black"
                        style={{ textIndent: '1.25cm' }}
                      >
                        {resolveCrossReferences(trimmed, project.crossReferences)}
                      </p>
                    );
                  })}
                </div>

                {/* Inline Figures & Tables associated with this chapter */}
                {(() => {
                  // Get figures and tables for this section
                  const explicitlyAssignedFigures = figures.filter((f) => f.targetSectionId === section.id);
                  const citedFigures = figures.filter(
                    (f) =>
                      section.content &&
                      (section.content.includes(`[ref:${f.id}]`) || section.content.includes(f.id)) &&
                      !explicitlyAssignedFigures.some((a) => a.id === f.id)
                  );
                  const unassignedFigures = figures.filter(
                    (f) =>
                      !f.targetSectionId &&
                      !project.sections.some(
                        (s) => s.content && (s.content.includes(`[ref:${f.id}]`) || s.content.includes(f.id))
                      )
                  );
                  const distributedFigures =
                    unassignedFigures.length > 0 && project.sections.length > 0
                      ? unassignedFigures.filter((_, idx) => idx % project.sections.length === secIdx)
                      : [];

                  const sectionFigures = [
                    ...explicitlyAssignedFigures,
                    ...citedFigures,
                    ...distributedFigures,
                  ];

                  const explicitlyAssignedTables = tables.filter((t) => t.targetSectionId === section.id);
                  const citedTables = tables.filter(
                    (t) =>
                      section.content &&
                      (section.content.includes(`[ref:${t.id}]`) || section.content.includes(t.id)) &&
                      !explicitlyAssignedTables.some((a) => a.id === t.id)
                  );
                  const unassignedTables = tables.filter(
                    (t) =>
                      !t.targetSectionId &&
                      !project.sections.some(
                        (s) => s.content && (s.content.includes(`[ref:${t.id}]`) || s.content.includes(t.id))
                      )
                  );
                  const distributedTables =
                    unassignedTables.length > 0 && project.sections.length > 0
                      ? unassignedTables.filter((_, idx) => idx % project.sections.length === secIdx)
                      : [];

                  const sectionTables = [
                    ...explicitlyAssignedTables,
                    ...citedTables,
                    ...distributedTables,
                  ];

                  return (
                    <>
                      {/* Render all figures for this section */}
                      {sectionFigures.map((fig) => (
                        <div key={fig.id} className="my-8 text-center page-break-avoid">
                          <div className="text-[10pt] font-semibold text-black mb-1">
                            Figura {fig.number} – {fig.title}
                          </div>
                          {fig.contentUrl ? (
                            <img
                              src={fig.contentUrl}
                              alt={fig.title}
                              className="max-h-72 max-w-full mx-auto object-contain my-2 border border-slate-300 shadow-2xs"
                            />
                          ) : (
                            <div className="w-full max-w-md mx-auto h-28 bg-slate-100 border border-dashed border-slate-300 rounded flex items-center justify-center text-xs text-slate-500 italic my-2">
                              [Ilustração: {fig.title}]
                            </div>
                          )}
                          <div className="text-[10pt] text-black mt-1">
                            {fig.source || 'Fonte: Elaborado pelo autor (2025).'}
                          </div>
                          {fig.notes && (
                            <div className="text-[9pt] text-slate-700 mt-0.5 italic">
                              Nota: {fig.notes}
                            </div>
                          )}
                        </div>
                      ))}

                      {/* Render all tables for this section */}
                      {sectionTables.map((tab) => (
                        <div key={tab.id} className="my-8 text-center page-break-avoid">
                          <div className="text-[10pt] font-semibold text-black mb-1">
                            {tab.type === 'quadro' ? 'Quadro' : 'Tabela'} {tab.number} – {tab.title}
                          </div>
                          {tab.tableHeaders && (
                            <div className="overflow-x-auto max-w-full my-2">
                              <table className="w-full text-left border-collapse text-[10pt] text-black border-t-2 border-b-2 border-black">
                                <thead>
                                  <tr className="border-b border-black">
                                    {tab.tableHeaders.map((h, i) => (
                                      <th key={i} className="p-2 font-bold">
                                        {h}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {tab.tableRows?.map((r, ri) => (
                                    <tr key={ri} className="border-b border-slate-300">
                                      {r.map((c, ci) => (
                                        <td key={ci} className="p-2">
                                          {c}
                                        </td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                          <div className="text-[10pt] text-black mt-1">
                            {tab.source || 'Fonte: Elaborado pelo autor (2025).'}
                          </div>
                        </div>
                      ))}
                    </>
                  );
                })()}
              </div>
            );
          })}

          {/* ========================================================= */}
          {/* 12. REFERÊNCIAS BIBLIOGRÁFICAS (NBR 6023) */}
          {/* ========================================================= */}
          {project.references.length > 0 && (
            <div className="abnt-page-sheet select-text page-break-before relative">
              {/* Page number */}
              <div className="absolute top-[20mm] right-[20mm] text-[10pt] font-normal text-black select-none">
                {getPageForSection('referencias')}
              </div>

              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                REFERÊNCIAS
              </h2>

              {/* NBR 6023: Alinhadas à esquerda, espaçamento simples, espaço entre referências */}
              <div className="space-y-4 text-left text-[12pt] leading-[1.0] text-black">
                {project.references.map((ref) => (
                  <p key={ref.id} className="text-justify leading-tight">
                    {ref.formattedABNT}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 13. APÊNDICES & ANEXOS */}
          {/* ========================================================= */}
          {project.appendices.map((app) => (
            <div
              key={app.id}
              className="abnt-page-sheet select-text page-break-before relative"
            >
              <div className="absolute top-[20mm] right-[20mm] text-[10pt] font-normal text-black select-none">
                {getPageForSection(app.id)}
              </div>
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                APÊNDICE {app.letter} – {app.title}
              </h2>
              <div className="text-justify text-[12pt] leading-[1.5] text-black">
                {app.content}
              </div>
            </div>
          ))}

          {project.annexes.map((ann) => (
            <div
              key={ann.id}
              className="abnt-page-sheet select-text page-break-before relative"
            >
              <div className="absolute top-[20mm] right-[20mm] text-[10pt] font-normal text-black select-none">
                {getPageForSection(ann.id)}
              </div>
              <h2 className="text-[12pt] font-bold uppercase text-center text-black mb-8">
                ANEXO {ann.letter} – {ann.title}
              </h2>
              <div className="text-justify text-[12pt] leading-[1.5] text-black">
                {ann.content}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
