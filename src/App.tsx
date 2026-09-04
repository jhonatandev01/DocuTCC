import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { ProjectMetadataEditor } from './components/ProjectMetadataEditor';
import { SectionEditor } from './components/SectionEditor';
import { CitationsManager } from './components/CitationsManager';
import { CrossReferenceManager } from './components/CrossReferenceManager';
import { ABNTDocumentPreview } from './components/ABNTDocumentPreview';
import { AIAcademicAssistant } from './components/AIAcademicAssistant';
import { AutonomousTCCGenerator } from './components/AutonomousTCCGenerator';
import { ABNTAuditor } from './components/ABNTAuditor';
import { ScriptsAutomationCenter } from './components/ScriptsAutomationCenter';
import { AnimatePresence } from 'motion/react';
import { InteractiveTutorial } from './components/InteractiveTutorial';
import { TermsOfUseModal } from './components/TermsOfUseModal';
import { SplashIntro } from './components/SplashIntro';
import {
  BookOpen,
  FileText,
  Bookmark,
  Layers,
  Eye,
  Wand2,
  Sparkles,
  Compass,
  Home,
  Plus,
} from 'lucide-react';
import { TCCProject, ViewTab } from './types';
import { sampleMonograph, sampleArticle, sampleTechnicalTCC } from './data/sampleProjects';
import {
  saveProjectToStorage,
  loadProjectFromStorage,
  getInitialProject,
} from './utils/storage';

export default function App() {
  const [project, setProject] = useState<TCCProject>(() => getInitialProject());

  // Default to clean HomeScreen (Google Docs / Canva style Hub)
  const [activeTab, setActiveTab] = useState<ViewTab>('inicio');

  // AI assistant prompt transfer
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string>('');
  const [aiAssistantAction, setAiAssistantAction] = useState<string>('sugestao_tema');

  const [saveStatus, setSaveStatus] = useState<string>('');

  // Interactive Tutorial modal state (accessible via the Header Menu)
  const [showTutorial, setShowTutorial] = useState<boolean>(false);
  const [showTerms, setShowTerms] = useState<boolean>(false);
  const [showIntro, setShowIntro] = useState<boolean>(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('docutcc_terms_accepted');
    if (!hasAccepted) {
      setShowTerms(true);
    }
  }, []);

  const handleTermsAccept = () => {
    setShowTerms(false);
    setShowIntro(true);
  };

  // Load from high-capacity IndexedDB on initial mount
  useEffect(() => {
    let isMounted = true;
    loadProjectFromStorage().then((saved) => {
      if (isMounted && saved) {
        setProject(saved);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to high-capacity storage automatically with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      saveProjectToStorage(project).catch((err) => {
        console.warn('Erro ao sincronizar projeto em segundo plano:', err);
      });
    }, 600);

    return () => clearTimeout(timer);
  }, [project]);

  // Explicit Save to browser storage (IndexedDB + localStorage fallback)
  const handleSaveLocally = async () => {
    try {
      await saveProjectToStorage(project);
      const now = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setSaveStatus(`Salvo às ${now}`);
      setTimeout(() => setSaveStatus(''), 4000);
    } catch (e) {
      console.error('Erro ao salvar no armazenamento:', e);
      alert('Erro ao salvar no armazenamento local do navegador.');
    }
  };

  // Handle opening AI assistant with specific text to refine
  const handleOpenAIAssistantWithText = (text: string, contextTitle: string) => {
    setAiAssistantAction('refinar_texto');
    setAiAssistantPrompt(
      `Por favor, aprimore a redação do seguinte trecho da seção "${contextTitle}" para atender estritamente aos padrões de escrita científica e impessoal da ABNT:\n\n"${text}"`
    );
    setActiveTab('assistente_ia');
  };

  // Export JSON (Backup file for technical restoration)
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(project, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_tcc_${project.title.slice(0, 25).replace(/[^a-zA-Z0-9]/g, '_')}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON with FileReader
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && json.title && Array.isArray(json.sections)) {
          setProject(json);
          alert('Projeto acadêmico importado com sucesso!');
        } else {
          alert('O arquivo JSON selecionado não possui a estrutura válida de um projeto DocuTCC.');
        }
      } catch (err) {
        console.error('Erro ao ler arquivo JSON:', err);
        alert('Erro ao processar o arquivo JSON. Verifique se o formato é válido.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Load Template
  const handleLoadTemplate = (templateName: string) => {
    if (confirm('Deseja carregar este modelo? As alterações não salvas serão substituídas.')) {
      if (templateName === 'tcc-tecnico-automacao' || templateName === 'tcc_tecnico' || templateName === 'tecnico') {
        setProject(sampleTechnicalTCC);
      } else if (templateName === 'tcc-artigo-gestao' || templateName === 'artigo') {
        setProject(sampleArticle);
      } else if (templateName === 'novo-em-branco') {
        setProject({
          ...sampleMonograph,
          id: `tcc-${Date.now()}`,
          title: 'TÍTULO DO TRABALHO DE CONCLUSÃO DE CURSO',
          subtitle: '',
          sections: [
            {
              id: 'sec-intro',
              number: '1',
              title: 'INTRODUÇÃO',
              level: 1,
              content: 'Escreva aqui a introdução do trabalho com contexto, delimitação do tema, problema de pesquisa e objetivos...',
              type: 'textual',
            },
            {
              id: 'sec-ref',
              number: '2',
              title: 'REFERENCIAL TEÓRICO',
              level: 1,
              content: 'Apresente os fundamentos teóricos e conceitos pertinentes...',
              type: 'textual',
            },
            {
              id: 'sec-met',
              number: '3',
              title: 'METODOLOGIA',
              level: 1,
              content: 'Descreva os procedimentos metodológicos adotados na pesquisa...',
              type: 'textual',
            },
            {
              id: 'sec-conc',
              number: '4',
              title: 'CONSIDERAÇÕES FINAIS',
              level: 1,
              content: 'Apresente as conclusões e respostas aos objetivos propostos...',
              type: 'textual',
            },
          ],
          references: [],
          crossReferences: [],
          lastModified: new Date().toISOString(),
        });
      } else {
        setProject(sampleMonograph);
      }
    }
  };

  // Start fresh blank project and navigate directly to editor
  const handleNewBlankProject = () => {
    handleLoadTemplate('novo-em-branco');
    setActiveTab('secoes');
  };

  // Trigger Print
  const handlePrint = () => {
    setActiveTab('preview');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-mesh text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onTabChange={setActiveTab}
        project={project}
        onSaveLocally={handleSaveLocally}
        saveStatus={saveStatus}
        onExportJSON={handleExportJSON}
        onImportJSON={handleImportJSON}
        onPrint={handlePrint}
        onLoadTemplate={handleLoadTemplate}
        onNewBlankProject={handleNewBlankProject}
        onOpenTutorial={() => setShowTutorial(true)}
      />

      {/* Interactive Step-by-Step Tutorial Modal */}
      <InteractiveTutorial
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        currentTab={activeTab}
      />

      {showTerms && <TermsOfUseModal onAccept={handleTermsAccept} />}

      <AnimatePresence>
        {showIntro && <SplashIntro onComplete={() => setShowIntro(false)} />}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 pb-20 md:pb-8">
        {/* Clean Home Screen (Google Docs / Canva style Hub) */}
        {activeTab === 'inicio' && (
          <div className="animate-in fade-in duration-200">
            <HomeScreen
              project={project}
              onOpenEditor={(tab = 'secoes') => setActiveTab(tab)}
              onNewBlankProject={handleNewBlankProject}
              onLoadTemplate={(templateId) => {
                handleLoadTemplate(templateId);
                setActiveTab('secoes');
              }}
              onOpenTutorial={() => setShowTutorial(true)}
              onOpenGuidelines={() => setActiveTab('metadata')}
            />
          </div>
        )}

        {activeTab === 'metadata' && (
          <div className="animate-in fade-in duration-200">
            <ProjectMetadataEditor project={project} onChange={setProject} />
          </div>
        )}

        {(activeTab === 'secoes' || (activeTab as string) === 'editor') && (
          <div className="animate-in fade-in duration-200">
            <SectionEditor
              project={project}
              onChange={setProject}
              onOpenAIAssistantWithText={handleOpenAIAssistantWithText}
            />
          </div>
        )}

        {(activeTab === 'citacoes' || (activeTab as string) === 'citations') && (
          <div className="animate-in fade-in duration-200">
            <CitationsManager
              project={project}
              onChange={setProject}
              onOpenAIAssistantWithText={(prompt, action) => {
                setAiAssistantAction(action);
                setAiAssistantPrompt(prompt);
                setActiveTab('assistente_ia');
              }}
            />
          </div>
        )}

        {(activeTab === 'referencias_cruzadas' || (activeTab as string) === 'cross_references') && (
          <div className="animate-in fade-in duration-200">
            <CrossReferenceManager project={project} onChange={setProject} />
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="animate-in fade-in duration-200">
            <ABNTDocumentPreview project={project} onPrint={handlePrint} />
          </div>
        )}

        {activeTab === 'gerador_ia' && (
          <div className="animate-in fade-in duration-200">
            <AutonomousTCCGenerator
              onProjectGenerated={(newProj) => {
                setProject(newProj);
              }}
              onNavigateToPreview={() => setActiveTab('preview')}
            />
          </div>
        )}

        {activeTab === 'auditoria' && (
          <div className="animate-in fade-in duration-200">
            <ABNTAuditor
              project={project}
              onApplyFix={(fixedProj) => setProject(fixedProj)}
              onOpenSectionEditor={(secId) => {
                setActiveTab('secoes');
              }}
            />
          </div>
        )}

        {activeTab === 'scripts' && (
          <div className="animate-in fade-in duration-200">
            <ScriptsAutomationCenter project={project} />
          </div>
        )}

        {(activeTab === 'assistente_ia' || (activeTab as string) === 'ai_assistant') && (
          <div className="animate-in fade-in duration-200">
            <AIAcademicAssistant
              project={project}
              initialPrompt={aiAssistantPrompt}
              initialAction={aiAssistantAction}
            />
          </div>
        )}
      </main>

      {/* Mobile Bottom Navigation Bar (Direct Document Editing tabs) */}
      <nav
        id="docutcc-mobile-bottom-bar"
        className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 px-1 py-1 flex items-center justify-around shadow-2xl"
      >
        {[
          { key: 'inicio' as ViewTab, label: 'Início', icon: Home },
          { key: 'metadata' as ViewTab, label: 'Capa', icon: BookOpen },
          { key: 'secoes' as ViewTab, label: 'Capítulos', icon: FileText },
          { key: 'citacoes' as ViewTab, label: 'Citações', icon: Bookmark },
          { key: 'referencias_cruzadas' as ViewTab, label: 'Figuras', icon: Layers },
          { key: 'preview' as ViewTab, label: 'A4 Real', icon: Eye },
        ].map((item) => {
          const IconComponent = item.icon;
          const isActive =
            activeTab === item.key ||
            (item.key === 'referencias_cruzadas' && (activeTab as string) === 'cross_references') ||
            (item.key === 'secoes' && (activeTab as string) === 'editor') ||
            (item.key === 'citacoes' && (activeTab as string) === 'citations');

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setActiveTab(item.key)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg min-h-[48px] flex-1 transition-all cursor-pointer ${
                isActive
                  ? 'text-amber-400 font-bold bg-amber-500/10'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <IconComponent className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] leading-tight truncate">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <footer className="no-print border-t border-slate-850 py-4 px-6 bg-slate-950/80 text-center text-xs text-slate-500 hidden md:block">
        DocuTCC – Plataforma Científica de Documentação Acadêmica ABNT (NBR 14724, NBR 6023, NBR 10520, NBR 6028).
      </footer>
    </div>
  );
}

