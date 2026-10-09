/* Página inicial: mosaico ODS, cartões de tema e população dos municípios (IBGE ao vivo) */
(function () {
  "use strict";
  const { ods, temas, municipios } = window.LNS;
  const { esc, selosODS, corTema } = window.LNS.ui;

  // Ícones dos ODS no hero
  document.querySelector("[data-ods-mini]").innerHTML =
    ods.map((o) => '<img src="' + o.icone + '" width="26" height="26" alt="">').join("");

  // Mosaico: cada ODS leva ao primeiro tema do Observatório relacionado a ele
  const temaDoODS = (n) => temas.find((t) => t.ods.includes(n));
  document.querySelector("[data-mosaico]").innerHTML =
    ods.map((o) => {
      const t = temaDoODS(o.n);
      const href = t ? "observatorio.html#" + t.id : "observatorio.html";
      return '<a href="' + href + '" style="--cor:var(--ods-' + o.n + ')" title="ODS ' + o.n + " — " + esc(o.nome) + '">' +
        '<img src="' + o.icone + '" alt="ODS ' + o.n + " — " + esc(o.nome) + '" width="180" height="180" loading="lazy"></a>';
    }).join("") +
    '<a class="mosaico-agenda" href="observatorio.html"><b>Agenda<br>2030</b><small>Ver o Observatório →</small></a>';

  // Cartões de tema
  document.querySelector("[data-temas-cartoes]").innerHTML = temas.map((t) =>
    '<a class="tema" href="observatorio.html#' + t.id + '" style="--cor:' + corTema(t) + '">' +
    selosODS(t.ods, 52) +
    "<h3>" + esc(t.titulo) + "</h3><p>" + esc(t.resumo) + "</p>" +
    '<span class="seta">Ver dados </span></a>'
  ).join("");

  // Municípios
  const alvo = document.querySelector("[data-municipios]");
  alvo.innerHTML = municipios.map((m) =>
    '<article class="cidade" style="--cor:' + m.cor + '">' +
    '<img class="cidade-foto" src="assets/img/cidades/' + m.id + '.jpg" alt="Paisagem de ' + esc(m.nome) + '" width="1000" height="747" loading="lazy">' +
    '<div class="cidade-corpo">' +
    "<h3>" + esc(m.nome) + "</h3>" +
    '<span class="cidade-pop" data-pop="' + m.ibge + '">—</span>' +
    '<span class="cidade-rotulo">habitantes</span>' +
    '<div class="cidade-links">' +
    '<a href="https://cidades.ibge.gov.br/brasil/sp/' + m.id + '/panorama" target="_blank" rel="noopener">IBGE Cidades</a>' +
    '<a href="https://idsc.cidadessustentaveis.org.br/#/cidade/' + m.ibge + '" target="_blank" rel="noopener">IDSC-BR</a>' +
    "</div></div></article>"
  ).join("");

  // População estimada — API de agregados do IBGE (tabela 6579, variável 9324)
  const ids = municipios.map((m) => m.ibge).join(",");
  const url = "https://servicodados.ibge.gov.br/api/v3/agregados/6579/periodos/-1/variaveis/9324?localidades=N6[" + ids + "]";
  fetch(url)
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((dados) => {
      let ano = "";
      dados[0].resultados[0].series.forEach((s) => {
        ano = Object.keys(s.serie)[0];
        const el = alvo.querySelector('[data-pop="' + s.localidade.id + '"]');
        if (el) el.textContent = Number(s.serie[ano]).toLocaleString("pt-BR");
      });
      document.querySelector("[data-fonte-pop]").textContent =
        "Fonte: IBGE — Estimativas da população residente, " + ano + " (consulta automática à API oficial do IBGE).";
    })
    .catch(() => {
      document.querySelector("[data-fonte-pop]").textContent =
        "Não foi possível consultar o IBGE agora. Veja os dados completos no IBGE Cidades.";
    });
})();
