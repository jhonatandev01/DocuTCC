import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Compass,
  Menu,
  X,
  Smartphone,
  ArrowLeft,
  Home,
  Plus,
  FileEdit,
} from 'lucide-react';
import { TCCProject, ViewTab } from '../types';
import { getProjectStatistics } from '../utils/abntFormatter';
import { exportProjectToDocx } from '../utils/exportDocx';
import { PWAInstallButton } from './PWAInstallButton';

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
  onOpenTutorial?: () => void;
  onLoadTemplate: (templateId: string) => void;
  onNewBlankProject?: () => void;
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
  onOpenTutorial,
  onLoadTemplate,
  onNewBlankProject,
  isGeneratingPDF = false,
}) => {
  const stats = getProjectStatistics(project);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const toolsMenuRef = React.useRef<HTMLDivElement>(null);
  const [showToolsMenu, setShowToolsMenu] = React.useState<boolean>(false);
  const [showABNTGuide, setShowABNTGuide] = React.useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = React.useState<boolean>(false);

  // Close tools dropdown when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (toolsMenuRef.current && !toolsMenuRef.current.contains(event.target as Node)) {
        setShowToolsMenu(false);
      }
    }
    if (showToolsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showToolsMenu]);

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
    <header className="no-print glass-panel-heavy sticky top-0 z-40 border-b border-slate-700/80 shadow-2xl">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand & Project Name */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleTabClick('inicio')}
            className="flex items-center gap-3 text-left group cursor-pointer"
            title="Ir para a Tela Inicial (Hub de Documentos)"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-950 border border-amber-500/40 p-0.5 shadow-md shadow-amber-900/30 overflow-hidden shrink-0 group-hover:border-amber-400 group-hover:scale-105 transition-all">
              <img src="/icon.svg" alt="DocuTCC Logo" className="w-full h-full object-cover rounded-lg" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-100 group-hover:text-amber-300 transition-colors tracking-tight flex items-center gap-2">
                  DocuTCC
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700/80">
                    Formatador Acadêmico
                  </span>
                </h1>
              </div>
              <p className="text-xs text-slate-400 truncate max-w-[180px] sm:max-w-xs md:max-w-md">
                {project.title || 'Novo Trabalho de Conclusão de Curso'}
              </p>
            </div>
          </button>
        </div>

        {/* Master Screen Tabs: Início vs Editor vs + Novo */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border border-slate-800 shadow-inner">
          <button
            type="button"
            onClick={() => handleTabClick('inicio')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'inicio'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
            title="Tela Inicial: Boas-vindas, modelos prontos e seus documentos"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Início</span>
          </button>

          <button
            type="button"
            onClick={() => handleTabClick('secoes')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab !== 'inicio'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-slate-850'
            }`}
            title="Editor: Edição estruturada do documento, capítulos e ABNT"
          >
            <FileEdit className="w-3.5 h-3.5" />
            <span>Editor</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNewBlankProject) {
                onNewBlankProject();
              } else {
                handleTabClick('secoes');
              }
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-amber-400 hover:text-amber-300 hover:bg-amber-500/10 transition-colors border border-amber-500/30 cursor-pointer"
            title="Iniciar um novo documento (+)"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Novo</span>
          </button>
        </div>

        {/* Clean Status Summary in Header (Only when inside Editor) */}
        {activeTab !== 'inicio' && (
          <div className="hidden lg:flex items-center gap-3 text-xs text-slate-300 bg-slate-800/60 px-3 py-1.5 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-1.5" title="Estimativa de páginas ABNT">
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>~{stats.estimatedPages} págs</span>
            </div>
            <span className="text-slate-600">•</span>
            <div title="Palavras no texto">
              <span>{stats.wordCount.toLocaleString('pt-BR')} palavras</span>
            </div>
            <span className="text-slate-600">•</span>
            <div className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" />
              <span>Formatado</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Real Save to Browser Storage */}
          <button
            type="button"
            onClick={onSaveLocally}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all shadow-sm cursor-pointer ${
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
            <span className="hidden sm:inline font-medium">{saveStatus || 'Salvar'}</span>
          </button>

          {/* Export Word (.docx) ABNT */}
          <button
            type="button"
            onClick={handleDownloadDocx}
            disabled={isExportingDocx}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-600/90 hover:bg-blue-600 text-white border border-blue-500/50 hover:border-blue-400 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Salvar/Exportar TCC para Microsoft Word (.docx) formatado segundo as normas ABNT"
          >
            <FileText className="w-4 h-4 text-blue-200" />
            <span className="hidden sm:inline">
              {isExportingDocx ? 'Gerando...' : 'Exportar Word'}
            </span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-blue-700/80 font-mono text-blue-200 hidden xs:inline">
              .docx
            </span>
          </button>

          {/* Export PDF direct (Desktop) */}
          <button
            type="button"
            onClick={handleDownloadPDFClick}
            disabled={isGeneratingPDF}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 hover:border-slate-600 transition-all shadow-sm disabled:opacity-50 cursor-pointer"
            title="Baixar arquivo PDF formatado ABNT"
          >
            <Download className="w-4 h-4 text-amber-400" />
            <span>
              {isGeneratingPDF ? 'Gerando...' : 'PDF'}
            </span>
          </button>

          {/* Print / Save PDF via browser dialog */}
          <button
            type="button"
            onClick={onPrint}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 transition-all shadow-sm font-medium cursor-pointer"
            title="Imprimir ou Salvar em PDF (alta fidelidade)"
          >
            <Printer className="w-4 h-4 text-slate-950" />
            <span className="hidden lg:inline">Imprimir / PDF</span>
          </button>

          {/* Hidden File Input for Backup Restoration */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={onImportJSON}
            className="hidden"
          />

          {/* Main Utility & Settings Menu Dropdown (Requested: encapsulates Tutorial, PWA, Models, Backup & AI tools) */}
          <div className="relative" ref={toolsMenuRef}>
            <button
              type="button"
              onClick={() => setShowToolsMenu(!showToolsMenu)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all duration-200 shadow-sm cursor-pointer transform active:scale-95 ${
                showToolsMenu
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/60 shadow-lg shadow-amber-950/40 ring-2 ring-amber-500/30'
                  : 'bg-slate-850 hover:bg-slate-800 text-slate-200 border-slate-750 hover:border-slate-650 hover:scale-[1.02]'
              }`}
              title="Menu: Recursos de IA, Modelos, Backup e Ajuda"
            >
              <Menu className="w-4 h-4 text-amber-400" />
              <span className="hidden xs:inline">Menu</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-300 ${
                  showToolsMenu ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu Container */}
            <AnimatePresence>
              {showToolsMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="fixed inset-x-3 top-16 sm:absolute sm:inset-auto sm:right-0 sm:top-full sm:mt-2 w-auto sm:w-[390px] max-h-[84vh] overflow-y-auto glass-panel-heavy rounded-2xl p-3.5 z-50 origin-top-right"
                >
                  {/* Menu Header */}
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
                      <Menu className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-100">Menu & Recursos</h4>
                      <p className="text-[10px] text-slate-400">Modelos, Inteligência Artificial e Ajuda</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowToolsMenu(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Section 1: Help & App Installation (Requested by user) */}
                <div className="space-y-1 mb-3">
                  <div className="text-[10px] font-bold text-amber-400/90 uppercase tracking-wider px-2 py-1">
                    Ajuda & Aplicativo
                  </div>

                  {/* Tutorial Interativo */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowToolsMenu(false);
                      if (onOpenTutorial) onOpenTutorial();
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-700/60"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                      <Compass className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Tutorial Interativo</span>
                        <span className="text-[10px] text-amber-300 font-medium bg-amber-500/15 px-1.5 py-0.5 rounded">
                          Passo a passo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        Aprenda a preencher capa, capítulos e gerar referências ABNT.
                      </p>
                    </div>
                  </button>

                  {/* Instalar Web App */}
                  <div className="px-1 py-0.5">
                    <PWAInstallButton
                      variant="menu-item"
                      onAfterClick={() => setShowToolsMenu(false)}
                    />
                  </div>

                  {/* Guia Normas ABNT */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowToolsMenu(false);
                      handleGuidelinesClick();
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-700/60"
                  >
                    <div className="p-1.5 rounded-lg bg-slate-800 text-amber-400 shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Guia de Normas ABNT</span>
                        <span className="text-[10px] text-slate-400 font-mono">NBRs</span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        Consulte as regras NBR 14724, 6023, 10520 e 6028.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Section 2: AI & Academic Tools */}
                <div className="space-y-1 mb-3 pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Recursos de IA & Auditoria
                  </div>

                  {/* Gerador Autônomo IA */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowToolsMenu(false);
                      handleTabClick('gerador_ia');
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-700/60"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-400 shrink-0 mt-0.5">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Gerador Autônomo IA</span>
                        <span className="text-[10px] text-amber-300 font-medium bg-amber-500/20 px-1.5 py-0.5 rounded">
                          Autônomo
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        Estruture os capítulos, tópicos e gere ideias iniciais com IA.
                      </p>
                    </div>
                  </button>

                  {/* Chat com IA Especialista */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowToolsMenu(false);
                      handleAIAssistantClick();
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-700/60"
                  >
                    <div className="p-1.5 rounded-lg bg-sky-500/15 text-sky-400 shrink-0 mt-0.5">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Chat com IA Especialista</span>
                        <span className="text-[10px] text-sky-300 font-medium bg-sky-500/20 px-1.5 py-0.5 rounded">
                          Chat
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        Tire dúvidas sobre escrita científica, ABNT e aprimore parágrafos.
                      </p>
                    </div>
                  </button>

                  {/* Auditoria ABNT */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowToolsMenu(false);
                      handleTabClick('auditoria');
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-700/60"
                  >
                    <div className="p-1.5 rounded-lg bg-indigo-500/15 text-indigo-400 shrink-0 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Auditoria ABNT</span>
                        <span className="text-[10px] text-indigo-300 font-medium bg-indigo-500/20 px-1.5 py-0.5 rounded">
                          Diagnóstico
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        Varredura de conformidade, citações órfãs e formatação técnica.
                      </p>
                    </div>
                  </button>

                  {/* Scripts & CLI */}
                  <button
                    type="button"
                    onClick={() => {
                      setShowToolsMenu(false);
                      handleTabClick('scripts');
                    }}
                    className="w-full text-left flex items-start gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800/90 hover:text-white transition-colors cursor-pointer border border-transparent hover:border-slate-700/60"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 shrink-0 mt-0.5">
                      <Terminal className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-100">Scripts & Automação CLI</span>
                        <span className="text-[10px] text-emerald-300 font-medium bg-emerald-500/20 px-1.5 py-0.5 rounded">
                          Dev / LaTeX
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-normal mt-0.5">
                        Scripts de exportação, compilação de código e templates técnicos.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Section 3: Academic Templates */}
                <div className="mb-3 pt-2 border-t border-slate-800">
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5">
                    Modelos Acadêmicos Prontos
                  </label>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        onLoadTemplate(e.target.value);
                        setShowToolsMenu(false);
                        e.target.value = '';
                      }
                    }}
                    defaultValue=""
                    className="w-full text-xs bg-slate-950 text-slate-200 border border-slate-700/80 rounded-xl px-3 py-2 focus:outline-none focus:border-amber-500 transition-colors cursor-pointer"
                  >
                    <option value="" disabled>
                      📋 Carregar Modelo de Exemplo...
                    </option>
                    <option value="tcc-ia-diagnostico">Monografia Completa (Bacharelado)</option>
                    <option value="tcc-tecnico-automacao">TCC Técnico (Projeto Prático)</option>
                    <option value="tcc-artigo-gestao">Artigo Científico ABNT (NBR 6022)</option>
                    <option value="novo-em-branco">Projeto em Branco (Novo)</option>
                  </select>
                </div>

                {/* Section 4: Backup & Restore (.json) */}
                <div className="pt-2 border-t border-slate-800">
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                    Cópia de Segurança (.json)
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 mt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setShowToolsMenu(false);
                        onExportJSON();
                      }}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-sky-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-sky-400" />
                      <span>Exportar Backup</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowToolsMenu(false);
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-xl text-xs font-semibold bg-slate-800/80 hover:bg-slate-800 text-emerald-300 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Restaurar</span>
                    </button>
                  </div>
                </div>
              </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs (Displayed strictly in Editor mode, keeping Home screen 100% clean) */}
      {activeTab !== 'inicio' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 scrollbar-none">
          {/* Direct Back to Home button */}
          <button
            type="button"
            onClick={() => handleTabClick('inicio')}
            className="flex items-center gap-1.5 py-2 px-3 text-xs font-semibold text-slate-300 hover:text-amber-300 hover:bg-slate-800 rounded-lg transition-colors mr-1 cursor-pointer shrink-0"
            title="Voltar para a Tela Inicial (Hub de Documentos)"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Início</span>
          </button>

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

          {/* Indicator and Return button when an extra tool from the menu is active */}
          {(isTabActive('gerador_ia') ||
            isTabActive('auditoria') ||
            isTabActive('scripts') ||
            isTabActive('assistente_ia')) && (
            <div className="ml-2 flex items-center gap-2 py-1 pl-2 border-l border-slate-800">
              <span className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {isTabActive('gerador_ia') && <Wand2 className="w-3.5 h-3.5 text-amber-400" />}
                {isTabActive('auditoria') && <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />}
                {isTabActive('scripts') && <Terminal className="w-3.5 h-3.5 text-emerald-400" />}
                {isTabActive('assistente_ia') && <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span>
                  {isTabActive('gerador_ia') && 'Gerador IA'}
                  {isTabActive('auditoria') && 'Auditoria ABNT'}
                  {isTabActive('scripts') && 'Scripts CLI'}
                  {isTabActive('assistente_ia') && 'Chat com IA'}
                </span>
              </span>
              <button
                type="button"
                onClick={() => handleTabClick('secoes')}
                className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                title="Voltar para a edição direta do documento"
              >
                <ArrowLeft className="w-3 h-3 text-amber-400" />
                <span>Voltar ao Documento</span>
              </button>
            </div>
          )}

          {/* Quick shortcut to open tools menu from the tab bar */}
          <button
            type="button"
            onClick={() => setShowToolsMenu(!showToolsMenu)}
            className="ml-auto flex items-center gap-1.5 py-1.5 px-3 text-xs font-medium text-slate-400 hover:text-amber-300 hover:bg-slate-800/60 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            title="Abrir Menu de Ferramentas, IA e Utilitários"
          >
            <Menu className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Mais Ferramentas ▾</span>
          </button>
        </div>
      )}

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
