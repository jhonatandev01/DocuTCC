import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Plus,
  FileText,
  BookOpen,
  GraduationCap,
  Sparkles,
  ArrowRight,
  Clock,
  Bookmark,
  Layers,
  HelpCircle,
  Compass,
  CheckCircle2,
  Calendar,
  Wand2,
  ShieldCheck,
  MessageSquare,
  Bot,
  Zap,
  Filter,
} from 'lucide-react';
import { TCCProject, ViewTab } from '../types';
import { getProjectStatistics } from '../utils/abntFormatter';

interface HomeScreenProps {
  project: TCCProject;
  onOpenEditor: (tab?: ViewTab) => void;
  onNewBlankProject: () => void;
  onLoadTemplate: (templateName: string) => void;
  onOpenTutorial: () => void;
  onOpenGuidelines: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  project,
  onOpenEditor,
  onNewBlankProject,
  onLoadTemplate,
  onOpenTutorial,
  onOpenGuidelines,
}) => {
  const [activeFilter, setActiveFilter] = useState<'todos' | 'modelos' | 'ia'>('todos');
  const stats = getProjectStatistics(project);

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Bom dia';
    if (hour >= 12 && hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Current formatted date
  const formattedDate = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date());

  // Capitalize first letter of formatted date
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);

  // Template cards definition with clean categories
  const templateCards = [
    {
      id: 'gerador_ia',
      title: 'Gerador IA Autônomo',
      subtitle: 'Estruturação Inteligente',
      badge: 'Autônomo',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
      description: 'Informe seu tema para criar um trabalho completo fundamentado com citações.',
      pagesPreview: 'Completo',
      category: 'ia',
      type: 'ai',
      isAiFeatured: true,
    },
    {
      id: 'tcc-ia-diagnostico',
      title: 'Monografia Acadêmica',
      subtitle: 'Bacharelado e Licenciatura',
      badge: 'Monografia',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      description: 'Estrutura clássica com Capa, Folha de Rosto, Resumo bilíngue, 5 Capítulos e Referências.',
      pagesPreview: '~18 págs.',
      category: 'modelos',
      type: 'monograph',
    },
    {
      id: 'tcc-artigo-gestao',
      title: 'Artigo Científico',
      subtitle: 'Publicação em Periódicos',
      badge: 'Artigo',
      badgeColor: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
      description: 'Formato direto para revistas e congressos com resumo bilíngue e seções numeradas.',
      pagesPreview: '~12 págs.',
      category: 'modelos',
      type: 'article',
    },
    {
      id: 'tcc-tecnico-automacao',
      title: 'TCC Técnico / Prático',
      subtitle: 'Nível Médio e Tecnológico',
      badge: 'Técnico',
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      description: 'Ideal para engenharia, automação e TI, com listas de ilustrações e cronograma.',
      pagesPreview: '~15 págs.',
      category: 'modelos',
      type: 'technical',
    },
  ];

  const filteredCards = templateCards.filter((card) => {
    if (activeFilter === 'todos') return true;
    return card.category === activeFilter;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: 'spring', stiffness: 300, damping: 24 },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-6xl mx-auto space-y-8"
    >
      {/* 1. Welcome Header (Style Google Docs / Canva - Clean & Spaced) */}
      <motion.section
        variants={itemVariants}
        id="home-welcome-banner"
        className="relative overflow-hidden rounded-3xl glass-panel-heavy p-6 sm:p-8"
      >
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400/90 tracking-wide uppercase">
              <Calendar className="w-3.5 h-3.5" />
              <span>{capitalizedDate}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle2 className="w-3 h-3" />
                Salvamento automático ativo
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {getGreeting()}, pesquisador(a)!
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Bem-vindo ao <span className="font-bold text-amber-300">DocuTCC</span>. Seu ambiente intuitivo para redigir, orientar e estruturar trabalhos acadêmicos com formatação automática.
            </p>
          </div>

          {/* Clean Call-to-action */}
          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenEditor('secoes')}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold text-sm shadow-lg shadow-amber-950/40 hover:shadow-amber-500/20 transition-all duration-200 cursor-pointer transform hover:scale-[1.02] active:scale-98"
            >
              <span>Continuar Redação</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onOpenTutorial}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-xs font-medium transition-colors cursor-pointer"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Tutorial Passo a Passo</span>
            </button>
          </div>
        </div>
      </motion.section>

      {/* 2. Destaques de Inteligência Artificial & Ferramentas Principais (Com Efeito e Transições) */}
      <motion.section variants={itemVariants} id="home-ai-spotlight" className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-300">
              <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                <span>Ferramentas de Inteligência Artificial</span>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded-full">
                  Em Destaque
                </span>
              </h2>
            </div>
          </div>
        </div>

        {/* 3 AI Cards with distinctive styling, hover transitions, and animated glow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Gerador Autônomo IA (Glowing animation & Shimmer) */}
          <div
            onClick={() => onOpenEditor('gerador_ia')}
            className="group relative overflow-hidden rounded-2xl glass-panel border-2 border-purple-500/50 hover:border-purple-400 p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1 animate-ai-glow"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-purple-500/25 transition-colors" />

            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="p-2.5 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-300 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all shadow-md shadow-purple-950/50">
                  <Wand2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-500/25 text-purple-200 border border-purple-500/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-purple-400 animate-spin" />
                  Gerador Autônomo
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-purple-200 transition-colors">
                Gerador Autônomo IA
              </h3>
              <p className="text-xs text-slate-300/90 leading-relaxed mt-1.5">
                Gere um trabalho acadêmico completo e fundamentado a partir do seu tema, estruturando capítulos e referências.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-purple-500/20 flex items-center justify-between text-xs font-bold text-purple-300 group-hover:text-purple-200">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                Criar TCC com IA
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Chat Especialista IA */}
          <div
            onClick={() => onOpenEditor('assistente_ia')}
            className="group relative overflow-hidden rounded-2xl glass-panel border border-sky-500/40 hover:border-sky-400 p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/20 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-sky-500/20 transition-colors" />

            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="p-2.5 rounded-xl bg-sky-500/20 border border-sky-500/40 text-sky-300 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all shadow-md shadow-sky-950/50">
                  <Bot className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/25 text-sky-200 border border-sky-500/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <MessageSquare className="w-3 h-3 text-sky-400" />
                  Orientador Virtual
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-sky-200 transition-colors">
                Chat Especialista IA
              </h3>
              <p className="text-xs text-slate-300/90 leading-relaxed mt-1.5">
                Converse com um orientador metodológico em tempo real para tirar dúvidas e aprimorar a redação de parágrafos.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-sky-500/20 flex items-center justify-between text-xs font-bold text-sky-300 group-hover:text-sky-200">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                Conversar com Orientador
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Auditoria ABNT */}
          <div
            onClick={() => onOpenEditor('auditoria')}
            className="group relative overflow-hidden rounded-2xl glass-panel border border-indigo-500/40 hover:border-indigo-400 p-5 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/20 cursor-pointer flex flex-col justify-between transform hover:-translate-y-1"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-indigo-500/20 transition-colors" />

            <div>
              <div className="flex items-center justify-between mb-3.5">
                <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-md shadow-indigo-950/50">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/25 text-indigo-200 border border-indigo-500/50 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-indigo-400" />
                  Diagnóstico Técnico
                </span>
              </div>

              <h3 className="text-base font-bold text-white group-hover:text-indigo-200 transition-colors">
                Auditoria ABNT
              </h3>
              <p className="text-xs text-slate-300/90 leading-relaxed mt-1.5">
                Varredura instantânea de citações órfãs, espaçamentos, notas de rodapé e conformidade com as normas.
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-indigo-500/20 flex items-center justify-between text-xs font-bold text-indigo-300 group-hover:text-indigo-200">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                Auditar Meu Trabalho
              </span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </motion.section>

      {/* 3. "Criar ou Escolher Modelo" Section with Filters (Google Docs / Canva Style) */}
      <motion.section variants={itemVariants} id="home-create-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Iniciar um novo documento
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comece com uma página em branco ou selecione uma estrutura pronta.
            </p>
          </div>

          {/* Interactive Filters */}
          <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400 ml-2 mr-0.5" />
            <button
              type="button"
              onClick={() => setActiveFilter('todos')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'todos'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Todos
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('modelos')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'modelos'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Modelos
            </button>
            <button
              type="button"
              onClick={() => setActiveFilter('ia')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === 'ia'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              IA
            </button>
          </div>
        </div>

        {/* Templates Grid (Docs & Canva style) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 sm:gap-4">
          {/* Card 1: The Iconic "+" Blank Document Card (Google Docs Style) */}
          {(activeFilter === 'todos' || activeFilter === 'modelos') && (
            <button
              type="button"
              onClick={onNewBlankProject}
              className="group text-left flex flex-col h-full rounded-2xl glass-panel border-2 border-dashed border-amber-500/40 hover:border-amber-400 p-3 sm:p-4 transition-all duration-200 hover:shadow-xl hover:shadow-amber-500/10 cursor-pointer relative transform hover:scale-[1.02]"
            >
              <div className="absolute top-2.5 right-2.5">
                <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 px-1.5 py-0.5 rounded">
                  Novo
                </span>
              </div>

              {/* A4 Sheet Mockup with big "+" */}
              <div className="w-full aspect-[3/4] rounded-xl bg-slate-950 border border-slate-800 group-hover:border-amber-500/50 flex flex-col items-center justify-center p-3 shadow-inner relative overflow-hidden transition-all duration-200 group-hover:bg-slate-900/60">
                {/* Subtle page lines */}
                <div className="w-12 h-1 bg-slate-800 rounded mb-1 opacity-50" />
                <div className="w-8 h-1 bg-slate-800 rounded mb-4 opacity-30" />

                {/* Central Plus Icon */}
                <div className="w-12 h-12 rounded-full bg-amber-500/15 group-hover:bg-amber-500 text-amber-400 group-hover:text-slate-950 flex items-center justify-center shadow-lg transition-all duration-200 transform group-hover:scale-110">
                  <Plus className="w-7 h-7 stroke-[2.5]" />
                </div>

                <div className="w-14 h-1 bg-slate-800 rounded mt-4 opacity-30" />
                <div className="w-10 h-1 bg-slate-800 rounded mt-1 opacity-40" />
              </div>

              <div className="mt-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
                    Em Branco
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    Comece um trabalho do zero com capas e margens prontas.
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-amber-400 font-semibold">
                  <span>+ Criar em Branco</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </button>
          )}

          {/* Cards: Filtered Templates */}
          {filteredCards.map((tpl) => (
            <div
              key={tpl.id}
              onClick={() => {
                if (tpl.id === 'gerador_ia') {
                  onOpenEditor('gerador_ia');
                } else {
                  onLoadTemplate(tpl.id);
                  onOpenEditor('secoes');
                }
              }}
              className={`group text-left flex flex-col h-full rounded-2xl glass-panel p-3 sm:p-4 transition-all duration-200 cursor-pointer relative transform hover:scale-[1.02] ${
                tpl.type === 'ai'
                  ? 'border-2 border-purple-500/50 hover:border-purple-400 hover:shadow-xl hover:shadow-purple-500/20'
                  : 'border border-slate-800 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50'
              }`}
            >
              {/* Top Badge */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${tpl.badgeColor}`}>
                  {tpl.badge}
                </span>
                <span className={`text-[10px] font-mono ${tpl.type === 'ai' ? 'text-purple-300 font-semibold' : 'text-slate-500'}`}>
                  {tpl.pagesPreview}
                </span>
              </div>

              {/* Visual Document Mockup */}
              <div className={`w-full aspect-[3/4] rounded-xl border p-3 shadow-inner flex flex-col justify-between overflow-hidden relative transition-all duration-200 ${
                tpl.type === 'ai'
                  ? 'bg-slate-950/90 border-purple-500/30 group-hover:border-purple-400/60'
                  : 'bg-slate-950 border-slate-800 group-hover:border-slate-700'
              }`}>
                <div className="space-y-1">
                  <div className={`w-full h-1 rounded ${tpl.type === 'ai' ? 'bg-purple-900/50' : 'bg-slate-800'}`} />
                  <div className={`w-3/4 h-1 rounded ${tpl.type === 'ai' ? 'bg-purple-900/30' : 'bg-slate-800/60'}`} />
                </div>

                <div className="my-auto py-2 text-center">
                  <div className={`inline-flex items-center justify-center p-2 rounded-lg mb-1 transition-colors ${
                    tpl.type === 'ai'
                      ? 'bg-purple-500/20 text-purple-300 group-hover:bg-purple-500 group-hover:text-white'
                      : 'bg-slate-800/60 text-slate-300 group-hover:text-amber-400'
                  }`}>
                    {tpl.type === 'monograph' && <BookOpen className="w-4 h-4" />}
                    {tpl.type === 'article' && <FileText className="w-4 h-4" />}
                    {tpl.type === 'technical' && <GraduationCap className="w-4 h-4" />}
                    {tpl.type === 'ai' && <Wand2 className="w-4 h-4 animate-pulse" />}
                  </div>
                  <div className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter truncate px-1">
                    {tpl.title}
                  </div>
                  <div className={`w-1/2 h-0.5 mx-auto mt-1 rounded ${tpl.type === 'ai' ? 'bg-purple-500/60' : 'bg-amber-500/40'}`} />
                </div>

                <div className="space-y-1">
                  <div className={`w-1/2 h-1 rounded mx-auto ${tpl.type === 'ai' ? 'bg-purple-900/40' : 'bg-slate-800/60'}`} />
                  <div className={`w-1/3 h-1 rounded mx-auto ${tpl.type === 'ai' ? 'bg-purple-900/30' : 'bg-slate-800/40'}`} />
                </div>
              </div>

              {/* Content info */}
              <div className="mt-3 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className={`text-xs sm:text-sm font-bold transition-colors ${
                    tpl.type === 'ai' ? 'text-purple-200 group-hover:text-purple-100' : 'text-white group-hover:text-amber-300'
                  }`}>
                    {tpl.title}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                    {tpl.description}
                  </p>
                </div>

                <div className={`mt-2 pt-2 border-t flex items-center justify-between text-[10px] font-medium transition-colors ${
                  tpl.type === 'ai'
                    ? 'border-purple-500/30 text-purple-300 group-hover:text-purple-200 font-bold'
                    : 'border-slate-800/80 text-slate-300 group-hover:text-amber-300'
                }`}>
                  <span>{tpl.type === 'ai' ? '⚡ Abrir Gerador' : '+ Usar Modelo'}</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* 4. "Documento Ativo / Recente" Section */}
      <motion.section variants={itemVariants} id="home-recent-document-section" className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Seu Trabalho em Andamento</span>
          </h2>

          <button
            type="button"
            onClick={() => onOpenEditor('preview')}
            className="text-xs text-amber-400 hover:text-amber-300 transition-colors font-medium flex items-center gap-1 cursor-pointer"
          >
            <span>Ver Visualização Final</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Recent Document Card */}
        <div className="rounded-2xl glass-panel hover:border-slate-700/80 p-5 sm:p-6 transition-all shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Document Info */}
            <div className="flex items-start gap-4 flex-1 min-w-0">
              <div
                onClick={() => onOpenEditor('secoes')}
                className="w-14 sm:w-16 aspect-[3/4] rounded-lg bg-slate-950 border border-amber-500/40 shadow-md p-1.5 flex flex-col justify-between shrink-0 cursor-pointer group hover:border-amber-400 transition-colors"
                title="Clique para editar"
              >
                <div className="space-y-0.5">
                  <div className="w-full h-0.5 bg-slate-700 rounded" />
                  <div className="w-2/3 h-0.5 bg-slate-700 rounded" />
                </div>
                <div className="w-full text-[6px] font-bold text-amber-400 text-center uppercase tracking-tighter truncate">
                  TCC
                </div>
                <div className="w-1/2 h-0.5 bg-slate-700 rounded mx-auto" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full">
                    {project.documentType === 'monografia'
                      ? 'Monografia'
                      : project.documentType === 'artigo'
                      ? 'Artigo Científico'
                      : project.documentType === 'tcc_tecnico'
                      ? 'TCC Técnico'
                      : 'Trabalho Acadêmico'}
                  </span>
                  <span className="text-xs text-slate-400 truncate">
                    {project.institution?.name || 'Instituição de Ensino'}
                  </span>
                </div>

                <h3
                  onClick={() => onOpenEditor('secoes')}
                  className="text-base sm:text-lg font-bold text-white hover:text-amber-300 transition-colors cursor-pointer line-clamp-2"
                >
                  {project.title || 'Novo Trabalho de Conclusão de Curso'}
                </h3>

                {project.subtitle && (
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {project.subtitle}
                  </p>
                )}

                {/* Metadata summary */}
                <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-slate-400 mt-2.5 pt-2 border-t border-slate-800/80">
                  <span className="flex items-center gap-1.5 text-slate-300">
                    <FileText className="w-3.5 h-3.5 text-amber-400" />
                    ~{stats.estimatedPages} páginas ({stats.wordCount.toLocaleString('pt-BR')} palavras)
                  </span>

                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Bookmark className="w-3.5 h-3.5 text-blue-400" />
                    {stats.totalReferences} referências catalogadas
                  </span>

                  <span className="flex items-center gap-1.5 text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-emerald-400" />
                    {stats.totalFigures + stats.totalTables} figuras/tabelas
                  </span>
                </div>
              </div>
            </div>

            {/* Actions for this document */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800 shrink-0">
              <button
                type="button"
                onClick={() => onOpenEditor('metadata')}
                className="flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Capa & Dados
              </button>

              <button
                type="button"
                onClick={() => onOpenEditor('secoes')}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-450 text-slate-950 text-xs font-bold shadow-md shadow-amber-950/30 transition-all cursor-pointer"
              >
                <span>Continuar Editando</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
};
