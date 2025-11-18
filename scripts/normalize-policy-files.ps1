Param()

# تطبيع معرفات العناوين داخل ملفات السياسات وإضافة معرف مطابق لكود السياسة
# - يزيل المعرفات اليدوية القديمة من h2/h3/h4
# - يستخرج كود السياسة (مثل GOV-002) من النص أو من المعرف القديم
# - يضيف السمة id="CODE-NNN" للعناوين، ويحقن الكود في بداية النص إن لم يكن موجودًا

$ErrorActionPreference = 'Stop'

$prefixMap = @{
  'gov'='GOV'; 'lgl'='LGL'; 'hr'='HR'; 'fin'='FIN'; 'acc'='ACC'; 'it'='IT';
  'PMO'='PMO'; 'proc'='PROC'; 'qaqc'='QAQC'; 'ten'='TEN'; 'am'='AM'; 'cc'='CC'; 'hse'='HSE'
}

function Get-CodeFromId([string]$id) {
  if (-not $id) { return $null }
  $lower = $id.ToLower()
  $m = [regex]::Match($lower, '\b(gov|lgl|hr|fin|acc|it|PMO|proc|qaqc|ten|am|cc|hse)[-_]?(\d{3,})\b')
  if ($m.Success) {
    $prefix = $m.Groups[1].Value.ToUpper()
    $num = [int]$m.Groups[2].Value
    return "$prefix-{0:D3}" -f $num
  }
  return $null
}

function Ensure-CodeAtStart([string]$text, [string]$code) {
  if (-not $code) { return $text }
  if ($text -match '^\s*[A-Z]{2,5}-\d{3}\b') { return $text }
  return "${code}: $text"
}

$root = Split-Path -Parent $PSScriptRoot
$policiesDir = Join-Path -Path $root -ChildPath 'policies'
if (-not (Test-Path -LiteralPath $policiesDir)) {
  throw "Policies directory not found: $policiesDir"
}
$files = Get-ChildItem -Path $policiesDir -Filter '*.html'

foreach ($f in $files) {
  Write-Host "Processing" $f.FullName
  $content = Get-Content -Raw -LiteralPath $f.FullName

  # Pass 1: headings with manual id -> derive code, remove old id, add id=CODE and inject code to text
  $pattern1 = '(?s)<h([234])([^>]*)\sid="([^"]+)"([^>]*)>(.*?)</h\1>'
  $evaluator1 = [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    $level = $m.Groups[1].Value
    $attrsLeft = $m.Groups[2].Value
    $oldId = $m.Groups[3].Value
    $attrsRight = $m.Groups[4].Value
    $inner = $m.Groups[5].Value

    $code = $null
    $codeMatch = [regex]::Match($inner, '\b([A-Z]{2,5}-\d{3})\b')
    if ($codeMatch.Success) { $code = $codeMatch.Groups[1].Value }
    if (-not $code) { $code = Get-CodeFromId $oldId }

    $attrs = ($attrsLeft + $attrsRight) -replace '\sid="[^"]+"',''
    if ($code) {
      $inner = Ensure-CodeAtStart $inner $code
      return "<h$level id=""$code""$attrs>$inner</h$level>"
    } else {
      return "<h$level$attrs>$inner</h$level>"
    }
  }
  $content = [regex]::Replace($content, $pattern1, $evaluator1)

  # Pass 2: headings without id but with code in the text -> add id=CODE
  $pattern2 = '(?s)<h([234])((?![^>]*\sid=)[^>]*)>(\s*([A-Z]{2,5}-\d{3})\b.*?)</h\1>'
  $evaluator2 = [System.Text.RegularExpressions.MatchEvaluator]{
    param($m)
    $level = $m.Groups[1].Value
    $attrs = $m.Groups[2].Value
    $inner = $m.Groups[3].Value
    $code = $m.Groups[4].Value
    return "<h$level id=""$code""$attrs>$inner</h$level>"
  }
  $content = [regex]::Replace($content, $pattern2, $evaluator2)

  Set-Content -LiteralPath $f.FullName -Value $content -Encoding UTF8
}

Write-Host "Normalization complete."