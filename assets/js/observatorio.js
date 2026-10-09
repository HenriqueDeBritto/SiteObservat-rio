/* Monta a página do Observatório a partir de dados.js */
(function () {
  "use strict";
  const { temas, municipios } = window.LNS;
  const { icone, esc, selosODS, corTema } = window.LNS.ui;

  const ETIQUETAS = {
    oficial: '<span class="etiqueta etiqueta-oficial">Dado oficial</span>',
    tableau: '<span class="etiqueta etiqueta-tableau">Painel</span>',
    mapa: '<span class="etiqueta etiqueta-mapa">Mapa</span>',
  };

  function chip(link) {
    const cidade = link.cidade && municipios.find((m) => m.id === link.cidade);
    const estiloCidade = cidade ? ' style="--cor-cidade:' + cidade.cor + '"' : "";
    const classeCidade = cidade ? " chip-cidade" : "";
    if (link.tipo === "tableau") {
      return '<a class="chip' + classeCidade + '"' + estiloCidade + ' href="' + esc(link.url) + '" data-tableau="' + esc(link.titulo || link.rotulo) + '">' +
        (cidade ? "" : icone("painel")) + esc(link.rotulo) + "</a>";
    }
    if (link.tipo === "mapa") {
      return '<a class="chip" href="' + esc(link.url) + '" data-mapa="' + esc(link.rotulo) + '">' + icone("mapa") + esc(link.rotulo) + "</a>";
    }
    if (link.interno) return '<a class="chip" href="' + esc(link.url) + '">' + esc(link.rotulo) + " →</a>";
    return '<a class="chip' + classeCidade + '"' + estiloCidade + ' href="' + esc(link.url) + '" target="_blank" rel="noopener">' +
      esc(link.rotulo) + icone(link.tipo === "mapa" ? "mapa" : "externo") + "</a>";
  }

  function chipsDoGrupo(grupo) {
    const lista = [];
    grupo.links.forEach((l) => {
      if (l.porCidade) {
        municipios.forEach((m) => lista.push({ rotulo: m.nome, url: l.porCidade(m), cidade: m.id }));
      } else {
        const titulo = grupo.links.length === 1 ? grupo.titulo : grupo.titulo + " — " + l.rotulo;
        lista.push(Object.assign({ titulo }, l));
      }
    });
    return lista.map(chip).join("");
  }

  function etiquetaDoGrupo(grupo) {
    if (grupo.etiqueta) return ETIQUETAS[grupo.etiqueta] || "";
    const tipos = grupo.links.map((l) => l.tipo);
    if (tipos.length && tipos.every((t) => t === "tableau")) return ETIQUETAS.tableau;
    return "";
  }

  function blocoTema(t) {
    return '<section class="bloco-tema" id="' + t.id + '" style="--cor:' + corTema(t) + '" aria-labelledby="t-' + t.id + '">' +
      '<div class="bloco-tema-info">' +
      selosODS(t.ods, 72) +
      '<h2 id="t-' + t.id + '">' + esc(t.titulo) + "</h2>" +
      "<p>" + esc(t.resumo) + "</p>" +
      "</div>" +
      '<div class="grupos">' +
      t.grupos.map((g) =>
        '<article class="grupo">' +
        '<div class="grupo-topo"><div><h3>' + esc(g.titulo) + '</h3><p class="grupo-fonte">' + esc(g.fonte) + "</p></div>" + etiquetaDoGrupo(g) + "</div>" +
        '<div class="chips">' + chipsDoGrupo(g) + "</div>" +
        (g.nota ? '<p class="grupo-desc">' + esc(g.nota) + "</p>" : "") +
        "</article>"
      ).join("") +
      "</div></section>";
  }

  // Navegação por tema
  const nav = document.querySelector("[data-nav-temas]");
  nav.innerHTML = temas.map((t) =>
    '<a href="#' + t.id + '" style="--cor:' + corTema(t) + '"><i></i>' + esc(t.titulo) + "</a>"
  ).join("");

  document.querySelector("[data-temas]").innerHTML = temas.map(blocoTema).join("");

  // Destaca o tema visível na barra de navegação
  const links = new Map([...nav.querySelectorAll("a")].map((a) => [a.getAttribute("href").slice(1), a]));
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove("ativo"));
      const a = links.get(en.target.id);
      if (a) {
        a.classList.add("ativo");
        nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  document.querySelectorAll(".bloco-tema").forEach((s) => observador.observe(s));
})();
