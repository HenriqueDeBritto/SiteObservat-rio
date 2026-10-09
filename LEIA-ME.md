# Site Litoral Norte Sustentável

Site unificado da **Rede Litoral Norte Sustentável** e do **Observatório do Desenvolvimento Sustentável**. Substitui os dois sites antigos do Google Sites.

Feito com HTML, CSS e JavaScript puros, sem instalação ou build. Só a página de Orçamento usa um pequeno script PHP, que a HostGator já suporta.

## Páginas

| Arquivo | Conteúdo |
|---|---|
| `index.html` | Início: a Rede, o Observatório em destaque, os 17 ODS e a população dos municípios (IBGE ao vivo) |
| `observatorio.html` | Os 11 temas do Observatório com links e painéis Tableau |
| `orcamento.html` | Receitas e despesas das 4 prefeituras (Tesouro Nacional/SICONFI ao vivo) |
| `mapas.html` | Mapas do Google My Maps e sistemas geográficos |
| `biblioteca.html` | eBiblioteca (pasta do Google Drive) e documentos em destaque |
| `gts-agenda-2030.html` | GT Agenda 2030/ODS Ilhabela e seus projetos |
| `agenda.html` | Agenda da Rede (Google Agenda) |
| `a-rede.html` | Quem somos, comitê mobilizador, Diálogo Socioambiental e adesões |

## Onde editar

- **Links e textos dos temas do Observatório:** `assets/js/dados.js`. Cada tema tem título, resumo, ODS relacionados e grupos de links. Um link com `tipo: "tableau"` abre o painel dentro do site; `porCidade` gera automaticamente um link para cada município.
- **Cores, fontes e espaçamentos:** `assets/css/estilo.css`. As cores ficam no início, em `:root`.
- **Menu e rodapé:** `assets/js/site.js`, na lista `PAGINAS`. O e-mail de contato está em `dados.js`, em `contato`.
- **Ícones dos ODS:** `assets/img/ods/`. São os ícones oficiais da ONU em português e **não devem ser alterados**.

## Testar no computador

```
powershell -ExecutionPolicy Bypass -File ferramentas\servidor-local.ps1
```

Depois abra `http://localhost:8080`. O servidor local também simula o `api/siconfi.php`.

## Publicar na HostGator

1. No cPanel, abra o **Gerenciador de Arquivos** (ou use FTP) e entre em `public_html`. Se for um subdomínio, entre na pasta dele.
2. Envie **todo o conteúdo do projeto, exceto**:
   - `_edicao-imagens/` (material de trabalho)
   - `ferramentas/` (só serve para testes locais)
   - `.claude/`
   - `LEIA-ME.md` (opcional)
3. Confira se a pasta `api/cache/` tem permissão de escrita (755). O `.htaccess` dentro dela bloqueia o acesso público ao cache.
4. Teste em `https://SEU-DOMINIO/api/siconfi.php?anexo=DCA-Anexo%20I-E&ano=2025&ente=3520400`. A resposta deve ser um JSON com `"items"`.
5. Ative o SSL gratuito (AutoSSL) no cPanel.

### Domínio

Hoje o domínio `litoralnortesustentavel.org.br` está hospedado na **Hostinger**, com DNS na **weblink.com.br**. O subdomínio `observatorio.` aponta para o Google Sites. Para publicar na HostGator:

- Aponte o domínio (registro A, ou os servidores DNS) para a HostGator.
- Decida o que acontece com `observatorio.litoralnortesustentavel.org.br`. Sugestão: redirecionar para `https://litoralnortesustentavel.org.br/observatorio.html`, para não quebrar links antigos.

## Fontes de dados ao vivo

- **IBGE:** população estimada (API de agregados do IBGE), consultada direto pelo navegador.
- **Tesouro Nacional / SICONFI:** DCA anexos I-C (receitas) e I-E (despesas por função), via `api/siconfi.php`, com cache de 30 dias. O cache é necessário porque o CDN do Tesouro nem sempre envia cabeçalhos CORS.
- **Tableau Public:** painéis do Observatório, abertos num visualizador dentro do site.
