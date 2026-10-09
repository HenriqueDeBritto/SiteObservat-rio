# Servidor local simples para testar o site (não é necessário em produção).
# Uso: powershell -ExecutionPolicy Bypass -File ferramentas\servidor-local.ps1 [-Porta 8080]
param([int]$Porta = $(if ($env:PORT) { [int]$env:PORT } else { 8080 }))

$raiz = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$tipos = @{
  ".html" = "text/html; charset=utf-8"; ".css" = "text/css; charset=utf-8"; ".js" = "text/javascript; charset=utf-8"
  ".json" = "application/json; charset=utf-8"; ".svg" = "image/svg+xml"; ".png" = "image/png"; ".jpg" = "image/jpeg"
  ".jpeg" = "image/jpeg"; ".webp" = "image/webp"; ".ico" = "image/x-icon"; ".txt" = "text/plain; charset=utf-8"
}

$ouvinte = New-Object System.Net.HttpListener
$ouvinte.Prefixes.Add("http://localhost:$Porta/")
$ouvinte.Start()
Write-Host "Servindo $raiz em http://localhost:$Porta/ (Ctrl+C para parar)"

try {
  while ($ouvinte.IsListening) {
    $ctx = $ouvinte.GetContext()
    try {
      $caminho = [Uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath.TrimStart("/"))
      if ($caminho -eq "") { $caminho = "index.html" }

      # Simula api/siconfi.php (na hospedagem quem responde é o PHP, com cache)
      if ($caminho -eq "api/siconfi.php") {
        $q = $ctx.Request.QueryString
        $url = "https://apidatalake.tesouro.gov.br/ords/siconfi/tt/dca?an_exercicio=$($q['ano'])&no_anexo=$([Uri]::EscapeDataString($q['anexo']))&id_ente=$($q['ente'])"
        try {
          $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 60
          $texto = [Text.Encoding]::UTF8.GetString($resp.RawContentStream.ToArray())
          $itens = ($texto | ConvertFrom-Json).items
          $json = ConvertTo-Json -InputObject @{ items = @($itens) } -Depth 5 -Compress
          $bytes = [Text.Encoding]::UTF8.GetBytes($json)
          $ctx.Response.ContentType = "application/json; charset=utf-8"
        } catch {
          $ctx.Response.StatusCode = 502
          $bytes = [Text.Encoding]::UTF8.GetBytes('{"erro":"falha ao consultar o Tesouro"}')
        }
        $ctx.Response.ContentLength64 = $bytes.Length
        $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        continue
      }
      $arquivo = [IO.Path]::GetFullPath((Join-Path $raiz $caminho))
      if ((Test-Path $arquivo -PathType Container)) { $arquivo = Join-Path $arquivo "index.html" }

      if ($arquivo.StartsWith($raiz) -and (Test-Path $arquivo -PathType Leaf)) {
        $bytes = [IO.File]::ReadAllBytes($arquivo)
        $ext = [IO.Path]::GetExtension($arquivo).ToLower()
        $ctx.Response.ContentType = if ($tipos.ContainsKey($ext)) { $tipos[$ext] } else { "application/octet-stream" }
        $ctx.Response.Headers.Add("Cache-Control", "no-store")
      } else {
        $ctx.Response.StatusCode = 404
        $bytes = [Text.Encoding]::UTF8.GetBytes("404 - nao encontrado: $caminho")
      }
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch {
      Write-Host "Erro em $($ctx.Request.Url): $($_.Exception.Message)"
    } finally {
      $ctx.Response.Close()
    }
  }
} finally {
  $ouvinte.Stop()
}
