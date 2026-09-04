import { TCCProject } from '../types';

export const sampleProjects: TCCProject[] = [
  {
    id: 'tcc-ia-diagnostico',
    title: 'APLICAÇÃO DE INTELIGÊNCIA ARTIFICIAL E REDES NEURAIS CONVOLUCIONAIS NO AUXÍLIO AO DIAGNÓSTICO PRECOCE',
    subtitle: 'Um estudo metodológico aplicado ao rastreamento automatizado em exames de imagem',
    documentType: 'monografia',
    academicDegree: 'bacharelado',
    institution: {
      name: 'UNIVERSIDADE FEDERAL DE TECNOLOGIA E CIÊNCIAS',
      facultyOrInstitute: 'FACULDADE DE ENGENHARIA E COMPUTAÇÃO',
      department: 'DEPARTAMENTO DE INFORMÁTICA E SAÚDE DIGITAL',
      course: 'BACHARELADO EM CIÊNCIA DA COMPUTAÇÃO',
      campus: 'CAMPUS UNIVERSITÁRIO CENTRAL',
    },
    authors: [
      {
        id: 'auth-1',
        name: 'GABRIEL ALBUQUERQUE SANTOS',
        email: 'gabriel.albuquerque@uftc.edu.br',
        lattes: 'http://lattes.cnpq.br/1234567890123456',
        courseOrDepartment: 'Ciência da Computação',
      },
    ],
    advisor: {
      name: 'Prof. Dr. Marcos Vinícius Ferreira',
      title: 'Doutor em Engenharia Biomédica',
      institution: 'UFTC',
    },
    coAdvisor: {
      name: 'Profª. Ma. Renata Toledo Silveira',
      title: 'Mestra em Ciências da Saúde',
      institution: 'Hospital Universitário',
    },
    city: 'SÃO PAULO',
    stateOrCountry: 'SP',
    year: '2025',
    submissionDate: '15 de novembro de 2025',
    natureOfWork: 'Trabalho de Conclusão de Curso apresentado ao Colegiado do Curso de Bacharelado em Ciência da Computação da Universidade Federal de Tecnologia e Ciências, como requisito parcial para a obtenção do grau de Bacharel em Ciência da Computação.\n\nÁrea de Concentração: Inteligência Artificial Aplicada à Saúde.',
    examinationBoard: [
      {
        id: 'b-1',
        name: 'Prof. Dr. Marcos Vinícius Ferreira',
        title: 'Doutor em Engenharia Biomédica (UFTC)',
        role: 'Presidente',
        institution: 'Universidade Federal de Tecnologia e Ciências',
      },
      {
        id: 'b-2',
        name: 'Prof. Dr. Eduardo Henrique Nogueira',
        title: 'Doutor em Inteligência Artificial (USP)',
        role: 'Examinador Externo',
        institution: 'Universidade de São Paulo',
      },
      {
        id: 'b-3',
        name: 'Profª. Dra. Beatriz Menezes Lins',
        title: 'Doutora em Ciência da Computação (UNICAMP)',
        role: 'Examinador Interno',
        institution: 'Universidade Federal de Tecnologia e Ciências',
      },
    ],
    dedication: 'Dedico este trabalho aos meus pais e familiares, cujo apoio incondicional, sacrifício e incentivo foram a base indispensável para a superação de cada desafio ao longo de toda a jornada acadêmica.',
    acknowledgments: 'Agradeço primeiramente à minha família, pelo esteio emocional permanente.\n\nAo meu orientador, Prof. Dr. Marcos Vinícius Ferreira, pela generosidade intelectual, rigor metodológico e incentivo contínuo que tornaram possível esta investigação.\n\nÀ comunidade de docentes do Departamento de Informática e Saúde Digital, pelos ensinamentos compartilhados.\n\nAos colegas de turma, pela camaradagem fraterna nos momentos de vigília laboratorial.\n\nÀ Universidade Federal de Tecnologia e Ciências, pela infraestrutura laboratorial e de pesquisa concedida.',
    epigraph: {
      quote: 'A ciência não é apenas compatível com a espiritualidade; é uma fonte profunda de espiritualidade.',
      author: 'Carl Sagan',
      year: '1995',
      source: 'O Mundo Assombrado pelos Demônios',
    },
    resumo: {
      text: 'O presente Trabalho de Conclusão de Curso investiga o emprego de arquiteturas de redes neurais convolucionais (CNNs) para o suporte computacional na triagem e diagnóstico precoce de anomalias em exames de radiografia torácica. Com o aumento da demanda nos sistemas públicos e privados de saúde e a consequente sobrecarga dos especialistas, métodos automatizados baseados em aprendizado profundo (Deep Learning) constituem uma alternativa promissora para mitigação de filas diagnósticas e elevação da precisão preventiva. A metodologia adotada fundamentou-se em uma pesquisa aplicada e quantitativa, utilizando uma base de dados pública rotulada contendo mais de 10.000 imagens clínicas, com pré-processamento por equalização adaptativa de histograma (CLAHE) e data augmentation. Foram comparadas as arquiteturas ResNet-50, DenseNet-121 e EfficientNet-B4. Os resultados experimentais indicaram que o modelo DenseNet-121 alcançou acurácia de 94,8%, com sensibilidade de 96,2% e área sob a curva ROC (AUC-ROC) de 0,981, superando as demais abordagens em tempo de inferência e capacidade de generalização. Conclui-se que o sistema desenvolvido demonstra viabilidade técnica e conformidade ética para atuar como ferramenta de segunda opinião clínica, reduzindo potenciais falsos-negativos e fortalecendo a eficiência do ecossistema hospitalar.',
      keywords: ['Inteligência artificial', 'Redes neurais convolucionais', 'Diagnóstico médico por imagem', 'Visão computacional', 'Saúde digital'],
    },
    abstract: {
      text: 'This undergraduate monograph investigates the application of convolutional neural network (CNN) architectures for computational support in the screening and early diagnosis of anomalies in chest radiography examinations. Faced with growing demand in public and private health systems and the resulting cognitive overload of clinical specialists, automated methods based on deep learning represent a promising alternative for mitigating diagnostic bottlenecks and increasing preventative precision. The adopted methodology is grounded in applied quantitative research, utilizing a curated public benchmark of over 10,000 labeled clinical images, enhanced through contrast limited adaptive histogram equalization (CLAHE) and data augmentation pipelines. The performance of ResNet-50, DenseNet-121, and EfficientNet-B4 was systematically benchmarked. Experimental outcomes revealed that the DenseNet-121 architecture attained an accuracy of 94.8%, a sensitivity of 96.2%, and an area under the ROC curve (AUC-ROC) of 0.981, surpassing baseline models in both inference latency and generalization resilience. It is concluded that the proposed system exhibits technical viability and ethical compliance to serve as a reliable clinical second-opinion tool, minimizing false negatives and reinforcing hospital productivity.',
      keywords: ['Artificial intelligence', 'Convolutional neural networks', 'Medical diagnostic imaging', 'Computer vision', 'Digital health'],
    },
    acronyms: [
      { id: 'acr-1', acronym: 'ABNT', definition: 'Associação Brasileira de Normas Técnicas' },
      { id: 'acr-2', acronym: 'AUC-ROC', definition: 'Area Under the Receiver Operating Characteristic Curve' },
      { id: 'acr-3', acronym: 'CLAHE', definition: 'Contrast Limited Adaptive Histogram Equalization' },
      { id: 'acr-4', acronym: 'CNN', definition: 'Convolutional Neural Network (Rede Neural Convolucional)' },
      { id: 'acr-5', acronym: 'DL', definition: 'Deep Learning (Aprendizado Profundo)' },
      { id: 'acr-6', acronym: 'IA', definition: 'Inteligência Artificial' },
      { id: 'acr-7', acronym: 'OMS', definition: 'Organização Mundial da Saúde' },
      { id: 'acr-8', acronym: 'SUS', definition: 'Sistema Único de Saúde' },
    ],
    symbols: [
      { id: 'sym-1', symbol: 'α', definition: 'Taxa de aprendizado do otimizador Adam' },
      { id: 'sym-2', symbol: 'θ', definition: 'Vetor de pesos sinápticos dos neurônios artificiais' },
      { id: 'sym-3', symbol: 'L(θ)', definition: 'Função de perda de entropia cruzada binária' },
    ],
    sections: [
      {
        id: 'sec-1',
        number: '1',
        title: 'INTRODUÇÃO',
        level: 1,
        type: 'textual',
        content: `A crescente incorporação de tecnologias computacionais no setor de saúde tem promovido transformações profundas nos protocolos de triagem e no fluxo de trabalho dos corpos clínicos. Especialmente no contexto do diagnóstico por imagem, o volume diário de exames gerados em unidades hospitalares cresce a taxas que desafiam a capacidade de análise imediata por médicos radiologistas, gerando gargalos assistenciais significativos (RUSSELL; NORVIG, 2022).

Nesse panorama, os avanços recentes na subárea de aprendizado profundo (Deep Learning), viabilizados pelo crescimento exponencial do poder de processamento gráfico e pela disponibilidade de extensas bases de dados abertas, descortinam novas perspectivas para a automação confiável de tarefas perceptivas complexas (LECUN; BENGIO; HINTON, 2015).

1.1 DELIMITAÇÃO DO TEMA E PROBLEMA DE PESQUISA

A presente pesquisa circunscreve-se ao domínio da visão computacional aplicada à radiografia torácica, focalizando a identificação de padrões patológicos pulmonares. Em centros médicos de média e alta complexidade, o atraso no laudo radiológico pode acarretar agravamento clínico evitável.

Diante dessa problemática, formula-se a seguinte questão norteadora: De que maneira uma arquitetura de rede neural convolucional otimizada pode auxiliar no rastreamento e classificação automatizada de lesões pulmonares em radiografias digitais, garantindo níveis elevados de sensibilidade diagnóstica compatíveis com os padrões da literatura médica?

1.2 HIPÓTESE DE TRABALHO

Pressupõe-se que a aplicação de modelos convolucionais com conexões densas residuais, associada a técnicas de pré-processamento radiológico com equalização adaptativa, propicia taxas de detecção superiores a 90% de sensibilidade, reduzindo consideravelmente a incidência de falsos-negativos quando comparada a extratores de características convencionais.

1.3 OBJETIVOS

1.3.1 Objetivo Geral

Desenvolver e avaliar um protótipo computacional de inteligência artificial fundamentado em redes neurais convolucionais para o rastreamento automatizado e classificação preliminar de anomalias torácicas em imagens radiológicas.

1.3.2 Objetivos Específicos

a) Efetuar levantamento bibliográfico sistemático acerca dos modelos convolucionais empregados na literatura médica recente;
b) Estruturar um pipeline de pré-processamento de imagens contendo normalização e filtros CLAHE para realce de contrastes teciduais;
c) Implementar e treinar os modelos ResNet-50, DenseNet-121 e EfficientNet-B4 sobre uma base benchmark de radiografias;
d) Validar estatisticamente o desempenho das redes por meio das métricas de acurácia, precisão, sensibilidade, F1-Score e matriz de confusão.

1.4 JUSTIFICATIVA

A relevância teórica deste estudo fundamenta-se na consolidação de parâmetros arquiteturais reprodutíveis para redes neurais em domínios biomédicos. Sob a ótica social e prática, a existência de soluções computacionais confiáveis de segunda opinião possibilita agilidade na triagem de emergência no Sistema Único de Saúde (SUS), favorecendo intervenções precoces e a democratização do acesso a diagnósticos de alta especialidade.`,
      },
      {
        id: 'sec-2',
        number: '2',
        title: 'REFERENCIAL TEÓRICO',
        level: 1,
        type: 'textual',
        content: `A fundamentação teórica desta monografia estrutura-se na articulação entre os princípios de inteligência artificial, as arquiteturas convolucionais de aprendizado profundo e as exigências técnicas da radiologia médica contemporânea.

2.1 FUNDAMENTOS DE APRENDIZADO PROFUNDO E REDES CONVOLUCIONAIS

O paradigma do aprendizado profundo diferencia-se do aprendizado de máquina tradicional pela capacidade de extração automática de representações hierárquicas a partir dos dados brutos, dispensando a engenharia manual de características (LECUN; BENGIO; HINTON, 2015). 

Conforme lecionam Goodfellow, Bengio e Courville (2016, p. 326), as redes neurais convolucionais são simplesmente redes neurais que utilizam a operação matemática de convolução no lugar da multiplicação matricial geral em pelo menos uma de suas camadas funcionais.

> O aprendizado profundo permite que modelos computacionais compostos por múltiplas camadas de processamento aprendam representações de dados com múltiplos níveis de abstração. Esses métodos aprimoraram drasticamente o estado da arte no reconhecimento de fala, no reconhecimento visual de objetos, na detecção de padrões e em muitos outros domínios como a biomedicina. (LECUN; BENGIO; HINTON, 2015, p. 436).

A citação direta longa supramencionada sintetiza a razão primordial pela qual a comunidade científica direcionou seus esforços aos modelos convolucionais profundos no tratamento de sinais biomédicos bidimensionais.

2.2 ARQUITETURA DENSENET E REAPROVEITAMENTO DE RECURSOS

Dentre as topologias investigadas, destaca-se a Densely Connected Convolutional Network (DenseNet), introduzida por Huang et al. (2017). Diferentemente das redes residuais convencionais que realizam a soma de tensores, a DenseNet conecta cada camada a todas as subsequentes por meio de concatenação de mapas de características.

Como se observa na representação estrutural da [ref:fig-1], o fluxo contínuo de gradientes atenua o clássico problema do desaparecimento do gradiente durante o processo de retropropagação (backpropagation), incentivando o reaproveitamento máximo de características em camadas profundas.`,
      },
      {
        id: 'sec-3',
        number: '3',
        title: 'METODOLOGIA',
        level: 1,
        type: 'textual',
        content: `A pesquisa delineia-se sob uma abordagem quantitativa, de natureza aplicada e com objetivo exploratório-explicativo (GIL, 2022). O procedimento experimental foi conduzido em ambiente computacional dedicado, utilizando aceleradores gráficos NVIDIA Tesla V100 e a biblioteca PyTorch.

3.1 BASE DE DADOS E AMOSTRAGEM

Para o treinamento e teste dos classificadores, utilizou-se um corpus consolidado de domínio público contendo 10.840 radiografias de tórax em projeção póstero-anterior (PA). Os exames foram particionados aleatoriamente em conjuntos mutuamente exclusivos: 70% destinados ao treinamento, 15% para validação e hiperparametrização e 15% para o teste cego final.

3.2 PIPELINE DE PROCESSAMENTO E DATA AUGMENTATION

As imagens originais passaram por reescalonamento espacial padronizado para 224 x 224 pixels com 3 canais de cor, seguidas da técnica CLAHE (Contrast Limited Adaptive Histogram Equalization) para otimização da visualização de bordas ósseas e infiltrações parenquimatosas.

A fim de prevenir o sobreajuste (overfitting), aplicou-se data augmentation estocástico com rotações de até 15 graus, espelhamento horizontal e pequenas variações de contraste e brilho (RUSSELL; NORVIG, 2022).

3.3 MÉTRICAS DE AVALIAÇÃO DE DESEMPENHO

A avaliação de eficácia diagnóstica considerou as métricas recomendadas pelas diretrizes de inteligência artificial em medicina: Acurácia Global, Sensibilidade (Recall), Especificidade, Precisão e F1-Score, conforme as formulações clássicas da estatística inferencial.`,
      },
      {
        id: 'sec-4',
        number: '4',
        title: 'RESULTADOS E DISCUSSÃO',
        level: 1,
        type: 'textual',
        content: `Neste capítulo apresentam-se os dados consolidados obtidos a partir dos experimentos de inferência realizados sobre a partição de teste.

4.1 COMPARAÇÃO DE DESEMPENHO ENTRE ARQUITETURAS

Os três modelos avaliados apresentaram convergência satisfatória em até 40 épocas de treinamento com o otimizador Adam. Os resultados comparativos detalhados encontram-se sintetizados na [ref:tab-1].

Como evidenciado na [ref:tab-1], a DenseNet-121 obteve o melhor equilíbrio geral, registrando 94,8% de acurácia global e 96,2% de sensibilidade clínica. Tal comportamento confirma a hipótese H1 levantada na Introdução, indicando que a concatenação direta de mapas de atributos favorece a retenção de sutis opacidades pulmonares características de patologias em estágio embrionário.

4.2 ANÁLISE DE CUSTO COMPUTACIONAL E LATÊNCIA

Adicionalmente, analisou-se o tempo médio despendido para o processamento de uma única imagem em ambiente de produção (inferência por exame). A DenseNet-121 apresentou latência média de 38 milissegundos por radiografia, tornando sua integração operacional plenamente compatível com sistemas hospitalares de resposta em tempo real (PACS).`,
      },
      {
        id: 'sec-5',
        number: '5',
        title: 'CONSIDERAÇÕES FINAIS',
        level: 1,
        type: 'textual',
        content: `O presente trabalho cumpriu os objetivos propostos ao projetar, implementar e validar metodologicamente um ecossistema inteligente de apoio ao diagnóstico por imagens radiológicas em conformidade com as exigências científicas vigentes.

A resposta ao problema de pesquisa formulado evidencia que as arquiteturas de aprendizado profundo, em especial com blocos densamente interconectados e pré-processamento adaptativo CLAHE, oferecem robustez analítica com sensibilidade de 96,2%, atuando como um filtro assertivo para minimizar casos falso-negativos em rotinas emergenciais.

Como contribuição teórica, formalizou-se um roteiro comparativo reprodutível para pesquisadores da área de engenharia de software biomédica. Como limitação deste estudo, salienta-se que a base amostral utilizada compreendeu primariamente exames em projeção PA de pacientes adultos, recomendando-se para trabalhos futuros a inclusão de amostras pediátricas e a incorporação de mapas de calor interpretáveis (Grad-CAM) para explicabilidade visual dirigida à equipe médica.`,
      },
    ],
    crossReferences: [
      {
        id: 'fig-1',
        type: 'figura',
        number: 1,
        title: 'Diagrama estrutural do fluxo de dados e blocos densos na rede DenseNet-121',
        source: 'Fonte: Elaborado pelo autor com base em Huang et al. (2017).',
        contentUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
        notes: 'Diagrama esquemático demonstrando conexões residuais densas e concatenação de tensores.',
      },
      {
        id: 'tab-1',
        type: 'tabela',
        number: 1,
        title: 'Métricas comparativas de desempenho nos testes cegos de classificação',
        source: 'Fonte: Dados obtidos na pesquisa experimental (2025).',
        tableHeaders: ['Arquitetura', 'Acurácia (%)', 'Sensibilidade (%)', 'Especificidade (%)', 'F1-Score', 'Latência (ms)'],
        tableRows: [
          ['ResNet-50', '91,4', '92,1', '90,7', '0,914', '42'],
          ['EfficientNet-B4', '93,2', '94,0', '92,5', '0,932', '65'],
          ['DenseNet-121', '94,8', '96,2', '93,4', '0,948', '38'],
        ],
        notes: 'Resultados médios obtidos após 5 repetições com validação cruzada 5-fold.',
      },
    ],
    references: [
      {
        id: 'ref-1',
        type: 'livro',
        authors: 'GIL, Antonio Carlos',
        title: 'Como elaborar projetos de pesquisa',
        subtitle: 'métodos e técnicas',
        edition: '7',
        city: 'São Paulo',
        publisher: 'Atlas',
        year: '2022',
        formattedABNT: 'GIL, Antonio Carlos. Como elaborar projetos de pesquisa: métodos e técnicas. 7. ed. São Paulo: Atlas, 2022.',
        citationKey: 'GIL, 2022',
      },
      {
        id: 'ref-2',
        type: 'livro',
        authors: 'GOODFELLOW, Ian; BENGIO, Yoshua; COURVILLE, Aaron',
        title: 'Deep learning',
        city: 'Cambridge',
        publisher: 'MIT Press',
        year: '2016',
        formattedABNT: 'GOODFELLOW, Ian; BENGIO, Yoshua; COURVILLE, Aaron. Deep learning. Cambridge: MIT Press, 2016.',
        citationKey: 'GOODFELLOW; BENGIO; COURVILLE, 2016',
      },
      {
        id: 'ref-3',
        type: 'artigo',
        authors: 'HUANG, Gao; LIU, Zhuang; VAN DER MAATEN, Laurens; WEINBERGER, Kilian Q.',
        title: 'Densely connected convolutional networks',
        journal: 'IEEE Transactions on Pattern Analysis and Machine Intelligence',
        volume: '40',
        number: '12',
        pages: 'p. 2736-2748',
        year: '2017',
        formattedABNT: 'HUANG, Gao et al. Densely connected convolutional networks. IEEE Transactions on Pattern Analysis and Machine Intelligence, v. 40, n. 12, p. 2736-2748, 2017.',
        citationKey: 'HUANG et al., 2017',
      },
      {
        id: 'ref-4',
        type: 'artigo',
        authors: 'LECUN, Yann; BENGIO, Yoshua; HINTON, Geoffrey',
        title: 'Deep learning',
        journal: 'Nature',
        volume: '521',
        number: '7553',
        pages: 'p. 436-444',
        year: '2015',
        formattedABNT: 'LECUN, Yann; BENGIO, Yoshua; HINTON, Geoffrey. Deep learning. Nature, v. 521, n. 7553, p. 436-444, 2015.',
        citationKey: 'LECUN; BENGIO; HINTON, 2015',
      },
      {
        id: 'ref-5',
        type: 'livro',
        authors: 'RUSSELL, Stuart; NORVIG, Peter',
        title: 'Inteligência artificial',
        subtitle: 'uma abordagem moderna',
        edition: '4',
        city: 'Rio de Janeiro',
        publisher: 'GEN LTC',
        year: '2022',
        formattedABNT: 'RUSSELL, Stuart; NORVIG, Peter. Inteligência artificial: uma abordagem moderna. 4. ed. Rio de Janeiro: GEN LTC, 2022.',
        citationKey: 'RUSSELL; NORVIG, 2022',
      },
    ],
    appendices: [
      {
        id: 'app-a',
        letter: 'A',
        title: 'Roteiro de Validação Experimental e Parâmetros de Hiperajuste',
        content: 'Este apêndice documenta a matriz de hiperparâmetros adotada para o treinamento dos modelos: Taxa de aprendizado inicial: 0.0001; Tamanho do lote (batch size): 32; Otimizador: Adam com decaimento exponencial de pesos de 0.0005; Função de perda: Binary Cross-Entropy with Logits.',
      },
    ],
    annexes: [
      {
        id: 'ann-a',
        letter: 'A',
        title: 'Diretrizes Éticas da Resolução CNS nº 510/2016 para Dados Secundários',
        content: 'Transcreve-se aqui os artigos pertinentes da Resolução do Conselho Nacional de Saúde relativos ao uso de bases de dados abertas anonimizadas de domínio público em pesquisas científicas.',
      },
    ],
    settings: {
      fontFamily: 'Times New Roman',
      fontSize: 12,
      lineSpacing: 1.5,
      margins: {
        top: 3,
        left: 3,
        right: 2,
        bottom: 2,
      },
      includeCover: true,
      includeTitlePage: true,
      includeApprovalSheet: true,
      includeDedication: true,
      includeAcknowledgments: true,
      includeEpigraph: true,
      includeResumo: true,
      includeAbstract: true,
      includeListOfFigures: true,
      includeListOfTables: true,
      includeListOfAcronyms: true,
      includeTableOfContents: true,
      showGridGuide: false,
    },
    lastModified: new Date().toISOString(),
  },
  {
    id: 'tcc-artigo-gestao',
    title: 'TRANSFORMAÇÃO DIGITAL E EFICIÊNCIA OPERACIONAL EM PEQUENAS EMPRESAS',
    subtitle: 'Um estudo multicaso no setor de serviços',
    documentType: 'artigo',
    academicDegree: 'especializacao',
    institution: {
      name: 'ESCOLA SUPERIOR DE GESTÃO E NEGÓCIOS',
      department: 'PROGRAMA DE PÓS-GRADUAÇÃO LATO SENSU',
      course: 'ESPECIALIZAÇÃO EM GESTÃO EMPRESARIAL',
    },
    authors: [
      {
        id: 'auth-2',
        name: 'MARIANA RODRIGUES LIMA',
        email: 'mariana.lima@escola.edu.br',
        courseOrDepartment: 'Gestão Empresarial',
      },
    ],
    advisor: {
      name: 'Profª. Dra. Clarice Antunes Prado',
      title: 'Doutora em Administração',
      institution: 'ESGN',
    },
    city: 'CURITIBA',
    stateOrCountry: 'PR',
    year: '2025',
    natureOfWork: 'Artigo Científico submetido como requisito final para a conclusão do Curso de Pós-Graduação Lato Sensu em Gestão Empresarial.',
    examinationBoard: [],
    resumo: {
      text: 'O presente artigo científico tem por escopo investigar as barreiras e os catalisadores da transformação digital em pequenas empresas do setor de serviços. Por meio de um estudo multicaso com três organizações de médio porte no Paraná, analisou-se a adoção de sistemas de gestão em nuvem e automação de fluxos operacionais. Os resultados evidenciam aumento de 27% na agilidade de atendimento e redução de retrabalho em tarefas financeiras.',
      keywords: ['Transformação digital', 'Gestão operacional', 'Pequenas empresas', 'Inovação em serviços'],
    },
    abstract: {
      text: 'This scientific article aims to investigate the barriers and enablers of digital transformation within small service enterprises. Using a multiple case study involving three regional firms, the research analyzed the adoption of cloud management systems and operational workflow automation. Outcomes indicate a 27% increase in customer fulfillment agility.',
      keywords: ['Digital transformation', 'Operations management', 'Small enterprises', 'Service innovation'],
    },
    acronyms: [
      { id: 'acr-10', acronym: 'ERP', definition: 'Enterprise Resource Planning (Planejamento de Recursos Empresariais)' },
      { id: 'acr-11', acronym: 'PME', definition: 'Pequena e Média Empresa' },
    ],
    symbols: [],
    sections: [
      {
        id: 'sec-art-1',
        number: '1',
        title: 'INTRODUÇÃO',
        level: 1,
        type: 'textual',
        content: `A competitividade dos mercados contemporâneos tem imposto às pequenas e médias empresas a necessidade premente de modernização tecnológica. No contexto dos serviços, a experiência do cliente e a celeridade dos processos internos tornaram-se vetores primordiais de sustentabilidade econômica.`,
      },
      {
        id: 'sec-art-2',
        number: '2',
        title: 'METODOLOGIA E CASOS ESTUDADOS',
        level: 1,
        type: 'textual',
        content: `Adotou-se o método de estudo multicaso com entrevistas semiestruturadas com gestores e análise documental de métricas operacionais antes e após a digitalização.`,
      },
      {
        id: 'sec-art-3',
        number: '3',
        title: 'RESULTADOS E CONCLUSÕES',
        level: 1,
        type: 'textual',
        content: `Os achados demonstram que os principais entraves não residem nos custos de software, mas na resistência cultural à mudança e na ausência de capacitação das equipes operacionais.`,
      },
    ],
    crossReferences: [],
    references: [
      {
        id: 'ref-art-1',
        type: 'livro',
        authors: 'PORTER, Michael E.',
        title: 'Vantagem competitiva',
        subtitle: 'criando e sustentando um desempenho superior',
        city: 'Rio de Janeiro',
        publisher: 'Campus',
        year: '1989',
        formattedABNT: 'PORTER, Michael E. Vantagem competitiva: criando e sustentando um desempenho superior. Rio de Janeiro: Campus, 1989.',
        citationKey: 'PORTER, 1989',
      },
    ],
    appendices: [],
    annexes: [],
    settings: {
      fontFamily: 'Arial',
      fontSize: 12,
      lineSpacing: 1.5,
      margins: { top: 3, left: 3, right: 2, bottom: 2 },
      includeCover: false,
      includeTitlePage: false,
      includeApprovalSheet: false,
      includeDedication: false,
      includeAcknowledgments: false,
      includeEpigraph: false,
      includeResumo: true,
      includeAbstract: true,
      includeListOfFigures: false,
      includeListOfTables: false,
      includeListOfAcronyms: false,
      includeTableOfContents: false,
      showGridGuide: false,
    },
    lastModified: new Date().toISOString(),
  },
  {
    id: 'tcc-tecnico-automacao',
    title: 'DESENVOLVIMENTO DE MÓDULO IOT DE BAIXO CUSTO PARA MONITORAMENTO TÉRMICO E DE CORRENTE EM QUADROS ELÉTRICOS INDUSTRIAIS',
    subtitle: 'Aplicação prática baseada em microcontrolador ESP32 e protocolo MQTT conforme as diretrizes da NR-10 e NBR 5410',
    documentType: 'tcc_tecnico',
    academicDegree: 'tecnico',
    institution: {
      name: 'INSTITUTO FEDERAL DE EDUCAÇÃO, CIÊNCIA E TECNOLOGIA',
      facultyOrInstitute: 'CAMPUS INDUSTRIAL',
      department: 'EIXO TECNOLÓGICO DE CONTROLE E PROCESSOS INDUSTRIAIS',
      course: 'CURSO TÉCNICO EM ELETROTÉCNICA',
      campus: 'CAMPUS CENTRAL',
    },
    authors: [
      {
        id: 'auth-tec-1',
        name: 'LUCAS MATHEUS SILVA COSTA',
        email: 'lucas.costa@aluno.if.edu.br',
        courseOrDepartment: 'Técnico em Eletrotécnica',
      },
      {
        id: 'auth-tec-2',
        name: 'BEATRIZ ALMEIDA SOUZA',
        email: 'beatriz.souza@aluno.if.edu.br',
        courseOrDepartment: 'Técnico em Eletrotécnica',
      },
    ],
    advisor: {
      name: 'Prof. Me. Rodrigo Augusto Nogueira',
      title: 'Engenheiro Eletricista e Mestre em Automação',
      institution: 'IFSP',
    },
    coAdvisor: {
      name: 'Prof. Esp. Marcelo Tavares Lima',
      title: 'Especialista em Segurança do Trabalho e NR-10',
      institution: 'IFSP',
    },
    city: 'SÃO PAULO',
    stateOrCountry: 'SP',
    year: '2025',
    submissionDate: '28 de novembro de 2025',
    natureOfWork: 'Trabalho de Conclusão de Curso apresentado à Coordenação do Curso Técnico em Eletrotécnica do Instituto Federal de Educação, Ciência e Tecnologia, como requisito parcial para a obtenção do diploma e habilitação profissional de Técnico em Eletrotécnica.\n\nEixo Tecnológico: Controle e Processos Industriais.',
    examinationBoard: [
      {
        id: 'b-tec-1',
        name: 'Prof. Me. Rodrigo Augusto Nogueira',
        title: 'Engenheiro Eletricista - Presidente',
        role: 'Presidente',
        institution: 'IFSP',
      },
      {
        id: 'b-tec-2',
        name: 'Prof. Esp. Carlos Eduardo Mendes',
        title: 'Tecnólogo em Automação e Docente Técnico',
        role: 'Examinador Interno',
        institution: 'IFSP',
      },
      {
        id: 'b-tec-3',
        name: 'Eng. Roberto Farias Santos',
        title: 'Engenheiro de Manutenção Elétrica Industrial',
        role: 'Examinador Externo',
        institution: 'Indústria Metalúrgica',
      },
    ],
    dedication: 'Dedicamos este projeto técnico aos nossos pais e mestres das oficinas industriais que nos ensinaram a honrar a profissão técnica e a segurança operacional.',
    acknowledgments: 'Agradecemos aos docentes do Instituto Federal pelo suporte laboratorial, pela disponibilização das bancadas de testes e dos instrumentos de medição de precisão.',
    epigraph: {
      quote: 'A teoria sem a prática é inútil; a prática sem a teoria é cega e perigosa.',
      author: 'Immanuel Kant',
      year: '1793',
    },
    resumo: {
      text: 'O presente Trabalho de Conclusão de Curso Técnico apresenta o dimensionamento, montagem e validação experimental de um módulo IoT de baixo custo projetado para o monitoramento contínuo de temperatura e intensidade de corrente elétrica em painéis e quadros de distribuição industrial (QGBT). A elevação de temperatura decorrente de conexões afrouxadas e o sobreaquecimento por efeito Joule figuram entre os principais fatores causadores de paradas não programadas e sinistros de incêndio em ambientes fabris. Com o objetivo de atender aos preceitos preventivos da Norma Regulamentadora NR-10 e da ABNT NBR 5410, desenvolveu-se uma arquitetura eletrônica embarcada baseada no microcontrolador ESP32 acoplado a um transformador de corrente não invasivo (SCT-013-000) e a sensores digitais de temperatura (DS18B20). Os dados amostrados são transmitidos em tempo real via protocolo MQTT para um servidor local com dashboard gráfico, possibilitando alarmes preventivos de sobrecorrente e subtensão. Os ensaios de bancada revelaram erro relativo inferior a 2,5% em comparação a alicate amperímetro profissional calibrado, com custo de hardware inferior a 15% das soluções proprietárias de mercado.',
      keywords: ['TCC Técnico', 'Eletrotécnica', 'Internet das Coisas', 'ESP32', 'Monitoramento Elétrico', 'NR-10'],
    },
    abstract: {
      text: 'This Technical Course Final Project presents the design, assembly, and experimental validation of a low-cost IoT module developed for continuous monitoring of temperature and electric current in industrial electrical switchboards. Overheating caused by loose connections and the Joule effect represents one of the main triggers of unscheduled downtime and electrical fires in manufacturing facilities. Aiming to comply with preventive guidelines established by the Brazilian Regulatory Standard NR-10 and ABNT NBR 5410, an embedded electronic architecture was developed using the ESP32 microcontroller paired with non-invasive current transformers (SCT-013-000) and digital temperature sensors (DS18B20). Collected telemetry data is published via MQTT protocol to a local server featuring a visual dashboard with automated threshold alarms. Laboratory trials demonstrated a relative error of less than 2.5% compared to professional calibrated clamp meters, at a hardware bill of materials lower than 15% of commercial proprietary counterparts.',
      keywords: ['Technical Course Project', 'Electrotechnics', 'Internet of Things', 'ESP32', 'Electrical Monitoring', 'NR-10 Standard'],
    },
    acronyms: [
      { id: 'acr-1', acronym: 'ABNT', definition: 'Associação Brasileira de Normas Técnicas' },
      { id: 'acr-2', acronym: 'ESP32', definition: 'Microcontrolador com Wi-Fi e Bluetooth integrado (Espressif)' },
      { id: 'acr-3', acronym: 'IoT', definition: 'Internet das Coisas (Internet of Things)' },
      { id: 'acr-4', acronym: 'MQTT', definition: 'Message Queuing Telemetry Transport' },
      { id: 'acr-5', acronym: 'NR-10', definition: 'Norma Regulamentadora nº 10 - Segurança em Instalações e Serviços em Eletricidade' },
      { id: 'acr-6', acronym: 'QGBT', definition: 'Quadro Geral de Baixa Tensão' },
      { id: 'acr-7', acronym: 'TC', definition: 'Transformador de Corrente' },
    ],
    symbols: [
      { id: 'sym-1', symbol: 'I', definition: 'Corrente elétrica eficaz (RMS)' },
      { id: 'sym-2', symbol: 'V', definition: 'Tensão elétrica em volts (V)' },
      { id: 'sym-3', symbol: 'T', definition: 'Temperatura em graus Celsius (°C)' },
      { id: 'sym-4', symbol: 'R', definition: 'Resistência ôhmica (Ω)' },
    ],
    sections: [
      {
        id: 'sec-tec-1',
        number: '1',
        title: 'INTRODUÇÃO E JUSTIFICATIVA TÉCNICA',
        level: 1,
        type: 'textual',
        content: `No contexto da indústria contemporânea e das rotinas de manutenção preditiva, a integridade dos painéis de distribuição elétrica desempenha papel decisivo para a continuidade operacional e para a preservação da vida dos operadores. Falhas elétricas motivadas por sobrecargas contínuas e conexões mecânicas deficientes constituem as causas mais frequentes de arco elétrico e queima de componentes em Quadros Gerais de Baixa Tensão (QGBT).

A Norma Regulamentadora NR-10 (BRASIL, 2019) estipula requisitos compulsórios de segurança operacional, estabelecendo que instalações elétricas devem dispor de mecanismos confiáveis de proteção e monitoramento que minimizem os riscos de choque elétrico e incêndios. Simultaneamente, a norma ABNT NBR 5410 (ABNT, 2004) regulamenta as instalações elétricas de baixa tensão, fixando limites estritos de elevação de temperatura e capacidade de condução dos condutores de cobre e barramentos.

Tradicionalmente, a verificação desses parâmetros em ambientes industriais é executada por meio de inspeções termográficas periódicas com câmeras infravermelhas manuais. Contudo, tal procedimento exibe limitações intrínsecas: possui caráter pontual (amostragem descontínua no tempo) e impõe a necessidade de intervenção física de técnicos na área de risco, potencializando a exposição humana a partes vivas sob tensão.

Nesse cenário, este Trabalho de Conclusão de Curso Técnico propõe o projeto, montagem e teste prático de um módulo de telemetria baseado em tecnologia IoT (Internet das Coisas). Empregando componentes de ampla disponibilidade e baixo custo, o sistema opera de forma não invasiva, monitorando em tempo integral a corrente eficaz das fases e a temperatura nos pontos críticos do quadro elétrico, emitindo notificações imediatas em caso de desvios operacionais.`,
      },
      {
        id: 'sec-tec-2',
        number: '2',
        title: 'FUNDAMENTAÇÃO TEÓRICA E NORMAS TÉCNICAS',
        level: 1,
        type: 'textual',
        content: `A fundamentação teórica deste projeto técnico ancora-se nas leis fundamentais do eletromagnetismo, nos fenômenos de dissipação térmica e no arcabouço normativo que rege as instalações industriais no território brasileiro.

2.1 Efeito Joule e Sobreaquecimento em Painéis
Conforme esclarece Mamede Filho (2017), a circulação de corrente elétrica através de um condutor real resulta na conversão de energia elétrica em energia térmica proporcional ao quadrado da intensidade de corrente, à resistência ôhmica do condutor e ao tempo de circulação:

Q = R · I² · t

Em terminais elétricos frouxos ou com oxidação de superfície, a resistência de contato (Rc) sofre elevação abrupta. Como a corrente de carga permanece constante imposta pelos motores e cargas industriais, a potência térmica dissipada localmente no barramento eleva-se criticamente, podendo carbonizar isolamentos e originar curtos-circuitos catastróficos.

2.2 Exigências Normativas: ABNT NBR 5410 e NR-10
A ABNT NBR 5410 determina que a temperatura máxima admissível para condutores isolados com PVC em regime contínuo é de 70 °C, enquanto isolações de EPR ou XLPE suportam até 90 °C. Ultrapassados tais limiares térmicos, ocorre o envelhecimento acelerado do polímero isolante, expondo a instalação ao risco de quebra de rigidez dielétrica.

Por sua vez, a NR-10 preconiza o princípio da proteção ativa e da segregação física entre operadores e partes energizadas (BRASIL, 2019). O sensoriamento remoto de grandezas viabiliza a conformidade normativa ao retirar a equipe de manutenção da proximidade direta dos barramentos durante a medição de rotina.`,
      },
      {
        id: 'sec-tec-3',
        number: '3',
        title: 'ESPECIFICAÇÃO DE MATERIAIS, HARDWARE E METODOLOGIA',
        level: 1,
        type: 'textual',
        content: `A metodologia adotada para a concretização do projeto técnico seguiu o ciclo estruturado de engenharia aplicada: levantamento de requisitos, dimensionamento de componentes, desenvolvimento do firmware embarcado e ensaios laboratoriais em bancada de testes.

3.1 Microcontrolador e Módulo de Processamento
Optou-se pelo microcontrolador ESP32 (Espressif Systems), composto por arquitetura dual-core Xtensa LX6 operando a 240 MHz, memória SRAM de 520 KB, conversores analógico-digitais (ADC) de 12 bits e transceptores integrados Wi-Fi 802.11 b/g/n e Bluetooth 4.2 BLE. Sua capacidade computacional possibilita o cálculo de True-RMS da forma de onda de corrente em tempo real diretamente na borda (Edge Computing).

3.2 Transformador de Corrente Não Invasivo (SCT-013-000)
Para aquisição de corrente alternada sem a necessidade de interrupção mecânica dos cabos alimentadores, empregou-se o sensor tipo Split-Core SCT-013-000. O dispositivo opera como transformador de corrente com relação de espiras de 1:2000, permitindo a leitura de correntes de 0 a 100 A com saída em corrente secundária de 0 a 50 mA.

Para adequar o sinal de corrente alternada à faixa unipolar de 0 a 3,3 V do conversor ADC do ESP32, projetou-se um circuito condicionador de sinal composto por resistor de carga (Burden Resistor) de 33 Ω e circuito de polarização com divisor resistivo e capacitor de desacoplamento de 10 µF, garantindo tensão de offset centrada em 1,65 V.

3.3 Sensores Digitais de Temperatura DS18B20
A medição de temperatura superficial dos barramentos foi confiada a sensores digitais DS18B20 blindados em cápsula de aço inoxidável. O sensor comunica-se via protocolo 1-Wire, operando com precisão de ±0,5 °C na faixa de -10 °C a +85 °C e resolução configurável de até 12 bits. Múltiplos sensores podem ser conectados ao mesmo pino GPIO através de endereçamento de 64 bits em barramento paralelo.`,
      },
      {
        id: 'sec-tec-4',
        number: '4',
        title: 'MONTAGEM DO PROTÓTIPO, TESTES E RESULTADOS DE BANCADA',
        level: 1,
        type: 'textual',
        content: `A montagem física do protótipo foi executada em placa de circuito impresso padronizada e alojada em invólucro em ABS com fixação para trilho DIN de 35 mm, compatível com os padrões de montagem de quadros elétricos industriais.

4.1 Protocolo de Testes Laboratoriais
Os ensaios foram conduzidos no Laboratório de Instalações Elétricas do Instituto Federal. Utilizou-se uma bancada didática composta por banco de cargas resistivas graduadas de 500 W a 3000 W alimentada em 220 Vca, gerando degraus de corrente controlados de 2,27 A a 13,63 A.

Para fins de calibração metrológica e validação, os valores aferidos pelo módulo IoT desenvolvido foram confrontados com as medições simultâneas de um alicate amperímetro digital de referência modelo Fluke 376 FC (calibrado e certificado RBC).

4.2 Análise de Precisão e Erro Relativo
Ao longo de 50 ciclos de medição com patamares de carga de 2,5 A, 5,0 A, 10,0 A e 13,5 A, o protótipo registrou erro relativo médio de 1,82%, com desvio padrão de 0,14 A. A amostragem de temperatura exibiu fidelidade de 99,1% em comparação a termômetro infravermelho óptico calibrado. O tempo de resposta para envio de pacote de telemetria via MQTT sob conexão Wi-Fi local foi inferior a 350 milissegundos.`,
      },
      {
        id: 'sec-tec-5',
        number: '5',
        title: 'CONSIDERAÇÕES FINAIS E VIABILIDADE ECONÔMICA',
        level: 1,
        type: 'textual',
        content: `A concepção e validação do protótipo comprovaram que a aplicação de tecnologias abertas de Internet das Coisas em cursos técnicos de nível médio é plenamente factível, gerando soluções funcionais que atendem às exigências de confiabilidade do setor produtivo.

No que tange à viabilidade econômica, o custo total dos componentes para fabricação do módulo totalizou aproximadamente R$ 145,00, valor significativamente inferior aos analisadores industriais comerciais disponíveis no mercado, cujos custos superam R$ 1.800,00 por unidade.

Em conformidade com as diretrizes da NR-10 e da ABNT NBR 5410, o equipamento viabiliza o acompanhamento em tempo real sem a necessidade de abertura constante de portas de quadros energizados, reduzindo significativamente a exposição a arcos elétricos. Como proposta de trabalhos futuros, sugere-se a implementação de alimentação PoE (Power over Ethernet) e comunicação via protocolo Modbus RTU sobre barramento RS-485 para integração a CLPs industriais legados.`,
      },
    ],
    crossReferences: [
      {
        id: 'fig-tec-1',
        type: 'figura',
        number: 1,
        title: 'Diagrama esquemático do circuito de condicionamento de sinal do sensor de corrente SCT-013',
        source: 'Autores (2025)',
      },
      {
        id: 'tab-tec-1',
        type: 'tabela',
        number: 1,
        title: 'Comparativo de medições de corrente entre protótipo ESP32 e Alicate Amperímetro Fluke 376 FC',
        source: 'Dados obtidos nos ensaios de bancada (2025)',
      },
    ],
    references: [
      {
        id: 'ref-tec-1',
        type: 'outro',
        authors: 'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS',
        title: 'ABNT NBR 5410',
        subtitle: 'Instalações elétricas de baixa tensão',
        city: 'Rio de Janeiro',
        publisher: 'ABNT',
        year: '2004',
        formattedABNT: 'ASSOCIAÇÃO BRASILEIRA DE NORMAS TÉCNICAS. ABNT NBR 5410: Instalações elétricas de baixa tensão. Rio de Janeiro: ABNT, 2004.',
        citationKey: 'ABNT, 2004',
      },
      {
        id: 'ref-tec-2',
        type: 'outro',
        authors: 'BRASIL. Ministério do Trabalho e Emprego',
        title: 'Norma Regulamentadora nº 10 (NR-10)',
        subtitle: 'Segurança em instalações e serviços em eletricidade',
        city: 'Brasília, DF',
        publisher: 'MTE',
        year: '2019',
        formattedABNT: 'BRASIL. Ministério do Trabalho e Emprego. Norma Regulamentadora nº 10 (NR-10): Segurança em instalações e serviços em eletricidade. Brasília, DF: MTE, 2019.',
        citationKey: 'BRASIL, 2019',
      },
      {
        id: 'ref-tec-3',
        type: 'livro',
        authors: 'MAMEDE FILHO, João',
        title: 'Instalações elétricas industriais',
        subtitle: 'fundamentos e projetos',
        city: 'Rio de Janeiro',
        publisher: 'LTC',
        year: '2017',
        formattedABNT: 'MAMEDE FILHO, João. Instalações elétricas industriais: fundamentos e projetos. 9. ed. Rio de Janeiro: LTC, 2017.',
        citationKey: 'MAMEDE FILHO, 2017',
      },
      {
        id: 'ref-tec-4',
        type: 'livro',
        authors: 'BOYLESTAD, Robert L.; NASHELSKY, Louis',
        title: 'Dispositivos eletrônicos e teoria de circuitos',
        city: 'São Paulo',
        publisher: 'Pearson Education do Brasil',
        year: '2013',
        formattedABNT: 'BOYLESTAD, Robert L.; NASHELSKY, Louis. Dispositivos eletrônicos e teoria de circuitos. 11. ed. São Paulo: Pearson Education do Brasil, 2013.',
        citationKey: 'BOYLESTAD; NASHELSKY, 2013',
      },
    ],
    appendices: [],
    annexes: [],
    settings: {
      fontFamily: 'Arial',
      fontSize: 12,
      lineSpacing: 1.5,
      margins: { top: 3, left: 3, right: 2, bottom: 2 },
      includeCover: true,
      includeTitlePage: true,
      includeApprovalSheet: true,
      includeDedication: true,
      includeAcknowledgments: true,
      includeEpigraph: true,
      includeResumo: true,
      includeAbstract: true,
      includeListOfFigures: true,
      includeListOfTables: true,
      includeListOfAcronyms: true,
      includeTableOfContents: true,
      showGridGuide: false,
    },
    lastModified: new Date().toISOString(),
  },
];

export const sampleMonograph = sampleProjects[0];
export const sampleArticle = sampleProjects[1];
export const sampleTechnicalTCC = sampleProjects[2];
