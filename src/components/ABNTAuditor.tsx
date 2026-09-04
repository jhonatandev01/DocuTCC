import React, { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  ShieldCheck, 
  Sparkles, 
  RefreshCw, 
  BookCheck, 
  Scale, 
  FileText,
  HelpCircle,
  Wand2,
  ChevronRight
} from 'lucide-react';
import { TCCProject, ABNTAuditResult, ABNTAuditIssue } from '../types';

interface ABNTAuditorProps {
  project: TCCProject;
  onApplyFix?: (updatedProject: TCCProject) => void;
  onOpenSectionEditor?: (sectionId: string) => void;
}

export const ABNTAuditor: React.FC<ABNTAuditorProps> = ({
  project,
  onApplyFix,
  onOpenSectionEditor,
}) => {
  const [auditResult, setAuditResult] = useState<ABNTAuditResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'citacoes' | 'formatacao' | 'linguagem' | 'estrutura'>('all');
  const [selectedIssue, setSelectedIssue] = useState<ABNTAuditIssue | null>(null);

  // Local deterministic pre-checks
  const runLocalCheck = (): ABNTAuditResult => {
    const issues: ABNTAuditIssue[] = [];
    const checklist: { name: string; status: 'pass' | 'warning' | 'fail'; details: string }[] = [];

    // 1. Margins Check (NBR 14724)
    const { top, left, right, bottom } = project.settings.margins;
    if (top === 3 && left === 3 && right === 2 && bottom === 2) {
      checklist.push({
        name: 'Margens A4 ABNT (NBR 14724)',
        status: 'pass',
        details: 'Margens estritamente configuradas em Superior 3cm, Esquerda 3cm, Direita 2cm e Inferior 2cm.',
      });
    } else {
      checklist.push({
        name: 'Margens A4 ABNT (NBR 14724)',
        status: 'fail',
        details: `Margens atuais (${top}/${left}/${right}/${bottom} cm) divergem da NBR 14724 (3/3/2/2 cm).`,
      });
      issues.push({
        id: 'iss-margins',
        category: 'formatacao',
        severity: 'alta',
        title: 'Margens do documento em desacordo com NBR 14724',
        description: 'A ABNT exige margem superior e esquerda de 3cm para encadernação, e direita e inferior de 2cm.',
        norma: 'NBR 14724',
        location: 'Configurações de Layout',
        suggestedFix: 'Ajustar as margens para 3cm (superior/esquerda) e 2cm (direita/inferior).',
      });
    }

    // 2. Resumo Check (NBR 6028)
    const wordCount = project.resumo?.text ? project.resumo.text.trim().split(/\s+/).length : 0;
    if (wordCount >= 150 && wordCount <= 500) {
      checklist.push({
        name: 'Extensão do Resumo (NBR 6028)',
        status: 'pass',
        details: `Resumo possui ${wordCount} palavras (conforme intervalo de 150 a 500 palavras).`,
      });
    } else if (wordCount === 0) {
      checklist.push({
        name: 'Extensão do Resumo (NBR 6028)',
        status: 'fail',
        details: 'O resumo em língua vernácula ainda não foi redigido.',
      });
      issues.push({
        id: 'iss-resumo-empty',
        category: 'estrutura',
        severity: 'alta',
        title: 'Resumo obrigatório ausente',
        description: 'O resumo em português é elemento pré-textual obrigatório pela NBR 14724 e NBR 6028.',
        norma: 'NBR 6028',
        location: 'Elementos Pré-Textuais',
        suggestedFix: 'Gerar o resumo estruturado com 150 a 500 palavras.',
      });
    } else {
      checklist.push({
        name: 'Extensão do Resumo (NBR 6028)',
        status: 'warning',
        details: `Resumo contém ${wordCount} palavras. A ABNT NBR 6028 recomenda entre 150 e 500 palavras para TCC.`,
      });
      issues.push({
        id: 'iss-resumo-size',
        category: 'estrutura',
        severity: 'media',
        title: 'Extensão do Resumo fora dos parâmetros ABNT',
        description: `O resumo contém ${wordCount} palavras. Deve ter de 150 a 500 palavras.`,
        norma: 'NBR 6028',
        location: 'Resumo',
        suggestedFix: wordCount < 150 ? 'Expandir com objetivo, metodologia e conclusões.' : 'Sintetizar o texto para menos de 500 palavras.',
      });
    }

    // 3. Palavras-chave Check
    const kwCount = project.resumo?.keywords?.length || 0;
    if (kwCount >= 3 && kwCount <= 5) {
      checklist.push({
        name: 'Palavras-chave (NBR 6028)',
        status: 'pass',
        details: `${kwCount} palavras-chave cadastradas (ideal: 3 a 5 palavras separadas por ponto).`,
      });
    } else {
      checklist.push({
        name: 'Palavras-chave (NBR 6028)',
        status: 'warning',
        details: `Identificadas ${kwCount} palavras-chave. A NBR 6028 estipula de 3 a 5 termos representativos.`,
      });
      issues.push({
        id: 'iss-keywords',
        category: 'estrutura',
        severity: 'baixa',
        title: 'Quantidade inadequada de palavras-chave',
        description: 'A NBR 6028 orienta de 3 a 5 palavras-chave separadas e finalizadas por ponto.',
        norma: 'NBR 6028',
        location: 'Resumo / Abstract',
        suggestedFix: 'Definir entre 3 e 5 palavras-chave precisas.',
      });
    }

    // 4. Impessoalidade científica (Detecção de 1ª pessoa)
    const firstPersonRegex = /\b(eu|nós|nosso|nossa|meu|minha|fizemos|concluímos|verifiquei|acredito|desenvolvemos)\b/i;
    let foundFirstPerson = false;
    let firstPersonSection = '';

    for (const sec of project.sections) {
      if (firstPersonRegex.test(sec.content)) {
        foundFirstPerson = true;
        firstPersonSection = sec.title;
        break;
      }
    }

    if (!foundFirstPerson) {
      checklist.push({
        name: 'Impessoalidade Acadêmica',
        status: 'pass',
        details: 'Linguagem impessoal em terceira pessoa ou voz passiva pronominal preservada.',
      });
    } else {
      checklist.push({
        name: 'Impessoalidade Acadêmica',
        status: 'warning',
        details: `Identificados termos em 1ª pessoa na seção "${firstPersonSection}".`,
      });
      issues.push({
        id: 'iss-first-person',
        category: 'linguagem',
        severity: 'media',
        title: 'Uso de primeira pessoa na redação científica',
        description: 'A redação de TCCs deve prezar pelo tom estritamente impessoal (ex: "verificou-se", "conclui-se que", "o presente estudo propõe").',
        norma: 'NBR 14724',
        location: firstPersonSection,
        suggestedFix: 'Utilizar o botão de refinamento acadêmico da IA para converter para a voz passiva sintética.',
      });
    }

    // 5. Citações e Referências (NBR 6023 e NBR 10520)
    const refCount = project.references?.length || 0;
    if (refCount >= 5) {
      checklist.push({
        name: 'Volume de Referências (NBR 6023)',
        status: 'pass',
        details: `${refCount} referências bibliográficas cadastradas no acervo do trabalho.`,
      });
    } else {
      checklist.push({
        name: 'Volume de Referências (NBR 6023)',
        status: 'warning',
        details: `Apenas ${refCount} referência(s) cadastrada(s). Um TCC típico requer fundamentação mais abrangente.`,
      });
      issues.push({
        id: 'iss-ref-count',
        category: 'referencias',
        severity: 'media',
        title: 'Fundamentação bibliográfica reduzida',
        description: 'Recomenda-se um corpus bibliográfico de livros, periódicos e artigos indexados.',
        norma: 'NBR 6023',
        location: 'Referências',
        suggestedFix: 'Adicionar mais artigos e livros seminais sobre o tema.',
      });
    }

    // Calculate score
    const total = checklist.length;
    const passes = checklist.filter(c => c.status === 'pass').length;
    const warnings = checklist.filter(c => c.status === 'warning').length;
    const score = Math.round(((passes * 1 + warnings * 0.5) / total) * 100);

    return {
      score,
      summary: score >= 85 
        ? 'Excelente nível de conformidade com as normas da ABNT. O documento atende aos requisitos estruturais fundamentais.'
        : 'O documento possui pontos de atenção metodológicos que merecem revisão antes da entrega final à banca.',
      passedChecksCount: passes,
      totalChecksCount: total,
      checklist,
      issues,
    };
  };

  useEffect(() => {
    setAuditResult(runLocalCheck());
  }, [project]);

  // Run deep AI audit
  const handleRunAIAudit = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gemini/audit-abnt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ project }),
      });
      if (response.ok) {
        const data = await response.json();
        if (data.audit) {
          setAuditResult(data.audit);
        }
      }
    } catch (e) {
      console.error('Falha na auditoria com IA, mantendo diagnóstico local:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleFixMargins = () => {
    if (onApplyFix) {
      onApplyFix({
        ...project,
        settings: {
          ...project.settings,
          margins: { top: 3, left: 3, right: 2, bottom: 2 },
        },
      });
    }
  };

  const filteredIssues = (auditResult?.issues || []).filter(issue => {
    if (activeFilter === 'all') return true;
    return issue.category === activeFilter;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              Auditoria de Conformidade em Tempo Real
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Auditor ABNT & Inspetor Metodológico
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl">
              Varredura algorítmica e semântica com base nas normas NBR 14724 (Trabalhos Acadêmicos),
              NBR 6023 (Referências), NBR 10520 (Citações) e NBR 6028 (Resumo).
            </p>
          </div>

          {/* Compliance Score Gauge */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex items-center gap-4 min-w-[240px]">
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-slate-800"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={
                    (auditResult?.score || 0) >= 80
                      ? 'text-emerald-500'
                      : (auditResult?.score || 0) >= 60
                      ? 'text-amber-500'
                      : 'text-rose-500'
                  }
                  strokeDasharray={`${auditResult?.score || 0}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute font-bold text-lg text-white">
                {auditResult?.score || 0}%
              </span>
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Índice ABNT</div>
              <div className="text-sm font-semibold text-white">
                {(auditResult?.score || 0) >= 80 ? 'Aprovável' : (auditResult?.score || 0) >= 60 ? 'Revisar' : 'Crítico'}
              </div>
              <div className="text-[11px] text-slate-400">
                {auditResult?.passedChecksCount} de {auditResult?.totalChecksCount} critérios
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs text-slate-400">
            {auditResult?.summary}
          </div>
          <button
            onClick={handleRunAIAudit}
            disabled={loading}
            className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Executando Análise com Gemini...' : 'Executar Auditoria Neural com IA'}
          </button>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {auditResult?.checklist.map((item, idx) => (
          <div
            key={idx}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3"
          >
            {item.status === 'pass' && (
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            )}
            {item.status === 'warning' && (
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            )}
            {item.status === 'fail' && (
              <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div>
              <div className="text-sm font-medium text-white">{item.name}</div>
              <div className="text-xs text-slate-400 mt-1 leading-relaxed">
                {item.details}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Issues & Recommendations Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h3 className="text-base font-semibold text-white">Apontamentos e Sugestões de Correção</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {filteredIssues.length} observação(ões) identificada(s)
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 rounded-lg border border-slate-800 overflow-x-auto text-xs">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === 'all' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setActiveFilter('formatacao')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === 'formatacao' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Formatação
            </button>
            <button
              onClick={() => setActiveFilter('citacoes')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === 'citacoes' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Citações
            </button>
            <button
              onClick={() => setActiveFilter('linguagem')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === 'linguagem' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Linguagem
            </button>
            <button
              onClick={() => setActiveFilter('estrutura')}
              className={`px-2.5 py-1 rounded font-medium transition-colors ${
                activeFilter === 'estrutura' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Estrutura
            </button>
          </div>
        </div>

        {/* Issue Cards */}
        <div className="divide-y divide-slate-800 mt-2">
          {filteredIssues.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2 opacity-80" />
              Nenhum problema encontrado nesta categoria. Excelente trabalho!
            </div>
          ) : (
            filteredIssues.map((issue) => (
              <div key={issue.id} className="py-4 space-y-2">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${
                        issue.severity === 'alta'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : issue.severity === 'media'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}>
                        Gravidade {issue.severity}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {issue.norma}
                      </span>
                      {issue.location && (
                        <span className="text-xs text-slate-500">
                          • {issue.location}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-white">{issue.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {issue.description}
                    </p>
                  </div>

                  {issue.id === 'iss-margins' && (
                    <button
                      onClick={handleFixMargins}
                      className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 hover:bg-emerald-500/30 text-emerald-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Wand2 className="w-3.5 h-3.5" />
                      Corrigir Margens (3/3/2/2)
                    </button>
                  )}
                </div>

                {issue.suggestedFix && (
                  <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                    <span><strong className="text-slate-200">Recomendação:</strong> {issue.suggestedFix}</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
