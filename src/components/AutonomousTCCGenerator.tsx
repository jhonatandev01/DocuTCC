import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Wand2, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ArrowRight,
  GraduationCap,
  Layers,
  FileCheck2,
  Settings2,
  RefreshCw,
  Globe,
  ExternalLink
} from 'lucide-react';
import { TCCProject, AcademicDegree, DocumentType, GroundingSource } from '../types';

interface AutonomousTCCGeneratorProps {
  onProjectGenerated: (newProject: TCCProject) => void;
  onNavigateToPreview: () => void;
}

const PRESETS = [
  {
    id: 'iot_automacao_tecnico',
    name: 'TCC Técnico: IoT e Monitoramento Industrial com ESP32',
    course: 'Técnico em Eletrotécnica / Automação Industrial',
    degree: 'tecnico' as AcademicDegree,
    documentType: 'tcc_tecnico' as DocumentType,
    topic: 'Desenvolvimento de Módulo IoT de Baixo Custo com ESP32 para Monitoramento Térmico e de Corrente em Quadros Elétricos',
    objectives: 'Projetar e validar protótipo funcional de telemetria em tempo real com ESP32, sensores SCT-013 e DS18B20 para prevenção de sobrecargas segundo a NR-10 e NBR 5410.',
    methodology: 'Pesquisa aplicada com desenvolvimento de protótipo de bancada, testes com carga resistiva controlada, calibração analógica e telemetria via protocolo MQTT.',
    technologies: 'ESP32, C++, Protocolo MQTT, Node-RED, Sensores SCT-013 e DS18B20, NBR 5410, NR-10',
  },
  {
    id: 'yolo_almoxarifado',
    name: 'Visão Computacional & YOLOv8 no Almoxarifado',
    course: 'Ciência da Computação',
    degree: 'bacharelado' as AcademicDegree,
    documentType: 'monografia' as DocumentType,
    topic: 'Utilização de Visão Computacional para Automação de Inventário em Almoxarifados Industriais',
    objectives: 'Desenvolver sistema autônomo com YOLOv8 e OpenCV para reduzir o tempo de contagem de peças em 40% com acurácia superior a 95%.',
    methodology: 'Pesquisa aplicada e quantitativa, com anotação de dataset, treinamento de rede neural convolucional e validação em bancada experimental.',
    technologies: 'Python 3.10, Ultralytics YOLOv8, OpenCV, PyTorch, Node.js, Express, TypeScript',
  },
  {
    id: 'llm_educacao',
    name: 'Inteligência Artificial e LLMs na Educação Superior',
    course: 'Sistemas de Informação',
    degree: 'bacharelado' as AcademicDegree,
    documentType: 'monografia' as DocumentType,
    topic: 'Impacto dos Modelos de Linguagem de Grande Escala no Processo de Ensino-Aprendizagem Acadêmico',
    objectives: 'Analisar a percepção e o rendimento de discentes na utilização de assistentes generativos para resolução de problemas em engenharia.',
    methodology: 'Estudo de caso exploratório com aplicação de questionários estruturados, testes práticos e análise estatística comparativa.',
    technologies: 'Python, Pandas, Gemini API, RAG (Retrieval-Augmented Generation), PostgreSQL',
  },
  {
    id: 'arquitetura_microsservicos',
    name: 'Engenharia de Software: Microsserviços e Clean Arch',
    course: 'Engenharia de Software',
    degree: 'bacharelado' as AcademicDegree,
    documentType: 'artigo' as DocumentType,
    topic: 'Transição Arquitetural Monolítica para Microsserviços com Base em Princípios de Clean Architecture',
    objectives: 'Avaliar os impactos em latência, manutenibilidade e escalabilidade horizontal durante a migração de um sistema financeiro crítico.',
    methodology: 'Pesquisa experimental comparando benchmarks de estresse e métricas de acoplamento de código (CBO e LCOM).',
    technologies: 'TypeScript, Node.js, Docker, Kubernetes, Apache Kafka, Redis, Prometheus',
  },
  {
    id: 'saude_telemedicina',
    name: 'Segurança da Informação e LGPD em Telemedicina',
    course: 'Engenharia Biomédica',
    degree: 'bacharelado' as AcademicDegree,
    documentType: 'monografia' as DocumentType,
    topic: 'Implementação de Protocolos Criptográficos e Conformidade com a LGPD em Prontuários Eletrônicos em Nuvem',
    objectives: 'Propor um framework de anonimização e criptografia de ponta a ponta para compartilhamento seguro de exames médicos.',
    methodology: 'Pesquisa aplicada com modelagem de ameaças (STRIDE) e validação de desempenho de algoritmos pós-quânticos.',
    technologies: 'Criptografia AES-256, RSA-4096, HL7/FHIR, Python, AWS KMS',
  },
];

const GENERATION_STEPS = [
  'Inicializando motor neural de síntese acadêmica...',
  'Pesquisando fontes atualizadas, dados e referências reais na web (Google Grounding)...',
  'Estruturando metadados institucionais e folha de rosto...',
  'Gerando Resumo em português (NBR 6028) e Abstract em inglês...',
  'Redigindo Introdução, Problema e Objetivos específicos...',
  'Elaborando Fundamentação Teórica com dados da pesquisa e citações ABNT (NBR 10520)...',
  'Detalhando Metodologia e Desenvolvimento técnico...',
  'Catalogando referências bibliográficas rigorosas (NBR 6023:2018)...',
  'Diagramando estrutura com margens 3/3/2/2 cm e paginação...',
];

export const AutonomousTCCGenerator: React.FC<AutonomousTCCGeneratorProps> = ({
  onProjectGenerated,
  onNavigateToPreview,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('yolo_almoxarifado');
  const [topic, setTopic] = useState<string>(PRESETS[0].topic);
  const [course, setCourse] = useState<string>(PRESETS[0].course);
  const [degree, setDegree] = useState<AcademicDegree>(PRESETS[0].degree);
  const [documentType, setDocumentType] = useState<DocumentType>(PRESETS[0].documentType);
  const [objectives, setObjectives] = useState<string>(PRESETS[0].objectives);
  const [methodology, setMethodology] = useState<string>(PRESETS[0].methodology);
  const [technologies, setTechnologies] = useState<string>(PRESETS[0].technologies);
  
  const [authorName, setAuthorName] = useState<string>('Jhonatan Palmeira');
  const [advisorName, setAdvisorName] = useState<string>('Prof. Dr. Orientador Acadêmico');
  const [institutionName, setInstitutionName] = useState<string>('Universidade de Tecnologia e Ciência');
  const [city, setCity] = useState<string>('São Paulo');

  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successGenerated, setSuccessGenerated] = useState<boolean>(false);
  const [generatedSources, setGeneratedSources] = useState<GroundingSource[]>([]);

  const handleApplyPreset = (presetId: string) => {
    setSelectedPreset(presetId);
    const p = PRESETS.find(item => item.id === presetId);
    if (p) {
      setTopic(p.topic);
      setCourse(p.course);
      setDegree(p.degree);
      setDocumentType(p.documentType);
      setObjectives(p.objectives);
      setMethodology(p.methodology);
      setTechnologies(p.technologies);
    }
  };

  const handleStartGeneration = async () => {
    setIsGenerating(true);
    setErrorMsg(null);
    setSuccessGenerated(false);
    setCurrentStepIndex(0);

    // Step simulation interval for visual feedback
    const stepTimer = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < GENERATION_STEPS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 2800);

    try {
      const response = await fetch('/api/gemini/generate-full-tcc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          course,
          degree,
          documentType,
          objectives,
          methodology,
          technologies,
          authorName,
          advisorName,
          institutionName,
          city,
          year: new Date().getFullYear().toString(),
        }),
      });

      clearInterval(stepTimer);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Erro durante a geração com IA.');
      }

      const data = await response.json();
      if (data.project) {
        setCurrentStepIndex(GENERATION_STEPS.length - 1);
        if (data.project.groundingSources && Array.isArray(data.project.groundingSources)) {
          setGeneratedSources(data.project.groundingSources);
        } else {
          setGeneratedSources([]);
        }
        onProjectGenerated(data.project);
        setSuccessGenerated(true);
      } else {
        throw new Error('Formato inválido retornado pelo servidor.');
      }
    } catch (err: any) {
      clearInterval(stepTimer);
      console.error(err);
      setErrorMsg(err.message || 'Falha ao gerar o projeto com IA.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-indigo-500/10 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-amber-400" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-medium mb-3">
            <Wand2 className="w-3.5 h-3.5" />
            Estruturação Inicial em 1-Clique
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Assistente Estrutural de TCC
          </h2>
          <p className="text-slate-300 text-sm sm:text-base mt-2 leading-relaxed">
            Descreva o tema, objetivos e metodologia do seu projeto. O assistente de inteligência artificial
            ajudará a elaborar automaticamente a estrutura inicial do seu trabalho, sugerindo tópicos, 
            citações iniciais e a organização básica exigida pelas normas ABNT.
          </p>
        </div>
      </div>

      {/* Preset Quick Selection */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-semibold text-white">Modelos Prontos de Alta Relevância</h3>
          </div>
          <span className="text-xs text-slate-400">Clique para preencher os campos automaticamente</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handleApplyPreset(preset.id)}
              className={`text-left p-3.5 rounded-lg border transition-all ${
                selectedPreset === preset.id
                  ? 'border-amber-500 bg-amber-500/10 shadow-sm shadow-amber-500/10 ring-1 ring-amber-500/40'
                  : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="text-xs font-semibold text-amber-400 mb-1 flex items-center justify-between">
                <span>{preset.course}</span>
                <span className="uppercase text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                  {preset.documentType}
                </span>
              </div>
              <div className="text-sm font-medium text-slate-200 line-clamp-2 leading-snug">
                {preset.name}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Configuration Form */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
        <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
          <Settings2 className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-semibold text-white">Especificações do Trabalho Acadêmico</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Academic Metadata */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tema / Título Principal do TCC *
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                rows={3}
                placeholder="Ex: Utilização de Visão Computacional para Automação de Inventário em Almoxarifados..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Curso / Programa *
                </label>
                <input
                  type="text"
                  value={course}
                  onChange={(e) => setCourse(e.target.value)}
                  placeholder="Ex: Ciência da Computação"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nível / Grau Acadêmico
                </label>
                <select
                  value={degree}
                  onChange={(e) => setDegree(e.target.value as AcademicDegree)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="tecnico">Técnico (Nível Médio - Habilitação Profissional)</option>
                  <option value="bacharelado">Bacharelado (Nível Superior)</option>
                  <option value="licenciatura">Licenciatura (Nível Superior)</option>
                  <option value="tecnologo">Tecnólogo (Graduação Tecnológica - Nível Superior)</option>
                  <option value="especializacao">Especialização (Pós-Graduação)</option>
                  <option value="mestrado">Mestrado (Stricto Sensu)</option>
                  <option value="doutorado">Doutorado (Stricto Sensu)</option>
                </select>
                {degree === 'tecnico' && (
                  <p className="text-[10px] text-emerald-400 mt-1">
                    * Nível Médio Profissionalizante: confere habilitação profissional de Técnico (não confere grau de tecnólogo).
                  </p>
                )}
                {degree === 'tecnologo' && (
                  <p className="text-[10px] text-sky-400 mt-1">
                    * Graduação Tecnológica: curso superior de tecnologia (CST).
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Tipo de Trabalho Acadêmico
                </label>
                <select
                  value={documentType}
                  onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                >
                  <option value="tcc_tecnico">TCC Técnico / Projeto de Conclusão Técnico</option>
                  <option value="monografia">Monografia Completa (NBR 14724)</option>
                  <option value="artigo">Artigo Científico (NBR 6022)</option>
                  <option value="relatorio_tecnico">Relatório Técnico / Tecnológico</option>
                  <option value="projeto_pesquisa">Projeto de Pesquisa / Pré-Projeto</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Instituição de Ensino
                </label>
                <input
                  type="text"
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Ex: Universidade Federal..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Nome do Autor(a)
                </label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Orientador(a) e Titulação
                </label>
                <input
                  type="text"
                  value={advisorName}
                  onChange={(e) => setAdvisorName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Methodological Context */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Objetivos & Problema de Pesquisa
              </label>
              <textarea
                value={objectives}
                onChange={(e) => setObjectives(e.target.value)}
                rows={3}
                placeholder="Ex: Reduzir tempo de contagem em 40% usando modelos de detecção em tempo real..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Procedimentos Metodológicos
              </label>
              <textarea
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                rows={3}
                placeholder="Ex: Pesquisa quantitativa e aplicada, coleta de amostras com OpenCV, treinamento com validação cruzada..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Tecnologias, Ferramentas ou Teóricos Centrais
              </label>
              <input
                type="text"
                value={technologies}
                onChange={(e) => setTechnologies(e.target.value)}
                placeholder="Ex: Python, YOLOv8, OpenCV, PyTorch, Node.js, Zod"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Cidade de Entrega
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Ano de Submissão
                </label>
                <input
                  type="text"
                  value={new Date().getFullYear().toString()}
                  readOnly
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-lg p-2.5 text-sm text-slate-400 cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm shadow-lg">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-400 mt-0.5" />
              <div>
                <p className="font-semibold text-rose-100">Erro no processamento da IA</p>
                <p className="text-xs text-rose-200 mt-1 leading-relaxed max-w-xl">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleStartGeneration}
              disabled={isGenerating}
              className="px-3.5 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-200 border border-rose-500/40 text-xs font-semibold flex items-center gap-2 transition-all shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
              Tentar Novamente
            </button>
          </div>
        )}

        {/* Success Alert */}
        {successGenerated && (
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <p className="font-semibold">Esboço do Trabalho Gerado com Sucesso!</p>
                  <p className="text-xs text-emerald-200">
                    A estrutura inicial, as sugestões de tópicos, o resumo e referências foram integradas ao seu projeto.
                  </p>
                </div>
              </div>
              <button
                onClick={onNavigateToPreview}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-slate-950 font-semibold text-xs flex items-center gap-2 hover:bg-emerald-400 transition-colors shadow-sm shrink-0"
              >
                Ver na Visualização A4
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Grounding Sources Badge */}
            {generatedSources.length > 0 && (
              <div className="pt-2 border-t border-emerald-500/20">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300 mb-2">
                  <Globe className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Fontes de dados reais reunidas via Google Search Grounding ({generatedSources.length}):</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {generatedSources.map((source, idx) => (
                    <a
                      key={idx}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-950/60 border border-emerald-500/30 hover:border-emerald-400 text-[11px] text-emerald-200 hover:text-white transition-colors"
                      title={source.title}
                    >
                      <span className="truncate max-w-[200px]">{source.title || source.url}</span>
                      <ExternalLink className="w-3 h-3 text-emerald-400 shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Display during generation */}
        {isGenerating && (
          <div className="p-5 rounded-xl bg-slate-950 border border-amber-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                <span className="text-sm font-semibold text-white">
                  {GENERATION_STEPS[currentStepIndex]}
                </span>
              </div>
              <span className="text-xs text-amber-400 font-mono">
                Passo {currentStepIndex + 1} de {GENERATION_STEPS.length}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-500 to-amber-300 h-full transition-all duration-700 ease-out"
                style={{
                  width: `${((currentStepIndex + 1) / GENERATION_STEPS.length) * 100}%`,
                }}
              />
            </div>
            <p className="text-xs text-slate-400">
              O modelo neural está gerando textos exaustivos, com escrita impessoal na terceira pessoa,
              citações cruzadas e referências reais no padrão ABNT. Isso pode levar alguns segundos.
            </p>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <FileCheck2 className="w-4 h-4 text-emerald-400" />
            <span>Validação automática de conformidade NBR 14724, 6023, 10520 e 6028 inclusa.</span>
          </div>

          <button
            onClick={handleStartGeneration}
            disabled={isGenerating || !topic.trim()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Gerando Estrutura do Documento...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Gerar Esboço Estrutural em 1-Clique</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
