import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  BookOpen,
  CheckCircle,
  FileCheck2,
  Copy,
  Check,
  Search,
  RefreshCw,
  Lightbulb,
  ArrowRight,
} from 'lucide-react';
import { TCCProject } from '../types';

interface AIAcademicAssistantProps {
  project: TCCProject;
  onApplyChanges?: (updatedProject: Partial<TCCProject>) => void;
  initialPrompt?: string;
  initialAction?: string;
}

export const AIAcademicAssistant: React.FC<AIAcademicAssistantProps> = ({
  project,
  onApplyChanges,
  initialPrompt = '',
  initialAction = 'sugestao_tema',
}) => {
  const [prompt, setPrompt] = useState<string>(initialPrompt);
  const [action, setAction] = useState<string>(initialAction);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Pre-configured academic prompts
  const academicTemplates = [
    {
      title: 'Estruturação & Problema de Pesquisa',
      action: 'sugestao_tema',
      prompt: `Meu tema é "${project.title}". Ajude-me a definir com clareza científica:
1. Pergunta ou Problema de Pesquisa
2. Hipótese central
3. Justificativa teórica e prática
4. Objetivo Geral e três Objetivos Específicos
5. Principais autores e teorias clássicas para o Referencial Teórico.`,
    },
    {
      title: 'Refinar Redação para Linguagem Científica',
      action: 'refinar_texto',
      prompt: `Por favor, reescreva o texto a seguir aplicando rigorosamente o tom acadêmico impessoal da ABNT (em terceira pessoa ou voz passiva sintética), eliminando gírias, clichês e juízos de valor:

"${project.sections[0]?.content.slice(0, 500) || 'Texto a ser refinado...'}"`,
    },
    {
      title: 'Gerar Resumo Oficial ABNT (NBR 6028)',
      action: 'gerar_resumo',
      prompt: `Com base no título "${project.title}" e nos capítulos do meu trabalho, elabore o RESUMO oficial em parágrafo único (entre 150 e 250 palavras) ressaltando contextualização, objetivo, metodologia, principais resultados esperados e conclusão. Em seguida, forneça 5 palavras-chave separadas por ponto final.`,
    },
    {
      title: 'Formatar Referência Desordenada (NBR 6023)',
      action: 'formatar_referencia',
      prompt: `Converta a seguinte publicação desformatada na regra exata da ABNT NBR 6023 (incluindo caixa alta nos autores, título em negrito ou itálico conforme a regra e paginação):

LeCun, Yann, Yoshua Bengio, and Geoffrey Hinton. "Deep learning." nature 521, no. 7553 (2015): 436-444.`,
    },
  ];

  const handleRunAI = async (customPrompt?: string, customAction?: string) => {
    const textToSend = customPrompt || prompt;
    const actionToSend = customAction || action;

    if (!textToSend.trim()) return;

    setIsLoading(true);
    setResult('');

    try {
      const response = await fetch('/api/gemini/academic-assist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: actionToSend,
          prompt: textToSend,
          context: `Título do TCC: ${project.title} | Curso: ${project.institution.course} | Grau: ${project.academicDegree}`,
        }),
      });

      const data = await response.json();
      if (data.error) {
        setResult(`Aviso: ${data.error}`);
      } else {
        setResult(data.result || 'Sem resposta.');
      }
    } catch (err: any) {
      console.error('Erro na chamada de IA:', err);
      setResult('Erro ao conectar ao assistente acadêmico. Verifique sua conexão ou tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyResult = () => {
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-amber-950/30 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">
              Assistente Acadêmico Inteligente & Especialista ABNT
            </h2>
            <p className="text-xs text-slate-400">
              Obtenha auxílio com fundamentação teórica, delimitação de tema, hipótese, revisão gramatical na norma culta e conversão instantânea de fontes para a NBR 6023.
            </p>
          </div>
        </div>
      </div>

      {/* Suggested Quick Templates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {academicTemplates.map((tpl, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setPrompt(tpl.prompt);
              setAction(tpl.action);
              handleRunAI(tpl.prompt, tpl.action);
            }}
            className="text-left p-3.5 bg-slate-900/80 hover:bg-slate-800/90 rounded-xl border border-slate-800 hover:border-amber-500/40 transition-all space-y-1 group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200 group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                {tpl.title}
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all" />
            </div>
            <p className="text-[11px] text-slate-400 line-clamp-2">
              {tpl.prompt}
            </p>
          </button>
        ))}
      </div>

      {/* Prompt Form */}
      <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-4 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Modo de Operação:</span>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value)}
              className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1 text-xs focus:border-amber-500"
            >
              <option value="sugestao_tema">Pesquisa & Delimitação do Tema</option>
              <option value="refinar_texto">Refinamento para Norma Culta / Impessoal</option>
              <option value="gerar_resumo">Gerador de Resumo ABNT NBR 6028</option>
              <option value="formatar_referencia">Formatação ABNT NBR 6023</option>
              <option value="auditoria_abnt">Auditoria de Conformidade ABNT</option>
            </select>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            Contexto Ativo: {project.title.slice(0, 35)}...
          </span>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Descreva seu pedido de orientação científica ou cole seu texto:
          </label>
          <textarea
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Como estruturar o capítulo de metodologia para um estudo de caso qualitativo com entrevistas semiestruturadas?"
            className="w-full bg-slate-950 text-slate-100 border border-slate-800 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
          />
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => handleRunAI()}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all disabled:opacity-40 shadow-sm"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Consultando Base ABNT...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Processar Consulta Acadêmica</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Response Result Box */}
      {result && (
        <div className="bg-slate-900 rounded-2xl border border-slate-800 p-5 space-y-3 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-slate-100 uppercase tracking-wide">
                Resposta do Especialista Acadêmico
              </h3>
            </div>

            <button
              type="button"
              onClick={handleCopyResult}
              className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-750 text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copiado!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copiar Resposta</span>
                </>
              )}
            </button>
          </div>

          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
            {result}
          </div>
        </div>
      )}
    </div>
  );
};
