import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { Packer } from "docx";
import { createDocxDocument } from "./src/utils/exportDocx";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Lazy Google Gen AI Client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Helper to inspect and parse Gemini error responses
function parseGeminiErrorMessage(error: any): {
  statusCode: number;
  isRetryable: boolean;
  isHighDemand: boolean;
  userFriendlyMessage: string;
} {
  const errStr = typeof error === "string" ? error : (error?.message || JSON.stringify(error) || "");

  let code: number | undefined;
  let status: string | undefined;
  let innerMsg: string | undefined;

  try {
    const jsonMatch = errStr.match(/\{[\s\S]*"error"[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.error) {
        code = Number(parsed.error.code);
        status = parsed.error.status;
        innerMsg = parsed.error.message;
      }
    }
  } catch (_e) {
    // ignore
  }

  if (!code && error?.status && typeof error.status === "number") {
    code = error.status;
  }

  const is503 = code === 503 || status === "UNAVAILABLE" || /503|UNAVAILABLE/i.test(errStr);
  const isHighDemand = is503 || /high demand|spikes in demand|temporarily unavailable|overloaded|try again later/i.test(errStr);
  const isRateLimit = code === 429 || status === "RESOURCE_EXHAUSTED" || /429|RESOURCE_EXHAUSTED|quota/i.test(errStr);
  const isNetwork = /ECONNRESET|ETIMEDOUT|ENOTFOUND|fetch failed/i.test(errStr);
  const isServerErr = code === 500 || code === 502 || code === 504;

  const isRetryable = isHighDemand || isRateLimit || isNetwork || isServerErr;

  let statusCode = 500;
  if (isHighDemand) statusCode = 503;
  else if (isRateLimit) statusCode = 429;
  else if (code && code >= 400 && code < 600) statusCode = code;

  let userFriendlyMessage = "Erro ao processar a solicitação com o serviço de Inteligência Artificial.";

  if (isHighDemand) {
    userFriendlyMessage = "Os servidores de IA estão com alta demanda temporária no momento (código 503). O sistema tentou modelos alternativos automaticamente. Por favor, aguarde alguns instantes e tente novamente.";
  } else if (isRateLimit) {
    userFriendlyMessage = "Limite temporário de requisições de IA atingido (código 429). Por favor, aguarde alguns segundos antes de tentar novamente.";
  } else if (/API key not valid|API_KEY_INVALID|GEMINI_API_KEY/i.test(errStr)) {
    userFriendlyMessage = "Chave GEMINI_API_KEY não configurada ou inválida. Verifique o menu de configurações da aplicação.";
  } else if (innerMsg) {
    userFriendlyMessage = innerMsg;
  } else if (error?.message) {
    userFriendlyMessage = error.message;
  }

  return { statusCode, isRetryable, isHighDemand, userFriendlyMessage };
}

interface GeminiCallParams {
  contents: any;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
  tools?: any[];
}

interface GeminiCallResult {
  text: string;
  groundingSources?: Array<{ title: string; url: string }>;
}

// Allowed models in order of priority (from official gemini-api skill)
const CANDIDATE_MODELS = [
  "gemini-3.8-flash",
  "gemini-flash-latest",
  "gemini-3.1-flash-lite",
];

async function callGeminiWithRetryAndFallback(
  ai: GoogleGenAI,
  params: GeminiCallParams
): Promise<string> {
  const result = await callGeminiWithDetailsAndFallback(ai, params);
  return result.text;
}

async function callGeminiWithDetailsAndFallback(
  ai: GoogleGenAI,
  params: GeminiCallParams
): Promise<GeminiCallResult> {
  let lastError: any = null;

  for (let modelIdx = 0; modelIdx < CANDIDATE_MODELS.length; modelIdx++) {
    const currentModel = CANDIDATE_MODELS[modelIdx];
    const maxAttempts = 2; // Try up to 2 times per model

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`[Gemini] Solicitando ao modelo '${currentModel}' (opção ${modelIdx + 1}/${CANDIDATE_MODELS.length}, tentativa ${attempt}/${maxAttempts})...`);
        const config: any = {
          systemInstruction: params.systemInstruction,
          temperature: params.temperature ?? 0.35,
          ...(params.responseMimeType ? { responseMimeType: params.responseMimeType } : {}),
        };

        if (params.tools && params.tools.length > 0) {
          config.tools = params.tools;
        }

        const response = await ai.models.generateContent({
          model: currentModel,
          contents: params.contents,
          config,
        });

        if (response.text) {
          console.log(`[Gemini] Resposta gerada com sucesso pelo modelo '${currentModel}'.`);

          // Extract grounding URLs and sources if Google Search tool was used
          const groundingSources: Array<{ title: string; url: string }> = [];
          const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
          if (chunks && Array.isArray(chunks)) {
            for (const chunk of chunks) {
              if (chunk.web?.uri) {
                groundingSources.push({
                  title: chunk.web.title || chunk.web.uri,
                  url: chunk.web.uri,
                });
              }
            }
          }

          return {
            text: response.text,
            groundingSources: groundingSources.length > 0 ? groundingSources : undefined,
          };
        } else {
          throw new Error("Resposta vazia retornada pela IA.");
        }
      } catch (err: any) {
        lastError = err;
        const { isRetryable, isHighDemand } = parseGeminiErrorMessage(err);
        console.warn(`[Gemini] Erro no modelo '${currentModel}' (tentativa ${attempt}):`, isHighDemand ? "Alta demanda temporária (503)" : err?.message || err);

        if (!isRetryable) {
          throw err;
        }

        if (attempt < maxAttempts) {
          const waitMs = 1200 + Math.floor(Math.random() * 800);
          console.log(`[Gemini] Aguardando ${waitMs}ms antes de repetir no modelo '${currentModel}'...`);
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        } else if (modelIdx < CANDIDATE_MODELS.length - 1) {
          const nextModel = CANDIDATE_MODELS[modelIdx + 1];
          console.log(`[Gemini] Modelo '${currentModel}' indisponível no momento. Alternando para contingência: '${nextModel}'...`);
          await new Promise((resolve) => setTimeout(resolve, 600));
        }
      }
    }
  }

  throw lastError;
}

// Academic AI Assistant endpoint
app.post("/api/gemini/academic-assist", async (req, res) => {
  try {
    const { action, prompt, context } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.status(503).json({
        error: "Serviço de IA temporariamente indisponível. Verifique a chave GEMINI_API_KEY no menu de configurações.",
      });
    }

    let systemInstruction = "Você é um especialista sênior em Metodologia Científica e Normas ABNT (Associação Brasileira de Normas Técnicas), especialmente NBR 14724 (Trabalhos Acadêmicos), NBR 6023 (Referências), NBR 10520 (Citações) e NBR 6028 (Resumo). Você auxilia estudantes e pesquisadores a redigir TCCs impecáveis, rigorosos, com linguagem impessoal, acadêmica e clara.";

    let userPrompt = "";

    if (action === "format_reference") {
      systemInstruction += " Converta as informações fornecidas em uma referência estritamente formatada pela ABNT NBR 6023:2018. Retorne também a forma de citação direta/indireta recomendada (NBR 10520). Exemplo no texto: (SOBRENOME, Ano, p. xx) e no parágrafo: Segundo Sobrenome (Ano).";
      userPrompt = `Informações brutas da fonte bibliográfica:\n${prompt}\n\nRetorne um JSON com os campos: 
      {
        "abntReference": "SOBRENOME, Nome. Título em negrito: subtítulo sem destaque. Cidade: Editora, Ano.",
        "inTextParenthetical": "(SOBRENOME, Ano)",
        "inTextNarrative": "Segundo Sobrenome (Ano)",
        "author": "SOBRENOME, Nome",
        "title": "Título da obra",
        "year": "2024",
        "type": "livro | artigo | site | tese | congresso",
        "notes": "Dicas de citação segundo NBR 10520"
      }. Retorne APENAS o JSON válido.`;
    } else if (action === "refine_academic_text") {
      systemInstruction += " Seu papel é reescrever o texto fornecido pelo usuário aprimorando para a norma culta padrão e estilo acadêmico rigoroso: terceira pessoa do singular ou voz passiva pronominal, sem chavões, sem juízos de valor informais, com clareza conceitual, conectivos adequados e elegância científica.";
      userPrompt = `Contexto/Seção do TCC: ${context || "Geral"}\n\nTexto original:\n"${prompt}"\n\nForneça uma versão reescrita com padrão acadêmico ABNT, seguida de breves apontamentos metodológicos sobre as melhorias efetuadas.`;
    } else if (action === "generate_objectives_and_problem") {
      userPrompt = `Com base no tema e ideia de TCC a seguir:\n"${prompt}"\n\nElabore uma proposta estruturada e coerente contendo:
1. Formulação do Problema de Pesquisa (pergunta investigativa clara e delimitada).
2. Hipótese de Trabalho (ou pressuposto).
3. Objetivo Geral (iniciado com verbo no infinitivo conforme taxonomia de Bloom, ex: Analisar, Investigar, Avaliar).
4. Três ou quatro Objetivos Específicos (etapas lógicas sequenciais para atingir o objetivo geral).
5. Sugestão de Justificativa (relevância teórica, prática e social).
6. Metodologia Recomendada (tipo de pesquisa, abordagem quali/quanti, instrumentos sugeridos).`;
    } else if (action === "generate_resumo_abstract") {
      userPrompt = `A partir do resumo em português ou tópicos do TCC:\n"${prompt}"\n\n1. Resumo em Português conforme ABNT NBR 6028 (texto corrido de parágrafo único, 150 a 500 palavras, contextualização, objetivo, metodologia, resultados e conclusão).
2. Palavras-chave: 3 a 5 palavras separadas por ponto e finalizadas por ponto.
3. Abstract em Inglês com terminologia acadêmica internacional correspondente.
4. Keywords em Inglês.`;
    } else {
      userPrompt = prompt;
    }

    const text = await callGeminiWithRetryAndFallback(ai, {
      contents: userPrompt,
      systemInstruction,
      temperature: 0.4,
    });

    return res.json({ result: text || "" });
  } catch (error: any) {
    console.error("Gemini API error (/api/gemini/academic-assist):", error);
    const errInfo = parseGeminiErrorMessage(error);
    return res.status(errInfo.statusCode).json({
      error: errInfo.userFriendlyMessage,
    });
  }
});

// Helper to sanitize and parse JSON from model output
function cleanAndParseJSON(rawText: string): any {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```json")) {
    cleaned = cleaned.replace(/^```json\s*/, "").replace(/\s*```$/, "");
  } else if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```\s*/, "").replace(/\s*```$/, "");
  }
  return JSON.parse(cleaned);
}

// Full Autonomous TCC Generator Endpoint
app.post("/api/gemini/generate-full-tcc", async (req, res) => {
  try {
    const {
      topic,
      course,
      degree = "bacharelado",
      documentType = "monografia",
      objectives,
      methodology,
      technologies,
      authorName = "SEU NOME COMPLETO",
      advisorName = "Prof. Dr. Nome do Orientador",
      institutionName = "Universidade / Instituto de Ensino Superior",
      city = "São Paulo",
      year = new Date().getFullYear().toString(),
    } = req.body;

    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Serviço de IA indisponível. Configure a chave GEMINI_API_KEY no menu de configurações.",
      });
    }

    const systemInstruction = `Você é o mais conceituado orientador acadêmico e especialista nas normas da ABNT (Associação Brasileira de Normas Técnicas), em especial NBR 14724:2011 (Trabalhos Acadêmicos), NBR 6023:2018 (Referências), NBR 10520:2023 (Citações) e NBR 6028:2021 (Resumo).
Sua missão é gerar uma estrutura acadêmica completa, rigorosa, científica e totalmente preenchida para um Trabalho de Conclusão de Curso (TCC).
NUNCA use placeholders como "escreva aqui mais", "..." ou "a preencher". Escreva textos aprofundados com parágrafos consistentes, termos acadêmicos na terceira pessoa (impessoal), fundamentação teórica sólida com citações em formato NBR 10520 (ex: SILVA, 2021) e referências bibliográficas reais e completas pela NBR 6023:2018.

CRITÉRIOS CRÍTICOS DE NATUREZA DO TRABALHO (natureOfWork) E GRAU ACADÊMICO:
- Se grau for "tecnico" (Educação Profissional Técnica de Nível Médio): O trabalho DEVE registrar exatamente:
  "Trabalho de Conclusão de Curso apresentado ao Curso Técnico em [Curso] do(a) [Instituição], como requisito parcial para a obtenção do diploma e habilitação profissional de Técnico em [Curso]."
  ATENÇÃO: O nível Técnico é educação profissional técnica de nível médio (Lei 9.394/96). NÃO confere título de Tecnólogo e NÃO é curso superior.
- Se grau for "tecnologo" (Graduação Tecnológica - Nível Superior):
  "Trabalho de Conclusão de Curso apresentado ao Curso Superior de Tecnologia em [Curso] da [Instituição], como requisito parcial para a obtenção do título de Tecnólogo em [Curso]."
- Se grau for "bacharelado":
  "Trabalho de Conclusão de Curso apresentado ao Curso de Bacharelado em [Curso] da [Instituição], como requisito parcial para a obtenção do título de Bacharel em [Curso]."
- Se grau for "licenciatura":
  "Trabalho de Conclusão de Curso apresentado ao Curso de Licenciatura em [Curso] da [Instituição], como requisito parcial para a obtenção do título de Licenciado em [Curso]."

CRITÉRIO PARA TIPO "tcc_tecnico" (TCC TÉCNICO / PROJETO DE CURSO TÉCNICO):
- Se o tipo for "tcc_tecnico" ou o grau for "tecnico", foque em aplicação prática, projeto aplicado, memorial descritivo, especificações de materiais/componentes/softwares, esquemas ou fluxogramas, conformidade com normas técnicas aplicáveis (ABNT, NRs da área) e validação através de testes práticos, medições de bancada ou estudo de caso operacional.
- Sugestão de seções:
  1. INTRODUÇÃO (Contexto da área técnica, justificativa operacional e objetivos técnicos)
  2. FUNDAMENTAÇÃO TEÓRICA E NORMAS TÉCNICAS (Conceitos centrais e normas aplicáveis)
  3. ESPECIFICAÇÃO DO PROJETO E METODOLOGIA (Materiais, ferramentas, softwares e procedimentos)
  4. DESENVOLVIMENTO, MONTAGEM E RESULTADOS PRÁTICOS (Implementação, testes e análise técnica)
  5. CONSIDERAÇÕES FINAIS E VIABILIDADE (Conclusão, viabilidade técnica/econômica e recomendações)

Você deve responder EXCLUSIVAMENTE em formato JSON com a seguinte estrutura:
{
  "title": "TÍTULO EM CAIXA ALTA DO TCC",
  "subtitle": "Subtítulo delimitador em caixa baixa e alta",
  "natureOfWork": "Texto completo da natureza do trabalho conforme a regra acima",
  "resumo": {
    "text": "Resumo contínuo em parágrafo único de 150 a 500 palavras conforme NBR 6028, contendo contextualização, problema, objetivo, metodologia, principais resultados e considerações finais.",
    "keywords": ["Palavra1", "Palavra2", "Palavra3", "Palavra4"]
  },
  "abstract": {
    "text": "Versão em inglês do resumo com vocabulário acadêmico formal.",
    "keywords": ["Keyword1", "Keyword2", "Keyword3", "Keyword4"]
  },
  "acronyms": [
    {"acronym": "SIGLA", "definition": "Significado da Sigla"}
  ],
  "sections": [
    {
      "id": "sec-1",
      "number": "1",
      "title": "INTRODUÇÃO",
      "level": 1,
      "type": "textual",
      "content": "Texto aprofundado com contextualização do tema, relevância acadêmica e social, problema de pesquisa, hipótese, objetivos e estrutura do trabalho."
    },
    {
      "id": "sec-2",
      "number": "2",
      "title": "REFERENCIAL TEÓRICO",
      "level": 1,
      "type": "textual",
      "content": "Texto aprofundado trazendo conceitos centrais, evolução histórica, debates teóricos com citações de autores importantes no formato (SOBRENOME, Ano)."
    },
    {
      "id": "sec-3",
      "number": "3",
      "title": "METODOLOGIA",
      "level": 1,
      "type": "textual",
      "content": "Detalhamento da abordagem (qualitativa/quantitativa), natureza da pesquisa, procedimentos, instrumentos, universo/amostra e critérios éticos e técnicos."
    },
    {
      "id": "sec-4",
      "number": "4",
      "title": "DESENVOLVIMENTO E RESULTADOS",
      "level": 1,
      "type": "textual",
      "content": "Apresentação detalhada da proposta, desenvolvimento técnico, dados coletados, análises e discussão comparativa à luz da literatura."
    },
    {
      "id": "sec-5",
      "number": "5",
      "title": "CONSIDERAÇÕES FINAIS",
      "level": 1,
      "type": "textual",
      "content": "Síntese dos resultados, verificação do cumprimento dos objetivos, contribuições do estudo, limitações e sugestões para trabalhos futuros."
    }
  ],
  "references": [
    {
      "type": "livro",
      "authors": "SOBRENOME, Nome",
      "title": "Título do livro",
      "subtitle": "subtítulo se houver",
      "publisher": "Editora",
      "city": "Cidade",
      "year": "2022",
      "formattedABNT": "SOBRENOME, Nome. Título do livro: subtítulo. Cidade: Editora, 2022.",
      "citationKey": "SOBRENOME, 2022"
    }
  ]
}`;

    const userPrompt = `Gere agora a documentação completa do TCC com os dados a seguir:
- Tema do TCC: ${topic}
- Curso: ${course}
- Grau Acadêmico: ${degree}
- Tipo de Documento: ${documentType}
- Objetivos: ${objectives || "Elaborar análise aprofundada com validação técnica"}
- Metodologia: ${methodology || "Pesquisa aplicada, exploratória e quantitativa"}
- Tecnologias/Ferramentas: ${technologies || "Ambiente padrão acadêmico"}
- Autor: ${authorName}
- Orientador: ${advisorName}
- Instituição: ${institutionName}
- Cidade: ${city}
- Ano: ${year}

Certifique-se de produzir textos ricos e volumosos, sem abreviações ou simplificações.`;

    const rawCallResult = await callGeminiWithDetailsAndFallback(ai, {
      contents: userPrompt,
      systemInstruction,
      temperature: 0.35,
      responseMimeType: "application/json",
    });

    const parsed = cleanAndParseJSON(rawCallResult.text || "{}");

    // Construct full TCCProject
    const fullProject = {
      id: `tcc-gen-${Date.now()}`,
      title: parsed.title || topic.toUpperCase(),
      subtitle: parsed.subtitle || "",
      documentType,
      academicDegree: degree,
      institution: {
        name: institutionName,
        course: course,
        campus: "Campus Principal",
      },
      authors: [
        {
          id: `auth-${Date.now()}`,
          name: authorName,
          email: "",
          courseOrDepartment: course,
        },
      ],
      advisor: {
        name: advisorName,
        title: "Prof. Dr.",
        institution: institutionName,
      },
      city,
      year,
      natureOfWork:
        parsed.natureOfWork ||
        `Trabalho de Conclusão de Curso apresentado ao Curso de ${course} da ${institutionName} como requisito parcial para a obtenção do título de Bacharel.`,
      examinationBoard: [
        {
          id: "board-1",
          name: advisorName,
          title: "Prof. Dr.",
          role: "Presidente",
          institution: institutionName,
        },
        {
          id: "board-2",
          name: "Prof. Dr. Primeiro Examinador Interno",
          title: "Prof. Dr.",
          role: "Examinador Interno",
          institution: institutionName,
        },
        {
          id: "board-3",
          name: "Profª. Dra. Segunda Examinadora Externa",
          title: "Profª. Dra.",
          role: "Examinador Externo",
          institution: "Universidade Convidada",
        },
      ],
      resumo: parsed.resumo || {
        text: "Resumo do trabalho acadêmico elaborado conforme NBR 6028.",
        keywords: ["Pesquisa", "Inovação", "Metodologia", "Resultados"],
      },
      abstract: parsed.abstract || {
        text: "Academic work abstract prepared in accordance with institutional guidelines.",
        keywords: ["Research", "Innovation", "Methodology", "Results"],
      },
      acronyms: (parsed.acronyms || []).map((a: any, idx: number) => ({
        id: `acr-${idx + 1}`,
        acronym: a.acronym,
        definition: a.definition,
      })),
      symbols: [],
      sections: (parsed.sections || []).map((sec: any, idx: number) => ({
        id: sec.id || `sec-${idx + 1}`,
        number: sec.number || `${idx + 1}`,
        title: sec.title || `SEÇÃO ${idx + 1}`,
        level: sec.level || 1,
        type: sec.type || "textual",
        content: sec.content || "",
      })),
      crossReferences: [],
      references: (parsed.references || []).map((ref: any, idx: number) => ({
        id: `ref-${idx + 1}`,
        type: ref.type || "livro",
        authors: ref.authors || "SOBRENOME, Nome",
        title: ref.title || "Título",
        subtitle: ref.subtitle || "",
        publisher: ref.publisher || "Editora",
        city: ref.city || "Cidade",
        year: ref.year || "2024",
        formattedABNT:
          ref.formattedABNT ||
          `${ref.authors}. ${ref.title}. ${ref.city}: ${ref.publisher}, ${ref.year}.`,
        citationKey: ref.citationKey || `${ref.authors?.split(",")[0]}, ${ref.year}`,
      })),
      appendices: [],
      annexes: [],
      settings: {
        fontFamily: "Times New Roman",
        fontSize: 12,
        lineSpacing: 1.5,
        margins: { top: 3, left: 3, right: 2, bottom: 2 },
        includeCover: true,
        includeTitlePage: true,
        includeApprovalSheet: true,
        includeDedication: false,
        includeAcknowledgments: false,
        includeEpigraph: false,
        includeResumo: true,
        includeAbstract: true,
        includeListOfFigures: true,
        includeListOfTables: true,
        includeListOfAcronyms: true,
        includeTableOfContents: true,
        showGridGuide: false,
      },
      groundingSources: rawCallResult.groundingSources || [],
      lastModified: new Date().toISOString(),
    };

    return res.json({ project: fullProject });
  } catch (error: any) {
    console.error("Erro na geração completa de TCC:", error);
    const errInfo = parseGeminiErrorMessage(error);
    return res.status(errInfo.statusCode).json({
      error: errInfo.userFriendlyMessage,
    });
  }
});

// Expand Section with Deep Academic Content Endpoint
app.post("/api/gemini/expand-section", async (req, res) => {
  try {
    const { sectionTitle, currentContent, projectContext, specificInstruction } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.status(503).json({
        error: "Serviço de IA indisponível. Verifique a chave GEMINI_API_KEY no menu de configurações.",
      });
    }

    const systemInstruction = `Você é um professor e pesquisador doutor em metodologia científica.
Sua função é expandir e aprofundar uma seção de TCC, tornando-a densa, rica em fundamentação, com parágrafos bem articulados (coerência e coesão textual), obedecendo rigorosamente à norma culta da língua portuguesa e o padrão impessoal da ABNT.
Insira citações no formato ABNT NBR 10520 (ex: Segundo Sobrenome (Ano, p. xx) ou (SOBRENOME, Ano)).
NUNCA use notas coloquiais ou tópicos rasos: escreva parágrafos contínuos de alto nível acadêmico prontos para integrar o TCC.`;

    const userPrompt = `Contexto geral do TCC:\n${projectContext || "Trabalho acadêmico de conclusão de curso"}\n\nTítulo da Seção: ${sectionTitle}\n\nConteúdo atual:\n"${currentContent || "Seção inicial em desenvolvimento."}"\n\nInstrução específica de expansão:\n${specificInstruction || "Aprofunde com fundamentação teórica, argumentos metodológicos detalhados e dados pertinentes."}\n\nRetorne o texto expandido completo pronto para publicação.`;

    const text = await callGeminiWithRetryAndFallback(ai, {
      contents: userPrompt,
      systemInstruction,
      temperature: 0.4,
    });

    return res.json({ expandedContent: text || "" });
  } catch (error: any) {
    console.error("Erro ao expandir seção:", error);
    const errInfo = parseGeminiErrorMessage(error);
    return res.status(errInfo.statusCode).json({
      error: errInfo.userFriendlyMessage,
    });
  }
});

// ABNT Real-Time Audit & Compliance Inspector Endpoint
app.post("/api/gemini/audit-abnt", async (req, res) => {
  try {
    const { project } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.status(503).json({
        error: "Serviço de IA indisponível. Verifique a chave GEMINI_API_KEY no menu de configurações.",
      });
    }

    const projectSummary = `
Título: ${project.title}
Tipo: ${project.documentType}
Resumo: ${project.resumo?.text?.slice(0, 300)}... (Palavras-chave: ${project.resumo?.keywords?.join(", ")})
Total de seções: ${project.sections?.length || 0}
Seções cadastradas: ${project.sections?.map((s: any) => `${s.number} ${s.title} (${s.content?.length || 0} chars)`).join("; ")}
Total de referências NBR 6023: ${project.references?.length || 0}
Referências: ${project.references?.map((r: any) => r.formattedABNT).join(" | ")}
Margens: Superior ${project.settings?.margins?.top}cm, Esquerda ${project.settings?.margins?.left}cm, Direita ${project.settings?.margins?.right}cm, Inferior ${project.settings?.margins?.bottom}cm
`;

    const systemInstruction = `Você é um auditor sênior de bancas acadêmicas e comitês de normas da ABNT.
Você audita documentos acadêmicos avaliando conformidade estrita com:
- NBR 14724 (Estrutura e elementos de trabalhos acadêmicos)
- NBR 6023 (Elaboração de referências)
- NBR 10520 (Citações em documentos)
- NBR 6028 (Resumos e palavras-chave)

Analise os dados do projeto e retorne um JSON estrito no seguinte formato:
{
  "score": 85, // número de 0 a 100
  "summary": "Diagnóstico geral sobre o nível de conformidade do TCC.",
  "passedChecksCount": 7,
  "totalChecksCount": 10,
  "checklist": [
    {"name": "Margens ABNT (3/3/2/2 cm)", "status": "pass", "details": "Margens em conformidade estrita com a NBR 14724."},
    {"name": "Resumo NBR 6028", "status": "pass", "details": "Resumo estruturado com palavras-chave."},
    {"name": "Equilíbrio de Citações", "status": "warning", "details": "Adicionar mais citações diretas curtas ou indiretas."},
    {"name": "Consistência de Referências NBR 6023", "status": "pass", "details": "Referências com autoria em caixa alta e título destacado."}
  ],
  "issues": [
    {
      "id": "iss-1",
      "category": "citacoes | formatacao | linguagem | estrutura | referencias",
      "severity": "alta | media | baixa",
      "title": "Título do apontamento",
      "description": "Explicação do problema encontrado segundo a norma.",
      "norma": "NBR 14724 | NBR 6023 | NBR 10520 | NBR 6028",
      "location": "Seção 2 / Introdução / Geral",
      "suggestedFix": "Ação recomendada para sanar o problema."
    }
  ]
}
Retorne APENAS o JSON válido.`;

    const rawResponse = await callGeminiWithRetryAndFallback(ai, {
      contents: `Audite este projeto de TCC:\n${projectSummary}`,
      systemInstruction,
      temperature: 0.2,
      responseMimeType: "application/json",
    });

    const parsed = cleanAndParseJSON(rawResponse || "{}");
    return res.json({ audit: parsed });
  } catch (error: any) {
    console.error("Erro na auditoria ABNT:", error);
    const errInfo = parseGeminiErrorMessage(error);
    return res.status(errInfo.statusCode).json({
      error: errInfo.userFriendlyMessage,
    });
  }
});

// Smart Citation Finder & Converter
app.post("/api/gemini/smart-citation", async (req, res) => {
  try {
    const { query } = req.body;
    const ai = getAIClient();

    if (!ai) {
      return res.status(503).json({ error: "Serviço de IA indisponível. Verifique a chave GEMINI_API_KEY no menu de configurações." });
    }

    const systemInstruction = `Você é um bibliotecário e catalogador sênior especialista na ABNT NBR 6023:2018 e NBR 10520:2023.
Receba um título de livro, artigo, autor, DOI ou descrição livre e gere um objeto JSON rigorosamente formatado:
{
  "type": "livro | artigo | site | tese | congresso",
  "authors": "SOBRENOME, Nome; OUTRO, Autor",
  "title": "Título da obra em negrito no padrão ABNT",
  "subtitle": "subtítulo sem destaque",
  "publisher": "Nome da Editora",
  "city": "Cidade de Publicação",
  "year": "2023",
  "journal": "Nome do periódico (se for artigo)",
  "volume": "v. 12",
  "number": "n. 2",
  "pages": "p. 45-60",
  "formattedABNT": "SOBRENOME, Nome. Título da obra: subtítulo. Cidade: Editora, 2023.",
  "citationKey": "SOBRENOME, 2023",
  "inTextParenthetical": "(SOBRENOME, 2023)",
  "inTextNarrative": "Segundo Sobrenome (2023)",
  "notes": "Dicas de citação segundo NBR 10520"
}
Retorne APENAS o JSON válido.`;

    const rawResponse = await callGeminiWithRetryAndFallback(ai, {
      contents: `Fonte bibliográfica pesquisada:\n"${query}"`,
      systemInstruction,
      temperature: 0.2,
      responseMimeType: "application/json",
    });

    const parsed = cleanAndParseJSON(rawResponse || "{}");
    return res.json({ reference: parsed });
  } catch (error: any) {
    console.error("Erro ao gerar citação inteligente:", error);
    const errInfo = parseGeminiErrorMessage(error);
    return res.status(errInfo.statusCode).json({
      error: errInfo.userFriendlyMessage,
    });
  }
});

// AI Multimodal Figure Analysis & Academic Contextualization
app.post("/api/gemini/analyze-figure", async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Serviço de IA indisponível. Verifique a chave GEMINI_API_KEY no menu de configurações.",
      });
    }

    const {
      imageData,
      mimeType,
      tccContext,
      userDescription,
      figureNumber,
      targetSectionTitle,
    } = req.body;

    if (!imageData) {
      return res.status(400).json({ error: "A imagem é obrigatória para análise." });
    }

    let detectedMime = mimeType || "image/jpeg";
    let base64String = imageData;

    const dataUrlMatch = imageData.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (dataUrlMatch) {
      detectedMime = dataUrlMatch[1];
      base64String = dataUrlMatch[2];
    }

    const figNum = figureNumber || 1;

    const systemInstruction = `Você é um docente orientador de TCC e pesquisador acadêmico sênior especialista nas normas ABNT NBR 14724:2011 (Trabalhos Acadêmicos) e NBR 6023:2018.
Sua tarefa é analisar uma imagem/figura enviada pelo estudante para inclusão no TCC e:
1. Compreender detalhadamente o conteúdo visual (esquema, fluxograma, fotografia experimental, protótipo, gráfico, diagrama de blocos, circuito elétrico, interface de software, mapa, etc.).
2. Avaliar criticamente como essa figura se relaciona com o tema, proposta e objetivos do TCC.
3. Se o estudante tiver fornecido observações, dados ou medições (ex: "adicione que a temperatura foi 45 graus"), incorporar essas informações fielmente.
4. Produzir:
   - "suggestedTitle": Título formal, preciso e acadêmico para a legenda da figura conforme ABNT. NÃO inclua o prefixo "Figura X", forneça apenas o texto descritivo em si (ex: "Diagrama de blocos da arquitetura de comunicação IoT").
   - "suggestedSource": Fonte em conformidade com ABNT (ex: "Fonte: Elaborado pelo autor (2025)." ou "Fonte: Dados experimentais da pesquisa (2025).").
   - "detailedDescription": Descrição técnica precisa dos elementos, etapas ou medições contidos na imagem.
   - "tccRelevance": Explicação analítica de como a ilustração corrobora a fundamentação, metodologia ou resultados do TCC.
   - "contextualParagraph": Parágrafo(s) acadêmico(s) completo(s) (em voz impessoal, norma culta da ABNT), pronto(s) para ser inserido(s) no corpo do texto do TCC, referenciando a figura explicitamente (ex: "Conforme ilustrado na Figura ${figNum}, ...") e detalhando seu significado conceitual e metodológico.
   - "suggestedSection": A seção mais apropriada do TCC para a inserção desta figura (ex: "Metodologia", "Resultados e Discussão", "Referencial Teórico").

Retorne APENAS um objeto JSON válido no formato:
{
  "suggestedTitle": "...",
  "suggestedSource": "...",
  "detailedDescription": "...",
  "tccRelevance": "...",
  "contextualParagraph": "...",
  "suggestedSection": "..."
}`;

    const promptText = `Contexto geral do TCC:
${tccContext || "Trabalho acadêmico de conclusão de curso"}

Número da Figura no documento: Figura ${figNum}
${targetSectionTitle ? `Seção Alvo Pretendida: ${targetSectionTitle}` : ""}
${userDescription ? `Informações e observações adicionais fornecidas pelo estudante:\n"${userDescription}"` : ""}

Por favor, analise a imagem em anexo, identifique seus elementos, sua conexão com o TCC e elabore o título, fonte e parágrafo de contextualização ABNT.`;

    const contents = {
      parts: [
        {
          inlineData: {
            mimeType: detectedMime,
            data: base64String,
          },
        },
        {
          text: promptText,
        },
      ],
    };

    const rawResponse = await callGeminiWithRetryAndFallback(ai, {
      contents,
      systemInstruction,
      temperature: 0.3,
      responseMimeType: "application/json",
    });

    const parsed = cleanAndParseJSON(rawResponse || "{}");
    return res.json({ analysis: parsed });
  } catch (error: any) {
    console.error("Erro na análise visual da figura:", error);
    const errInfo = parseGeminiErrorMessage(error);
    return res.status(errInfo.statusCode).json({
      error: errInfo.userFriendlyMessage,
    });
  }
});

// AI Integrate User Information into Section Text
app.post("/api/gemini/integrate-user-info", async (req, res) => {
  try {
    const ai = getAIClient();
    if (!ai) {
      return res.status(503).json({
        error: "Serviço de IA indisponível. Verifique a chave GEMINI_API_KEY no menu de configurações.",
      });
    }

    const {
      currentContent,
      sectionTitle,
      tccContext,
      userProvidedInfo,
      figureReference,
    } = req.body;

    if (!userProvidedInfo) {
      return res.status(400).json({ error: "Nenhuma informação fornecida pelo usuário." });
    }

    const systemInstruction = `Você é um redator acadêmico e orientador sênior especialista em redação científica pela ABNT.
O estudante deseja integrar novas informações, observações empíricas ou dados recentes dentro de uma seção de seu TCC.
Diretrizes:
1. Integre organicamente as novas informações fornecidas ao texto atual da seção.
2. Se houver menção a ilustrações ou referências de figuras, conecte o texto de forma coerente (ex: "conforme observado na ${figureReference || 'Figura correspondente'}...").
3. Mantenha rigorosa conformidade com o tom científico formal da ABNT: impessoalidade (terceira pessoa), clareza conceitual e vocabulário técnico preciso.
4. Preserve todo o conteúdo útil que já existia na seção, enriquecendo-o e aprofundando-o sem truncamento.
Retorne APENAS um JSON:
{
  "updatedContent": "Texto completo e enriquecido da seção",
  "changeSummary": "Resumo de 1 a 2 frases do que foi adicionado e integrado"
}`;

    const userPrompt = `Contexto do TCC:\n${tccContext || "Trabalho acadêmico"}\n\nTítulo da Seção: ${sectionTitle}\n\nConteúdo Atual da Seção:\n"${currentContent || "Seção em desenvolvimento."}"\n\nNovas informações / dados fornecidos pelo usuário para integrar:\n"${userProvidedInfo}"\n${figureReference ? `Referência da figura associada: ${figureReference}` : ''}\n\nRetorne o texto enriquecido completo da seção.`;

    const rawResponse = await callGeminiWithRetryAndFallback(ai, {
      contents: userPrompt,
      systemInstruction,
      temperature: 0.35,
      responseMimeType: "application/json",
    });

    const parsed = cleanAndParseJSON(rawResponse || "{}");
    return res.json({ result: parsed });
  } catch (error: any) {
    console.error("Erro ao integrar informações do usuário:", error);
    const errInfo = parseGeminiErrorMessage(error);
    return res.status(errInfo.statusCode).json({
      error: errInfo.userFriendlyMessage,
    });
  }
});

// Direct DOCX Export Endpoint via 'docx' package
app.post("/api/export/docx", async (req, res) => {
  try {
    const { project } = req.body;
    if (!project) {
      return res.status(400).json({ error: "Objeto 'project' é obrigatório." });
    }

    const doc = createDocxDocument(project);
    const buffer = await Packer.toBuffer(doc);

    const safeTitle = (project.title || "tcc")
      .slice(0, 35)
      .replace(/[^a-zA-Z0-9]/g, "_");

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${safeTitle}_ABNT.docx"`
    );
    return res.send(buffer);
  } catch (error: any) {
    console.error("Erro ao gerar .docx no backend:", error);
    return res.status(500).json({
      error: error.message || "Erro ao gerar arquivo Word (.docx).",
    });
  }
});

// Setup Vite development server or static file serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`DocuTCC Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
