/* ==========================================================================
   DADOS DO SITE — edite aqui para atualizar links, temas e textos.
   Cada link pode ser:
     { rotulo, url }                       → link simples
     { rotulo, url, tipo: "tableau" }      → abre o painel Tableau dentro do site
     { rotulo, porCidade: m => url }       → gera um link para cada município
   ========================================================================== */
(function () {
  "use strict";

  // Municípios do Litoral Norte (códigos IBGE)
  const municipios = [
    { id: "caraguatatuba", nome: "Caraguatatuba", ibge: 3510500, cor: "var(--ods-14)" },
    { id: "ilhabela", nome: "Ilhabela", ibge: 3520400, cor: "var(--ods-13)" },
    { id: "sao-sebastiao", nome: "São Sebastião", ibge: 3550704, cor: "var(--ods-11)" },
    { id: "ubatuba", nome: "Ubatuba", ibge: 3555406, cor: "var(--ods-16)" },
  ];

  // Os 17 Objetivos de Desenvolvimento Sustentável (nomes curtos oficiais).
  // Ícones oficiais em português em assets/img/ods/ (fonte: Wikimedia Commons / ONU).
  // Pelas regras de uso da ONU, os ícones não podem ser alterados (cor, texto ou proporção).
  const ICONES_ODS = { 1: "jpg", 12: "jpg", 14: "jpg", 16: "jpg" };
  const iconeODS = (n) => "assets/img/ods/ods-" + String(n).padStart(2, "0") + "." + (ICONES_ODS[n] || "webp");
  const ods = [
    { n: 1, nome: "Erradicação da pobreza" },
    { n: 2, nome: "Fome zero e agricultura sustentável" },
    { n: 3, nome: "Saúde e bem-estar" },
    { n: 4, nome: "Educação de qualidade" },
    { n: 5, nome: "Igualdade de gênero" },
    { n: 6, nome: "Água potável e saneamento" },
    { n: 7, nome: "Energia limpa e acessível" },
    { n: 8, nome: "Trabalho decente e crescimento econômico" },
    { n: 9, nome: "Indústria, inovação e infraestrutura" },
    { n: 10, nome: "Redução das desigualdades" },
    { n: 11, nome: "Cidades e comunidades sustentáveis" },
    { n: 12, nome: "Consumo e produção responsáveis" },
    { n: 13, nome: "Ação contra a mudança global do clima" },
    { n: 14, nome: "Vida na água" },
    { n: 15, nome: "Vida terrestre" },
    { n: 16, nome: "Paz, justiça e instituições eficazes" },
    { n: 17, nome: "Parcerias e meios de implementação" },
  ].map((o) => Object.assign(o, { icone: iconeODS(o.n) }));

  const tableau = (caminho) => "https://public.tableau.com/views/" + caminho;

  // Link do Observatório Fiscal do TCE-SP já filtrado por município (sempre no exercício mais recente)
  const tceFiscal = (m) =>
    "https://painel.tce.sp.gov.br/pentaho/api/repos/%3Apublic%3Aof%3Ahome%3Ageral%3Aof.wcdf/generatedContent?userid=anony&password=zero&bookmarkState=" +
    encodeURIComponent(JSON.stringify({ impl: "client", params: { pMunicipio: String(m.ibge), pEstadual: "municipal" } }));

  // Temas do Observatório. "ods": objetivos relacionados; o primeiro define a cor do tema.
  const temas = [
    {
      id: "orcamento",
      titulo: "Orçamento Público Municipal",
      icone: "moeda",
      ods: [17, 16],
      resumo: "Como cada município arrecada e gasta: receitas próprias, royalties, despesas por área e comparação regional.",
      grupos: [
        {
          titulo: "Comparação dos orçamentos do Litoral Norte",
          fonte: "Observatório · dados do Portal da Transparência Municipal (TCE-SP)",
          links: [{ rotulo: "Abrir painel comparativo dos 4 municípios", url: tableau("OrcamentoLN/Orc4MunicipiosLN"), tipo: "tableau" }],
        },
        {
          titulo: "Receitas e despesas por município",
          fonte: "Observatório · Tableau Public",
          links: [
            { rotulo: "Ilhabela", url: tableau("OrcamentoLN/menu?Municipio=Ilhabela"), tipo: "tableau" },
            { rotulo: "São Sebastião", url: tableau("OrcamentoLN_17608037325790/menu?Municipio=S%C3%A3o%20Sebasti%C3%A3o"), tipo: "tableau" },
          ],
          nota: "Caraguatatuba e Ubatuba: veja os dados oficiais na página Orçamento.",
        },
        {
          titulo: "Orçamentos municipais da RMVale",
          fonte: "Dissertação de mestrado (USP) · Tableau Public",
          links: [{ rotulo: "Comparação de receitas da Região Metropolitana do Vale do Paraíba", url: tableau("dissertacaoUSP/Receitas_RMVale"), tipo: "tableau" }],
        },
        {
          titulo: "Dados oficiais ao vivo",
          fonte: "Tesouro Nacional (SICONFI) e TCE-SP",
          etiqueta: "oficial",
          links: [{ rotulo: "Ver página Orçamento", url: "orcamento.html", interno: true }],
        },
      ],
    },
    {
      id: "demografia",
      titulo: "Demografia",
      icone: "pessoas",
      ods: [10, 11],
      resumo: "Quem vive no Litoral Norte: população, crescimento, renda e características de cada município.",
      grupos: [
        {
          titulo: "IBGE Cidades — Panorama",
          fonte: "Instituto Brasileiro de Geografia e Estatística",
          etiqueta: "oficial",
          links: [{ porCidade: (m) => "https://cidades.ibge.gov.br/brasil/sp/" + m.id + "/panorama" }],
        },
        {
          titulo: "Seade Municípios",
          fonte: "Fundação Seade (SP)",
          etiqueta: "oficial",
          links: [{ rotulo: "Painel de população dos municípios paulistas", url: "https://municipios.seade.gov.br/" }],
        },
      ],
    },
    {
      id: "saude",
      titulo: "Saúde",
      icone: "coracao",
      ods: [3],
      resumo: "Acesso aos serviços de saúde, mortalidade, vacinação e atendimentos de urgência na região.",
      grupos: [
        {
          titulo: "Painéis de saúde pública",
          fonte: "Fontes oficiais e institutos de pesquisa",
          links: [
            { rotulo: "Painel Saúde — Seade Municípios", url: "https://municipios.seade.gov.br/saude/" },
            { rotulo: "Observatório da Saúde Pública", url: "https://observatoriosaudepublica.com.br/menu-municipio/" },
            { rotulo: "IEPS Data", url: "https://iepsdata.org.br/" },
            { rotulo: "DATASUS — TabNet", url: "https://datasus.saude.gov.br/informacoes-de-saude-tabnet/" },
          ],
        },
        {
          titulo: "SAMU no Litoral Norte",
          fonte: "Observatório · Tableau Public",
          links: [
            { rotulo: "Atendimentos de trânsito", url: tableau("samu_transito/Painel2"), tipo: "tableau" },
            { rotulo: "Agressões no litoral de SP", url: tableau("DadosdoSAMUAgressesnoLitoraldeSoPaulo/Painel1"), tipo: "tableau" },
          ],
        },
        {
          titulo: "Covid-19 em Ilhabela (2021–2022)",
          fonte: "Observatório · Tableau Public",
          links: [{ rotulo: "Painel Covid-19 Ilhabela", url: tableau("Covid-19_Ilhabela_2021/O2_covid_omicron"), tipo: "tableau" }],
        },
      ],
    },
    {
      id: "educacao",
      titulo: "Educação",
      icone: "livro",
      ods: [4],
      resumo: "Aprendizagem, aprovação e abandono escolar, IDEB e oportunidades educacionais em cada município.",
      grupos: [
        {
          titulo: "IDEB no Litoral Norte",
          fonte: "Observatório · Tableau Public",
          links: [
            { rotulo: "IDEB Litoral Norte 2022", url: tableau("IDEB_LN_2022/Painel1"), tipo: "tableau" },
            { rotulo: "Educação 2023", url: tableau("Educacao_2023_17569208201400/ideb_f1"), tipo: "tableau" },
          ],
        },
        {
          titulo: "QEdu — Taxas de rendimento",
          fonte: "QEdu (Meritt e Fundação Lemann)",
          links: [{ porCidade: (m) => "https://qedu.org.br/municipio/" + m.ibge + "-" + m.id + "/taxas-rendimento" }],
        },
        {
          titulo: "IOEB — Índice de Oportunidades da Educação Brasileira",
          fonte: "Centro de Liderança Pública e parceiros",
          links: [{ porCidade: (m) => "https://ioeb.org.br/municipio/" + m.id + "-sp/" }],
        },
        {
          titulo: "Painel Educação — Seade Municípios",
          fonte: "Fundação Seade (SP)",
          etiqueta: "oficial",
          links: [{ rotulo: "Abrir painel", url: "https://municipios.seade.gov.br/educacao/" }],
        },
      ],
    },
    {
      id: "saneamento",
      titulo: "Saneamento",
      icone: "gota",
      ods: [6, 14],
      resumo: "Água, esgoto, resíduos sólidos e balneabilidade — da torneira de casa à qualidade das praias.",
      grupos: [
        {
          titulo: "Saneamento por município",
          fonte: "Instituto Água e Saneamento · dados SINISA 2024",
          links: [{ porCidade: (m) => "https://www.aguaesaneamento.org.br/municipios-e-saneamento/sp/" + m.id }],
        },
        {
          titulo: "Painel Saneamento Brasil",
          fonte: "Instituto Trata Brasil",
          links: [{ porCidade: (m) => "https://www.painelsaneamento.org.br/localidade?id=" + m.ibge }],
        },
        {
          titulo: "Mapas e painéis regionais",
          fonte: "Observatório e órgãos estaduais",
          links: [
            { rotulo: "Mapa do Saneamento do Litoral Norte", url: "https://www.google.com/maps/d/viewer?mid=1dgK12gr_bG9MLdg9Mj_MU2kRTMeS7iI", tipo: "mapa" },
            { rotulo: "SNIS Litoral Norte", url: tableau("SNIS_Litoral_Norte/Painel1"), tipo: "tableau" },
            { rotulo: "Qualidade das praias (CETESB)", url: "https://arcgis.cetesb.sp.gov.br/portal/apps/experiencebuilder/experience/?id=bdd0cbd4bf094df9a000bf663254c21f" },
            { rotulo: "Observando os Rios (SOS Mata Atlântica)", url: "https://observandoosrios.sosma.org.br/projetos/2/observando-os-rios-sp" },
          ],
        },
      ],
    },
    {
      id: "energia",
      titulo: "Consumo de Energia",
      icone: "raio",
      ods: [7],
      resumo: "Evolução do consumo de energia elétrica nos municípios do Litoral Norte, por classe de consumidor.",
      grupos: [
        {
          titulo: "Consumo de energia elétrica no Litoral Norte",
          fonte: "Observatório · Tableau Public",
          links: [{ rotulo: "Abrir painel", url: tableau("Livro2_16705457223830/Histria1"), tipo: "tableau" }],
        },
      ],
    },
    {
      id: "economia",
      titulo: "Desenvolvimento Econômico, Trabalho e Renda",
      icone: "grafico",
      ods: [8, 9, 1],
      resumo: "Emprego formal, atividade econômica, turismo e o índice paulista de desenvolvimento municipal.",
      grupos: [
        {
          titulo: "Índices e painéis econômicos",
          fonte: "Fundação Seade (SP)",
          etiqueta: "oficial",
          links: [
            { rotulo: "Índice Paulista de Desenvolvimento Municipal (IPDM)", url: "https://ipdm.seade.gov.br/" },
            { rotulo: "Painel de Economia", url: "https://municipios.seade.gov.br/economia/" },
            { rotulo: "Painel de Emprego", url: "https://municipios.seade.gov.br/emprego/" },
          ],
        },
        {
          titulo: "Observatório do Turismo de Ilhabela",
          fonte: "Observatório · Tableau Public",
          links: [{ rotulo: "Abrir painel", url: tableau("I_Observatorio_do_Turismo/Story_Semana_da_Vela"), tipo: "tableau" }],
        },
      ],
    },
    {
      id: "cidades",
      titulo: "Cidades Sustentáveis",
      icone: "predio",
      ods: [11, 9],
      resumo: "Mobilidade urbana e o desempenho de cada município nos 17 ODS segundo o índice nacional IDSC-BR.",
      grupos: [
        {
          titulo: "IDSC-BR — Índice de Desenvolvimento Sustentável das Cidades",
          fonte: "Instituto Cidades Sustentáveis e SDSN",
          links: [{ porCidade: (m) => "https://idsc.cidadessustentaveis.org.br/#/cidade/" + m.ibge }],
        },
        {
          titulo: "Pesquisa sobre Mobilidade Urbana (2019)",
          fonte: "Observatório · Tableau Public",
          links: [
            { rotulo: "Caraguatatuba", url: tableau("C_Observatorio_ODS_2030_MobCidades/MobCidades-MapadosMunicipios"), tipo: "tableau", cidade: "caraguatatuba" },
            { rotulo: "Ilhabela", url: tableau("I_Observatorio_ODS_2030_MobCidades/MobCidades-MapadosMunicipios"), tipo: "tableau", cidade: "ilhabela" },
            { rotulo: "São Sebastião", url: tableau("S_Observatorio_ODS_2030_MobCidades/MobCidades-Story-Pesquisadepercepo"), tipo: "tableau", cidade: "sao-sebastiao" },
            { rotulo: "Ubatuba", url: tableau("U_Observatorio_ODS_2030_MobCidades/MobCidades-Story-Pesquisadepercepo"), tipo: "tableau", cidade: "ubatuba" },
          ],
        },
      ],
    },
    {
      id: "clima",
      titulo: "Agenda Climática",
      icone: "folha",
      ods: [13],
      resumo: "Como o tema do clima aparece — ou não aparece — nos planos de governo dos candidatos da região.",
      grupos: [
        {
          titulo: "Análise dos programas de governo",
          fonte: "Observatório · Tableau Public",
          links: [{ rotulo: "Candidatos dos municípios do Litoral Norte", url: tableau("AgendaClimatica_17569206762490/NivelCitacao"), tipo: "tableau" }],
        },
      ],
    },
    {
      id: "social",
      titulo: "Desenvolvimento Social e Equidade",
      icone: "maos",
      ods: [1, 5, 10],
      resumo: "Primeira infância, crianças e adolescentes, povos indígenas, segurança e progresso social.",
      grupos: [
        {
          titulo: "Índice de Progresso Social (IPS Brasil)",
          fonte: "IPS Brasil",
          links: [{ porCidade: (m) => "https://ipsbrasil.org.br/explore/scorecard/" + m.ibge }],
        },
        {
          titulo: "Primeira Infância em Dados",
          fonte: "Fundação Maria Cecilia Souto Vidigal",
          links: [{ porCidade: (m) => "https://primeirainfanciaemdados.org.br/municipios/" + m.id + "-sp/" }],
        },
        {
          titulo: "Crianças e adolescentes",
          fonte: "Fundação Abrinq e Conselho Tutelar",
          links: [
            { rotulo: "Observatório da Criança e do Adolescente", url: "https://observatoriocrianca.org.br/" },
            { rotulo: "Ocorrências do Conselho Tutelar em Ilhabela", url: "https://www.google.com/maps/d/viewer?mid=159mzQoerRFgveO6FEjnP1PyNR4U", tipo: "mapa" },
          ],
        },
        {
          titulo: "Observatório Indígena",
          fonte: "Observatório · Tableau Public",
          links: [{ rotulo: "Escolas indígenas em SP", url: tableau("OBS_Indigena/Escolas_SP"), tipo: "tableau" }],
        },
        {
          titulo: "Segurança pública",
          fonte: "Secretaria da Segurança Pública (SP)",
          etiqueta: "oficial",
          links: [{ rotulo: "Estatísticas criminais por município", url: "https://www.ssp.sp.gov.br/estatistica" }],
        },
      ],
    },
    {
      id: "governanca",
      titulo: "Governança e Transparência",
      icone: "balanca",
      ods: [16, 17],
      resumo: "Eficiência da gestão, transparência pública e execução fiscal das prefeituras, segundo o TCE-SP.",
      grupos: [
        {
          titulo: "Observatório Fiscal do TCE-SP",
          fonte: "Tribunal de Contas do Estado de São Paulo",
          etiqueta: "oficial",
          links: [{ porCidade: tceFiscal }],
        },
        {
          titulo: "Índice de Efetividade da Gestão Municipal (IEG-M)",
          fonte: "Tribunal de Contas do Estado de São Paulo",
          etiqueta: "oficial",
          links: [{ rotulo: "Abrir painel IEG-M", url: "https://iegm.tce.sp.gov.br/" }],
        },
        {
          titulo: "ITGP — Indicador de Transparência e Governança Pública",
          fonte: "Observatório · Tableau Public",
          links: [
            { rotulo: "Ilhabela", url: tableau("ITGP_RMVale_17606577792590/Painel?Munic%C3%ADpio=Ilhabela"), tipo: "tableau", cidade: "ilhabela" },
            { rotulo: "São Sebastião", url: tableau("ITGP_RMVale_17606577792590/Painel?Munic%C3%ADpio=S%C3%A3o%20Sebasti%C3%A3o"), tipo: "tableau", cidade: "sao-sebastiao" },
          ],
        },
      ],
    },
  ];

  // Contato oficial — não alterar sem autorização
  const contato = {
    emailObservatorio: "observatorio@litoralnortesustentavel.org.br",
  };

  window.LNS = { municipios, ods, temas, tableau, tceFiscal, contato };
})();
