import React, { useState, useRef } from 'react';
import {
  FileText,
  Plus,
  Trash2,
  ChevronRight,
  ChevronDown,
  Quote,
  Layers,
  Sparkles,
  MoveUp,
  MoveDown,
  Bookmark,
  CheckCircle,
  Eye,
  Edit3,
  Upload,
  Image as ImageIcon,
  Wand2,
  PlusCircle,
  CheckCircle2,
  Loader2,
  Send,
  X,
} from 'lucide-react';
import { TCCProject, TCCSection, ABNTReference, CrossReferenceItem } from '../types';
import { resolveCrossReferences } from '../utils/abntFormatter';

interface SectionEditorProps {
  project: TCCProject;
  onChange: (updatedProject: TCCProject) => void;
  onOpenAIAssistantWithText?: (text: string, context: string) => void;
}

export const SectionEditor: React.FC<SectionEditorProps> = ({
  project,
  onChange,
  onOpenAIAssistantWithText,
}) => {
  const [selectedSectionId, setSelectedSectionId] = useState<string>(
    project.sections[0]?.id || ''
  );
  const [showCitationModal, setShowCitationModal] = useState<boolean>(false);
  const [showCrossRefModal, setShowCrossRefModal] = useState<boolean>(false);
  const [citationType, setCitationType] = useState<'curta' | 'longa' | 'indireta' | 'narrativa'>('curta');
  const [selectedRefId, setSelectedRefId] = useState<string>('');
  const [citationPage, setCitationPage] = useState<string>('42');
  const [citationQuoteText, setCitationQuoteText] = useState<string>('');
  const [viewMode, setViewMode] = useState<'editor' | 'preview'>('editor');
  const [isExpandingWithAI, setIsExpandingWithAI] = useState<boolean>(false);

  // AI info integration modal state
  const [showEnrichModal, setShowEnrichModal] = useState<boolean>(false);
  const [userExtraInfo, setUserExtraInfo] = useState<string>('');
  const [isIntegratingExtraInfo, setIsIntegratingExtraInfo] = useState<boolean>(false);
  const directFileInputRef = useRef<HTMLInputElement>(null);

  const activeSection = project.sections.find((s) => s.id === selectedSectionId) || project.sections[0];

  const handleIntegrateExtraInfo = async () => {
    if (!userExtraInfo.trim() || !activeSection) return;
    setIsIntegratingExtraInfo(true);
    try {
      const res = await fetch('/api/gemini/integrate-user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentContent: activeSection.content || '',
          sectionTitle: activeSection.title,
          tccContext: `Título: ${project.title}. Curso: ${project.course || ''}`,
          userProvidedInfo: userExtraInfo,
        }),
      });
      const data = await res.json();
      if (data.result?.updatedContent) {
        const updated = project.sections.map((s) =>
          s.id === activeSection.id ? { ...s, content: data.result.updatedContent } : s
        );
        onChange({ ...project, sections: updated, lastModified: new Date().toISOString() });
        setShowEnrichModal(false);
        setUserExtraInfo('');
      }
    } catch (err) {
      console.error('Erro ao integrar informações:', err);
      alert('Erro ao integrar informações no texto.');
    } finally {
      setIsIntegratingExtraInfo(false);
    }
  };

  const handleDirectImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !activeSection) return;
    const fileList: File[] = Array.from(files);
    const readers = fileList.map((file) => {
      return new Promise<{ name: string; dataUrl: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => {
          resolve({
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            dataUrl: (ev.target?.result as string) || '',
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      const existingFigures = project.crossReferences.filter((c) => c.type === 'figura');
      const startNumber = existingFigures.length + 1;

      const newFigures: CrossReferenceItem[] = results.map((res, idx) => ({
        id: `fig-${Date.now()}-${idx}`,
        type: 'figura',
        number: startNumber + idx,
        title: res.name ? res.name.charAt(0).toUpperCase() + res.name.slice(1) : `Figura ${startNumber + idx}`,
        source: 'Fonte: Elaborado pelo autor (2025).',
        contentUrl: res.dataUrl,
        targetSectionId: activeSection.id,
      }));

      // Append reference tags to active section
      const refTags = newFigures.map((f) => `[ref:${f.id}]`).join('\n\n');
      const updatedContent = activeSection.content ? `${activeSection.content.trim()}\n\n${refTags}` : refTags;

      const updatedSections = project.sections.map((s) => s.id === activeSection.id ? { ...s, content: updatedContent } : s);
      const updatedRefs = [...project.crossReferences, ...newFigures];

      onChange({
        ...project,
        sections: updatedSections,
        crossReferences: updatedRefs,
        lastModified: new Date().toISOString(),
      });
    });
    e.target.value = '';
  };

  const handleExpandSectionWithAI = async () => {
    if (!activeSection) return;
    setIsExpandingWithAI(true);
    try {
      const response = await fetch('/api/gemini/expand-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionTitle: `${activeSection.number} ${activeSection.title}`,
          currentContent: activeSection.content,
          projectContext: `TCC: ${project.title} (${project.documentType}). Curso: ${project.institution.course}.`,
          specificInstruction: 'Aprofunde a argumentação científica com linguagem impessoal e citações em conformidade com as normas ABNT NBR 10520.',
        }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.expandedContent) {
          const updated = project.sections.map((s) =>
            s.id === activeSection.id ? { ...s, content: data.expandedContent } : s
          );
          onChange({ ...project, sections: updated, lastModified: new Date().toISOString() });
        }
      }
    } catch (err) {
      console.error('Erro ao expandir seção:', err);
    } finally {
      setIsExpandingWithAI(false);
    }
  };

  // Add new section
  const handleAddSection = (level: 1 | 2 | 3 = 1) => {
    const nextNumber = `${project.sections.filter(s => s.level === 1).length + 1}`;
    const newSection: TCCSection = {
      id: `sec-${Date.now()}`,
      number: level === 1 ? nextNumber : `${nextNumber}.1`,
      title: level === 1 ? 'NOVO CAPÍTULO' : 'Nova Subseção',
      level,
      type: 'textual',
      content: 'Redija aqui o conteúdo acadêmico deste capítulo ou subseção seguindo as normas da ABNT NBR 14724...',
    };

    const updatedSections = [...project.sections, newSection];
    onChange({
      ...project,
      sections: updatedSections,
      lastModified: new Date().toISOString(),
    });
    setSelectedSectionId(newSection.id);
  };

  // Delete section
  const handleDeleteSection = (id: string) => {
    if (project.sections.length <= 1) return;
    const remaining = project.sections.filter((s) => s.id !== id);
    onChange({
      ...project,
      sections: remaining,
      lastModified: new Date().toISOString(),
    });
    if (selectedSectionId === id) {
      setSelectedSectionId(remaining[0]?.id || '');
    }
  };

  // Move section up/down
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= project.sections.length) return;

    const sections = [...project.sections];
    const temp = sections[index];
    sections[index] = sections[targetIndex];
    sections[targetIndex] = temp;

    onChange({
      ...project,
      sections,
      lastModified: new Date().toISOString(),
    });
  };

  // Insert citation into active section
  const handleInsertCitation = () => {
    const ref = project.references.find((r) => r.id === selectedRefId);
    if (!ref || !activeSection) return;

    let citationString = '';
    const authorUpper = ref.authors.split(';')[0]?.split(',')[0]?.trim().toUpperCase() || 'AUTOR';
    const authorCap = authorUpper.charAt(0) + authorUpper.slice(1).toLowerCase();
    const pageSuffix = citationPage ? `, p. ${citationPage.trim()}` : '';

    if (citationType === 'curta') {
      const quote = citationQuoteText.trim() || 'texto da citação direta curta';
      citationString = `"${quote}" (${authorUpper}, ${ref.year}${pageSuffix})`;
    } else if (citationType === 'longa') {
      const quote = citationQuoteText.trim() || 'Texto da citação direta longa com mais de três linhas, que deve ser apresentado em parágrafo isolado com recuo de quatro centímetros da margem esquerda, fonte tamanho dez e espaçamento simples entre as linhas.';
      citationString = `\n\n> ${quote} (${authorUpper}, ${ref.year}${pageSuffix})\n\n`;
    } else if (citationType === 'indireta') {
      citationString = `(${authorUpper}, ${ref.year})`;
    } else if (citationType === 'narrativa') {
      citationString = `Segundo ${authorCap} (${ref.year}${pageSuffix})`;
    }

    const updatedContent = activeSection.content
      ? `${activeSection.content} ${citationString}`
      : citationString;

    const updatedSections = project.sections.map((s) =>
      s.id === activeSection.id ? { ...s, content: updatedContent } : s
    );

    onChange({
      ...project,
      sections: updatedSections,
      lastModified: new Date().toISOString(),
    });

    setShowCitationModal(false);
    setCitationQuoteText('');
  };

  // Insert cross reference into active section
  const handleInsertCrossRef = (item: CrossReferenceItem) => {
    if (!activeSection) return;
    const token = `[ref:${item.id}]`;
    const updatedContent = activeSection.content
      ? `${activeSection.content} conforme demonstrado na ${token}`
      : `Ver ${token}`;

    const updatedSections = project.sections.map((s) =>
      s.id === activeSection.id ? { ...s, content: updatedContent } : s
    );

    onChange({
      ...project,
      sections: updatedSections,
      lastModified: new Date().toISOString(),
    });

    setShowCrossRefModal(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* LEFT COLUMN: Section Directory */}
      <div className="lg:col-span-4 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-slate-200 uppercase tracking-wide">
              Capítulos & Estrutura
            </h2>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleAddSection(1)}
              className="flex items-center gap-1 text-[11px] bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2.5 py-1 rounded-lg transition-colors font-medium"
              title="Adicionar Capítulo Primário (Novo Número)"
            >
              <Plus className="w-3 h-3" /> Capítulo
            </button>
            <button
              type="button"
              onClick={() => handleAddSection(2)}
              className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 px-2 py-1 rounded-lg transition-colors font-medium"
              title="Adicionar Subseção (ex: 1.1)"
            >
              <Plus className="w-3 h-3" /> Subseção
            </button>
          </div>
        </div>

        <div className="p-3 space-y-1.5 max-h-[calc(100vh-280px)] overflow-y-auto">
          {project.sections.map((section, index) => {
            const isSelected = section.id === selectedSectionId;
            return (
              <div
                key={section.id}
                className={`group flex items-center justify-between p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/70 border border-transparent'
                }`}
                onClick={() => setSelectedSectionId(section.id)}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <span
                    className={`font-mono text-[11px] ${
                      section.level === 1 ? 'text-amber-400 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {section.number || '•'}
                  </span>
                  <span
                    className={`truncate ${
                      section.level === 1 ? 'uppercase' : ''
                    }`}
                  >
                    {section.title || 'Sem título'}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveSection(index, 'up');
                    }}
                    disabled={index === 0}
                    className="p-1 hover:text-white disabled:opacity-30"
                    title="Mover para cima"
                  >
                    <MoveUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMoveSection(index, 'down');
                    }}
                    disabled={index === project.sections.length - 1}
                    className="p-1 hover:text-white disabled:opacity-30"
                    title="Mover para baixo"
                  >
                    <MoveDown className="w-3 h-3" />
                  </button>
                  {project.sections.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSection(section.id);
                      }}
                      className="p-1 text-rose-400 hover:text-rose-300"
                      title="Excluir capítulo"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* RIGHT COLUMN: Active Section Editor */}
      {activeSection && (
        <div className="lg:col-span-8 bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden space-y-4">
          {/* Section Heading & Controls */}
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[200px]">
              <input
                type="text"
                value={activeSection.number}
                onChange={(e) => {
                  const updated = project.sections.map((s) =>
                    s.id === activeSection.id ? { ...s, number: e.target.value } : s
                  );
                  onChange({ ...project, sections: updated });
                }}
                className="w-16 bg-slate-800 text-amber-400 font-mono font-bold text-xs border border-slate-700 rounded-lg px-2 py-1.5 focus:border-amber-500 text-center"
                placeholder="Ex: 1"
                title="Numeração ABNT da seção"
              />
              <input
                type="text"
                value={activeSection.title}
                onChange={(e) => {
                  const val = activeSection.level === 1 ? e.target.value.toUpperCase() : e.target.value;
                  const updated = project.sections.map((s) =>
                    s.id === activeSection.id ? { ...s, title: val } : s
                  );
                  onChange({ ...project, sections: updated });
                }}
                className={`flex-1 bg-slate-800 text-slate-100 font-bold text-xs border border-slate-700 rounded-lg px-3 py-1.5 focus:border-amber-500 ${
                  activeSection.level === 1 ? 'uppercase' : ''
                }`}
                placeholder="TÍTULO DA SEÇÃO"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={activeSection.level}
                onChange={(e) => {
                  const lvl = parseInt(e.target.value, 10) as 1 | 2 | 3;
                  const updated = project.sections.map((s) =>
                    s.id === activeSection.id
                      ? {
                          ...s,
                          level: lvl,
                          title: lvl === 1 ? s.title.toUpperCase() : s.title,
                        }
                      : s
                  );
                  onChange({ ...project, sections: updated });
                }}
                className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-amber-500"
                title="Nível hierárquico da seção ABNT"
              >
                <option value={1}>1 Primária (CAIXA ALTA NEGRITO - Nova Folha)</option>
                <option value={2}>2 Secundária (CAIXA ALTA SEM NEGRITO)</option>
                <option value={3}>3 Terciária (Caixa Baixa Negrito)</option>
              </select>

              {/* Toggle Editor / Preview */}
              <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                <button
                  type="button"
                  onClick={() => setViewMode('editor')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'editor'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Edit3 className="w-3 h-3" /> Editor
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Eye className="w-3 h-3" /> ABNT
                </button>
              </div>
            </div>
          </div>

          {/* Quick ABNT Writing Toolbar */}
          <div className="px-4 py-2 border-b border-slate-800 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mr-1">
              Inserção Rápida ABNT:
            </span>

            {/* Inserir Citação */}
            <button
              type="button"
              onClick={() => {
                if (project.references.length === 0) {
                  alert('Cadastre referências primeiro na aba "Citações & NBR 6023" para inseri-las automaticamente.');
                  return;
                }
                setSelectedRefId(project.references[0]?.id || '');
                setShowCitationModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 font-medium transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-amber-400" />
              <span>Inserir Citação (NBR 10520)</span>
            </button>

            {/* Inserir Referência Cruzada */}
            <button
              type="button"
              onClick={() => {
                if (project.crossReferences.length === 0) {
                  alert('Adicione ilustrações na aba "Referências Cruzadas" para inseri-las no texto.');
                  return;
                }
                setShowCrossRefModal(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-blue-300 border border-blue-500/30 font-medium transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Inserir Ref. Cruzada (Figura/Tabela)</span>
            </button>

            {/* Adicionar Imagens Diretamente nesta Seção */}
            <input
              ref={directFileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleDirectImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => directFileInputRef.current?.click()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/70 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-500/40 font-medium transition-colors"
              title="Faça upload de 1 ou várias imagens diretamente para este capítulo"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-400" />
              <span>Adicionar Figuras</span>
            </button>

            {/* Implementar Informações do Usuário com IA */}
            <button
              type="button"
              onClick={() => setShowEnrichModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/80 text-indigo-300 border border-indigo-500/40 font-medium transition-colors"
              title="Implemente novas informações, dados de experimentos ou observações com IA no texto"
            >
              <Wand2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Implementar Informações (IA)</span>
            </button>

            {/* Expandir Seção com IA */}
            <button
              type="button"
              onClick={handleExpandSectionWithAI}
              disabled={isExpandingWithAI}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/40 font-medium transition-colors ml-auto disabled:opacity-50"
              title="Aprofunda o conteúdo desta seção com argumentação científica e referencial teórico"
            >
              <Sparkles className={`w-3.5 h-3.5 text-indigo-400 ${isExpandingWithAI ? 'animate-spin' : ''}`} />
              <span>{isExpandingWithAI ? 'Expandindo com IA...' : 'Expandir com IA'}</span>
            </button>

            {/* Refinar com IA */}
            {onOpenAIAssistantWithText && (
              <button
                type="button"
                onClick={() => {
                  onOpenAIAssistantWithText(activeSection.content, activeSection.title);
                }}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 font-medium transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Refinar Texto</span>
              </button>
            )}
          </div>

          {/* Section Figures Quick Ribbon */}
          {(() => {
            const sectionFigures = project.crossReferences.filter(
              (c) =>
                c.type === 'figura' &&
                (c.targetSectionId === activeSection.id ||
                  (activeSection.content && activeSection.content.includes(c.id)))
            );
            if (sectionFigures.length === 0) return null;
            return (
              <div className="px-3 py-2 bg-slate-900 border-b border-slate-800 flex items-center gap-2 text-xs overflow-x-auto">
                <span className="text-slate-400 font-semibold shrink-0 text-[11px] flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                  Figuras deste capítulo ({sectionFigures.length}):
                </span>
                {sectionFigures.map((fig) => (
                  <div
                    key={fig.id}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-200 text-[11px] shrink-0"
                  >
                    {fig.contentUrl && (
                      <img
                        src={fig.contentUrl}
                        alt={fig.title}
                        className="w-4 h-4 rounded object-cover border border-slate-600"
                      />
                    )}
                    <span className="font-bold text-amber-400">Fig. {fig.number}</span>
                    <span className="max-w-[130px] truncate text-slate-300">{fig.title}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const tag = `[ref:${fig.id}]`;
                        if (!activeSection.content.includes(tag)) {
                          const newContent = `${activeSection.content.trim()}\n\n${tag}`;
                          const updated = project.sections.map((s) =>
                            s.id === activeSection.id ? { ...s, content: newContent } : s
                          );
                          onChange({
                            ...project,
                            sections: updated,
                            lastModified: new Date().toISOString(),
                          });
                        }
                      }}
                      className="text-blue-400 hover:text-blue-300 font-bold ml-1 text-[10px]"
                      title="Inserir citação no texto"
                    >
                      +Citar
                    </button>
                  </div>
                ))}
              </div>
            );
          })()}

          {/* Editor Body or Preview Body */}
          <div className="p-4">
            {viewMode === 'editor' ? (
              <div className="space-y-2">
                <textarea
                  rows={18}
                  value={activeSection.content}
                  onChange={(e) => {
                    const updated = project.sections.map((s) =>
                      s.id === activeSection.id ? { ...s, content: e.target.value } : s
                    );
                    onChange({ ...project, sections: updated });
                  }}
                  className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-4 text-xs font-mono focus:outline-none focus:border-amber-500 leading-relaxed"
                  placeholder="Redija o texto aqui. Use linhas em branco para separar parágrafos. Citações longas (> 3 linhas) devem começar com '> ' no início da linha."
                />
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <span>
                    Dica: use <code className="text-amber-400">&gt; texto da citação</code> para blocos de citação longa com recuo de 4cm.
                  </span>
                  <span>
                    {activeSection.content
                      ? activeSection.content.trim().split(/\s+/).filter(Boolean).length
                      : 0}{' '}
                    palavras
                  </span>
                </div>
              </div>
            ) : (
              /* Single Section Live ABNT View */
              <div className="p-6 bg-white text-slate-900 rounded-xl border border-slate-200 shadow-inner font-abnt-serif">
                <div className="mb-4">
                  <h3
                    className={`font-bold ${
                      activeSection.level === 1
                        ? 'text-lg uppercase text-black font-abnt-serif'
                        : activeSection.level === 2
                        ? 'text-base uppercase font-normal text-black font-abnt-serif'
                        : 'text-sm font-bold text-black font-abnt-serif'
                    }`}
                  >
                    {activeSection.number} {activeSection.title}
                  </h3>
                </div>

                <div className="space-y-3 text-justify text-sm leading-[1.5]">
                  {activeSection.content.split('\n\n').map((paragraph, pIdx) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return null;

                    // Check if it is a long direct quote
                    if (trimmed.startsWith('>')) {
                      const quoteText = trimmed.replace(/^>\s*/, '');
                      return (
                        <div
                          key={pIdx}
                          className="abnt-quote-long pl-[4cm] text-[10pt] leading-[1.15] text-justify my-3"
                        >
                          {resolveCrossReferences(quoteText, project.crossReferences)}
                        </div>
                      );
                    }

                    return (
                      <p
                        key={pIdx}
                        className="abnt-paragraph text-[12pt] text-justify leading-[1.5]"
                        style={{ textIndent: '1.25cm' }}
                      >
                        {resolveCrossReferences(trimmed, project.crossReferences)}
                      </p>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: INSERIR CITAÇÃO */}
      {showCitationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-amber-400" />
                Inserir Citação Automática (NBR 10520)
              </h3>
              <button
                type="button"
                onClick={() => setShowCitationModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Selecione a Obra Referenciada
                </label>
                <select
                  value={selectedRefId}
                  onChange={(e) => setSelectedRefId(e.target.value)}
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
                >
                  {project.references.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.citationKey} – {r.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Tipo de Citação
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setCitationType('curta')}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      citationType === 'curta'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    Direta Curta (&lt; 3 linhas)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCitationType('longa')}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      citationType === 'longa'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    Direta Longa (Recuo 4cm)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCitationType('indireta')}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      citationType === 'indireta'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    Indireta: (AUTOR, Ano)
                  </button>
                  <button
                    type="button"
                    onClick={() => setCitationType('narrativa')}
                    className={`p-2 rounded-lg border text-left transition-colors ${
                      citationType === 'narrativa'
                        ? 'border-amber-500 bg-amber-500/10 text-amber-300 font-bold'
                        : 'border-slate-700 bg-slate-800 text-slate-300'
                    }`}
                  >
                    Narrativa: Segundo Autor (Ano)
                  </button>
                </div>
              </div>

              {(citationType === 'curta' || citationType === 'longa') && (
                <>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Página da Citação
                    </label>
                    <input
                      type="text"
                      value={citationPage}
                      onChange={(e) => setCitationPage(e.target.value)}
                      placeholder="Ex: 45 ou 45-48"
                      className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">
                      Texto Exato da Citação
                    </label>
                    <textarea
                      rows={3}
                      value={citationQuoteText}
                      onChange={(e) => setCitationQuoteText(e.target.value)}
                      placeholder="Cole ou digite aqui o trecho exato da obra original..."
                      className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500 leading-relaxed"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCitationModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleInsertCitation}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
              >
                Inserir no Parágrafo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSERIR REFERÊNCIA CRUZADA */}
      {showCrossRefModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                Inserir Referência Cruzada
              </h3>
              <button
                type="button"
                onClick={() => setShowCrossRefModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Selecione o elemento ilustrativo catalogado para inserir a citação cruzada no texto (ex: "conforme Figura 1"):
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {project.crossReferences.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleInsertCrossRef(item)}
                  className="w-full text-left p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700 hover:border-blue-500/50 transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-amber-400 uppercase tracking-wide mr-2">
                      {item.type} {item.number}:
                    </span>
                    <span className="text-slate-200 truncate">{item.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">
                    [ref:{item.id}]
                  </span>
                </button>
              ))}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowCrossRefModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Implementar Informações do Usuário com IA */}
      {showEnrichModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-indigo-400" />
                <h3 className="text-sm font-bold text-slate-100">
                  Implementar Informações no Capítulo com IA
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowEnrichModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Forneça os dados, resultados experimentais, especificações ou observações que você deseja adicionar ao capítulo <strong>"{activeSection.number} {activeSection.title}"</strong>. A IA integrará essas informações com rigor científico e estilo formal ABNT.
            </p>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1">
                Suas informações ou observações para incorporar:
              </label>
              <textarea
                rows={4}
                value={userExtraInfo}
                onChange={(e) => setUserExtraInfo(e.target.value)}
                placeholder="Exemplo: Os testes foram realizados a 45ºC durante 72 horas. Os resultados da Figura 2 comprovaram que a resistência à tração aumentou em 23%, superando a liga convencional..."
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl p-3 text-xs focus:border-indigo-500 placeholder-slate-500 leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowEnrichModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleIntegrateExtraInfo}
                disabled={isIntegratingExtraInfo || !userExtraInfo.trim()}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow disabled:opacity-50"
              >
                {isIntegratingExtraInfo ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Integrando Informações...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Incorporar no Texto</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
