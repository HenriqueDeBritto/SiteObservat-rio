<?php
/**
 * Intermediário (proxy com cache) para a API do SICONFI — Tesouro Nacional.
 *
 * O navegador não consegue consultar a API do Tesouro de forma confiável
 * (o CDN deles às vezes devolve respostas sem cabeçalhos CORS). Este script
 * roda na hospedagem, consulta o Tesouro, guarda a resposta em cache e a
 * entrega ao site.
 *
 * Uso: api/siconfi.php?anexo=DCA-Anexo%20I-E&ano=2025&ente=3520400
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

// Somente o que o site precisa — nada além disso é repassado ao Tesouro
const ANEXOS_PERMITIDOS = ['DCA-Anexo I-E', 'DCA-Anexo I-C'];
const ENTES_PERMITIDOS  = [3510500, 3520400, 3550704, 3555406]; // Caraguatatuba, Ilhabela, São Sebastião, Ubatuba
const API               = 'https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca';
const CACHE_COM_DADOS   = 30 * 86400; // DCA já entregue raramente muda
const CACHE_SEM_DADOS   = 86400;      // ano ainda não entregue: tentar de novo amanhã

function responder(int $status, array $corpo): void {
    http_response_code($status);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE);
    exit;
}

$anexo = $_GET['anexo'] ?? '';
$ano   = filter_var($_GET['ano'] ?? '', FILTER_VALIDATE_INT, ['options' => ['min_range' => 2015, 'max_range' => 2100]]);
$ente  = filter_var($_GET['ente'] ?? '', FILTER_VALIDATE_INT);

if (!in_array($anexo, ANEXOS_PERMITIDOS, true) || $ano === false || !in_array($ente, ENTES_PERMITIDOS, true)) {
    responder(400, ['erro' => 'Parâmetros inválidos.']);
}

$pastaCache = __DIR__ . '/cache';
if (!is_dir($pastaCache)) {
    @mkdir($pastaCache, 0755, true);
}
$arquivoCache = $pastaCache . '/dca-' . md5($anexo) . "-$ano-$ente.json";

// 1) Cache válido
if (is_file($arquivoCache)) {
    $conteudo = file_get_contents($arquivoCache);
    $dados = json_decode($conteudo, true);
    $validade = !empty($dados['items']) ? CACHE_COM_DADOS : CACHE_SEM_DADOS;
    if ($dados !== null && (time() - filemtime($arquivoCache)) < $validade) {
        header('Cache-Control: public, max-age=86400');
        header('X-Cache-Local: HIT');
        echo $conteudo;
        exit;
    }
}

// 2) Consulta ao Tesouro (com paginação)
function baixar(string $url): ?array {
    if (function_exists('curl_init')) {
        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_TIMEOUT        => 45,
            CURLOPT_USERAGENT      => 'LitoralNorteSustentavel/1.0',
        ]);
        $corpo = curl_exec($ch);
        $codigo = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
    } else {
        $ctx = stream_context_create(['http' => ['timeout' => 45, 'user_agent' => 'LitoralNorteSustentavel/1.0']]);
        $corpo = @file_get_contents($url, false, $ctx);
        $codigo = $corpo === false ? 0 : 200;
    }
    if ($corpo === false || $codigo !== 200) {
        return null;
    }
    return json_decode($corpo, true);
}

$url = API . '?' . http_build_query(['an_exercicio' => $ano, 'no_anexo' => $anexo, 'id_ente' => $ente], '', '&', PHP_QUERY_RFC3986);
$itens = [];
for ($pagina = 0; $url && $pagina < 10; $pagina++) {
    $json = baixar($url);
    if ($json === null) {
        // Tesouro fora do ar: entrega o cache antigo, se houver
        if (is_file($arquivoCache)) {
            header('X-Cache-Local: STALE');
            echo file_get_contents($arquivoCache);
            exit;
        }
        responder(502, ['erro' => 'Não foi possível consultar o Tesouro Nacional agora.']);
    }
    $itens = array_merge($itens, $json['items'] ?? []);
    $url = null;
    if (!empty($json['hasMore'])) {
        foreach ($json['links'] ?? [] as $link) {
            if (($link['rel'] ?? '') === 'next') {
                $url = $link['href'];
            }
        }
    }
}

$saida = json_encode(['items' => $itens, 'consultado_em' => date('c')], JSON_UNESCAPED_UNICODE);
@file_put_contents($arquivoCache, $saida, LOCK_EX);
header('Cache-Control: public, max-age=86400');
header('X-Cache-Local: MISS');
echo $saida;
