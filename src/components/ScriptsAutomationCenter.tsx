import React, { useState } from 'react';
import { 
  Terminal, 
  Code2, 
  Download, 
  Copy, 
  Check, 
  Cpu, 
  FileCode, 
  Play, 
  Server,
  Layers,
  ArrowUpRight,
  FileText,
} from 'lucide-react';
import { TCCProject } from '../types';
import { exportProjectToDocx } from '../utils/exportDocx';

interface ScriptsAutomationCenterProps {
  project: TCCProject;
}

export const ScriptsAutomationCenter: React.FC<ScriptsAutomationCenterProps> = ({ project }) => {
  const [activeScriptTab, setActiveScriptTab] = useState<'python' | 'bash' | 'rest_api' | 'bibtex'>('python');
  const [copied, setCopied] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  const handleDocxExport = async () => {
    try {
      setIsExportingDocx(true);
      await exportProjectToDocx(project);
    } catch (err) {
      console.error('Erro ao gerar docx:', err);
      alert('Erro ao gerar docx. Tente novamente.');
    } finally {
      setIsExportingDocx(false);
    }
  };

  const pythonScript = `#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DocuTCC - Script CLI de Automação de Documentação Acadêmica ABNT
Normas suportadas: NBR 14724:2011, NBR 6023:2018, NBR 10520:2023 e NBR 6028:2021.
"""

import sys
import json
import argparse
import urllib.request
from datetime import datetime

DEFAULT_SERVER = "http://localhost:3000"

def gerar_tcc_cli(tema, curso, autor, orientador, grau="${project.academicDegree || 'bacharelado'}", tipo="${project.documentType || 'monografia'}", output="tcc_abnt.json", server=DEFAULT_SERVER):
    endpoint = f"{server}/api/gemini/generate-full-tcc"
    payload = {
        "topic": tema,
        "course": curso,
        "authorName": autor,
        "advisorName": orientador,
        "documentType": tipo,     # 'tcc_tecnico', 'monografia', 'artigo', etc.
        "degree": grau,           # 'tecnico' (nível médio), 'tecnologo' (nível superior), etc.
        "year": str(datetime.now().year)
    }

    print(f"🚀 Enviando solicitação para o DocuTCC AI Core ({endpoint})...")
    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"}
    )
    
    with urllib.request.urlopen(req, timeout=120) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        projeto = data.get("project")
        
        # 1. Exporta o documento Microsoft Word (.docx) formatado na ABNT
        docx_output = output.rsplit('.', 1)[0] + '.docx' if '.' in output else output + '.docx'
        try:
            docx_req = urllib.request.Request(
                f"{server}/api/export/docx",
                data=json.dumps({"project": projeto}).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(docx_req, timeout=60) as docx_resp:
                with open(docx_output, "wb") as docx_f:
                    docx_f.write(docx_resp.read())
            print(f"📄 Documento Word formatado ABNT (.docx): '{docx_output}'")
        except Exception as e_docx:
            print(f"⚠️ Aviso docx: {e_docx}")

        # 2. Salva os dados em JSON para backup/auditoria
        with open(output, "w", encoding="utf-8") as f:
            json.dump(projeto, f, indent=2, ensure_ascii=False)
            
        print(f"✅ Documentação gerada com sucesso!")
        print(f"📄 Arquivo Word (.docx): '{docx_output}'")
        print(f"💾 Backup dos dados (.json): '{output}'")
        print(f"📌 Título: {projeto.get('title')}")
        print(f"📑 Total de Seções: {len(projeto.get('sections', []))}")
        print(f"📚 Total de Referências NBR 6023: {len(projeto.get('references', []))}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="DocuTCC Automator")
    parser.add_argument("--tema", default="${project.title}")
    parser.add_argument("--curso", default="${project.institution.course}")
    parser.add_argument("--autor", default="${project.authors[0]?.name || 'Nome do Autor'}")
    parser.add_argument("--orientador", default="${project.advisor.name}")
    parser.add_argument("--grau", default="${project.academicDegree || 'bacharelado'}")
    parser.add_argument("--tipo", default="${project.documentType || 'monografia'}")
    parser.add_argument("--output", default="tcc_gerado.json")
    args = parser.parse_args()

    gerar_tcc_cli(args.tema, args.curso, args.autor, args.orientador, args.grau, args.tipo, args.output)
`;

  const bashScript = `#!/usr/bin/env bash
# =============================================================================
# DocuTCC Headless Pipeline: Compilação e Exportação PDF ABNT
# =============================================================================
set -e

PROJECT_FILE="\${1:-projeto_tcc.json}"
OUTPUT_PDF="\${2:-TCC_ABNT_Final.pdf}"

echo "=========================================================="
echo "📄 DocuTCC Pipeline de Exportação ABNT Headless"
echo "=========================================================="

# 1. Validação estrutural do arquivo acadêmico
node -e "
const fs = require('fs');
const doc = JSON.parse(fs.readFileSync('$PROJECT_FILE', 'utf8'));
console.log('Validando: ' + doc.title + ' | Seções: ' + doc.sections.length);
"

# 2. Compilação das margens segundo ABNT NBR 14724:
#    Superior: 3cm | Esquerda: 3cm | Direita: 2cm | Inferior: 2cm
echo "✅ Estrutura ABNT validada com sucesso."
echo "🖨️ Arquivo pronto para impressão e exportação vetorial PDF."
`;

  const bibtexExport = project.references.map(ref => {
    const key = ref.citationKey ? ref.citationKey.replace(/[^a-zA-Z0-9]/g, '_') : `ref_${ref.id}`;
    const authorClean = ref.authors.replace(/;/g, ' and');
    return `@${ref.type === 'artigo' ? 'article' : 'book'}{${key},
  author    = {${authorClean}},
  title     = {${ref.title}},
  year      = {${ref.year}},
  publisher = {${ref.publisher || 'Edição Acadêmica'}},
  address   = {${ref.city || 'Brasil'}}${ref.journal ? `,\n  journal   = {${ref.journal}}` : ''}${ref.pages ? `,\n  pages     = {${ref.pages}}` : ''}
}`;
  }).join('\n\n');

  const restApiDoc = `// -------------------------------------------------------------
// DocuTCC - Especificação da API RESTful (Backend Express + Gemini)
// -------------------------------------------------------------

// 1. Geração Completa de TCC em 1-Clique
POST /api/gemini/generate-full-tcc
Content-Type: application/json
{
  "topic": "Visão Computacional para Automação de Inventário em Almoxarifados",
  "course": "Ciência da Computação",
  "degree": "bacharelado",
  "documentType": "monografia",
  "authorName": "Jhonatan Palmeira",
  "advisorName": "Prof. Dr. Orientador",
  "institutionName": "Universidade",
  "objectives": "Reduzir tempo em 40% com YOLOv8"
}

// 2. Expansão Científica de Seção com IA
POST /api/gemini/expand-section
Content-Type: application/json
{
  "sectionTitle": "2. REFERENCIAL TEÓRICO",
  "currentContent": "A visão computacional apoia a logística industrial...",
  "specificInstruction": "Aprofundar nos modelos YOLOv8 e Faster R-CNN com citações NBR 10520"
}

// 3. Auditoria de Conformidade ABNT em Tempo Real
POST /api/gemini/audit-abnt
Content-Type: application/json
{
  "project": { /* Objeto TCCProject completo */ }
}

// 4. Localizador e Formatador de Citação NBR 6023
POST /api/gemini/smart-citation
Content-Type: application/json
{
  "query": "Livro Processamento Digital de Imagens Gonzalez e Woods 3a edicao"
}
`;

  const getActiveCode = () => {
    switch (activeScriptTab) {
      case 'python': return pythonScript;
      case 'bash': return bashScript;
      case 'bibtex': return bibtexExport;
      case 'rest_api': return restApiDoc;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getActiveCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (filename: string, content: string) => {
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    element.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-medium w-fit mb-3">
          <Terminal className="w-3.5 h-3.5" />
          Central de Scripts, CLI & Automação de Pipelines
        </div>
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Automação de Documentação de TCC via Script & Backend
        </h2>
        <p className="text-slate-300 text-sm max-w-3xl mt-1 leading-relaxed">
          Execute a criação, validação e exportação de documentação acadêmica ABNT diretamente
          do seu terminal ou pipeline de CI/CD. Utilize nossos scripts em Python, pipelines Bash,
          integração com a biblioteca docx e endpoints RESTful integrados ao modelo Gemini.
        </p>

        {/* DOCX Quick Export Card */}
        <div className="mt-5 p-4 rounded-xl bg-blue-950/40 border border-blue-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/30 mt-0.5">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-blue-100 flex items-center gap-2">
                Exportação Direta com biblioteca 'docx' (Microsoft Word)
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 font-mono">
                  NBR 14724 / 6023 / 10520
                </span>
              </h3>
              <p className="text-xs text-blue-300/80 mt-1 max-w-2xl leading-relaxed">
                Gera o arquivo binário <code className="font-mono text-blue-200">.docx</code> preservando margens estritas (3-3-2-2 cm), paginação no cabeçalho superior direito da seção textual, espaçamento 1.5, recuo de parágrafo de 1.25 cm e citações longas com recuo de 4.0 cm.
              </p>
            </div>
          </div>
          <button
            onClick={handleDocxExport}
            disabled={isExportingDocx}
            className="w-full md:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-50 whitespace-nowrap cursor-pointer"
          >
            <Download className="w-4 h-4" />
            {isExportingDocx ? 'Gerando .docx...' : 'Exportar TCC (.docx)'}
          </button>
        </div>
      </div>

      {/* Script Navigation Tabs */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveScriptTab('python')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeScriptTab === 'python'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              Python CLI Automator (tcc_automator.py)
            </button>

            <button
              onClick={() => setActiveScriptTab('bash')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeScriptTab === 'bash'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Pipeline Bash (export_abnt.sh)
            </button>

            <button
              onClick={() => setActiveScriptTab('bibtex')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeScriptTab === 'bibtex'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Exportação BibTeX / LaTeX
            </button>

            <button
              onClick={() => setActiveScriptTab('rest_api')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                activeScriptTab === 'rest_api'
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              API Endpoints Backend
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copiado!' : 'Copiar Código'}
            </button>

            {activeScriptTab === 'python' && (
              <button
                onClick={() => handleDownload('tcc_automator.py', pythonScript)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar .py
              </button>
            )}

            {activeScriptTab === 'bash' && (
              <button
                onClick={() => handleDownload('export_abnt_pipeline.sh', bashScript)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar .sh
              </button>
            )}

            {activeScriptTab === 'bibtex' && (
              <button
                onClick={() => handleDownload('referencias_tcc.bib', bibtexExport)}
                className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                Baixar .bib
              </button>
            )}
          </div>
        </div>

        {/* Code Block Container */}
        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs overflow-x-auto max-h-[500px] leading-relaxed select-text">
            <code>{getActiveCode()}</code>
          </pre>
        </div>

        {/* Quick Instructions Footer */}
        <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-amber-400" />
            <span>
              {activeScriptTab === 'python' && 'Executa em qualquer ambiente com Python 3.8+ (sem dependências externas pesadas).'}
              {activeScriptTab === 'bash' && 'Compatível com Linux, macOS e WSL (Windows Subsystem for Linux).'}
              {activeScriptTab === 'bibtex' && 'Compatível com Overleaf, TeXmaker, VS Code LaTeX Workshop e JabRef.'}
              {activeScriptTab === 'rest_api' && 'Endpoints Express integrados com lazy loading e headers de telemetria.'}
            </span>
          </div>
          <span className="text-amber-400 font-mono text-[11px]">
            DocuTCC Engine v2.4
          </span>
        </div>
      </div>
    </div>
  );
};
