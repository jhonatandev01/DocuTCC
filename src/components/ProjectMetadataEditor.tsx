import React, { useState } from 'react';
import {
  Building2,
  Users,
  GraduationCap,
  Award,
  Heart,
  Quote,
  FileCheck2,
  Plus,
  Trash2,
  HelpCircle,
  Sliders,
  FileText,
  Languages,
} from 'lucide-react';
import { Author, BoardMember, TCCProject } from '../types';

interface ProjectMetadataEditorProps {
  project: TCCProject;
  onChange: (updatedProject: TCCProject) => void;
}

export const ProjectMetadataEditor: React.FC<ProjectMetadataEditorProps> = ({
  project,
  onChange,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<
    'geral' | 'instituicao' | 'autoria' | 'resumo' | 'pre_textuais' | 'configuracoes'
  >('geral');

  // Helper to generate default nature of work
  const generateDefaultNatureOfWork = () => {
    const cleanCourse = project.institution.course.replace(
      /^(Bacharelado|Licenciatura|Tecnologia|Curso Técnico em|Técnico em)\s*/i,
      ''
    );

    if (project.academicDegree === 'tecnico' || project.documentType === 'tcc_tecnico') {
      return `Trabalho de Conclusão de Curso apresentado à Coordenação do Curso Técnico em ${cleanCourse} da ${project.institution.name}, como requisito parcial para a obtenção do diploma e habilitação profissional de Técnico em ${cleanCourse}.\n\nEixo Tecnológico: ${project.institution.department || 'Informação e Comunicação'}.`;
    }

    const degreeLabel =
      project.academicDegree === 'bacharelado'
        ? 'Bacharel'
        : project.academicDegree === 'licenciatura'
        ? 'Licenciado'
        : project.academicDegree === 'tecnologo'
        ? 'Tecnólogo'
        : project.academicDegree === 'especializacao'
        ? 'Especialista'
        : project.academicDegree === 'mestrado'
        ? 'Mestre'
        : 'Doutor';

    const workTypeLabel =
      project.documentType === 'artigo'
        ? 'Artigo Científico apresentado como Trabalho de Conclusão de Curso'
        : project.documentType === 'relatorio_tecnico'
        ? 'Relatório Técnico apresentado'
        : project.documentType === 'projeto_pesquisa'
        ? 'Projeto de Pesquisa apresentado'
        : 'Trabalho de Conclusão de Curso apresentado';

    return `${workTypeLabel} ao Colegiado do Curso de ${project.institution.course} da ${project.institution.name}, como requisito parcial para a obtenção do título de ${degreeLabel} em ${cleanCourse}.\n\nÁrea de Concentração: ${project.institution.department || 'Ciências Exatas e Tecnológicas'}.`;
  };

  // Add author
  const handleAddAuthor = () => {
    const newAuthor: Author = {
      id: `auth-${Date.now()}`,
      name: 'NOVO AUTOR',
      email: '',
      courseOrDepartment: project.institution.course,
    };
    onChange({
      ...project,
      authors: [...project.authors, newAuthor],
      lastModified: new Date().toISOString(),
    });
  };

  // Remove author
  const handleRemoveAuthor = (id: string) => {
    if (project.authors.length <= 1) return;
    onChange({
      ...project,
      authors: project.authors.filter((a) => a.id !== id),
      lastModified: new Date().toISOString(),
    });
  };

  // Add Board Member
  const handleAddBoardMember = () => {
    const newMember: BoardMember = {
      id: `b-${Date.now()}`,
      name: 'Prof. Dr. Nome do Examinador',
      title: 'Doutor em Área Específica',
      role: 'Examinador Externo',
      institution: project.institution.name,
    };
    onChange({
      ...project,
      examinationBoard: [...project.examinationBoard, newMember],
      lastModified: new Date().toISOString(),
    });
  };

  // Remove Board Member
  const handleRemoveBoardMember = (id: string) => {
    onChange({
      ...project,
      examinationBoard: project.examinationBoard.filter((b) => b.id !== id),
      lastModified: new Date().toISOString(),
    });
  };

  // Resumo word count
  const resumoWordCount = project.resumo.text
    ? project.resumo.text.trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="bg-slate-900/90 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
      {/* Sub Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-950/60 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveSubTab('geral')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'geral'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          Título e Dados Básicos
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('instituicao')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'instituicao'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Instituição de Ensino
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('autoria')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'autoria'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Autores e Orientadores
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('resumo')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'resumo'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Languages className="w-4 h-4" />
          Resumo & Abstract
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('pre_textuais')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'pre_textuais'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          Banca, Dedicatória & Epígrafe
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab('configuracoes')}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap ${
            activeSubTab === 'configuracoes'
              ? 'border-amber-500 text-amber-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          Configurações ABNT
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6 space-y-6">
        {/* TAB 1: GERAL */}
        {activeSubTab === 'geral' && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Título Principal do Trabalho (Caixa Alta conforme ABNT NBR 14724)
                </label>
                <input
                  type="text"
                  value={project.title}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      title: e.target.value.toUpperCase(),
                      lastModified: new Date().toISOString(),
                    })
                  }
                  placeholder="EX: DESENVOLVIMENTO DE SISTEMA INTELIGENTE..."
                  className="w-full bg-slate-800 text-slate-100 font-semibold border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Pela NBR 14724, o título na capa e folha de rosto deve estar em letras maiúsculas e negrito.
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Subtítulo (Opcional - sem negrito, precedido por dois pontos)
                </label>
                <input
                  type="text"
                  value={project.subtitle || ''}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      subtitle: e.target.value,
                      lastModified: new Date().toISOString(),
                    })
                  }
                  placeholder="Ex: Um estudo de caso aplicado à gestão hospitalar"
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-amber-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Tipo de Trabalho Acadêmico
                </label>
                <select
                  value={project.documentType}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      documentType: e.target.value as any,
                      lastModified: new Date().toISOString(),
                    })
                  }
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="monografia">Monografia / TCC Tradicional (NBR 14724)</option>
                  <option value="tcc_tecnico">TCC Técnico / Projeto de Conclusão de Curso Técnico</option>
                  <option value="artigo">Artigo Científico (NBR 6022)</option>
                  <option value="relatorio_tecnico">Relatório Técnico ou Tecnológico (NBR 10719)</option>
                  <option value="projeto_pesquisa">Projeto de Pesquisa / Pré-Projeto (NBR 15287)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Nível / Grau do Curso
                </label>
                <select
                  value={project.academicDegree}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      academicDegree: e.target.value as any,
                      lastModified: new Date().toISOString(),
                    })
                  }
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                >
                  <option value="tecnico">Técnico (Nível Médio Profissionalizante - Habilitação de Técnico)</option>
                  <option value="bacharelado">Bacharelado (Graduação - Nível Superior)</option>
                  <option value="licenciatura">Licenciatura (Graduação - Nível Superior)</option>
                  <option value="tecnologo">Tecnólogo (Graduação Tecnológica - Nível Superior - CST)</option>
                  <option value="especializacao">Especialização (Pós-Graduação Lato Sensu)</option>
                  <option value="mestrado">Mestrado (Pós-Graduação Stricto Sensu - Dissertação)</option>
                  <option value="doutorado">Doutorado (Pós-Graduação Stricto Sensu - Tese)</option>
                </select>
                {(project.academicDegree === 'tecnico' || project.documentType === 'tcc_tecnico') ? (
                  <p className="text-[11px] text-emerald-400/90 mt-1.5 flex items-center gap-1.5 bg-emerald-950/30 border border-emerald-800/40 px-2.5 py-1.5 rounded-lg">
                    <span>💡</span>
                    <span>
                      <strong>Nível Técnico:</strong> Educação profissional de nível médio (Lei 9.394/96). Confere <strong>habilitação profissional de Técnico</strong> (ex: Técnico em Informática, Eletrotécnica). Não confundir com <em>Tecnólogo</em>, que é graduação de nível superior.
                    </span>
                  </p>
                ) : project.academicDegree === 'tecnologo' ? (
                  <p className="text-[11px] text-sky-400/90 mt-1.5 flex items-center gap-1.5 bg-sky-950/30 border border-sky-800/40 px-2.5 py-1.5 rounded-lg">
                    <span>💡</span>
                    <span>
                      <strong>Nível Tecnólogo (CST):</strong> Curso Superior de Tecnologia (graduação tecnológica). Confere diploma de <strong>nível superior</strong> e grau de Tecnólogo.
                    </span>
                  </p>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Cidade / Local de Depósito
                </label>
                <input
                  type="text"
                  value={project.city}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      city: e.target.value.toUpperCase(),
                      lastModified: new Date().toISOString(),
                    })
                  }
                  placeholder="EX: SÃO PAULO"
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Ano de Depósito / Defesa
                </label>
                <input
                  type="text"
                  value={project.year}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      year: e.target.value,
                      lastModified: new Date().toISOString(),
                    })
                  }
                  placeholder="2025"
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Natureza do Trabalho (Nota Explicativa da Folha de Rosto e Aprovação)
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      onChange({
                        ...project,
                        natureOfWork: generateDefaultNatureOfWork(),
                        lastModified: new Date().toISOString(),
                      })
                    }
                    className="text-[11px] text-amber-400 hover:text-amber-300 underline"
                  >
                    Gerar texto padrão automaticamente
                  </button>
                </div>
                <textarea
                  rows={3}
                  value={project.natureOfWork}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      natureOfWork: e.target.value,
                      lastModified: new Date().toISOString(),
                    })
                  }
                  className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INSTITUICAO */}
        {activeSubTab === 'instituicao' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Nome da Instituição de Ensino Superior (Caixa Alta)
              </label>
              <input
                type="text"
                value={project.institution.name}
                onChange={(e) =>
                  onChange({
                    ...project,
                    institution: {
                      ...project.institution,
                      name: e.target.value.toUpperCase(),
                    },
                    lastModified: new Date().toISOString(),
                  })
                }
                placeholder="EX: UNIVERSIDADE DE SÃO PAULO"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Faculdade, Centro ou Instituto
              </label>
              <input
                type="text"
                value={project.institution.facultyOrInstitute || ''}
                onChange={(e) =>
                  onChange({
                    ...project,
                    institution: {
                      ...project.institution,
                      facultyOrInstitute: e.target.value.toUpperCase(),
                    },
                    lastModified: new Date().toISOString(),
                  })
                }
                placeholder="EX: FACULDADE DE ENGENHARIA"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Departamento
              </label>
              <input
                type="text"
                value={project.institution.department || ''}
                onChange={(e) =>
                  onChange({
                    ...project,
                    institution: {
                      ...project.institution,
                      department: e.target.value.toUpperCase(),
                    },
                    lastModified: new Date().toISOString(),
                  })
                }
                placeholder="EX: DEPARTAMENTO DE COMPUTAÇÃO"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wide">
                Nome do Curso
              </label>
              <input
                type="text"
                value={project.institution.course}
                onChange={(e) =>
                  onChange({
                    ...project,
                    institution: {
                      ...project.institution,
                      course: e.target.value,
                    },
                    lastModified: new Date().toISOString(),
                  })
                }
                placeholder="Bacharelado em Ciência da Computação"
                className="w-full bg-slate-800 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
        )}

        {/* TAB 3: AUTORIA & ORIENTACAO */}
        {activeSubTab === 'autoria' && (
          <div className="space-y-6">
            {/* Authors list */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  Autores do Trabalho ({project.authors.length})
                </h3>
                <button
                  type="button"
                  onClick={handleAddAuthor}
                  className="flex items-center gap-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Coautor
                </button>
              </div>

              <div className="space-y-3">
                {project.authors.map((author, index) => (
                  <div
                    key={author.id}
                    className="p-4 bg-slate-800/60 rounded-xl border border-slate-700/70 grid grid-cols-1 md:grid-cols-3 gap-3 items-center"
                  >
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        Nome Completo do Autor {index + 1}
                      </label>
                      <input
                        type="text"
                        value={author.name}
                        onChange={(e) => {
                          const updated = project.authors.map((a) =>
                            a.id === author.id
                              ? { ...a, name: e.target.value.toUpperCase() }
                              : a
                          );
                          onChange({
                            ...project,
                            authors: updated,
                            lastModified: new Date().toISOString(),
                          });
                        }}
                        className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                        E-mail Institucional
                      </label>
                      <input
                        type="email"
                        value={author.email || ''}
                        onChange={(e) => {
                          const updated = project.authors.map((a) =>
                            a.id === author.id
                              ? { ...a, email: e.target.value }
                              : a
                          );
                          onChange({
                            ...project,
                            authors: updated,
                            lastModified: new Date().toISOString(),
                          });
                        }}
                        placeholder="autor@universidade.edu.br"
                        className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                          Currículo Lattes (Opcional)
                        </label>
                        <input
                          type="text"
                          value={author.lattes || ''}
                          onChange={(e) => {
                            const updated = project.authors.map((a) =>
                              a.id === author.id
                                ? { ...a, lattes: e.target.value }
                                : a
                            );
                            onChange({
                              ...project,
                              authors: updated,
                              lastModified: new Date().toISOString(),
                            });
                          }}
                          placeholder="http://lattes.cnpq.br/..."
                          className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                        />
                      </div>
                      {project.authors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveAuthor(author.id)}
                          className="mt-4 p-2 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-colors"
                          title="Remover autor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Advisor & Coadvisor */}
            <div className="pt-4 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                Orientação Acadêmica
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
                  <span className="text-xs font-bold text-amber-400">Orientador(a) Principal</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Nome com Titulação (Ex: Prof. Dr. Fulano de Tal)
                    </label>
                    <input
                      type="text"
                      value={project.advisor.name}
                      onChange={(e) =>
                        onChange({
                          ...project,
                          advisor: { ...project.advisor, name: e.target.value },
                          lastModified: new Date().toISOString(),
                        })
                      }
                      className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Titulação Acadêmica
                    </label>
                    <input
                      type="text"
                      value={project.advisor.title}
                      onChange={(e) =>
                        onChange({
                          ...project,
                          advisor: { ...project.advisor, title: e.target.value },
                          lastModified: new Date().toISOString(),
                        })
                      }
                      placeholder="Doutor em Ciência da Computação"
                      className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
                  <span className="text-xs font-bold text-slate-300">Coorientador(a) (Se houver)</span>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Nome com Titulação
                    </label>
                    <input
                      type="text"
                      value={project.coAdvisor?.name || ''}
                      onChange={(e) =>
                        onChange({
                          ...project,
                          coAdvisor: {
                            name: e.target.value,
                            title: project.coAdvisor?.title || '',
                            institution: project.coAdvisor?.institution || '',
                          },
                          lastModified: new Date().toISOString(),
                        })
                      }
                      placeholder="Profª. Ma. Beltrana de Tal"
                      className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">
                      Titulação Acadêmica
                    </label>
                    <input
                      type="text"
                      value={project.coAdvisor?.title || ''}
                      onChange={(e) =>
                        onChange({
                          ...project,
                          coAdvisor: {
                            name: project.coAdvisor?.name || '',
                            title: e.target.value,
                            institution: project.coAdvisor?.institution || '',
                          },
                          lastModified: new Date().toISOString(),
                        })
                      }
                      placeholder="Mestra em Engenharia"
                      className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: RESUMO & ABSTRACT */}
        {activeSubTab === 'resumo' && (
          <div className="space-y-6">
            {/* Resumo em Português */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/70 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-amber-400 uppercase tracking-wide flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4" />
                  Resumo em Língua Portuguesa (NBR 6028)
                </label>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
                    resumoWordCount >= 150 && resumoWordCount <= 500
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {resumoWordCount} palavras (Recomendado NBR 6028: 150 a 500)
                </span>
              </div>
              <textarea
                rows={7}
                value={project.resumo.text}
                onChange={(e) =>
                  onChange({
                    ...project,
                    resumo: { ...project.resumo, text: e.target.value },
                    lastModified: new Date().toISOString(),
                  })
                }
                placeholder="O resumo deve ser redigido em parágrafo único, em terceira pessoa, ressaltando o objetivo, método, resultados e conclusões do trabalho..."
                className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
              />

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Palavras-chave (separadas por ponto final conforme NBR 6028)
                </label>
                <input
                  type="text"
                  value={project.resumo.keywords.join('. ')}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw
                      .split('.')
                      .map((k) => k.trim())
                      .filter(Boolean);
                    onChange({
                      ...project,
                      resumo: { ...project.resumo, keywords: parsed },
                      lastModified: new Date().toISOString(),
                    });
                  }}
                  placeholder="Inteligência artificial. Visão computacional. Redes neurais."
                  className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>

            {/* Abstract em Inglês */}
            <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/70 space-y-3">
              <label className="block text-xs font-bold text-slate-200 uppercase tracking-wide">
                Abstract (Resumo em Língua Estrangeira - Inglês)
              </label>
              <textarea
                rows={7}
                value={project.abstract.text}
                onChange={(e) =>
                  onChange({
                    ...project,
                    abstract: { ...project.abstract, text: e.target.value },
                    lastModified: new Date().toISOString(),
                  })
                }
                placeholder="This monograph investigates the application of..."
                className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-3 text-xs focus:outline-none focus:border-amber-500 leading-relaxed"
              />

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Keywords (separadas por ponto final)
                </label>
                <input
                  type="text"
                  value={project.abstract.keywords.join('. ')}
                  onChange={(e) => {
                    const raw = e.target.value;
                    const parsed = raw
                      .split('.')
                      .map((k) => k.trim())
                      .filter(Boolean);
                    onChange({
                      ...project,
                      abstract: { ...project.abstract, keywords: parsed },
                      lastModified: new Date().toISOString(),
                    });
                  }}
                  placeholder="Artificial intelligence. Computer vision. Neural networks."
                  className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-amber-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PRE-TEXTUAIS OPCIONAIS E BANCA */}
        {activeSubTab === 'pre_textuais' && (
          <div className="space-y-6">
            {/* Examination Board */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4" />
                  Membros da Banca Examinadora (Folha de Aprovação)
                </h3>
                <button
                  type="button"
                  onClick={handleAddBoardMember}
                  className="flex items-center gap-1 text-xs bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 px-3 py-1 rounded-lg transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" /> Adicionar Membro
                </button>
              </div>

              <div className="space-y-2">
                {project.examinationBoard.map((member) => (
                  <div
                    key={member.id}
                    className="p-3 bg-slate-900 rounded-xl border border-slate-700/70 grid grid-cols-1 sm:grid-cols-4 gap-2 items-center text-xs"
                  >
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => {
                        const updated = project.examinationBoard.map((m) =>
                          m.id === member.id ? { ...m, name: e.target.value } : m
                        );
                        onChange({ ...project, examinationBoard: updated });
                      }}
                      placeholder="Nome e Titulação"
                      className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-amber-500"
                    />
                    <input
                      type="text"
                      value={member.institution}
                      onChange={(e) => {
                        const updated = project.examinationBoard.map((m) =>
                          m.id === member.id
                            ? { ...m, institution: e.target.value }
                            : m
                        );
                        onChange({ ...project, examinationBoard: updated });
                      }}
                      placeholder="Instituição"
                      className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-amber-500"
                    />
                    <select
                      value={member.role}
                      onChange={(e) => {
                        const updated = project.examinationBoard.map((m) =>
                          m.id === member.id
                            ? { ...m, role: e.target.value as any }
                            : m
                        );
                        onChange({ ...project, examinationBoard: updated });
                      }}
                      className="bg-slate-800 text-slate-100 border border-slate-700 rounded-lg px-2.5 py-1.5 focus:border-amber-500"
                    >
                      <option value="Presidente">Presidente</option>
                      <option value="Orientador">Orientador</option>
                      <option value="Examinador Interno">Examinador Interno</option>
                      <option value="Examinador Externo">Examinador Externo</option>
                    </select>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveBoardMember(member.id)}
                        className="text-rose-400 hover:text-rose-300 p-1.5"
                        title="Remover examinador"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Dedication, Acknowledgments, Epigraph */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Heart className="w-3.5 h-3.5 text-rose-400" />
                  Dedicatória (Opcional - NBR 14724)
                </label>
                <textarea
                  rows={4}
                  value={project.dedication || ''}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      dedication: e.target.value,
                      lastModified: new Date().toISOString(),
                    })
                  }
                  placeholder="Dedico este trabalho a..."
                  className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-3 text-xs focus:border-amber-500 leading-relaxed"
                />
                <p className="text-[10px] text-slate-400">
                  Na folha impressa, a dedicatória fica alinhada à direita na parte inferior da página.
                </p>
              </div>

              <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
                  <Quote className="w-3.5 h-3.5 text-amber-400" />
                  Epígrafe (Opcional - NBR 14724)
                </label>
                <textarea
                  rows={2}
                  value={project.epigraph?.quote || ''}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      epigraph: {
                        quote: e.target.value,
                        author: project.epigraph?.author || '',
                      },
                      lastModified: new Date().toISOString(),
                    })
                  }
                  placeholder="Citação inspiradora..."
                  className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-3 text-xs focus:border-amber-500 leading-relaxed"
                />
                <input
                  type="text"
                  value={project.epigraph?.author || ''}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      epigraph: {
                        quote: project.epigraph?.quote || '',
                        author: e.target.value,
                      },
                      lastModified: new Date().toISOString(),
                    })
                  }
                  placeholder="Autor da frase (ex: Carl Sagan, 1995)"
                  className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg px-3 py-1.5 text-xs focus:border-amber-500"
                />
              </div>

              <div className="md:col-span-2 p-4 bg-slate-800/40 rounded-xl border border-slate-700/60 space-y-2">
                <label className="text-xs font-bold text-slate-300 uppercase">
                  Agradecimentos (Opcional - NBR 14724)
                </label>
                <textarea
                  rows={4}
                  value={project.acknowledgments || ''}
                  onChange={(e) =>
                    onChange({
                      ...project,
                      acknowledgments: e.target.value,
                      lastModified: new Date().toISOString(),
                    })
                  }
                  placeholder="Agradeço primeiramente aos professores, colegas, agências de fomento..."
                  className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-xl p-3 text-xs focus:border-amber-500 leading-relaxed"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: CONFIGURACOES ABNT */}
        {activeSubTab === 'configuracoes' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wide mb-3">
                Norma Tipográfica (NBR 14724)
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Família da Fonte Padrão
                  </label>
                  <select
                    value={project.settings.fontFamily}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: {
                          ...project.settings,
                          fontFamily: e.target.value as any,
                        },
                      })
                    }
                    className="w-full bg-slate-900 text-slate-100 border border-slate-700 rounded-lg p-2 focus:border-amber-500"
                  >
                    <option value="Times New Roman">Times New Roman (Recomendado)</option>
                    <option value="Arial">Arial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Espaçamento Entrelinhas
                  </label>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                    1,5 no texto / 1,0 em citações longas
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">
                    Margens Oficiais ABNT
                  </label>
                  <div className="p-2 bg-slate-900 rounded-lg border border-slate-800 text-slate-300">
                    Sup: 3cm | Esq: 3cm | Inf: 2cm | Dir: 2cm
                  </div>
                </div>
              </div>
            </div>

            {/* Checklist de Elementos Pré e Pós textuais */}
            <div className="p-4 bg-slate-800/40 rounded-xl border border-slate-700/60">
              <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide mb-3">
                Elementos a Incluir na Renderização / PDF
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeCover}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeCover: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Capa (Obrigatório)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeTitlePage}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeTitlePage: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Folha de Rosto (Obrigatório)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeApprovalSheet}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeApprovalSheet: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Folha de Aprovação</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeResumo}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeResumo: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Resumo (Português)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeAbstract}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeAbstract: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Abstract (Inglês)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeTableOfContents}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeTableOfContents: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Sumário Automático (NBR 6027)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeListOfFigures}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeListOfFigures: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Lista de Figuras</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeListOfTables}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeListOfTables: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Lista de Tabelas</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={project.settings.includeListOfAcronyms}
                    onChange={(e) =>
                      onChange({
                        ...project,
                        settings: { ...project.settings, includeListOfAcronyms: e.target.checked },
                      })
                    }
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-500"
                  />
                  <span>Lista de Siglas / Abreviaturas</span>
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
