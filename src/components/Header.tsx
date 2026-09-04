import React from 'react';
import {
  BookOpen,
  FileText,
  Eye,
  Bookmark,
  Sparkles,
  Printer,
  Download,
  Upload,
  Save,
  HelpCircle,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Terminal,
  Wand2,
  Database,
  ChevronDown,
  Check,
} from 'lucide-react';
import { TCCProject, ViewTab } from '../types';
import { getProjectStatistics } from '../utils/abntFormatter';
import { exportProjectToDocx } from '../utils/exportDocx';

interface HeaderProps {
  project: TCCProject;
  activeTab: ViewTab;
  setActiveTab?: (tab: ViewTab) => void;
  onTabChange?: (tab: ViewTab) => void;
  onSaveLocally?: () => void;
  saveStatus?: string;
  onPrint: () => void;
  onExportPDF?: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenGuidelines?: () => void;
  onOpenAIAssistant?: () => void;
  onLoadTemplate: (templateId: string) => void;
  isGeneratingPDF?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  project,
  activeTab,
  setActiveTab,
  onTabChange,
  onSaveLocally,
  saveStatus,
  onPrint,
  onExportPDF,
  onExportJSON,
  onImportJSON,
  onOpenGuidelines,
  onOpenAIAssistant,
  onLoadTemplate,
  isGeneratingPDF = false,
}) => {
  const stats = getProjectStatistics(project);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [showABNTGuide, setShowABNTGuide] = React.useState<boolean>(false);
  const [showBackupMenu, setShowBackupMenu] = React.useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = React.useState<boolean>(false);

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportProjectToDocx(project);
    } catch (err) {
      console.error('Erro ao exportar docx:', err);
      alert('Erro ao exportar documento .docx. Tente novamente.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleTabClick = (tab: ViewTab) => {
    if (typeof setActiveTab === 'function') {
      setActiveTab(tab);
    }
    if (typeof onTabChange === 'function') {
      onTabChange(tab);
    }
  };

  const handleAIAssistantClick = () => {
    if (typeof onOpenAIAssistant === 'function') {
      onOpenAIAssistant();
    } else {
      handleTabClick('assistente_ia');
    }
  };

  const handleGuidelinesClick = () => {
    if (typeof onOpenGuidelines === 'function') {
      onOpenGuidelines();
    } else {
      setShowABNTGuide(true);
    }
  };

  const handleDownloadPDFClick = () => {
    if (typeof onExportPDF === 'function') {
      onExportPDF();
    } else {
      handleTabClick('preview');
      setTimeout(() => {
        onPrint();
      }, 300);
    }
  };

  const isTabActive = (tab: ViewTab) => {
    if (activeTab === tab) return true;
    if (tab === 'secoes' && ((activeTab as string) === 'editor')) return true;
    if (tab === 'citacoes' && ((activeTab as string) === 'citations')) return true;
    if (tab === 'referencias_cruzadas' && ((activeTab as string) === 'cross_references')) return true;
    if (tab === 'assistente_ia' && ((activeTab as string) === 'ai_assistant')) return true;
    return false;
  };

  return (
    <header className="no-print bg-slate-900 border-b border-slate-800 sticky top-0 z-40 shadow-xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Project Name */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-md shadow-amber-900/30">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-100 tracking-tight flex items-center gap-1.5">
                DocuTCC
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-medium border border-amber-500/30">
                  ABNT NBR 14724
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 truncate max-w-xs sm:max-w-md">
              {project.title || 'Novo Trabalho de Conclusão de Curso'}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="hidden md:flex items-center gap-4 text-xs text-slate-300 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60">
          <div className="flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-amber-400" />
            <span>~{stats.estimatedPages} págs.</span>
          </div>
          <span className="text-slate-600">|</span>
          <div>
            <span>{stats.wordCount.toLocaleString('pt-BR')} palavras</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-blue-400" />
            <span>{stats.totalReferences} refs</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-emerald-400" />
            <span>{stats.totalFigures + stats.totalTables} ilustrações</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Load Model Dropdown */}
          <select
            onChange={(e) => {
              if (e.target.value) {
                onLoadTemplate(e.target.value);
                e.target.value = '';
              }
            }}
            defaultValue=""
            className="text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
            title="Carregar Modelo Acadêmico Pronto"
          >
            <option value="" disabled>
              📋 Modelos ABNT...
            </option>
            <option value="tcc-ia-diagnostico">Monografia Completa (Bacharelado)</option>
            <option value="tcc-tecnico-automacao">TCC Técnico (Projeto Prático / Nível Médio)</option>
            <option value="tcc-artigo-gestao">Artigo Científico ABNT (NBR 6022)</option>
            <option value="novo-em-branco">Projeto em Branco (Novo)</option>
          </select>

          {/* Real Save to Browser Storage */}
          <button
            type="button"
            onClick={onSaveLocally}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-sm cursor-pointer ${
              saveStatus
                ? 'bg-emerald-600/90 text-white border-emerald-500 shadow-emerald-950/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700 hover:border-slate-600'
            }`}
            title="Salvar alterações no navegador (armazena seu projeto com segurança)"
          >
            {saveStatus ? (
              <Check className="w-4 h-4 text-emerald-200 animate-pulse" />
            ) : (
              <Save className="w-4 h-4 text-emerald-400" />
            )}
            <span className="font-medium">{saveStatus || 'Salvar'}</span>
          </button>

          {/* Export Word (.docx) ABNT */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Salvar/Exportar TCC para Microsoft Word (.docx) formatado segundo as normas ABNT"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span className="hidden sm:inline">
              {isExportingDocx ? 'Gerando .docx...' : 'Exportar Word'}
            </span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-blue-700/80 font-mono text-blue-200">
              .docx
            </span>
          </button>

          {/* Export PDF direct */}
          <button
            type="button"
            onClick={handleDownloadPDFClick}
            disabled={isGeneratingPDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Baixar arquivo PDF formatado ABNT"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">
              {isGeneratingPDF ? 'Gerando...' : 'Baixar PDF'}
            </span>
          </button>

          {/* Print / Save PDF via browser dialog */}
          <button
            type="button"
            onClick={onPrint}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-sm font-medium cursor-pointer"
            title="Imprimir ou Salvar em PDF (alta fidelidade)"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span className="hidden sm:inline">Imprimir / PDF</span>
          </button>

          {/* Technical Backup & Restore Menu (.json) */}
          <div className="relative">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={onImportJSON}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => setShowBackupMenu(!showBackupMenu)}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
              title="Cópia de segurança e restauração técnica (.json)"
            >
              <Database className="w-3.5 h-3.5 text-slate-400" />
              <span className="hidden lg:inline">Backup</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showBackupMenu && (
              <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-700/80 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-2 py-1 border-b border-slate-800 text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Cópia de Segurança (.json)</span>
                  <span className="text-amber-400 text-[9px] font-mono">DocuTCC</span>
                </div>
                <p className="px-2 py-1.5 text-[11px] text-slate-400 leading-relaxed">
                  Arquivos <code className="text-amber-400">.json</code> contêm dados técnicos para transferir seu trabalho para outro computador ou restaurá-lo no DocuTCC.
                </p>
                <div className="space-y-1 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setShowBackupMenu(false);
                      onExportJSON();
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">Exportar Backup (.json)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Baixar cópia de segurança dos dados</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowBackupMenu(false);
                      fileInputRef.current?.click();
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                  >
                    <Upload className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-100">Restaurar Backup (.json)</div>
                      <div className="text-[10px] text-slate-400 font-normal">Carregar arquivo de backup salvo antes</div>
                    </div>
                  </button>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-800/80 px-2 text-[10px] text-slate-500">
                  💡 Para editar ou entregar o trabalho com formatação ABNT, use <strong className="text-blue-300">Exportar Word</strong> ou <strong className="text-amber-300">Imprimir / PDF</strong>.
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleGuidelinesClick}
            className="p-1.5 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors"
            title="Guia das Normas ABNT"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 scrollbar-none">
        <button
          type="button"
          onClick={() => handleTabClick('metadata')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            isTabActive('metadata')
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Capa & Dados ABNT</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('secoes')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            isTabActive('secoes')
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Capítulos & Conteúdo</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('citacoes')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            isTabActive('citacoes')
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Citações & NBR 6023</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {project.references.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('referencias_cruzadas')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            isTabActive('referencias_cruzadas')
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Figuras & Tabelas</span>
          <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 font-mono">
            {project.crossReferences.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabClick('preview')}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            isTabActive('preview')
              ? 'border-amber-500 text-amber-400 bg-amber-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Visualização ABNT (A4)</span>
        </button>

        {/* Gerador Autônomo IA */}
        <button
          type="button"
          onClick={() => handleTabClick('gerador_ia')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            isTabActive('gerador_ia')
              ? 'border-amber-500 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-amber-400/90 hover:text-amber-200 hover:border-amber-500/30'
          }`}
        >
          <Wand2 className="w-4 h-4 text-amber-400" />
          <span>Gerador Autônomo IA</span>
        </button>

        {/* Auditoria ABNT */}
        <button
          type="button"
          onClick={() => handleTabClick('auditoria')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            isTabActive('auditoria')
              ? 'border-indigo-500 text-indigo-300 bg-indigo-500/10'
              : 'border-transparent text-indigo-400/90 hover:text-indigo-200 hover:border-indigo-500/30'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-indigo-400" />
          <span>Auditoria ABNT</span>
        </button>

        {/* Scripts & CLI */}
        <button
          type="button"
          onClick={() => handleTabClick('scripts')}
          className={`flex items-center gap-2 py-2.5 px-3.5 text-xs font-medium border-b-2 transition-all whitespace-nowrap ${
            isTabActive('scripts')
              ? 'border-emerald-500 text-emerald-300 bg-emerald-500/10'
              : 'border-transparent text-emerald-400/90 hover:text-emerald-200 hover:border-emerald-500/30'
          }`}
        >
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Scripts & CLI</span>
        </button>

        <button
          type="button"
          onClick={handleAIAssistantClick}
          className={`flex items-center gap-2 py-2.5 px-4 text-xs font-medium border-b-2 transition-all whitespace-nowrap ml-auto ${
            isTabActive('assistente_ia')
              ? 'border-amber-400 text-amber-300 bg-amber-500/10'
              : 'border-transparent text-amber-400 hover:text-amber-200 hover:border-amber-400/50'
          }`}
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Chat com IA</span>
        </button>
      </div>

      {/* ABNT Norms Guidelines Modal */}
      {showABNTGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-amber-400 flex items-center gap-2">
                <HelpCircle className="w-5 h-5" />
                Guia Rápido de Normas ABNT (NBR 14724, 6023, 10520, 6028)
              </h3>
              <button
                type="button"
                onClick={() => setShowABNTGuide(false)}
                className="text-slate-400 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-slate-800"
              >
                ✕ Fechar
              </button>
            </div>

            <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">📏 Formatação e Margens (NBR 14724)</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>Papel:</strong> A4 (21 cm × 29,7 cm), cor branca.</li>
                  <li><strong>Margens:</strong> Superior e Esquerda: 3 cm; Inferior e Direita: 2 cm.</li>
                  <li><strong>Fonte:</strong> Times New Roman ou Arial tamanho 12 para o corpo.</li>
                  <li><strong>Tamanho 10:</strong> Citações diretas longas, notas de rodapé, paginação e legendas de figuras/tabelas.</li>
                  <li><strong>Espaçamento:</strong> 1,5 entre linhas no texto principal; simples nas citações longas e referências.</li>
                  <li><strong>Recuo de Parágrafo:</strong> 1,25 cm a partir da margem esquerda na primeira linha.</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">🔢 Numeração e Paginação</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>Contagem:</strong> Começa na Folha de Rosto (a capa não conta).</li>
                  <li><strong>Exibição:</strong> O número da página só aparece a partir da primeira folha textual (Introdução).</li>
                  <li><strong>Posição:</strong> Canto superior direito, a 2 cm da borda superior.</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">💬 Citações no Texto (NBR 10520)</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><strong>Citação Direta Curta (até 3 linhas):</strong> No fluxo do texto, entre aspas duplas: <em>Segundo Silva (2020, p. 15), "o modelo..."</em> ou <em>(SILVA, 2020, p. 15)</em>.</li>
                  <li><strong>Citação Direta Longa (mais de 3 linhas):</strong> Parágrafo isolado com recuo de 4 cm da margem esquerda, fonte tamanho 10, entrelinhas simples e SEM aspas.</li>
                  <li><strong>Citação Indireta (Paráfrase):</strong> Reprodução de ideias sem copiar palavras: <em>Conforme apontado por Santos (2021)...</em></li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                <h4 className="font-bold text-amber-300 mb-1">📚 Referências Bibliográficas (NBR 6023)</h4>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Ordem alfabética pelo sobrenome do primeiro autor em CAIXA ALTA.</li>
                  <li>Alinhamento à esquerda, entrelinhas simples e separadas entre si por 1 espaço simples.</li>
                  <li>Destaque tipográfico (<strong>Negrito</strong>) no título da obra (não no subtítulo).</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowABNTGuide(false)}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
