import React, { useState, useEffect } from 'react';
import { Scale, Check, AlertTriangle, ShieldCheck } from 'lucide-react';

interface TermsOfUseModalProps {
  onAccept: () => void;
}

export function TermsOfUseModal({ onAccept }: TermsOfUseModalProps) {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('docutcc_terms_accepted', 'true');
    onAccept();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300">
        
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3 bg-slate-50">
          <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-800">Termos de Uso e Responsabilidade Acadêmica</h2>
            <p className="text-sm text-slate-500">Leia atentamente antes de prosseguir</p>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1 text-slate-600 space-y-5 text-sm">
          <div className="p-4 bg-amber-50 text-amber-800 rounded-xl flex space-x-3 border border-amber-100">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <p className="font-medium">
              O DocuTCC é uma ferramenta de <strong>Assistência e Formatação Acadêmica</strong>, e não um substituto para o seu esforço intelectual, pesquisa e autoria.
            </p>
          </div>

          <p>
            Ao utilizar a plataforma DocuTCC, você concorda com os seguintes termos baseados na legislação brasileira de Direitos Autorais (Lei 9.610/98) e princípios de integridade acadêmica:
          </p>

          <ol className="list-decimal pl-5 space-y-3 font-medium text-slate-700">
            <li>
              <strong>Autoria e Responsabilidade:</strong> Você é o único responsável e autor intelectual pelo conteúdo redigido, formatado ou estruturado nesta plataforma. A Inteligência Artificial atua exclusivamente como ferramenta de apoio à ideação, revisão ortográfica e formatação.
            </li>
            <li>
              <strong>Proibição de Plágio e Fraude:</strong> É terminantemente proibido utilizar a plataforma para gerar e submeter integralmente trabalhos que não sejam de sua autoria intelectual. A apresentação de textos gerados por IA como sendo de autoria humana, sem devida citação ou transparência, configura fraude acadêmica e pode ferir as regras das instituições de ensino.
            </li>
            <li>
              <strong>Isenção de Responsabilidade:</strong> Os desenvolvedores do DocuTCC não se responsabilizam por reprovações acadêmicas, acusações de plágio, infrações éticas, notas atribuídas por bancas examinadoras ou consequências legais (incluindo implicações da Falsidade Ideológica - Art. 299 do Código Penal) decorrentes do mau uso da ferramenta.
            </li>
            <li>
              <strong>Conformidade ABNT:</strong> O aplicativo emprega lógicas para facilitar a diagramação nos padrões ABNT (Associação Brasileira de Normas Técnicas), porém, o usuário final deve sempre revisar o documento exportado para garantir adequação às diretrizes específicas do seu manual de curso/faculdade.
            </li>
          </ol>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <p className="text-xs text-slate-500 leading-relaxed">
              O uso de ferramentas automatizadas para ganho de produtividade na escrita e diagramação é legal, contudo, a ética acadêmica e a autenticidade científica devem ser preservadas pelo estudante-pesquisador em todos os momentos da redação de Trabalhos de Conclusão de Curso (TCC), Monografias, Artigos e Dissertações.
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 bg-white">
          <label className="flex items-start space-x-3 cursor-pointer group mb-5">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-amber-500/20 checked:bg-amber-600 checked:border-amber-600 transition-colors cursor-pointer"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
              />
              <Check className="w-3.5 h-3.5 text-white absolute opacity-0 peer-checked:opacity-100 pointer-events-none transition-opacity" strokeWidth={3} />
            </div>
            <span className="text-sm font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
              Li, compreendi e concordo integralmente com os Termos de Uso e Assunção de Responsabilidade Acadêmica, declarando ser o autor intelectual dos meus trabalhos.
            </span>
          </label>

          <button
            onClick={handleAccept}
            disabled={!accepted}
            className="w-full flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>Concordar e Acessar o Aplicativo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
