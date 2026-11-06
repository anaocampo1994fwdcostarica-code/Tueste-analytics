param(
  [string]$InputPath = (Join-Path $PSScriptRoot '..\Tueste_Calculadora_Con_Caja_Empresarial.xlsx'),
  [string]$OutputPath = (Join-Path $PSScriptRoot '..\Tueste_Calculadora_Con_Caja_Empresarial_CORREGIDA_ETAPA_15.xlsx')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem
Add-Type -AssemblyName System.IO.Compression

if (-not (Test-Path -LiteralPath $InputPath)) { throw "No se encontró el Excel original: $InputPath" }
if (Test-Path -LiteralPath $OutputPath) { throw "La salida ya existe y no se sobrescribirá: $OutputPath" }

Copy-Item -LiteralPath $InputPath -Destination $OutputPath -ErrorAction Stop
$archive = [System.IO.Compression.ZipFile]::Open((Resolve-Path -LiteralPath $OutputPath), [System.IO.Compression.ZipArchiveMode]::Update)

function Get-ZipText([string]$name) {
  $entry = $archive.GetEntry($name)
  if ($null -eq $entry) { throw "No existe la entrada XLSX: $name" }
  $reader = [System.IO.StreamReader]::new($entry.Open())
  try { return $reader.ReadToEnd() } finally { $reader.Dispose() }
}

function Set-ZipText([string]$name, [string]$text) {
  $entry = $archive.GetEntry($name)
  if ($null -ne $entry) { $entry.Delete() }
  $replacement = $archive.CreateEntry($name, [System.IO.Compression.CompressionLevel]::Optimal)
  $writer = [System.IO.StreamWriter]::new($replacement.Open(), [System.Text.UTF8Encoding]::new($false))
  try { $writer.Write($text) } finally { $writer.Dispose() }
}

try {
  # Supuestos!B35: control editable de adopción Pack; se conserva B36 como nota.
  $sheet1 = Get-ZipText 'xl/worksheets/sheet1.xml'
  $row35 = '<x:row r="35"><x:c r="A35" t="str"><x:v>Adopción Pack (0% a 100%)</x:v></x:c><x:c r="B35" s="12" t="n"><x:v>1</x:v></x:c><x:c r="C35" t="str"><x:v>Editable: mezcla Pack y pedido de 2 bolsas con política de envío alternativa</x:v></x:c></x:row>'
  if ($sheet1 -notmatch 'r="B35"') { $sheet1 = $sheet1.Replace('<x:row r="36"', "$row35<x:row r=`"36`"") }
  Set-ZipText 'xl/worksheets/sheet1.xml' $sheet1

  # Escenarios: Pack aplica la mezcla en cada compra suelta, envío alternativo a pedidos < USD 45 y suscripción.
  $sheet3 = Get-ZipText 'xl/worksheets/sheet3.xml'
  $replacements = [ordered]@{
    '<x:f>Supuestos!B25</x:f><x:v>48</x:v>' = '<x:f>(1-Supuestos!B35)*Supuestos!B6+Supuestos!B35*Supuestos!B25</x:f><x:v>48</x:v>'
    '<x:f>Supuestos!B26*Supuestos!B7+Supuestos!B8+Supuestos!B25*Supuestos!B9+Supuestos!B27</x:f><x:v>24.38</x:v>' = '<x:f>(1-Supuestos!B35)*(Supuestos!B7*Supuestos!B5+Supuestos!B6*Supuestos!B9+Supuestos!B10)+Supuestos!B35*(Supuestos!B26*Supuestos!B7+Supuestos!B8+Supuestos!B25*Supuestos!B9+Supuestos!B27)</x:f><x:v>24.38</x:v>'
    '<x:f>IFERROR(D6*(Supuestos!B20*D8+Supuestos!B21*Supuestos!B11)/D4,0)</x:f><x:v>0.93616875</x:v>' = '<x:f>IFERROR(D6*(Supuestos!B20*D8+Supuestos!B21*Supuestos!B11)/D4,0)</x:f><x:v>0.93616875</x:v>'
    '<x:f>Resultados!B16-B10+D10</x:f><x:v>55.39999999999999</x:v>' = '<x:f>D10*Supuestos!B22</x:f><x:v>70.86</x:v>'
    '<x:f>D17*Supuestos!B20+D18*Supuestos!B21</x:f><x:v>61.36657068771631</x:v>' = '<x:f>D17*Supuestos!B20+D18*Supuestos!B21</x:f><x:v>79.5890046</x:v>'
    '<x:f>IFERROR(D19/D14,0)</x:f><x:v>1.1250537959414657</x:v>' = '<x:f>IFERROR(D19/D14,0)</x:f><x:v>1.459131751</x:v>'
    '<x:f>D19-D14</x:f><x:v>6.821116142261765</x:v>' = '<x:f>D19-D14</x:f><x:v>25.04355005454545</x:v>'
  }
  foreach ($pair in $replacements.GetEnumerator()) {
    if (-not $sheet3.Contains($pair.Key)) { throw "No se encontró una fórmula esperada para reemplazar: $($pair.Key)" }
    $sheet3 = $sheet3.Replace($pair.Key, $pair.Value)
  }
  $oldD18 = '<x:c r="D18" s="20" t="n"><x:f>Resultados!B18</x:f><x:v>95.17713791810881</x:v></x:c>'
  $newD18 = '<x:c r="D18" s="20" t="n"><x:f>(Supuestos!B11-Supuestos!B7*Supuestos!B5-Supuestos!B11*Supuestos!B9-Supuestos!B10)*Resultados!B17</x:f><x:v>129.053364</x:v></x:c>'
  if (-not $sheet3.Contains($oldD18)) { throw 'No se encontró Escenarios!D18 esperado.' }
  $sheet3 = $sheet3.Replace($oldD18, $newD18)
  $sheet3 = $sheet3.Replace('Supuesto de propuesta: todos los pedidos sueltos usan pack (no demostrado).', 'Adopción Pack editable: mezcla el Pack y el pedido de 2 bolsas en cada compra suelta.')
  $sheet3 = $sheet3.Replace('En pack: se conserva el envío gratis al superar $45.', 'En Pack: pedidos y suscripciones bajo $45 trasladan envío al cliente; Pack $48 conserva envío pagado por Tueste.')
  Set-ZipText 'xl/worksheets/sheet3.xml' $sheet3

  # Cohortes caja: la suscripción de Pack usa la contribución con política alternativa de envío.
  $sheet7 = Get-ZipText 'xl/worksheets/sheet7.xml'
  $sheet7 = $sheet7.Replace("+'Curva de caja'!E5*Resultados!B10", "+'Curva de caja'!E5*(Escenarios!D18/Resultados!B17)")
  6..16 | ForEach-Object {
    $sheet7 = $sheet7.Replace("+'Curva de caja'!E$_*Resultados!B10", "+'Curva de caja'!E$_*(Escenarios!D18/Resultados!B17)")
  }
  Set-ZipText 'xl/worksheets/sheet7.xml' $sheet7

  # Obliga a Excel a reconstruir las fórmulas y gráficos al abrir la copia.
  $workbook = Get-ZipText 'xl/workbook.xml'
  $workbook = [regex]::Replace($workbook, '<x:calcPr[^>]*/>', '')
  $workbook = $workbook.Replace('</x:workbook>', '<x:calcPr calcId="0" calcMode="auto" fullCalcOnLoad="1" forceFullCalc="1"/></x:workbook>')
  Set-ZipText 'xl/workbook.xml' $workbook
}
finally {
  $archive.Dispose()
}

Write-Output "Copia corregida creada: $OutputPath"
