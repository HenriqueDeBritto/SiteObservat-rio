/* ==========================================================================
   Componentes comuns: cabeçalho, rodapé, menu mobile, ícones e visualizador
   de painéis Tableau. Depende de dados.js.
   ========================================================================== */
(function () {
  "use strict";
  const LNS = window.LNS;

  /* ---------- Ícones (traço, 24×24) ---------- */
  const ICONES = {
    moeda: '<circle cx="12" cy="12" r="9"/><path d="M15 9.5c-.6-1-1.7-1.5-3-1.5-1.7 0-3 .9-3 2.2 0 3 6 1.6 6 4.6 0 1.3-1.3 2.2-3 2.2-1.4 0-2.6-.6-3.1-1.6M12 6.5v11"/>',
    pessoas: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.5-3.4 3-5.5 6-5.5s5.5 2.1 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.5 14.6c2.5.2 4.2 2 4.5 4.9"/>',
    coracao: '<path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0 1 12 7a4.3 4.3 0 0 1 7.5 2.8C19.5 15.4 12 20 12 20Z"/><path d="M4.5 12h3.5l1.5-2.5 2.5 5 1.5-2.5h6"/>',
    livro: '<path d="M4 5.5C6.5 4.5 9.5 4.5 12 6c2.5-1.5 5.5-1.5 8-.5V19c-2.5-1-5.5-1-8 .5-2.5-1.5-5.5-1.5-8-.5Z"/><path d="M12 6v13.5"/>',
    gota: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11Z"/><path d="M9.5 14.5a2.5 2.5 0 0 0 2.5 2.5"/>',
    raio: '<path d="M13 2.5 5 13.5h6l-1 8 8-11h-6l1-8Z"/>',
    grafico: '<path d="M4 20V4M4 20h16"/><path d="m7 15 4-4 3 3 5-6"/><path d="M15 8h4v4"/>',
    predio: '<path d="M4 21V8l6-4v17M10 21V10h10v11M3 21h18"/><path d="M13 13h1M16 13h1M13 16h1M16 16h1M6.5 10h1M6.5 13h1M6.5 16h1"/>',
    folha: '<path d="M5 19c0-8 5-14 15-15-1 10-7 15-15 15Z"/><path d="M5 19c3-4 6-7 10-9"/>',
    maos: '<path d="M7 11.5V6.8a1.4 1.4 0 0 1 2.8 0V11M9.8 10V5.4a1.4 1.4 0 0 1 2.8 0V10M12.6 10V6.2a1.4 1.4 0 0 1 2.8 0V12"/><path d="M15.4 9.5a1.4 1.4 0 0 1 2.8 0V14a7 7 0 0 1-7 7 6.4 6.4 0 0 1-5.4-3l-2.4-3.8a1.5 1.5 0 0 1 2.5-1.6L7 13.5"/>',
    balanca: '<path d="M12 3v18M7 21h10M5 7h14M5 7l-3 7a3.5 3.5 0 0 0 6 0L5 7ZM19 7l-3 7a3.5 3.5 0 0 0 6 0l-3-7Z"/>',
    externo: '<path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
    painel: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 16v-4M11 16V8M15 16v-6M19 16v-2"/>',
    mapa: '<path d="m9 4-6 2.5v13.5l6-2.5 6 2.5 6-2.5V4l-6 2.5L9 4Z"/><path d="M9 4v13.5M15 6.5V20"/>',
    fechar: '<path d="M6 6l12 12M18 6 6 18"/>',
  };
  function icone(nome, extra) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"' +
      (extra ? " " + extra : "") + ">" + (ICONES[nome] || "") + "</svg>";
  }

  /* ---------- Navegação ---------- */
  const PAGINAS = [
    { href: "index.html", rotulo: "Início" },
    { href: "observatorio.html", rotulo: "Observatório" },
    { href: "orcamento.html", rotulo: "Orçamento" },
    { href: "mapas.html", rotulo: "Mapas" },
    { href: "biblioteca.html", rotulo: "Biblioteca" },
    { href: "gts-agenda-2030.html", rotulo: "GTs Agenda 2030" },
    { href: "agenda.html", rotulo: "Agenda" },
    { href: "a-rede.html", rotulo: "A Rede" },
  ];
  const atual = (location.pathname.split("/").pop() || "index.html").toLowerCase();

  const marcaHTML =
    '<img src="assets/img/logo-trevo.svg" alt="" width="40" height="40">' +
    '<span class="marca-texto"><strong>Litoral Norte Sustentável</strong><small>Rede · Observatório ODS</small></span>';

  function faixaODS() {
    return '<div class="faixa-ods" aria-hidden="true">' +
      LNS.ods.map((o) => '<span style="background:var(--ods-' + o.n + ')"></span>').join("") + "</div>";
  }

  function montarTopo() {
    const alvo = document.querySelector("[data-topo]");
    if (!alvo) return;
    const links = PAGINAS.map((p) =>
      '<a href="' + p.href + '"' + (p.href === atual ? ' aria-current="page"' : "") + ">" + p.rotulo + "</a>"
    ).join("");
    alvo.outerHTML =
      '<a class="pular-conteudo" href="#conteudo">Pular para o conteúdo</a>' +
      '<header class="topo">' + faixaODS() +
      '<div class="container topo-inner">' +
      '<a class="marca" href="index.html" aria-label="Litoral Norte Sustentável — página inicial">' + marcaHTML + "</a>" +
      '<button class="menu-botao" type="button" aria-expanded="false" aria-controls="menu-principal" aria-label="Abrir menu"><span></span><span></span><span></span></button>' +
      '<nav id="menu-principal" class="menu" aria-label="Principal">' + links + "</nav>" +
      "</div></header>";

    const botao = document.querySelector(".menu-botao");
    const menu = document.getElementById("menu-principal");
    botao.addEventListener("click", () => {
      const aberto = botao.getAttribute("aria-expanded") === "true";
      botao.setAttribute("aria-expanded", String(!aberto));
      botao.setAttribute("aria-label", aberto ? "Abrir menu" : "Fechar menu");
      menu.classList.toggle("aberto", !aberto);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && menu.classList.contains("aberto")) { botao.click(); botao.focus(); }
    });
  }

  function montarRodape() {
    const alvo = document.querySelector("[data-rodape]");
    if (!alvo) return;
    const email = LNS.contato.emailObservatorio;
    alvo.outerHTML =
      '<footer class="rodape">' + faixaODS() +
      '<div class="container rodape-grade">' +
      '<div class="rodape-marca"><a href="index.html" aria-label="Litoral Norte Sustentável — página inicial">' +
      '<img src="assets/img/logo-rede-trevo-nomes-512.png" alt="Trevo da Rede Litoral Norte Sustentável com os nomes de Caraguatatuba, Ilhabela, São Sebastião e Ubatuba" width="132" height="132" loading="lazy"></a>' +
      "<div><strong>Rede Litoral Norte Sustentável</strong>" +
      "<p>Rede de organizações da sociedade civil, movimentos sociais e cidadãos que articulam o desenvolvimento sustentável do Litoral Norte de São Paulo.</p></div></div>" +
      '<div><h2>Navegação</h2><ul>' + PAGINAS.map((p) => '<li><a href="' + p.href + '">' + p.rotulo + "</a></li>").join("") + "</ul></div>" +
      '<div><h2>Contato</h2><ul>' +
      '<li>Contato/email: <a href="mailto:' + email + '">' + email + "</a></li>" +
      '<li><a href="https://docs.google.com/forms/d/e/1FAIpQLSfZKSjTEA_LbrijUlBFO_mzzLYNM_NlfUvyIz8gx2ejeeJ7-g/viewform" target="_blank" rel="noopener">Junte-se à Rede / Cadastre-se</a></li>' +
      "</ul></div>" +
      "</div>" +
      '<div class="container rodape-base"><span>© ' + new Date().getFullYear() + " Rede Litoral Norte Sustentável · Instituto Ilhabela Sustentável</span>" +
      "<span>Caraguatatuba · Ilhabela · São Sebastião · Ubatuba</span></div>" +
      "</footer>";
  }

  /* ---------- Visualizador de painéis Tableau ---------- */
  let modal;
  function criarModal() {
    modal = document.createElement("div");
    modal.className = "modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "modal-titulo");
    modal.innerHTML =
      '<div class="modal-caixa">' +
      '<div class="modal-topo"><h2 id="modal-titulo"></h2><div class="modal-acoes">' +
      '<a class="modal-externo" target="_blank" rel="noopener">' + icone("externo", 'width="16" height="16"') + '<span class="texto-longo">Abrir no Tableau</span></a>' +
      '<button type="button" class="modal-fechar" aria-label="Fechar">' + icone("fechar", 'width="16" height="16"') + "Fechar</button>" +
      "</div></div>" +
      '<div class="modal-corpo"><div class="modal-carregando">Carregando…</div></div>' +
      "</div>";
    document.body.appendChild(modal);
    modal.querySelector(".modal-fechar").addEventListener("click", fecharModal);
    modal.addEventListener("click", (e) => { if (e.target === modal) fecharModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && modal.classList.contains("aberto")) fecharModal(); });
  }
  let origemFoco = null;
  // Abre um painel Tableau, um mapa (Google My Maps) ou outra página incorporável no visualizador
  function abrirVisualizador(tipo, url, titulo) {
    if (!modal) criarModal();
    origemFoco = document.activeElement;
    const sep = url.includes("?") ? "&" : "?";
    let embed = url, externo = url, rotuloExterno = "Abrir em nova aba";
    if (tipo === "tableau") {
      embed = url + sep + ":embed=y&:showVizHome=no&:toolbar=bottom&:language=pt-BR";
      externo = url + sep + ":showVizHome=no";
      rotuloExterno = "Abrir no Tableau";
    } else if (tipo === "mapa") {
      embed = url.replace("/maps/d/viewer", "/maps/d/embed").replace("/maps/d/u/0/viewer", "/maps/d/embed");
      externo = url.replace("/maps/d/embed", "/maps/d/viewer");
      rotuloExterno = "Abrir no Google Maps";
    }
    modal.querySelector("#modal-titulo").textContent = titulo;
    modal.querySelector(".modal-externo").href = externo;
    modal.querySelector(".modal-externo .texto-longo").textContent = rotuloExterno;
    const corpo = modal.querySelector(".modal-corpo");
    corpo.querySelectorAll("iframe").forEach((f) => f.remove());
    const carregando = corpo.querySelector(".modal-carregando");
    carregando.hidden = false;
    const iframe = document.createElement("iframe");
    iframe.title = titulo;
    iframe.src = embed;
    iframe.allowFullscreen = true;
    iframe.addEventListener("load", () => { carregando.hidden = true; });
    corpo.appendChild(iframe);
    modal.classList.add("aberto");
    document.body.style.overflow = "hidden";
    modal.querySelector(".modal-fechar").focus();
  }
  function fecharModal() {
    modal.classList.remove("aberto");
    modal.querySelectorAll("iframe").forEach((f) => f.remove());
    document.body.style.overflow = "";
    if (origemFoco) origemFoco.focus();
  }
  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-tableau], [data-mapa]");
    if (!a || e.ctrlKey || e.metaKey || e.shiftKey) return;
    e.preventDefault();
    const tipo = a.hasAttribute("data-tableau") ? "tableau" : "mapa";
    abrirVisualizador(tipo, a.getAttribute("href"), a.getAttribute("data-" + tipo));
  });

  /* ---------- Utilidades ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }
  // Ícones oficiais dos ODS (tamanho em px)
  function selosODS(lista, tamanho) {
    const t = tamanho || 40;
    return '<div class="selos">' + lista.map((n) => {
      const o = LNS.ods[n - 1];
      return '<img class="selo-ods" src="' + o.icone + '" width="' + t + '" height="' + t + '" alt="ODS ' + n + " — " + esc(o.nome) +
        '" title="ODS ' + n + " — " + esc(o.nome) + '" loading="lazy">';
    }).join("") + "</div>";
  }
  function corTema(tema) { return "var(--ods-" + tema.ods[0] + ")"; }

  montarTopo();
  montarRodape();

  window.LNS.ui = { icone, esc, selosODS, corTema, abrirVisualizador };
})();
