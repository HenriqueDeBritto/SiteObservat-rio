/* ==========================================================================
   Página Orçamento — dados oficiais do Tesouro Nacional (SICONFI, DCA)
   API pública: https://apidatalake.tesouro.gov.br/ords/siconfi/tt/
   ========================================================================== */
(function () {
  "use strict";
  const { municipios, ods, tceFiscal } = window.LNS;
  const { esc, selosODS } = window.LNS.ui;

  const API = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca";
  const PROXY = "api/siconfi.php";
  const ANEXO_DESPESAS = "DCA-Anexo I-E"; // despesas por função
  const ANEXO_RECEITAS = "DCA-Anexo I-C"; // receitas por natureza
  const CACHE_DIAS = 7;

  // Funções de governo (Portaria MOG 42/1999) → ODS relacionados
  const FUNCOES = {
    "01": [16], "02": [16], "03": [16], "04": [16, 17], "05": [16], "06": [16, 11],
    "08": [1, 10], "09": [1, 8], "10": [3], "11": [8], "12": [4], "13": [11],
    "14": [10, 5, 16], "15": [11, 9], "16": [11, 1], "17": [6], "18": [13, 14, 15],
    "19": [9], "20": [2], "22": [9], "23": [8], "24": [9], "25": [7], "26": [11, 9],
    "27": [3, 11], "28": [17],
  };

  // Áreas usadas na comparação entre municípios
  const AREAS_COMPARACAO = [
    { cod: "10", rotulo: "Saúde" },
    { cod: "12", rotulo: "Educação" },
    { cod: "17", rotulo: "Saneamento" },
    { cod: "18", rotulo: "Gestão ambiental" },
    { cod: "08", rotulo: "Assistência social" },
  ];

  const estado = { municipio: "ilhabela", ano: null };
  const dica = document.querySelector("[data-dica]");

  /* ---------- Formatação ---------- */
  const fmtMoeda = (v) => {
    const a = Math.abs(v);
    if (a >= 1e9) return "R$ " + (v / 1e9).toLocaleString("pt-BR", { maximumFractionDigits: 2 }) + " bi";
    if (a >= 1e6) return "R$ " + (v / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi";
    if (a >= 1e3) return "R$ " + (v / 1e3).toLocaleString("pt-BR", { maximumFractionDigits: 0 }) + " mil";
    return "R$ " + v.toLocaleString("pt-BR", { maximumFractionDigits: 0 });
  };
  const fmtMoedaCheia = (v) => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const fmtPct = (v) => v.toLocaleString("pt-BR", { maximumFractionDigits: 1, minimumFractionDigits: 1 }) + "%";

  /* ---------- Acesso à API com cache local ---------- */
  function lerCache(chave) {
    try {
      const bruto = localStorage.getItem(chave);
      if (!bruto) return null;
      const { t, d } = JSON.parse(bruto);
      return Date.now() - t < CACHE_DIAS * 864e5 ? d : null;
    } catch (e) { return null; }
  }
  function gravarCache(chave, d) {
    try { localStorage.setItem(chave, JSON.stringify({ t: Date.now(), d })); } catch (e) { /* sem cache */ }
  }

  const pendentes = new Map();
  async function consultar(anexo, ano, ibge) {
    const chave = "siconfi:" + anexo + ":" + ano + ":" + ibge;
    const emCache = lerCache(chave);
    if (emCache) return emCache;
    if (pendentes.has(chave)) return pendentes.get(chave);

    const p = (async () => {
      // 1º: intermediário com cache na hospedagem (api/siconfi.php)
      try {
        const r = await fetch(PROXY + "?anexo=" + encodeURIComponent(anexo) + "&ano=" + ano + "&ente=" + ibge);
        if (r.ok) {
          const j = await r.json();
          if (Array.isArray(j.items)) {
            if (j.items.length) gravarCache(chave, j.items);
            return j.items;
          }
        }
      } catch (e) { /* segue para a consulta direta */ }

      // 2º: consulta direta ao Tesouro (pode falhar por CORS)
      let itens = [];
      let url = API + "?an_exercicio=" + ano + "&no_anexo=" + encodeURIComponent(anexo) + "&id_ente=" + ibge;
      for (let pagina = 0; url && pagina < 10; pagina++) {
        const r = await fetch(url);
        if (!r.ok) throw new Error("SICONFI respondeu " + r.status);
        const j = await r.json();
        itens = itens.concat(j.items || []);
        const prox = j.hasMore && (j.links || []).find((l) => l.rel === "next");
        url = prox ? prox.href : null;
      }
      if (itens.length) gravarCache(chave, itens);
      return itens;
    })();
    pendentes.set(chave, p);
    try { return await p; } finally { pendentes.delete(chave); }
  }

  /* ---------- Interpretação dos anexos ---------- */
  function lerDespesas(itens) {
    const liq = itens.filter((i) => i.coluna === "Despesas Liquidadas");
    const total = liq.find((i) => /^Despesas Exceto Intra/i.test(i.conta));
    const funcoes = liq
      .filter((i) => /^\d{2} - /.test(i.conta))
      .map((i) => ({ cod: i.conta.slice(0, 2), nome: i.conta.slice(5).trim(), valor: Number(i.valor) }))
      .filter((f) => f.valor > 0)
      .sort((a, b) => b.valor - a.valor);
    const populacao = (itens[0] && Number(itens[0].populacao)) || null;
    return { total: total ? Number(total.valor) : funcoes.reduce((s, f) => s + f.valor, 0), funcoes, populacao };
  }

  function lerReceitas(itens) {
    const brutas = itens.filter((i) => i.coluna === "Receitas Brutas Realizadas");
    const v = (cod) => { const i = brutas.find((x) => x.cod_conta === cod); return i ? Number(i.valor) : 0; };
    const total = v("ReceitasExcetoIntraOrcamentarias");
    const proprias = v("RO1.1.0.0.00.0.0");
    const royaltiesUniao = v("RO1.7.1.2.00.0.0");
    const royaltiesEstado = v("RO1.7.2.2.00.0.0");
    const uniao = v("RO1.7.1.0.00.0.0") - royaltiesUniao;
    const estadoSP = v("RO1.7.2.0.00.0.0") - royaltiesEstado;
    const patrimonial = v("RO1.3.0.0.00.0.0");
    const royalties = royaltiesUniao + royaltiesEstado;
    const fontes = [
      { nome: "Royalties e compensações (petróleo e recursos naturais)", valor: royalties },
      { nome: "Impostos, taxas e contribuições municipais", valor: proprias },
      { nome: "Transferências do Estado (ICMS, IPVA e outras)", valor: estadoSP },
      { nome: "Transferências da União (FPM, SUS e outras)", valor: uniao },
      { nome: "Rendimentos financeiros e patrimoniais", valor: patrimonial },
    ];
    const outras = total - fontes.reduce((s, f) => s + f.valor, 0);
    if (outras > 0) fontes.push({ nome: "Outras receitas (inclui FUNDEB e receitas de capital)", valor: outras });
    return { total, royalties, fontes: fontes.filter((f) => f.valor > 0).sort((a, b) => b.valor - a.valor) };
  }

  /* ---------- Desenho ---------- */
  function barra({ rotulo, valor, total, max, odsLista, detalhe }) {
    const pct = total ? (valor / total) * 100 : 0;
    const largura = max ? Math.max((valor / max) * 100, 0.8) : 0;
    const texto = rotulo + ": " + fmtMoedaCheia(valor) + " (" + fmtPct(pct) + ")" + (detalhe ? " · " + detalhe : "");
    return '<div class="barra-linha" tabindex="0" data-dica-texto="' + esc(texto) + '">' +
      '<div class="barra-cabeca"><span class="barra-rotulo">' + esc(rotulo) + "</span>" +
      (odsLista && odsLista.length ? selosODS(odsLista, 30) : "") + "</div>" +
      '<div class="barra-trilho"><span class="barra-preenchida" style="width:' + largura.toFixed(2) + '%"></span>' +
      '<span class="barra-valor">' + fmtPct(pct) + "</span></div></div>";
  }

  function desenharDespesas(d) {
    const alvo = document.querySelector("[data-despesas]");
    if (!d.funcoes.length) { alvo.innerHTML = '<p class="carregando">Sem dados de despesas para este ano.</p>'; return; }
    const max = d.funcoes[0].valor;
    const visiveis = d.funcoes.slice(0, 12);
    const resto = d.funcoes.slice(12).reduce((s, f) => s + f.valor, 0);
    alvo.innerHTML = visiveis.map((f) => barra({
      rotulo: f.nome, valor: f.valor, total: d.total, max, odsLista: FUNCOES[f.cod] || [],
      detalhe: d.populacao ? fmtMoedaCheia(f.valor / d.populacao) + " por habitante" : "",
    })).join("") +
      (resto > 0 ? barra({ rotulo: "Demais áreas", valor: resto, total: d.total, max }) : "");
  }

  function desenharReceitas(r) {
    const alvo = document.querySelector("[data-receitas]");
    if (!r.total) { alvo.innerHTML = '<p class="carregando">Sem dados de receitas para este ano.</p>'; return; }
    const max = r.fontes[0].valor;
    alvo.innerHTML = r.fontes.map((f) => barra({ rotulo: f.nome, valor: f.valor, total: r.total, max })).join("");
  }

  function desenharKPIs(d, r, m) {
    const kpi = (rotulo, valor, nota) =>
      '<div class="kpi"><span class="kpi-rotulo">' + rotulo + '</span><span class="kpi-valor">' + valor + "</span>" +
      (nota ? '<span class="kpi-nota">' + nota + "</span>" : "") + "</div>";
    const pop = d.populacao;
    document.querySelector("[data-kpis]").innerHTML =
      kpi("Receita realizada", r.total ? fmtMoeda(r.total) : "—", m.nome + " · " + estado.ano) +
      kpi("Despesa liquidada", fmtMoeda(d.total), r.total ? "Resultado: " + fmtMoeda(r.total - d.total) : "") +
      kpi("Despesa por habitante", pop ? fmtMoedaCheia(d.total / pop) : "—", pop ? pop.toLocaleString("pt-BR") + " habitantes" : "") +
      kpi("Peso dos royalties", r.total ? fmtPct((r.royalties / r.total) * 100) : "—", "da receita total");
  }

  async function atualizarMunicipio() {
    const m = municipios.find((x) => x.id === estado.municipio);
    const aviso = document.querySelector("[data-aviso]");
    aviso.hidden = true;
    ["[data-despesas]", "[data-receitas]"].forEach((s) => {
      document.querySelector(s).innerHTML = '<p class="carregando">Consultando o Tesouro Nacional…</p>';
    });
    try {
      const [ie, ic] = await Promise.all([
        consultar(ANEXO_DESPESAS, estado.ano, m.ibge),
        consultar(ANEXO_RECEITAS, estado.ano, m.ibge),
      ]);
      if (m.id !== estado.municipio) return; // usuário trocou de município durante a consulta
      if (!ie.length && !ic.length) {
        aviso.hidden = false;
        aviso.textContent = m.nome + " ainda não publicou a Declaração de Contas Anuais (DCA) de " + estado.ano + " no SICONFI. Escolha um ano anterior.";
        document.querySelector("[data-kpis]").innerHTML = "";
        document.querySelector("[data-despesas]").innerHTML = "";
        document.querySelector("[data-receitas]").innerHTML = "";
        return;
      }
      const d = lerDespesas(ie);
      const r = lerReceitas(ic);
      desenharKPIs(d, r, m);
      desenharDespesas(d);
      desenharReceitas(r);
      document.querySelector("[data-fonte]").innerHTML =
        "Fonte: Tesouro Nacional — SICONFI, Declaração de Contas Anuais (DCA) " + estado.ano +
        ", Anexos I-C e I-E, conforme declarado pela Prefeitura de " + esc(m.nome) +
        ". Despesas liquidadas e receitas brutas, exceto intraorçamentárias. Consulta automática à " +
        '<a href="https://apidatalake.tesouro.gov.br/docs/siconfi/" target="_blank" rel="noopener">API oficial</a>.';
    } catch (e) {
      aviso.hidden = false;
      aviso.innerHTML = "Não foi possível consultar o Tesouro Nacional agora. Tente novamente em alguns minutos ou veja o " +
        '<a href="' + esc(tceFiscal(m)) + '" target="_blank" rel="noopener">Observatório Fiscal do TCE-SP</a>.';
    }
  }

  async function atualizarComparacao() {
    const tabela = document.querySelector("[data-comparacao]");
    const ano = estado.ano;
    tabela.innerHTML = '<tbody><tr><td class="carregando">Consultando o Tesouro Nacional…</td></tr></tbody>';
    const linhas = [];
    for (const m of municipios) {
      try {
        const [ie, ic] = await Promise.all([consultar(ANEXO_DESPESAS, ano, m.ibge), consultar(ANEXO_RECEITAS, ano, m.ibge)]);
        const d = lerDespesas(ie);
        const r = lerReceitas(ic);
        const porArea = {};
        AREAS_COMPARACAO.forEach((a) => {
          const f = d.funcoes.find((x) => x.cod === a.cod);
          porArea[a.cod] = d.populacao && f ? f.valor / d.populacao : null;
        });
        linhas.push({ m, ok: ie.length > 0, total: d.populacao ? d.total / d.populacao : null, porArea, royalties: r.total ? (r.royalties / r.total) * 100 : null });
      } catch (e) {
        linhas.push({ m, ok: false });
      }
    }
    if (ano !== estado.ano) return;

    const colunas = [
      { rotulo: "Despesa total", ods: [], val: (l) => l.total, fmt: fmtMoedaCheia },
      ...AREAS_COMPARACAO.map((a) => ({ rotulo: a.rotulo, ods: FUNCOES[a.cod], val: (l) => l.porArea && l.porArea[a.cod], fmt: fmtMoedaCheia })),
      { rotulo: "Royalties na receita", ods: [], val: (l) => l.royalties, fmt: fmtPct },
    ];
    const cab = "<thead><tr><th scope=\"col\">Município</th>" + colunas.map((c) =>
      '<th scope="col"><span class="th-rotulo">' + esc(c.rotulo) + "</span>" + (c.ods.length ? selosODS(c.ods, 32) : "") +
      '<span class="th-unidade">' + (c.fmt === fmtPct ? "% da receita" : "R$ por habitante") + "</span></th>"
    ).join("") + "</tr></thead>";
    const corpo = "<tbody>" + linhas.map((l) => {
      if (!l.ok) return '<tr><th scope="row">' + esc(l.m.nome) + '</th><td colspan="' + colunas.length + '" class="sem-dado">Sem DCA ' + ano + " publicada no SICONFI</td></tr>";
      return '<tr><th scope="row">' + esc(l.m.nome) + "</th>" + colunas.map((c) => {
        const v = c.val(l);
        const max = Math.max(...linhas.filter((x) => x.ok).map((x) => c.val(x) || 0));
        if (v == null) return '<td class="sem-dado">—</td>';
        return '<td><span class="celula-valor">' + c.fmt(v) + '</span><span class="mini-trilho"><span style="width:' +
          (max ? (v / max) * 100 : 0).toFixed(1) + '%"></span></span></td>';
      }).join("") + "</tr>";
    }).join("") + "</tbody>";
    tabela.innerHTML = '<caption class="visualmente-oculto">Comparação entre os municípios do Litoral Norte, ' + ano + "</caption>" + cab + corpo;
  }

  /* ---------- Dica (tooltip) das barras ---------- */
  function mostrarDica(el, x, y) {
    dica.textContent = el.getAttribute("data-dica-texto");
    dica.hidden = false;
    const r = dica.getBoundingClientRect();
    const left = Math.min(Math.max(8, x - r.width / 2), innerWidth - r.width - 8);
    dica.style.left = left + "px";
    dica.style.top = Math.max(8, y - r.height - 12) + "px";
  }
  document.addEventListener("pointermove", (e) => {
    const el = e.target.closest && e.target.closest("[data-dica-texto]");
    if (el) mostrarDica(el, e.clientX, e.clientY); else dica.hidden = true;
  });
  document.addEventListener("focusin", (e) => {
    const el = e.target.closest && e.target.closest("[data-dica-texto]");
    if (el) { const r = el.getBoundingClientRect(); mostrarDica(el, r.left + r.width / 2, r.top); }
  });
  document.addEventListener("focusout", () => { dica.hidden = true; });
  addEventListener("scroll", () => { dica.hidden = true; }, { passive: true });

  /* ---------- Filtros ---------- */
  document.querySelector("[data-ods-topo]").innerHTML = selosODS([17, 16], 64).replace(/^<div class="selos">|<\/div>$/g, "");

  const segmentado = document.querySelector("[data-municipios]");
  segmentado.innerHTML = municipios.map((m) =>
    '<button type="button" role="radio" aria-checked="' + (m.id === estado.municipio) + '" data-id="' + m.id + '">' + esc(m.nome) + "</button>"
  ).join("");
  segmentado.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b || b.dataset.id === estado.municipio) return;
    estado.municipio = b.dataset.id;
    segmentado.querySelectorAll("button").forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    atualizarMunicipio();
  });
  segmentado.addEventListener("keydown", (e) => {
    if (!["ArrowLeft", "ArrowRight"].includes(e.key)) return;
    const bs = [...segmentado.querySelectorAll("button")];
    const i = bs.findIndex((b) => b.dataset.id === estado.municipio);
    const prox = bs[(i + (e.key === "ArrowRight" ? 1 : -1) + bs.length) % bs.length];
    prox.click(); prox.focus();
  });

  // A DCA de um ano é entregue até 30 de abril do ano seguinte
  const hoje = new Date();
  const ultimoAno = hoje.getFullYear() - (hoje.getMonth() >= 5 ? 1 : 2);
  const anos = [];
  for (let a = ultimoAno; a >= 2018; a--) anos.push(a);
  const seletorAno = document.querySelector("[data-ano]");
  seletorAno.innerHTML = anos.map((a) => '<option value="' + a + '">' + a + "</option>").join("");
  estado.ano = ultimoAno;
  seletorAno.addEventListener("change", () => {
    estado.ano = Number(seletorAno.value);
    atualizarMunicipio();
    atualizarComparacao();
  });

  document.querySelector("[data-tce]").innerHTML = municipios.map((m) =>
    '<a class="chip chip-cidade" style="--cor-cidade:' + m.cor + '" href="' + esc(tceFiscal(m)) + '" target="_blank" rel="noopener">' + esc(m.nome) + "</a>"
  ).join("");

  atualizarMunicipio().then(atualizarComparacao);
})();
