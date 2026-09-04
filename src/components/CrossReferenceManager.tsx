import React, { useState, useRef } from 'react';
import {
  Layers,
  Plus,
  Trash2,
  Image as ImageIcon,
  Table as TableIcon,
  Variable,
  Copy,
  Check,
  Upload,
  Sparkles,
  Bot,
  FileText,
  Send,
  Loader2,
  Edit2,
  ArrowRight,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { CrossReferenceItem, CrossReferenceType, TCCProject, TCCSection } from '../types';

interface CrossReferenceManagerProps {
  project: TCCProject;
  onChange: (updatedProject: TCCProject) => void;
}

interface AIFigureAnalysis {
  suggestedTitle: string;
  suggestedSource: string;
  detailedDescription: string;
  tccRelevance: string;
  contextualParagraph: string;
  suggestedSection: string;
}

export const CrossReferenceManager: React.FC<CrossReferenceManagerProps> = ({
  project,
  onChange,
}) => {
  const [activeType, setActiveType] = useState<CrossReferenceType>('figura');
  const [isAdding, setIsAdding] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Drag & drop state
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // AI states
  const [analyzingFigureId, setAnalyzingFigureId] = useState<string | null>(null);
  const [activeAIAnalysis, setActiveAIAnalysis] = useState<{
    figureId: string;
    analysis: AIFigureAnalysis;
  } | null>(null);
  const [userCustomNote, setUserCustomNote] = useState<string>('');
  const [isEnrichingText, setIsEnrichingText] = useState(false);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);

  // Single new item state (for tables, formulas, single items)
  const [newItem, setNewItem] = useState<{
    type: CrossReferenceType;
    title: string;
    source: string;
    contentUrl: string;
    formulaLatex: string;
    tableHeaders: string[];
    tableRows: string[][];
    notes: string;
    targetSectionId: string;
  }>({
    type: 'figura',
    title: '',
    source: 'Fonte: Elaborado pelo autor (2025).',
    contentUrl: '',
    formulaLatex: '',
    tableHeaders: ['Variável / Item', 'Descrição', 'Resultado'],
    tableRows: [
      ['Amostra A', 'Grupo Controle', '88.5%'],
      ['Amostra B', 'Grupo Experimental', '96.2%'],
    ],
    notes: '',
    targetSectionId: '',
  });

  const textualSections = project.sections.filter((s) => s.type === 'textual');

  const showFeedback = (msg: string) => {
    setActionSuccessMessage(msg);
    setTimeout(() => setActionSuccessMessage(null), 4500);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Re-number items sequentially by type according to ABNT NBR 14724
  const renumberItems = (items: CrossReferenceItem[]): CrossReferenceItem[] => {
    const types: CrossReferenceType[] = ['figura', 'tabela', 'quadro', 'grafico', 'equacao'];
    return items.map((item) => {
      const typeItems = items.filter((x) => x.type === item.type);
      const index = typeItems.findIndex((x) => x.id === item.id);
      return { ...item, number: index + 1 };
    });
  };

  // Multi-Image Upload & Batch Registration
  const processImageFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files).filter((file) => file.type.startsWith('image/'));
    if (validFiles.length === 0) {
      alert('Selecione arquivos de imagem válidos (PNG, JPG, JPEG, WEBP, SVG).');
      return;
    }

    const readers = validFiles.map((file, idx) => {
      return new Promise<{ name: string; dataUrl: string }>((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          resolve({
            name: file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' '),
            dataUrl: (e.target?.result as string) || '',
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then((results) => {
      const existingFigures = project.crossReferences.filter((c) => c.type === 'figura');
      const startNumber = existingFigures.length + 1;

      const newFigures: CrossReferenceItem[] = results.map((res, idx) => {
        const figNum = startNumber + idx;
        // Clean file name to make initial clean title
        const cleanTitle = res.name
          ? res.name.charAt(0).toUpperCase() + res.name.slice(1)
          : `Ilustração do TCC`;

        // Automatically assign to a textual section if available
        const defaultSection = textualSections[idx % (textualSections.length || 1)];

        return {
          id: `fig-${Date.now()}-${idx}-${Math.random().toString(36).slice(2, 6)}`,
          type: 'figura',
          number: figNum,
          title: cleanTitle,
          source: 'Fonte: Elaborado pelo autor (2025).',
          contentUrl: res.dataUrl,
          targetSectionId: defaultSection?.id || '',
        };
      });

      const updated = renumberItems([...project.crossReferences, ...newFigures]);
      onChange({
        ...project,
        crossReferences: updated,
        lastModified: new Date().toISOString(),
      });

      setActiveType('figura');
      showFeedback(
        `${newFigures.length} ${newFigures.length === 1 ? 'figura cadastrada' : 'figuras cadastradas'} com sucesso e prontas para o documento ABNT!`
      );
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processImageFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processImageFiles(e.dataTransfer.files);
    }
  };

  // Add individual item manually
  const handleSaveItem = () => {
    if (!newItem.title) {
      alert('Preencha o título ou legenda do elemento.');
      return;
    }

    const existingCount = project.crossReferences.filter((c) => c.type === newItem.type).length;
    const itemNumber = existingCount + 1;

    const item: CrossReferenceItem = {
      id: `${newItem.type.slice(0, 3)}-${Date.now()}`,
      type: newItem.type,
      number: itemNumber,
      title: newItem.title,
      source: newItem.source || 'Fonte: Elaborado pelo autor (2025).',
      contentUrl: newItem.contentUrl,
      formulaLatex: newItem.formulaLatex,
      tableHeaders:
        newItem.type === 'tabela' || newItem.type === 'quadro' ? newItem.tableHeaders : undefined,
      tableRows:
        newItem.type === 'tabela' || newItem.type === 'quadro' ? newItem.tableRows : undefined,
      notes: newItem.notes,
      targetSectionId: newItem.targetSectionId || undefined,
    };

    const updated = renumberItems([...project.crossReferences, item]);
    onChange({
      ...project,
      crossReferences: updated,
      lastModified: new Date().toISOString(),
    });

    setIsAdding(false);
    setNewItem({
      type: activeType,
      title: '',
      source: 'Fonte: Elaborado pelo autor (2025).',
      contentUrl: '',
      formulaLatex: '',
      tableHeaders: ['Coluna 1', 'Coluna 2', 'Coluna 3'],
      tableRows: [['Dado 1', 'Dado 2', 'Dado 3']],
      notes: '',
      targetSectionId: '',
    });
    showFeedback(`${item.type} cadastrado(a) com sucesso!`);
  };

  // Delete item
  const handleDeleteItem = (id: string) => {
    const remaining = project.crossReferences.filter((c) => c.id !== id);
    const renumbered = renumberItems(remaining);

    onChange({
      ...project,
      crossReferences: renumbered,
      lastModified: new Date().toISOString(),
    });
    showFeedback('Elemento removido e numeração ABNT reorganizada.');
  };

  // Update specific item properties (title, source, section)
  const handleUpdateItem = (id: string, updates: Partial<CrossReferenceItem>) => {
    const updated = project.crossReferences.map((item) => {
      if (item.id === id) {
        return { ...item, ...updates };
      }
      return item;
    });

    onChange({
      ...project,
      crossReferences: updated,
      lastModified: new Date().toISOString(),
    });
  };

  // AI Multimodal Analysis of a Figure
  const handleAnalyzeFigureWithAI = async (fig: CrossReferenceItem, customNote?: string) => {
    if (!fig.contentUrl) {
      alert('A figura precisa ter uma imagem carregada para ser analisada pela IA.');
      return;
    }

    setAnalyzingFigureId(fig.id);

    try {
      const targetSec = textualSections.find((s) => s.id === fig.targetSectionId);

      const res = await fetch('/api/gemini/analyze-figure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageData: fig.contentUrl,
          tccContext: `Título: ${project.title}. Curso: ${project.course || ''}. Tema: ${project.subtitle || ''}`,
          userDescription: customNote || userCustomNote || '',
          figureNumber: fig.number,
          targetSectionTitle: targetSec?.title || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha na análise da imagem com IA.');
      }

      const analysis: AIFigureAnalysis = data.analysis;
      setActiveAIAnalysis({
        figureId: fig.id,
        analysis,
      });

      // Automatically update figure with suggested title & source if current is generic
      const isGenericTitle =
        !fig.title || fig.title.startsWith('Figura') || fig.title.startsWith('Ilustração');
      const updates: Partial<CrossReferenceItem> = {
        aiAnalysis: analysis.contextualParagraph,
      };
      if (isGenericTitle && analysis.suggestedTitle) {
        updates.title = analysis.suggestedTitle;
      }
      if (analysis.suggestedSource) {
        updates.source = analysis.suggestedSource;
      }

      handleUpdateItem(fig.id, updates);
      showFeedback('Imagem analisada com sucesso pela IA do Gemini!');
    } catch (err: any) {
      console.error('Erro na análise da figura:', err);
      alert(`Erro ao analisar imagem com IA: ${err.message}`);
    } finally {
      setAnalyzingFigureId(null);
    }
  };

  // Insert Figure and contextual paragraph into a section
  const handleInsertFigureAndTextIntoSection = (
    fig: CrossReferenceItem,
    targetSecId: string,
    paragraphText: string
  ) => {
    if (!targetSecId) {
      alert('Selecione uma seção de destino para inserir a figura e o texto.');
      return;
    }

    const targetSection = project.sections.find((s) => s.id === targetSecId);
    if (!targetSection) return;

    // Cross-ref citation tag
    const refTag = `[ref:${fig.id}]`;
    const cleanParagraph = paragraphText.includes(refTag)
      ? paragraphText
      : `${paragraphText}\n\n${refTag}`;

    const newContent = targetSection.content
      ? `${targetSection.content.trim()}\n\n${cleanParagraph}`
      : cleanParagraph;

    const updatedSections = project.sections.map((s) => {
      if (s.id === targetSecId) {
        return { ...s, content: newContent };
      }
      return s;
    });

    const updatedRefs = project.crossReferences.map((c) => {
      if (c.id === fig.id) {
        return { ...c, targetSectionId: targetSecId };
      }
      return c;
    });

    onChange({
      ...project,
      sections: updatedSections,
      crossReferences: updatedRefs,
      lastModified: new Date().toISOString(),
    });

    showFeedback(
      `Figura ${fig.number} e parágrafo contextualizado inseridos com sucesso na seção "${targetSection.number} ${targetSection.title}"!`
    );
  };

  // Enrich section with user-provided information via AI
  const handleEnrichWithUserInfo = async (
    secId: string,
    userInfo: string,
    figReferenceLabel?: string
  ) => {
    if (!userInfo.trim()) {
      alert('Digite as informações ou dados que deseja incorporar ao texto.');
      return;
    }

    const targetSection = project.sections.find((s) => s.id === secId);
    if (!targetSection) {
      alert('Selecione uma seção para enriquecer o texto.');
      return;
    }

    setIsEnrichingText(true);

    try {
      const res = await fetch('/api/gemini/integrate-user-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentContent: targetSection.content || '',
          sectionTitle: targetSection.title,
          tccContext: `Título: ${project.title}. Curso: ${project.course || ''}`,
          userProvidedInfo: userInfo,
          figureReference: figReferenceLabel,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Falha ao integrar informações.');
      }

      const updatedContent = data.result?.updatedContent;
      if (!updatedContent) {
        throw new Error('Nenhum texto retornado.');
      }

      const updatedSections = project.sections.map((s) => {
        if (s.id === secId) {
          return { ...s, content: updatedContent };
        }
        return s;
      });

      onChange({
        ...project,
        sections: updatedSections,
        lastModified: new Date().toISOString(),
      });

      setUserCustomNote('');
      showFeedback(
        `Texto da seção "${targetSection.title}" enriquecido com as novas informações com sucesso!`
      );
    } catch (err: any) {
      console.error('Erro ao enriquecer texto:', err);
      alert(`Erro ao integrar informações: ${err.message}`);
    } finally {
      setIsEnrichingText(false);
    }
  };

  const filteredItems = project.crossReferences.filter((c) => c.type === activeType);
  const totalFiguresCount = project.crossReferences.filter((c) => c.type === 'figura').length;

  return (
    <div className="space-y-6">
      {/* Toast feedback */}
      {actionSuccessMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-emerald-950/90 text-emerald-200 border border-emerald-500/50 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{actionSuccessMessage}</span>
        </div>
      )}

      {/* Header card */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Central de Ilustrações & Referências Cruzadas (NBR 14724)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre múltiplas imagens simultaneamente com visão computacional, numeração automática e renderização no documento ABNT.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeType === 'figura' && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-all shadow-md"
            >
              <Upload className="w-4 h-4" />
              <span>Inserir 5+ Imagens de uma vez</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              setNewItem((prev) => ({ ...prev, type: activeType }));
              setIsAdding(!isAdding);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-md"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar {activeType.charAt(0).toUpperCase() + activeType.slice(1)} Individual</span>
          </button>
        </div>
      </div>

      {/* Multi-image drag & drop dropzone banner for Figures */}
      {activeType === 'figura' && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
            isDragging
              ? 'border-blue-400 bg-blue-500/10 scale-[1.01]'
              : 'border-slate-700 hover:border-blue-500/60 bg-slate-900/60 hover:bg-slate-900/90'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-inner">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Arraste e solte até 5 (ou mais) imagens aqui
              </h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                Selecione todas as figuras do seu TCC simultaneamente. O sistema numera automaticamente (Figura 1, 2, 3, 4, 5...) e as renderiza no documento ABNT com suporte a análise visual por IA.
              </p>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-[11px] text-slate-300 font-medium mt-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Suporta identificação visual com IA para gerar títulos e parágrafos acadêmicos</span>
            </div>
          </div>
        </div>
      )}

      {/* Type Selector Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/40 rounded-xl p-1 gap-1">
        {(['figura', 'tabela', 'quadro', 'equacao'] as CrossReferenceType[]).map((type) => {
          const count = project.crossReferences.filter((c) => c.type === type).length;
          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                setActiveType(type);
                setIsAdding(false);
              }}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold capitalize flex items-center justify-center gap-2 transition-all ${
                activeType === type
                  ? 'bg-slate-800 text-amber-400 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {type === 'figura' && <ImageIcon className="w-3.5 h-3.5" />}
              {type === 'tabela' && <TableIcon className="w-3.5 h-3.5" />}
              {type === 'quadro' && <Layers className="w-3.5 h-3.5" />}
              {type === 'equacao' && <Variable className="w-3.5 h-3.5" />}
              <span>{type}s</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-900 text-slate-400 font-mono">
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Form: Add New Single Item */}
      {isAdding && (
        <div className="bg-slate-900 rounded-2xl border border-blue-500/40 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wide">
              Cadastrar Nova {newItem.type}
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Título / Legenda da {newItem.type} (Posicionada no Topo - NBR 14724)
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                placeholder="Ex: Diagrama de blocos do sistema microcontrolado"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2.5 focus:border-blue-500 font-medium"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-slate-300 font-semibold mb-1">
                Fonte da Ilustração (Posicionada na Base - Obrigatório NBR 14724)
              </label>
              <input
                type="text"
                value={newItem.source}
                onChange={(e) => setNewItem({ ...newItem, source: e.target.value })}
                placeholder="Fonte: Elaborado pelo autor (2025)."
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-1">
              <label className="block text-slate-300 font-semibold mb-1">
                Vincular à Seção do TCC
              </label>
              <select
                value={newItem.targetSectionId}
                onChange={(e) => setNewItem({ ...newItem, targetSectionId: e.target.value })}
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-blue-500"
              >
                <option value="">Automático (Distribuir nos capítulos do TCC)</option>
                {textualSections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    {sec.number} {sec.title}
                  </option>
                ))}
              </select>
            </div>

            {/* If Figure: image upload or URL */}
            {newItem.type === 'figura' && (
              <div className="md:col-span-2 space-y-2">
                <label className="block text-slate-300 font-semibold">
                  Imagem da Figura (Upload ou URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem.contentUrl}
                    onChange={(e) => setNewItem({ ...newItem, contentUrl: e.target.value })}
                    placeholder="https://... ou faça upload do arquivo"
                    className="flex-1 bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-blue-500"
                  />
                  <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            setNewItem((prev) => ({
                              ...prev,
                              contentUrl: (ev.target?.result as string) || '',
                            }));
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {newItem.contentUrl && (
                  <div className="mt-2 p-2 bg-slate-950 rounded-xl border border-slate-800 max-w-xs">
                    <img
                      src={newItem.contentUrl}
                      alt="Preview"
                      className="max-h-40 rounded object-contain mx-auto"
                    />
                  </div>
                )}
              </div>
            )}

            {/* If Table: simple grid editor */}
            {(newItem.type === 'tabela' || newItem.type === 'quadro') && (
              <div className="md:col-span-2 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-slate-300 font-semibold">
                    Colunas e Dados da Tabela
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setNewItem((prev) => ({
                        ...prev,
                        tableRows: [
                          ...prev.tableRows,
                          new Array(prev.tableHeaders.length).fill('Novo dado'),
                        ],
                      }));
                    }}
                    className="text-[11px] text-amber-400 hover:text-amber-300"
                  >
                    + Adicionar Linha
                  </button>
                </div>
                <div className="overflow-x-auto bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead>
                      <tr className="border-b border-slate-800">
                        {newItem.tableHeaders.map((header, hIdx) => (
                          <th key={hIdx} className="p-1">
                            <input
                              type="text"
                              value={header}
                              onChange={(e) => {
                                const copy = [...newItem.tableHeaders];
                                copy[hIdx] = e.target.value;
                                setNewItem({ ...newItem, tableHeaders: copy });
                              }}
                              className="bg-slate-800 px-2 py-1 rounded w-full text-slate-200 font-bold"
                            />
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {newItem.tableRows.map((row, rIdx) => (
                        <tr key={rIdx} className="border-b border-slate-900">
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} className="p-1">
                              <input
                                type="text"
                                value={cell}
                                onChange={(e) => {
                                  const copy = newItem.tableRows.map((r) => [...r]);
                                  copy[rIdx][cIdx] = e.target.value;
                                  setNewItem({ ...newItem, tableRows: copy });
                                }}
                                className="bg-slate-900 px-2 py-1 rounded w-full text-slate-300"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* If Equation */}
            {newItem.type === 'equacao' && (
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  Expressão em LaTeX
                </label>
                <input
                  type="text"
                  value={newItem.formulaLatex}
                  onChange={(e) => setNewItem({ ...newItem, formulaLatex: e.target.value })}
                  placeholder="Ex: f(x) = \sum_{i=1}^n w_i x_i + b"
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-blue-500 font-mono"
                />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveItem}
              className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs"
            >
              Salvar Ilustração
            </button>
          </div>
        </div>
      )}

      {/* AI Analysis Review Modal / Panel */}
      {activeAIAnalysis && (
        <div className="bg-indigo-950/40 border border-indigo-500/40 rounded-2xl p-5 shadow-2xl space-y-4 backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-indigo-500/30 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              <h3 className="text-sm font-bold text-indigo-200">
                Resultado da Análise de Visão Computacional por IA
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveAIAnalysis(null)}
              className="text-xs text-indigo-300 hover:text-white px-2 py-1 bg-indigo-900/40 rounded"
            >
              Fechar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-3">
              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                  O que a IA identificou na Imagem:
                </span>
                <p className="text-slate-200 mt-1 leading-relaxed">
                  {activeAIAnalysis.analysis.detailedDescription}
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                  Relevância e Conexão com o TCC:
                </span>
                <p className="text-slate-300 mt-1 leading-relaxed">
                  {activeAIAnalysis.analysis.tccRelevance}
                </p>
              </div>

              <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                    Título & Fonte ABNT Sugeridos:
                  </span>
                  <p className="text-slate-200 font-semibold mt-0.5">
                    {activeAIAnalysis.analysis.suggestedTitle}
                  </p>
                  <p className="text-slate-400 text-[11px] italic">
                    {activeAIAnalysis.analysis.suggestedSource}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="bg-slate-900/90 p-3.5 rounded-xl border border-indigo-500/30 space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wide flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  Parágrafo Científico de Contextualização ABNT:
                </span>
                <p className="text-slate-100 text-justify leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800 font-serif">
                  {activeAIAnalysis.analysis.contextualParagraph}
                </p>

                <div className="pt-2">
                  <label className="block text-slate-300 text-[11px] font-semibold mb-1">
                    Inserir este texto e a figura no capítulo:
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="targetSecSelect"
                      className="flex-1 bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 text-xs"
                      defaultValue={
                        textualSections.find(
                          (s) =>
                            s.title.toLowerCase().includes('resultado') ||
                            s.title.toLowerCase().includes('metodologia')
                        )?.id || textualSections[0]?.id
                      }
                    >
                      {textualSections.map((sec) => (
                        <option key={sec.id} value={sec.id}>
                          {sec.number} {sec.title}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => {
                        const selectEl = document.getElementById(
                          'targetSecSelect'
                        ) as HTMLSelectElement;
                        const targetId = selectEl?.value;
                        const targetFig = project.crossReferences.find(
                          (c) => c.id === activeAIAnalysis.figureId
                        );
                        if (targetFig && targetId) {
                          handleInsertFigureAndTextIntoSection(
                            targetFig,
                            targetId,
                            activeAIAnalysis.analysis.contextualParagraph
                          );
                        }
                      }}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs flex items-center gap-1 shadow"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      <span>Inserir na Seção</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const typeCapitalized = item.type.charAt(0).toUpperCase() + item.type.slice(1);
          const crossRefToken = `[ref:${item.id}]`;
          const isAnalyzingThis = analyzingFigureId === item.id;
          const assignedSection = textualSections.find((s) => s.id === item.targetSectionId);

          return (
            <div
              key={item.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 space-y-3 shadow-md hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                {/* Header of card */}
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-amber-400 text-xs uppercase tracking-wide">
                      {typeCapitalized} {item.number}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-2 py-0.5 rounded">
                      {crossRefToken}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Title (Editable in place) */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                    Título / Legenda da Figura (ABNT):
                  </label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleUpdateItem(item.id, { title: e.target.value })}
                    className="w-full bg-slate-800/80 text-slate-100 text-xs font-semibold rounded-lg px-2.5 py-1.5 border border-slate-700 focus:border-blue-500"
                    placeholder="Título da ilustração"
                  />
                </div>

                {/* Section Assignment Dropdown */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                    Seção / Capítulo de Destino no TCC:
                  </label>
                  <select
                    value={item.targetSectionId || ''}
                    onChange={(e) => handleUpdateItem(item.id, { targetSectionId: e.target.value })}
                    className="w-full bg-slate-800/80 text-slate-200 text-xs rounded-lg px-2.5 py-1.5 border border-slate-700 focus:border-blue-500"
                  >
                    <option value="">Distribuir automaticamente no documento</option>
                    {textualSections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.number} {sec.title}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Body visual */}
                {item.type === 'figura' && item.contentUrl && (
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 flex flex-col items-center">
                    <img
                      src={item.contentUrl}
                      alt={item.title}
                      className="max-h-48 rounded object-contain"
                    />
                  </div>
                )}

                {(item.type === 'tabela' || item.type === 'quadro') && item.tableHeaders && (
                  <div className="bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-x-auto">
                    <table className="w-full text-left text-[11px] text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-700">
                          {item.tableHeaders.map((h, idx) => (
                            <th key={idx} className="p-1 font-bold text-slate-200">
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.tableRows?.map((row, rIdx) => (
                          <tr key={rIdx} className="border-b border-slate-800/60">
                            {row.map((c, cIdx) => (
                              <td key={cIdx} className="p-1">
                                {c}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {item.type === 'equacao' && item.formulaLatex && (
                  <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-amber-300 flex justify-between items-center">
                    <span>{item.formulaLatex}</span>
                    <span className="text-slate-400">({item.number})</span>
                  </div>
                )}

                {/* Source Input */}
                <div>
                  <label className="text-[10px] text-slate-400 font-semibold block mb-0.5">
                    Fonte (Obrigatório ABNT):
                  </label>
                  <input
                    type="text"
                    value={item.source}
                    onChange={(e) => handleUpdateItem(item.id, { source: e.target.value })}
                    className="w-full bg-slate-800/80 text-slate-300 text-xs italic rounded-lg px-2.5 py-1 border border-slate-700 focus:border-blue-500"
                    placeholder="Fonte: Elaborado pelo autor (2025)."
                  />
                </div>
              </div>

              {/* Action Controls */}
              <div className="space-y-2 pt-3 border-t border-slate-800">
                {/* AI Tools Bar for Figure */}
                {item.type === 'figura' && item.contentUrl && (
                  <div className="space-y-2">
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAnalyzeFigureWithAI(item)}
                        disabled={isAnalyzingThis}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
                        title="Identifica o que é a imagem e gera contexto acadêmico para o TCC"
                      >
                        {isAnalyzingThis ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                            <span>Analisando Imagem...</span>
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Analisar com IA (Gemini)</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const secId = item.targetSectionId || textualSections[0]?.id;
                          if (!secId) {
                            alert('Nenhuma seção encontrada no TCC.');
                            return;
                          }
                          const defaultParagraph = `Conforme ilustrado na Figura ${item.number}, ${item.title.toLowerCase()} desempenha papel fundamental na fundamentação e análise técnica apresentada.`;
                          handleInsertFigureAndTextIntoSection(item, secId, defaultParagraph);
                        }}
                        className="flex items-center justify-center gap-1 py-1.5 px-2.5 bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors"
                        title="Insere a citação no capítulo selecionado"
                      >
                        <ArrowRight className="w-3 h-3 text-emerald-400" />
                        <span>Inserir na Seção</span>
                      </button>
                    </div>

                    {/* Quick user note/information injection with AI */}
                    <div className="bg-slate-950/60 p-2 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-[10px] text-slate-400 font-semibold block">
                        Deseja adicionar ou enriquecer informações sobre esta figura no texto?
                      </span>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          placeholder="Ex: o ensaio atingiu 45ºC e suportou carga de 350 MPa..."
                          value={userCustomNote}
                          onChange={(e) => setUserCustomNote(e.target.value)}
                          className="flex-1 bg-slate-900 text-slate-200 text-[11px] rounded-lg px-2 py-1 border border-slate-750 focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const secId = item.targetSectionId || textualSections[0]?.id;
                            if (secId) {
                              handleEnrichWithUserInfo(
                                secId,
                                userCustomNote,
                                `Figura ${item.number}`
                              );
                            }
                          }}
                          disabled={isEnrichingText || !userCustomNote.trim()}
                          className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 rounded-lg text-[11px] font-bold flex items-center gap-1 disabled:opacity-50"
                        >
                          {isEnrichingText ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Send className="w-3 h-3" />
                          )}
                          <span>Integrar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Copy Token Button */}
                <div className="flex items-center justify-between pt-1 text-[10px]">
                  <span className="text-slate-500">
                    Tag: <code className="text-blue-400">{crossRefToken}</code>
                  </span>

                  <button
                    type="button"
                    onClick={() => handleCopy(crossRefToken, item.id)}
                    className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-200 px-2 py-1 rounded-lg border border-slate-700 transition-colors"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3 text-slate-400" />
                    )}
                    <span>Copiar Citação</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredItems.length === 0 && (
          <div className="md:col-span-2 p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            Nenhuma {activeType} cadastrada ainda. Utilize o botão acima para carregar 5 imagens simultaneamente ou cadastrar individualmente.
          </div>
        )}
      </div>
    </div>
  );
};
