import React, { useState } from 'react';
import {
  Bookmark,
  Plus,
  Trash2,
  Copy,
  Check,
  Search,
  Sparkles,
  Download,
  AlertCircle,
  BookOpen,
  FileCode,
  ExternalLink,
} from 'lucide-react';
import { ABNTReference, ReferenceType, TCCProject } from '../types';
import {
  formatABNTReference,
  generateCitationKeys,
  validateCitations,
} from '../utils/abntFormatter';

interface CitationsManagerProps {
  project: TCCProject;
  onChange: (updatedProject: TCCProject) => void;
  onOpenAIAssistantWithText?: (prompt: string, action: string) => void;
}

export const CitationsManager: React.FC<CitationsManagerProps> = ({
  project,
  onChange,
  onOpenAIAssistantWithText,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('todos');
  const [isAddingReference, setIsAddingReference] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [rawTextImport, setRawTextImport] = useState('');
  const [isImportingAI, setIsImportingAI] = useState(false);

  // New reference form state
  const [newRef, setNewRef] = useState<Partial<ABNTReference>>({
    type: 'livro',
    authors: '',
    title: '',
    subtitle: '',
    publisher: '',
    city: '',
    year: '2024',
    edition: '',
    journal: '',
    volume: '',
    number: '',
    pages: '',
    url: '',
    accessDate: '',
  });

  const citationValidation = validateCitations(project);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSaveNewReference = () => {
    if (!newRef.authors || !newRef.title) {
      alert('Preencha ao menos os Autores e o Título da obra.');
      return;
    }

    const formattedABNT = formatABNTReference(newRef);
    const keys = generateCitationKeys(newRef.authors || '', newRef.year || '');

    const completeRef: ABNTReference = {
      id: `ref-${Date.now()}`,
      type: newRef.type || 'livro',
      authors: newRef.authors || '',
      title: newRef.title || '',
      subtitle: newRef.subtitle,
      publisher: newRef.publisher,
      city: newRef.city,
      year: newRef.year || '2024',
      edition: newRef.edition,
      journal: newRef.journal,
      volume: newRef.volume,
      number: newRef.number,
      pages: newRef.pages,
      url: newRef.url,
      accessDate: newRef.accessDate,
      event: newRef.event,
      degree: newRef.degree,
      formattedABNT,
      citationKey: keys.parenthetical.replace(/[()]/g, ''),
    };

    const updatedReferences = [...project.references, completeRef];
    // Sort references alphabetically according to ABNT NBR 6023
    updatedReferences.sort((a, b) => a.authors.localeCompare(b.authors));

    onChange({
      ...project,
      references: updatedReferences,
      lastModified: new Date().toISOString(),
    });

    setIsAddingReference(false);
    setNewRef({
      type: 'livro',
      authors: '',
      title: '',
      subtitle: '',
      publisher: '',
      city: '',
      year: '2024',
      edition: '',
      journal: '',
      volume: '',
      number: '',
      pages: '',
      url: '',
      accessDate: '',
    });
  };

  const handleDeleteReference = (id: string) => {
    const updated = project.references.filter((r) => r.id !== id);
    onChange({
      ...project,
      references: updated,
      lastModified: new Date().toISOString(),
    });
  };

  // Convert references to BibTeX string
  const exportBibTeX = () => {
    const bibItems = project.references.map((ref) => {
      const tag = ref.citationKey.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      return `@misc{${tag},
  author = {${ref.authors}},
  title = {${ref.title}},
  year = {${ref.year}},
  publisher = {${ref.publisher || ''}},
  note = {${ref.formattedABNT}}
}`;
    });

    const blob = new Blob([bibItems.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referencias_tcc_${Date.now()}.bib`;
    a.click();
  };

  // Filtered list
  const filteredReferences = project.references.filter((r) => {
    const matchesSearch =
      r.authors.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.year.includes(searchTerm);

    const matchesType = filterType === 'todos' || r.type === filterType;

    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Overview & Quick Actions */}
      <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-amber-400" />
            Gerenciador de Citações & Referências (ABNT NBR 6023 / NBR 10520)
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Cadastre referências bibliográficas, obtenha as chaves de citação direta e indireta com 1 clique e monitore se estão citadas no texto.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={exportBibTeX}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs border border-slate-700 font-medium transition-colors"
            title="Exportar no formato BibTeX (.bib)"
          >
            <FileCode className="w-3.5 h-3.5 text-blue-400" />
            <span>Exportar BibTeX</span>
          </button>

          <button
            type="button"
            onClick={() => setIsAddingReference(!isAddingReference)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Referência</span>
          </button>
        </div>
      </div>

      {/* Citations Audit Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 font-medium">Total de Obras Cadastradas</div>
          <div className="text-xl font-bold text-slate-100 mt-1">
            {project.references.length} referências
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 font-medium">Citadas no Texto do TCC</div>
          <div className="text-xl font-bold text-emerald-400 mt-1 flex items-center gap-2">
            {citationValidation.citedCount} de {project.references.length}
          </div>
        </div>

        <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4">
          <div className="text-xs text-slate-400 font-medium">Pendentes de Citação</div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {citationValidation.unusedReferences.length} obras
          </div>
        </div>
      </div>

      {/* Form: Add New Reference */}
      {isAddingReference && (
        <div className="bg-slate-900 rounded-2xl border border-amber-500/40 p-5 shadow-2xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-2">
              <Plus className="w-4 h-4" /> Cadastrar Nova Obra (NBR 6023)
            </h3>
            <button
              type="button"
              onClick={() => setIsAddingReference(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Cancelar
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Tipo de Fonte
              </label>
              <select
                value={newRef.type}
                onChange={(e) =>
                  setNewRef({ ...newRef, type: e.target.value as ReferenceType })
                }
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
              >
                <option value="livro">Livro / Monografia</option>
                <option value="artigo">Artigo em Periódico / Revista</option>
                <option value="congresso">Artigo em Anais de Congresso</option>
                <option value="tese">Tese / Dissertação Acadêmica</option>
                <option value="site">Website / Página da Web</option>
                <option value="legislacao">Legislação / Documento Oficial</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Autores (SOBRENOME, Nome; SOBRENOME, Nome)
              </label>
              <input
                type="text"
                value={newRef.authors}
                onChange={(e) => setNewRef({ ...newRef, authors: e.target.value })}
                placeholder="EX: SILVA, João Carlos; SANTOS, Maria Clara"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500 font-semibold"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-slate-300 font-semibold mb-1">
                Título Principal da Obra
              </label>
              <input
                type="text"
                value={newRef.title}
                onChange={(e) => setNewRef({ ...newRef, title: e.target.value })}
                placeholder="Título da obra ou artigo"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Subtítulo (Se houver - sem negrito)
              </label>
              <input
                type="text"
                value={newRef.subtitle || ''}
                onChange={(e) => setNewRef({ ...newRef, subtitle: e.target.value })}
                placeholder="uma abordagem prática"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
              />
            </div>

            {newRef.type === 'artigo' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    Nome da Revista / Periódico
                  </label>
                  <input
                    type="text"
                    value={newRef.journal || ''}
                    onChange={(e) => setNewRef({ ...newRef, journal: e.target.value })}
                    placeholder="Revista Brasileira de Computação Aplicada"
                    className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Volume e Número
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newRef.volume || ''}
                      onChange={(e) => setNewRef({ ...newRef, volume: e.target.value })}
                      placeholder="v. 12"
                      className="w-1/2 bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={newRef.number || ''}
                      onChange={(e) => setNewRef({ ...newRef, number: e.target.value })}
                      placeholder="n. 3"
                      className="w-1/2 bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Cidade (Local)
              </label>
              <input
                type="text"
                value={newRef.city || ''}
                onChange={(e) => setNewRef({ ...newRef, city: e.target.value })}
                placeholder="São Paulo"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Editora / Instituição
              </label>
              <input
                type="text"
                value={newRef.publisher || ''}
                onChange={(e) => setNewRef({ ...newRef, publisher: e.target.value })}
                placeholder="Atlas / Pearson / Elsevier"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Ano de Publicação
              </label>
              <input
                type="text"
                value={newRef.year || ''}
                onChange={(e) => setNewRef({ ...newRef, year: e.target.value })}
                placeholder="2024"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                Páginas (Ex: p. 45-60)
              </label>
              <input
                type="text"
                value={newRef.pages || ''}
                onChange={(e) => setNewRef({ ...newRef, pages: e.target.value })}
                placeholder="p. 112-128"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
              />
            </div>

            {newRef.type === 'site' && (
              <>
                <div className="md:col-span-2">
                  <label className="block text-slate-300 font-semibold mb-1">
                    URL de Acesso
                  </label>
                  <input
                    type="text"
                    value={newRef.url || ''}
                    onChange={(e) => setNewRef({ ...newRef, url: e.target.value })}
                    placeholder="https://www.exemplo.org.br/artigo"
                    className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Data de Acesso (Ex: 14 out. 2024)
                  </label>
                  <input
                    type="text"
                    value={newRef.accessDate || ''}
                    onChange={(e) => setNewRef({ ...newRef, accessDate: e.target.value })}
                    placeholder="Acesso em: 10 mar. 2025."
                    className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
                  />
                </div>
              </>
            )}
          </div>

          {/* Real-time ABNT string preview */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wide block mb-1">
              Pré-visualização da Referência ABNT NBR 6023:
            </span>
            <p className="text-xs text-slate-200 font-serif">
              {formatABNTReference(newRef)}
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAddingReference(false)}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSaveNewReference}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs"
            >
              Salvar na Bibliografia
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por autor, título ou ano..."
            className="w-full bg-slate-800 text-slate-100 pl-9 pr-3 py-1.5 rounded-lg border border-slate-700 text-xs focus:border-amber-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Filtrar:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-slate-800 text-slate-200 text-xs border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-amber-500"
          >
            <option value="todos">Todos os tipos</option>
            <option value="livro">Livros</option>
            <option value="artigo">Artigos em Revista</option>
            <option value="congresso">Congressos</option>
            <option value="site">Websites</option>
          </select>
        </div>
      </div>

      {/* Reference Cards List */}
      <div className="space-y-3">
        {filteredReferences.map((ref) => {
          const keys = generateCitationKeys(ref.authors, ref.year);
          const isCited = citationValidation.matchedReferences.some((m) => m.id === ref.id);

          return (
            <div
              key={ref.id}
              className="bg-slate-900/90 rounded-2xl border border-slate-800 p-4 hover:border-slate-700 transition-all space-y-3 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-slate-800 text-slate-300 border border-slate-700">
                    {ref.type}
                  </span>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {ref.citationKey}
                  </span>
                  {isCited ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-medium">
                      ✓ Citada no texto
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                      ⚠️ Ainda não citada
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleDeleteReference(ref.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    title="Excluir referência"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Formatted ABNT string */}
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 text-xs text-slate-200 font-serif leading-relaxed">
                {ref.formattedABNT}
              </div>

              {/* Fast Copy Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase">
                  Copiar Citação:
                </span>

                <button
                  type="button"
                  onClick={() => handleCopy(keys.parenthetical, `p-${ref.id}`)}
                  className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors font-mono"
                  title="Citação parentética no fim de frase"
                >
                  {copiedId === `p-${ref.id}` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{keys.parenthetical}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(keys.narrative, `n-${ref.id}`)}
                  className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-750 text-slate-200 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors"
                  title="Citação narrativa em início de parágrafo"
                >
                  {copiedId === `n-${ref.id}` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400" />
                  )}
                  <span>{keys.narrative}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleCopy(ref.formattedABNT, `f-${ref.id}`)}
                  className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-750 text-amber-300 px-2.5 py-1 rounded-lg border border-amber-500/30 transition-colors ml-auto"
                  title="Copiar referência ABNT NBR 6023 completa"
                >
                  {copiedId === `f-${ref.id}` ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-amber-400" />
                  )}
                  <span>Copiar NBR 6023</span>
                </button>
              </div>
            </div>
          );
        })}

        {filteredReferences.length === 0 && (
          <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
            Nenhuma referência bibliográfica encontrada com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
};
