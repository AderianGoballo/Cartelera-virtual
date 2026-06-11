$testIpp = Get-Content "Test-ipp.html" -Raw -Encoding UTF8

# Extract styles from Test-ipp
$styleBlock = ""
if ($testIpp -match '(?s)(<style>.*?</style>.*?<style>.*?</style>)') {
    $styleBlock = $matches[1]
}

# Extract main content from Test-ipp
$mainContent = ""
if ($testIpp -match '(?s)(<div class="container test-card">.*?</script>\s*</div>)') {
    $mainContent = $matches[1]
}

# Fix dark mode selectors in $styleBlock
$styleBlock = $styleBlock -replace 'html\[data-theme="dark"\]', 'html.dark'

# Update colors in $styleBlock to match DAIA palette
$styleBlock = $styleBlock -replace '--color-bg: #f0f9ff;', '--color-bg: transparent;'
$styleBlock = $styleBlock -replace '--color-bg-dark: #0f172a;', '--color-bg-dark: #1e3a8a;'
$styleBlock = $styleBlock -replace '--color-texto: #0f172a;', '--color-texto: #0f172a;'
$styleBlock = $styleBlock -replace '--color-borde: #bae6fd;', '--color-borde: #bfdbfe;'
$styleBlock = $styleBlock -replace '--color-primary: #0284c7;', '--color-primary: #2563eb;'
$styleBlock = $styleBlock -replace '--color-primary-dark: #0369a1;', '--color-primary-dark: #1d4ed8;'
$styleBlock = $styleBlock -replace '--color-primary-light: #e0f2fe;', '--color-primary-light: rgba(37,99,235,0.1);'
$styleBlock = $styleBlock -replace '--color-accent: #0ea5e9;', '--color-accent: #60a5fa;'

# Update dark mode colors
$styleBlock = $styleBlock -replace '--color-bg: #082f49;', '--color-bg: transparent;'
$styleBlock = $styleBlock -replace '--color-bg-dark: #0f172a; /\* Footer invariable \*/', '--color-bg-dark: transparent;'
$styleBlock = $styleBlock -replace '--color-bg-warm: #0c4a6e;', '--color-bg-warm: rgba(30, 58, 138, 0.3);'
$styleBlock = $styleBlock -replace '--color-borde: #1e3a5f;', '--color-borde: rgba(96, 165, 250, 0.3);'
$styleBlock = $styleBlock -replace '--color-primary: #38bdf8;', '--color-primary: #3b82f6;'
$styleBlock = $styleBlock -replace '--color-primary-dark: #0284c7;', '--color-primary-dark: #60a5fa;'
$styleBlock = $styleBlock -replace '--color-primary-light: #072238;', '--color-primary-light: rgba(37, 99, 235, 0.2);'
$styleBlock = $styleBlock -replace '--color-accent: #38bdf8;', '--color-accent: #93c5fd;'

# Additional style fixes
$styleBlock = $styleBlock -replace 'padding-top: calc\(var\(--header-height, 72px\) \+ 2rem\);', 'padding-top: 0;'
$styleBlock = $styleBlock -replace 'min-height: calc\(100vh - var\(--header-height, 72px\)\);', ''
$styleBlock = $styleBlock -replace 'background-color: var\(--bg-page\);', 'background-color: transparent;'
$styleBlock = $styleBlock -replace 'max-width: 850px !important;', 'max-width: 850px !important; backdrop-filter: blur(16px);'
$styleBlock = $styleBlock -replace 'border-radius: 12px;', 'border-radius: 1.5rem;'
$styleBlock = $styleBlock -replace 'box-shadow: 0 10px 30px rgba\(0,0,0,0.15\);', 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);'

$headAddition = @"
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
$styleBlock
"@

$mainBlock = @"
    <main class="flex-grow pt-24 pb-16 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 major-container">
$mainContent
        </div>
    </main>
"@

$testHtml = Get-Content "test.html" -Raw -Encoding UTF8
$testHtml = $testHtml -replace '(?i)(<link rel=''stylesheet'' href=''style\.css''>)', "`$1`n$headAddition"
$testHtml = $testHtml -replace '<title>DAIA UCV \| Inicio</title>', '<title>DAIA UCV | Test IPP</title>'
$testHtml = $testHtml -replace '(?s)<main.*?</main>', $mainBlock

# Fix the active menu class in test.html
$testHtml = $testHtml -replace 'class="text-blue-600 dark:text-blue-400 transition relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400"', 'class="hover:text-blue-600 dark:hover:text-blue-400 transition"'

Set-Content -Path "test.html" -Value $testHtml -Encoding UTF8

$files = "index.html", "disciplinas.html", "servicios.html", "articulo25.html", "test.html"

foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw -Encoding UTF8
        
        # Avoid duplicate additions
        if ($c -notmatch 'Test IPP') {
            # Desktop nav
            $c = $c -replace '(<a href="articulo25\.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition">Artículo 25</a>)', "`$1`n                    <a href=`"test.html`" class=`"hover:text-blue-600 dark:hover:text-blue-400 transition`">Test IPP</a>"
            
            # Mobile nav
            $c = $c -replace '(<a href="articulo25\.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Artículo 25</a>)', "`$1`n                    <a href=`"test.html`" class=`"hover:text-blue-600 dark:hover:text-blue-400 py-2`">Test IPP</a>"
            
            # Footer nav
            $c = $c -replace '(<li><a href="articulo25\.html" class="py-2 inline-block hover:text-blue-600 transition-colors">Artículo 25</a></li>)', "`$1`n                        <li><a href=`"test.html`" class=`"py-2 inline-block hover:text-blue-600 transition-colors`">Test IPP</a></li>"
            
            Set-Content -Path $f -Value $c -Encoding UTF8
        }
    }
}
