import React, { useState, useEffect } from 'react';
import {
  Compass,
  BookOpen,
  FileText,
  Bookmark,
  Layers,
  Eye,
  Wand2,
  ShieldCheck,
  Terminal,
  Sparkles,
  Download,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
} from 'lucide-react';
import { ViewTab } from '../types';

interface TutorialStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  tabKey?: ViewTab;
  description: string;
  keyFeatures: string[];
  proTip: string;
}

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'intro',
    title: 'Bem-vindo ao DocuTCC!',
    subtitle: 'Plataforma Científica de TCC e Normas ABNT',
    icon: Compass,
    iconColor: 'text-amber-400',
    description:
      'O DocuTCC foi desenvolvido para eliminar as dores de cabeça com formatação de trabalhos acadêmicos (TCC, monografias, artigos e projetos técnicos). Tudo é configurado automaticamente nas normas ABNT NBR 14724, 6023, 10520 e 6028.',
    keyFeatures: [
      'Documento sempre formatado com margens ABNT (3cm sup/esq, 2cm inf/dir)',
      'Geração e exportação para Word (.docx) e PDF pronto para entrega',
      'Inteligência Artificial integrada para redigir, expandir e analisar figuras',
      'Funciona no computador e como Web App no celular (instalação com 1 clique)',
    ],
    proTip: 'Você pode reabrir este tutorial a qualquer momento clicando no botão "Tutorial" no topo da tela.',
  },
  {
    id: 'metadata',
    title: '1. Capa & Dados ABNT',
    subtitle: 'Identificação oficial da instituição e autores (NBR 14724)',
    icon: BookOpen,
    iconColor: 'text-amber-400',
    tabKey: 'metadata',
    description:
      'Nesta aba você preenche os dados formais do seu trabalho. O DocuTCC posiciona os elementos na Capa e Folha de Rosto com a tipografia, espaçamento e recuos exigidos pela banca examinadora.',
    keyFeatures: [
      'Instituição, Faculdade/Instituto, Curso e Cidade/Ano',
      'Título e Subtítulo padronizados em caixa alta e negrito',
      'Natureza do trabalho (ex: "Trabalho de Conclusão de Curso apresentado à...")',
      'Nome do Orientador, Coorientador e múltiplos autores',
    ],
    proTip: 'A capa não conta na paginação; a contagem inicia na Folha de Rosto e a numeração só é exibida a partir da Introdução.',
  },
  {
    id: 'secoes',
    title: '2. Capítulos & Conteúdo',
    subtitle: 'Editor de texto acadêmico com formatação científica',
    icon: FileText,
    iconColor: 'text-sky-400',
    tabKey: 'secoes',
    description:
      'Aqui você redige os capítulos do seu TCC com hierarquia automática (1 INTRODUÇÃO, 1.1 Objetivos, 1.1.1 Específicos). O editor cuida dos recuos de parágrafo de 1,25 cm e espaçamento entrelinhas 1,5.',
    keyFeatures: [
      'Numeração automática e hierarquia de títulos ABNT',
      'Formatação de citação direta longa com recuo de 4 cm e fonte 10pt',
      'Botão "Adicionar Figuras" direto no capítulo ativo',
      'Botão "Implementar Informações (IA)" para incorporar suas anotações ou dados de pesquisa no texto com estilo formal',
    ],
    proTip: 'Use o botão "Aprimorar com IA" para transformar rascunhos em escrita científica impessoal.',
  },
  {
    id: 'citacoes',
    title: '3. Citações & NBR 6023',
    subtitle: 'Gerenciador bibliográfico e inserção automática no texto',
    icon: Bookmark,
    iconColor: 'text-blue-400',
    tabKey: 'citacoes',
    description:
      'Cadastre livros, artigos científicos, sites, monografias e teses. O sistema formata a referência bibliográfica na íntegra segundo a NBR 6023:2018 e fornece a citação autor-data pronta para copiar.',
    keyFeatures: [
      'Citações no sistema autor-data: (SILVA, 2024) e Segundo Silva (2024)',
      'Organização automática da lista de referências em ordem alfabética',
      'Destaque tipográfico automático em negrito no título da obra',
      'Importação e sugestão de fontes acadêmicas via inteligência artificial',
    ],
    proTip: 'Clique em "Copiar Citação" para colar a citação direta ou indireta diretamente no seu texto.',
  },
  {
    id: 'referencias_cruzadas',
    title: '4. Figuras, Tabelas & IA Vision',
    subtitle: 'Gestão de ilustrações com legendas e análise multimodal',
    icon: Layers,
    iconColor: 'text-emerald-400',
    tabKey: 'referencias_cruzadas',
    description:
      'Gerencie figuras, gráficos e tabelas com conformidade ABNT: título e número no topo (Figura 1 – Título), imagem centralizada e Fonte na base. Envie múltiplas imagens simultaneamente!',
    keyFeatures: [
      'Upload múltiplo de fotos e gráficos de uma só vez',
      'Análise com IA Multimodal (Gemini Vision): identifica o conteúdo técnico da imagem e sugere título e fonte',
      'Geração de parágrafo científico de contextualização pronto para o texto',
      'Lista de Ilustrações gerada automaticamente no documento final',
    ],
    proTip: 'Vincule cada figura ao seu respectivo capítulo para que ela seja renderizada exatamente onde deve estar.',
  },
  {
    id: 'preview',
    title: '5. Visualização ABNT (A4 Real)',
    subtitle: 'Pré-visualização em tempo real das folhas impressas',
    icon: Eye,
    iconColor: 'text-amber-400',
    tabKey: 'preview',
    description:
      'Veja exatamente como seu trabalho será impresso em papel A4 (210mm × 297mm). Todas as páginas, sumário, elementos pré-textuais e paginação no canto superior direito são renderizados com fidelidade absoluta.',
    keyFeatures: [
      'Réguas milimétricas com margens 3-3-2-2 cm',
      'Sumário automático gerado dinamicamente com numeração de páginas',
      'Controles de zoom (50% a 130%) e modo "Ajustar à Tela"',
      'Exportação direta para Word (.docx) e Impressão em PDF de alta resolução',
    ],
    proTip: 'No celular, o preview se ajusta perfeitamente permitindo zoom e rolagem suave.',
  },
  {
    id: 'gerador_ia',
    title: '6. Gerador Autônomo com IA',
    subtitle: 'Criação estruturada do TCC a partir do seu tema',
    icon: Wand2,
    iconColor: 'text-amber-400',
    tabKey: 'gerador_ia',
    description:
      'Se você está começando do zero, informe o tema do seu TCC, curso, área de pesquisa e objetivos. O Gerador Autônomo cria a estrutura completa do trabalho com introdução, fundamentação e metodologia científica.',
    keyFeatures: [
      'Gera Capa, Resumo em Português e Abstract em Inglês',
      'Cria capítulos coerentes com citações no formato ABNT',
      'Cadastra referências bibliográficas reais pertinentes ao tema',
      'Permite editar e expandir qualquer seção gerada',
    ],
    proTip: 'Quanto mais detalhes você fornecer sobre o objetivo da sua pesquisa, mais aprofundado será o conteúdo gerado.',
  },
  {
    id: 'auditoria',
    title: '7. Auditoria ABNT',
    subtitle: 'Verificação em tempo real e correção em 1 clique',
    icon: ShieldCheck,
    iconColor: 'text-indigo-400',
    tabKey: 'auditoria',
    description:
      'O módulo de auditoria funciona como um membro exigente da banca examinadora: ele inspeciona o documento em busca de seções vazias, figuras sem fonte, referências incompletas ou dados pendentes na capa.',
    keyFeatures: [
      'Pontuação de conformidade ABNT (0 a 100%)',
      'Identificação visual de avisos críticos e recomendações',
      'Botões de correção rápida para resolver pendências em 1 clique',
      'Garantia de que o trabalho segue todas as exigências das NBRs',
    ],
    proTip: 'Antes de imprimir ou exportar para a banca, execute a Auditoria para garantir nota máxima em conformidade.',
  },
  {
    id: 'scripts',
    title: '8. Scripts & Automações CLI',
    subtitle: 'Ferramentas avançadas para pesquisadores e estudantes',
    icon: Terminal,
    iconColor: 'text-emerald-400',
    tabKey: 'scripts',
    description:
      'Acesse utilitários de produtividade: contagem detalhada de palavras por capítulo, exportações de backup em lote, scripts de formatação e automações para quem gosta de trabalhar rápido.',
    keyFeatures: [
      'Cálculo e estatísticas precisas de volume textual',
      'Backup e restauração rápida em arquivo JSON seguro',
      'Scripts de conversão e utilitários acadêmicos',
    ],
    proTip: 'Faça backup regular do seu trabalho com a opção "Exportar Backup (.json)" no menu superior.',
  },
  {
    id: 'assistente_ia',
    title: '9. Chat com IA Especialista',
    subtitle: 'Assistente acadêmico disponível 24 horas',
    icon: Sparkles,
    iconColor: 'text-amber-400',
    tabKey: 'assistente_ia',
    description:
      'Tire dúvidas sobre normas ABNT, solicite reescrita em linguagem científica formal, peça sugestões de temas, formulação de hipóteses ou desenvolvimento de parágrafos metodológicos.',
    keyFeatures: [
      'Aprimoramento de textos com foco em impessoalidade acadêmica',
      'Sugestão de autores de referência e fundamentação teórica',
      'Esclarecimento pontual de dúvidas de formatação',
    ],
    proTip: 'Você pode selecionar qualquer texto no Editor de Capítulos e enviá-lo diretamente para a IA aprimorar.',
  },
  {
    id: 'pwa',
    title: '10. Web App (PWA) & Instalação',
    subtitle: 'Instale no seu celular, tablet ou computador',
    icon: Smartphone,
    iconColor: 'text-sky-400',
    description:
      'O DocuTCC é uma Progressive Web App (PWA) completa! Você pode instalá-lo como um aplicativo nativo no seu celular (Android ou iPhone) e no PC (Windows, Mac, Linux).',
    keyFeatures: [
      'Ícone oficial do DocuTCC na sua tela inicial',
      'Abertura instantânea em tela cheia sem barras de navegador',
      'Totalmente adaptado para telas sensíveis ao toque (mobile-friendly)',
      'Armazenamento local seguro no seu dispositivo (IndexedDB)',
    ],
    proTip: 'Clique em "Instalar Web App" no topo da tela para instalar no seu aparelho agora mesmo!',
  },
];

interface InteractiveTutorialProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: ViewTab) => void;
  currentTab: ViewTab;
}

export const InteractiveTutorial: React.FC<InteractiveTutorialProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  currentTab,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') {
        setCurrentStepIndex((prev) => Math.min(prev + 1, TUTORIAL_STEPS.length - 1));
      } else if (e.key === 'ArrowLeft') {
        setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentStep = TUTORIAL_STEPS[currentStepIndex];
  const IconComponent = currentStep.icon;
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === TUTORIAL_STEPS.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      onClose();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  };

  const handleTryFeature = () => {
    if (currentStep.tabKey) {
      onNavigateTab(currentStep.tabKey);
    }
  };

  return (
    <div
      id="docutcc-tutorial-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        id="docutcc-tutorial-card"
        className="bg-slate-900 border border-amber-500/40 rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto flex flex-col justify-between"
      >
        {/* Header with Title and Close button */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center">
              <Compass className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-1.5">
                Tutorial Interativo DocuTCC
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">
                  {currentStepIndex + 1}/{TUTORIAL_STEPS.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">Guia passo a passo de todas as funções da plataforma</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar Tutorial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-amber-500 to-amber-400 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / TUTORIAL_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        <div className="space-y-3.5 py-1">
          {/* Step Badge & Title */}
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 shadow-sm">
              <IconComponent className={`w-5 h-5 ${currentStep.iconColor}`} />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-100 leading-tight">
                {currentStep.title}
              </h3>
              <p className="text-xs text-amber-400/90 font-medium mt-0.5">
                {currentStep.subtitle}
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentStep.description}
          </p>

          {/* Key Features List */}
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800/80 space-y-2">
            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
              Recursos Principais:
            </span>
            <ul className="space-y-1.5">
              {currentStep.keyFeatures.map((feat, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                  <span className="leading-snug">{feat}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Pro Tip Callout */}
          <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-start gap-2">
            <span className="text-amber-400 text-xs shrink-0">💡</span>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              <strong>Dica:</strong> {currentStep.proTip}
            </p>
          </div>

          {/* Interactive Feature Action Button if linked to a tab */}
          {currentStep.tabKey && (
            <div className="pt-1 flex items-center justify-between bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60">
              <span className="text-xs text-slate-300">
                {currentTab === currentStep.tabKey
                  ? 'Você já está visualizando esta aba no fundo.'
                  : 'Deseja experimentar esta função agora?'}
              </span>
              <button
                type="button"
                onClick={handleTryFeature}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold transition-colors border border-amber-500/40 flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>{currentTab === currentStep.tabKey ? 'Aba Ativa' : 'Abrir Aba'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Navigation Step Indicators (Dots) & Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
          {/* Step dots */}
          <div className="flex items-center gap-1 max-w-[180px] sm:max-w-xs overflow-x-auto py-1 scrollbar-none">
            {TUTORIAL_STEPS.map((step, idx) => (
              <button
                key={step.id}
                type="button"
                onClick={() => setCurrentStepIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                  idx === currentStepIndex
                    ? 'bg-amber-400 w-5'
                    : 'bg-slate-700 hover:bg-slate-600'
                }`}
                title={`Ir para o passo ${idx + 1}: ${step.title}`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrev}
              disabled={isFirstStep}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 disabled:opacity-30 disabled:pointer-events-none transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Anterior</span>
            </button>

            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>{isLastStep ? 'Concluir' : 'Próximo'}</span>
              {!isLastStep && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Initial welcome prompt (shown non-intrusively once upon first opening)
interface WelcomeBannerProps {
  onStartTutorial: () => void;
  onDismiss: () => void;
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  onStartTutorial,
  onDismiss,
}) => {
  return (
    <div
      id="docutcc-welcome-banner"
      className="no-print bg-gradient-to-r from-amber-500/15 via-slate-900 to-indigo-500/15 border-b border-amber-500/30 px-4 sm:px-6 py-2.5 animate-in fade-in slide-in-from-top duration-300"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30">
            <Compass className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
              Primeira vez no DocuTCC?
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                Tour Rápido
              </span>
            </h4>
            <p className="text-[11px] text-slate-300">
              Conheça em 1 minuto como formatar seu TCC segundo as normas ABNT, usar IA para escrever e exportar em Word (.docx).
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onStartTutorial}
            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Iniciar Tour Interativo</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 text-xs transition-colors cursor-pointer"
            title="Fechar aviso (você pode abrir o tutorial mais tarde)"
          >
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
};
