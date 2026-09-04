import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ProjectMetadataEditor } from './components/ProjectMetadataEditor';
import { SectionEditor } from './components/SectionEditor';
import { CitationsManager } from './components/CitationsManager';
import { CrossReferenceManager } from './components/CrossReferenceManager';
import { ABNTDocumentPreview } from './components/ABNTDocumentPreview';
import { AIAcademicAssistant } from './components/AIAcademicAssistant';
import { AutonomousTCCGenerator } from './components/AutonomousTCCGenerator';
import { ABNTAuditor } from './components/ABNTAuditor';
import { ScriptsAutomationCenter } from './components/ScriptsAutomationCenter';
import { TCCProject, ViewTab } from './types';
import { sampleMonograph, sampleArticle, sampleTechnicalTCC } from './data/sampleProjects';
import {
  saveProjectToStorage,
  loadProjectFromStorage,
  getInitialProject,
} from './utils/storage';

export default function App() {
  const [project, setProject] = useState<TCCProject>(() => getInitialProject());

  const [activeTab, setActiveTab] = useState<ViewTab>('preview');

  // AI assistant prompt transfer
  const [aiAssistantPrompt, setAiAssistantPrompt] = useState<string>('');
  const [aiAssistantAction, setAiAssistantAction] = useState<string>('sugestao_tema');

  const [saveStatus, setSaveStatus] = useState<string>('');

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

  // Trigger Print
  const handlePrint = () => {
    setActiveTab('preview');
    setTimeout(() => {
      window.print();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
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

      {/* Footer */}
      <footer className="no-print border-t border-slate-850 py-4 px-6 bg-slate-950/80 text-center text-xs text-slate-500">
        DocuTCC – Plataforma Científica de Documentação Acadêmica ABNT (NBR 14724, NBR 6023, NBR 10520, NBR 6028).
      </footer>
    </div>
  );
}

