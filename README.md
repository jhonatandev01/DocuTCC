# 🎓 DocuTCC – Plataforma Científica de Documentação Acadêmica ABNT

<div align="center">

![DocuTCC Logo](/public/icon.svg)

**A plataforma completa para elaboração, estruturação e formatação automática de Trabalhos de Conclusão de Curso (TCC), monografias, dissertações e artigos científicos segundo as normas vigentes da ABNT.**

[![React](https://img.shields.io/badge/React-19-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178c6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PWA Ready](https://img.shields.io/badge/PWA-Ready-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)](https://web.dev/progressive-web-apps/)
[![ABNT Standards](https://img.shields.io/badge/ABNT-NBR_14724_|_6023_|_10520-amber?style=for-the-badge)](https://www.abnt.org.br/)
[![Gemini AI](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 📑 Sumário

- [Visão Geral](#-visão-geral)
- [Normas ABNT Atendidas](#-normas-abnt-atendidas)
- [Principais Funcionalidades](#-principais-funcionalidades)
  - [1. Capa & Folha de Rosto (NBR 14724)](#1-capa--folha-de-rosto-nbr-14724)
  - [2. Editor de Capítulos & Seções](#2-editor-de-capítulos--seções)
  - [3. Gestão Bibliográfica & Citações (NBR 6023 / NBR 10520)](#3-gestão-bibliográfica--citações-nbr-6023--nbr-10520)
  - [4. Figuras, Tabelas & IA Multimodal (Gemini Vision)](#4-figuras-tabelas--ia-multimodal-gemini-vision)
  - [5. Visualização Fiel em Papel A4 Real](#5-visualização-fiel-em-papel-a4-real)
  - [6. Exportação para Word (.docx) e PDF](#6-exportação-para-word-docx-e-pdf)
  - [7. Gerador Autônomo com Inteligência Artificial](#7-gerador-autônomo-com-inteligência-artificial)
  - [8. Auditoria de Conformidade ABNT](#8-auditoria-de-conformidade-abnt)
  - [9. Scripts & Automação CLI](#9-scripts--automação-cli)
  - [10. Chat com Assistente Acadêmico IA](#10-chat-com-assistente-acadêmico-ia)
  - [11. Tutorial Interativo Integrado](#11-tutorial-interativo-integrado)
  - [12. Progressive Web App (PWA) & Modo Mobile](#12-progressive-web-app-pwa--modo-mobile)
- [Stack Tecnológica](#-stack-tecnológica)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Como Executar Localmente](#-como-executar-localmente)
  - [Pré-requisitos](#pré-requisitos)
  - [Passo a Passo](#passo-a-passo)
- [Variáveis de Ambiente](#-variáveis-de-ambiente)
- [Instalação como Aplicativo (PWA)](#-instalação-como-aplicativo-pwa)
- [Persistência de Dados & Segurança](#-persistência-de-dados--segurança)
- [Contribuindo](#-contribuindo)
- [Licença](#-licença)

---

## 🌟 Visão Geral

O **DocuTCC** foi concebido para resolver definitivamente um dos maiores gargalos de estudantes, orientadores e pesquisadores brasileiros: **a complexidade e o tempo gasto na formatação manual de trabalhos acadêmicos segundo as normas da Associação Brasileira de Normas Técnicas (ABNT)**.

Em vez de ajustar manualmente réguas, parágrafos, margens, notas de rodapé e caixas de texto no Word, o DocuTCC atua como um sistema estruturado onde o autor se concentra estritamente na produção científica. Toda a formatação, paginação, recuos, geração de listas, sumários e exportações para `.docx` e `.pdf` são calculadas dinamicamente com fidelidade milimétrica.

---

## 📐 Normas ABNT Atendidas

O sistema segue rigorosamente as publicações e revisões oficiais:

| Norma ABNT | Descrição / Aplicação no DocuTCC |
| :--- | :--- |
| **NBR 14724:2011** | **Trabalhos Acadêmicos:** Estrutura completa de elementos pré-textuais (Capa, Folha de Rosto, Resumo, Abstract, Listas, Sumário), textuais e pós-textuais. |
| **NBR 6023:2018** | **Referências:** Formatação de livros, artigos de periódicos, teses, dissertações, legislação e websites. Ordem alfabética estrita, título em negrito e alinhamento à esquerda. |
| **NBR 10520:2023** | **Citações:** Sistema autor-data com formato indireto `Segundo Silva (2024)` e direto `(SILVA, 2024, p. 45)`. Citações longas com recuo de 4 cm, entrelinhas simples e fonte 10pt. |
| **NBR 6028:2021** | **Resumo:** Formatação em parágrafo único justificado, limite recomendado de palavras e palavras-chave separadas por ponto e vírgula. |
| **NBR 6027:2012** | **Sumário:** Geração automática com alinhamento das seções primárias, secundárias e terciárias e linhas pontilhadas de ligação com paginação. |
| **NBR 6024:2012** | **Numeração Progressiva:** Hierarquia de títulos (1, 1.1, 1.1.1) sem ponto final após o último dígito e diferenciação tipográfica. |
| **Regras Gerais** | **Margens ABNT:** Superior 3 cm, Esquerda 3 cm, Inferior 2 cm, Direita 2 cm; fonte Arial ou Times New Roman (12pt no corpo, 10pt para notas/citações longas/fontes de ilustrações), espaçamento 1,5 e recuo de primeira linha de 1,25 cm. |

---

## 🚀 Principais Funcionalidades

### 1. Capa & Folha de Rosto (NBR 14724)
- Identificação completa da instituição, instituto/faculdade, curso, cidade e ano.
- Título principal em caixa alta e negrito, com subtítulo em caixa baixa.
- Caixa de natureza do trabalho (recuo de 8 cm do centro à margem direita com fonte menor e espaçamento simples).
- Gestão de orientador, coorientador e múltiplos autores.

### 2. Editor de Capítulos & Seções
- Numeração automática e hierarquia multinível (seção primária, secundária e terciária).
- Botões de inserção rápida para citações longas (recuo de 4 cm), fórmulas, equações e tabelas.
- Aprimoramento de escrita com IA: transforma anotações informais em linguagem científica formal e impessoal.
- Incorporador de informações via IA: adiciona notas de campo ou dados coletados direto no capítulo selecionado.

### 3. Gestão Bibliográfica & Citações (NBR 6023 / NBR 10520)
- Cadastro de fontes com campos guiados: livros, artigos de revistas, sites com URL/data de acesso, teses e conferências.
- Gerador automático da referência completa e dos blocos de citação direta e indireta.
- Botão *"Copiar Citação"* em 1 clique para colar no texto.
- Ordenação alfabética automática em conformidade com as regras de catalogação.

### 4. Figuras, Tabelas & IA Multimodal (Gemini Vision)
- Gestão completa de ilustrações e quadros com a estrutura oficial: **Topo** (Identificação e Título) + **Centro** (Imagem) + **Base** (Fonte consultada e notas).
- Suporte a upload múltiplo de imagens simultaneamente com preview imediato.
- **Análise com Gemini Vision**: a IA examina o gráfico ou fotografia, identifica o conteúdo acadêmico, gera o título padronizado, a fonte recomendada e um parágrafo científico para contextualizar a ilustração no corpo do texto.
- Geração automática da Lista de Ilustrações e Lista de Tabelas.

### 5. Visualização Fiel em Papel A4 Real
- Renderização visual das folhas de papel A4 (210 mm × 297 mm) em escala real com réguas milimétricas (3-3-2-2 cm).
- Paginação científica: numeração no canto superior direito a 2 cm da borda, iniciando a contagem na folha de rosto e exibindo o número apenas a partir da primeira folha textual (Introdução).
- Controles de zoom (50% a 130%) e botão inteligente *"Ajustar à Tela"*.

### 6. Exportação para Word (.docx) e PDF
- **Microsoft Word (.docx) Nativo**: gera um documento `.docx` real com estilos ABNT configurados (títulos, margens, espaçamentos, tabelas de referências e quebras de página por seção).
- **PDF de Alta Resolução**: impressão limpa sem elementos da interface com CSS `@media print` otimizado e download direto via canvas/PDF.

### 7. Gerador Autônomo com Inteligência Artificial
- Criação do rascunho inicial do TCC a partir do tema, curso, objetivo geral e metodologia.
- Gera capa, resumo, abstract com tradução técnica, introdução, capítulos de fundamentação com referências e considerações finais.

### 8. Auditoria de Conformidade ABNT
- Scanner em tempo real que verifica dados pendentes na capa, seções vazias, ilustrações sem indicação de fonte e referências não citadas.
- Pontuação de conformidade (0% a 100%) e botões de resolução em um clique.

### 9. Scripts & Automação CLI
- Central de comandos rápidos para pesquisadores: contagem de palavras por capítulo, estimativa precisa de páginas ABNT, exportação e importação de backups completos em JSON.

### 10. Chat com Assistente Acadêmico IA
- Orientador virtual disponível 24 horas para tirar dúvidas sobre metodologia científica, sugerir tópicos de revisão bibliográfica e reescrever trechos com impessoalidade acadêmica.

### 11. Tutorial Interativo Integrado
- Tour guiado em 10 passos cobrindo todas as áreas do sistema, com navegação por teclado, barra de progresso e botão *"Experimentar Aba"* para testar imediatamente.
- Abertura não intrusiva com banner discreto no primeiro acesso e botão permanente no topo.

### 12. Progressive Web App (PWA) & Modo Mobile
- Funciona perfeitamente em celulares, tablets e computadores.
- Instalável como app nativo com ícone na tela inicial, abertura em tela cheia (*standalone*) e cache de assets.
- Barra de navegação inferior tátil (48px) no celular e redimensionamento automático das folhas A4.

---

## 🛠 Stack Tecnológica

- **Frontend:** [React 19](https://react.dev/), [TypeScript 5.8](https://www.typescriptlang.org/), [Tailwind CSS 4](https://tailwindcss.com/)
- **Build & Bundler:** [Vite 6](https://vitejs.dev/), [esbuild](https://esbuild.github.io/)
- **Backend / API Proxy:** [Express 4](https://expressjs.com/), [tsx](https://github.com/privatenumber/tsx)
- **Inteligência Artificial:** [@google/genai](https://github.com/google/generative-ai-js) (Modelos Gemini 2.5 Flash com suporte multimodal Vision)
- **Geração de Documentos:** [docx](https://docx.js.org/) (manipulação nativa OpenXML), [html2canvas](https://html2canvas.hertzen.com/), [jspdf](https://github.com/parallax/jsPDF)
- **Animações & Ícones:** [motion](https://motion.dev/), [lucide-react](https://lucide.dev/)
- **PWA & Offline:** [vite-plugin-pwa](https://vite-pwa-org.netlify.app/), Service Workers, Web App Manifest

---

## 📁 Estrutura do Projeto

```text
docutcc/
├── public/                     # Assets estáticos e manifest PWA
│   ├── icon.svg                # Ícone vetorial oficial DocuTCC
│   ├── icon-192.png            # Ícone PWA para telas médias
│   ├── icon-512.png            # Ícone PWA de alta definição
│   └── manifest.webmanifest    # Configuração PWA (standalone, cores, atalhos)
├── src/
│   ├── components/             # Componentes modulares da interface
│   │   ├── ABNTAuditor.tsx             # Auditor de conformidade e regras ABNT
│   │   ├── ABNTDocumentPreview.tsx     # Visualizador de páginas A4 em tempo real
│   │   ├── AIAcademicAssistant.tsx     # Chat interativo com IA especialista
│   │   ├── AutonomousTCCGenerator.tsx  # Gerador autônomo de estrutura de TCC
│   │   ├── CitationsManager.tsx        # Gerenciador bibliográfico NBR 6023/10520
│   │   ├── CrossReferenceManager.tsx   # Figuras, tabelas e IA Vision
│   │   ├── Header.tsx                  # Cabeçalho, estatísticas e menu mobile
│   │   ├── InteractiveTutorial.tsx     # Tour guiado interativo de 10 passos
│   │   ├── ProjectMetadataEditor.tsx   # Capa, folha de rosto e dados institucionais
│   │   ├── PWAInstallButton.tsx        # Botão de instalação nativa (PWA)
│   │   ├── ScriptsAutomationCenter.tsx # Automações, contadores e CLI
│   │   └── SectionEditor.tsx           # Editor científico dos capítulos
│   ├── data/
│   │   └── sampleProjects.ts   # Modelos acadêmicos prontos (Monografia, Artigo, Técnico)
│   ├── utils/
│   │   ├── abntFormatter.ts    # Lógica de formatação, NBRs e estatísticas
│   │   ├── exportDocx.ts       # Conversor para arquivo Word (.docx) nativo
│   │   └── storage.ts          # Persistência local em IndexedDB e localStorage
│   ├── types.ts                # Definições de tipos TypeScript do projeto
│   ├── App.tsx                 # Componente raiz da aplicação
│   ├── main.tsx                # Ponto de entrada do cliente React
│   └── index.css               # Folha de estilo global com Tailwind CSS
├── server.ts                   # Servidor Express com proxy de API para Gemini
├── package.json                # Dependências e scripts do projeto
├── tsconfig.json               # Configuração do TypeScript
├── vite.config.ts              # Configuração do Vite e plugin PWA
└── README.md                   # Documentação oficial do projeto
```

---

## 💻 Como Executar Localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) versão 18 ou superior.
- [npm](https://www.npmjs.com/) ou [pnpm](https://pnpm.io/) / [yarn](https://yarnpkg.com/).
- Uma chave de API do **Google Gemini** (gratuita no [Google AI Studio](https://aistudio.google.com/)).

### Passo a Passo

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/seu-usuario/docutcc.git
   cd docutcc
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto baseado no `.env.example`:
   ```bash
   cp .env.example .env
   ```
   Abra o arquivo `.env` e insira sua chave da API do Gemini:
   ```env
   GEMINI_API_KEY="sua_chave_do_gemini_aqui"
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

5. **Acesse no navegador:**
   Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

---

## 🔐 Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | Sim* | Chave de API para recursos inteligentes (Gemini Vision, gerador de TCC e chat acadêmico). As demais funções de edição, formatação e exportação funcionam normalmente sem ela. |
| `APP_URL` | Não | URL base da aplicação em ambiente de produção (injetada automaticamente em deploys Cloud Run). |

---

## 📦 Scripts Disponíveis

No arquivo `package.json`:

- `npm run dev`: Inicia o servidor backend Express com Vite integrado via `tsx` na porta 3000.
- `npm run build`: Compila os assets do frontend com Vite e empacota o servidor Node.js com `esbuild` em `dist/server.cjs`.
- `npm run start`: Inicia a aplicação compilada em modo de produção.
- `npm run lint`: Executa a verificação estática de tipos TypeScript com `tsc --noEmit`.
- `npm run clean`: Remove os diretórios temporários de compilação (`dist/`).

---

## 📱 Instalação como Aplicativo (PWA)

O DocuTCC é uma **Progressive Web App (PWA)** completa e pode ser instalado sem passar pelas lojas de aplicativos:

### No Computador (Chrome / Edge / Brave):
1. Acesse o DocuTCC no navegador.
2. Clique no botão **"Instalar Web App"** no topo da página ou no ícone de instalação na barra de endereços.
3. O DocuTCC será aberto como um programa independente, com janela própria e atalho na sua área de trabalho.

### No Celular Android:
1. Acesse a aplicação pelo Chrome.
2. Toque no botão **"Instalar Web App"** ou no menu do navegador (três pontinhos) e selecione **"Instalar aplicativo"** ou **"Adicionar à tela inicial"**.

### No iPhone / iPad (iOS Safari):
1. Abra a aplicação no **Safari**.
2. Toque no botão de **Compartilhar** (ícone do quadrado com a seta para cima).
3. Role para baixo e selecione **"Adicionar à Tela de Início"**.

---

## 💾 Persistência de Dados & Segurança

- **Privacidade Total:** Os dados do seu TCC ficam salvos **localmente no seu próprio navegador** via IndexedDB de alta capacidade e `localStorage`.
- **Nenhum texto é gravado em servidores de terceiros:** apenas as solicitações diretas à IA passam pela API oficial do Gemini com credenciais criptografadas.
- **Backup Seguro:** Você pode exportar todo o seu trabalho a qualquer instante clicando em **"Exportar Backup (.json)"** e restaurá-lo em qualquer outro computador ou celular.

---

## 🤝 Contribuindo

Contribuições da comunidade acadêmica e de desenvolvedores são muito bem-vindas!

1. Faça um Fork do projeto (`git clone https://github.com/seu-usuario/docutcc.git`).
2. Crie uma branch para a sua feature (`git checkout -b feature/MinhaNovaFeature`).
3. Faça o commit das suas alterações (`git commit -m 'feat: Adiciona suporte a norma X'`).
4. Envie para a branch (`git push origin feature/MinhaNovaFeature`).
5. Abra um **Pull Request**.

---

## 📄 Licença

Este projeto está sob a licença **MIT** - consulte o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">
Desenvolvido com foco no rigor metodológico e na excelência da pesquisa acadêmica brasileira.
</div>
