$ErrorActionPreference = "Stop"

# 1. Handle test-ipp.html
if (Test-Path "test.html") {
    Copy-Item -Path "test.html" -Destination "test-ipp.html" -Force
    Remove-Item -Path "test.html" -Force
}

# 2. Extract layout template from index.html
$indexContent = Get-Content "index.html" -Raw -Encoding UTF8

function BuildTestPage($sourceFile, $destFile, $pageTitle) {
    if (-not (Test-Path $sourceFile)) {
        Write-Host "File not found: $sourceFile"
        return
    }
    
    $sourceContent = Get-Content $sourceFile -Raw -Encoding UTF8
    
    # Extract styles
    $styleBlock = ""
    if ($sourceContent -match '(?s)(<style>.*?</style>)') {
        $styleBlock = $matches[1]
    }
    
    # Extract main content
    $mainContent = ""
    if ($sourceContent -match '(?s)(<div class="container test-card">.*?)</div>\s*</div>\s*<!-- FOOTER -->') {
        $mainContent = $matches[1]
    } else {
        # Fallback
        if ($sourceContent -match '(?s)(<div class="container test-card">.*)') {
            $mainContent = $matches[1] -replace '(?s)</div>\s*<!-- FOOTER -->.*', ''
        }
    }
    
    # Extract inline scripts (the test logic)
    $scriptsBlock = ""
    if ($sourceContent -match '(?s)(<script>\s*(?:const|let|var)\s*(?:questions|allItems|//).*?</script>)') {
        $scriptsBlock = $matches[1]
    }

    # Fix styles
    $styleBlock = $styleBlock -replace 'html\[data-theme="dark"\]', 'html.dark'
    $styleBlock = $styleBlock -replace '--color-bg: #f0f9ff;', '--color-bg: transparent;'
    $styleBlock = $styleBlock -replace '--color-bg-dark: #0f172a;', '--color-bg-dark: transparent;'
    $styleBlock = $styleBlock -replace '--color-texto: #0f172a;', '--color-texto: #0f172a;'
    $styleBlock = $styleBlock -replace '--color-borde: #bae6fd;', '--color-borde: #bfdbfe;'
    $styleBlock = $styleBlock -replace '--color-primary: #0284c7;', '--color-primary: #2563eb;'
    $styleBlock = $styleBlock -replace '--color-primary-dark: #0369a1;', '--color-primary-dark: #1d4ed8;'
    $styleBlock = $styleBlock -replace '--color-primary-light: #e0f2fe;', '--color-primary-light: rgba(37,99,235,0.1);'
    $styleBlock = $styleBlock -replace '--color-accent: #0ea5e9;', '--color-accent: #60a5fa;'
    
    $styleBlock = $styleBlock -replace '--color-bg: #082f49;', '--color-bg: transparent;'
    $styleBlock = $styleBlock -replace '--color-bg-dark: #0f172a; /\* Footer invariable \*/', '--color-bg-dark: transparent;'
    $styleBlock = $styleBlock -replace '--color-bg-warm: #0c4a6e;', '--color-bg-warm: rgba(30, 58, 138, 0.3);'
    $styleBlock = $styleBlock -replace '--color-bg-warm: #ffffff;', '--color-bg-warm: rgba(255, 255, 255, 0.6);'
    $styleBlock = $styleBlock -replace '--color-borde: #1e3a5f;', '--color-borde: rgba(96, 165, 250, 0.3);'
    $styleBlock = $styleBlock -replace '--color-primary: #38bdf8;', '--color-primary: #3b82f6;'
    $styleBlock = $styleBlock -replace '--color-primary-dark: #0284c7;', '--color-primary-dark: #60a5fa;'
    $styleBlock = $styleBlock -replace '--color-primary-light: #072238;', '--color-primary-light: rgba(37, 99, 235, 0.2);'
    $styleBlock = $styleBlock -replace '--color-accent: #38bdf8;', '--color-accent: #93c5fd;'

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
    $scriptsBlock
"@

    $newPage = $indexContent -replace '(?i)(<link rel=''stylesheet'' href=''style\.css''>)', "`$1`n$headAddition"
    $newPage = $newPage -replace '<title>.*?</title>', "<title>DAIA UCV | $pageTitle</title>"
    $newPage = $newPage -replace '(?s)<main.*?</main>', $mainBlock
    
    [System.IO.File]::WriteAllText($destFile, $newPage, [System.Text.Encoding]::UTF8)
}

BuildTestPage "Test-autopercepcion.html" "test-autopercepcion.html" "Test AutopercepciÃ³n"
BuildTestPage "Test-casm85.html" "test-casm85.html" "Test CASM-85"

# 3. Create tests.html
$testsMainBlock = @"
    <main class="flex-grow pt-32 pb-16 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 major-container">
            <div class="text-center mb-16 fade-up">
                <span class="text-blue-600 font-black text-sm tracking-[0.3em] uppercase">EvaluaciÃ³n y DiagnÃ³stico</span>
                <h1 class="font-display text-4xl md:text-6xl font-black text-slate-900 dark:text-white mt-2">NUESTROS <span class="text-blue-600">TESTS</span></h1>
                <div class="w-32 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-6 rounded-full"></div>
                <p class="text-slate-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto text-lg">Selecciona la prueba psicotÃ©cnica o vocacional que deseas realizar para obtener tu informe detallado.</p>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-8 fade-up section-optimize">
                
                <a href="test-ipp.html" class="block group">
                    <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform relative z-10 border border-blue-200/50 dark:border-blue-700/30">
                            <i data-lucide="clipboard-list" class="w-7 h-7"></i>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 relative z-10">Test IPP</h3>
                        <p class="text-slate-600 dark:text-gray-400 flex-grow relative z-10">Inventario de Intereses y Preferencias Profesionales. Descubre tu vocaciÃ³n.</p>
                        <div class="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all relative z-10">
                            Realizar test <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                        </div>
                    </div>
                </a>

                <a href="test-autopercepcion.html" class="block group">
                    <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform relative z-10 border border-blue-200/50 dark:border-blue-700/30">
                            <i data-lucide="user-check" class="w-7 h-7"></i>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 relative z-10">AutopercepciÃ³n Vocacional</h3>
                        <p class="text-slate-600 dark:text-gray-400 flex-grow relative z-10">EvaluaciÃ³n de la influencia en las decisiones vocacionales y profesionales.</p>
                        <div class="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all relative z-10">
                            Realizar test <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                        </div>
                    </div>
                </a>

                <a href="test-casm85.html" class="block group">
                    <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform relative z-10 border border-blue-200/50 dark:border-blue-700/30">
                            <i data-lucide="book-open" class="w-7 h-7"></i>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 relative z-10">Test CASM-85</h3>
                        <p class="text-slate-600 dark:text-gray-400 flex-grow relative z-10">Inventario de HÃ¡bitos de Estudio. Descubre y mejora tus tÃ©cnicas de aprendizaje.</p>
                        <div class="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all relative z-10">
                            Realizar test <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                        </div>
                    </div>
                </a>

            </div>
        </div>
    </main>
"@

$testsPage = $indexContent -replace '<title>.*?</title>', "<title>DAIA UCV | Nuestros Tests</title>"
$testsPage = $testsPage -replace '(?s)<main.*?</main>', $testsMainBlock

[System.IO.File]::WriteAllText("tests.html", $testsPage, [System.Text.Encoding]::UTF8)

# 4. Update Navigation in all html files to point to tests.html and say "Tests" instead of "Test IPP".
$files = Get-ChildItem -Filter "*.html" | Select-Object -ExpandProperty Name
foreach ($f in $files) {
    if (Test-Path $f) {
        $c = Get-Content $f -Raw -Encoding UTF8
        
        # Desktop
        $c = $c -replace '<a href="test\.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition">Test IPP</a>', '<a href="tests.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition">Tests</a>'
        $c = $c -replace '<a href="test-ipp\.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition">Test IPP</a>', '<a href="tests.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition">Tests</a>'
        
        # Mobile
        $c = $c -replace '<a href="test\.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Test IPP</a>', '<a href="tests.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Tests</a>'
        $c = $c -replace '<a href="test-ipp\.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Test IPP</a>', '<a href="tests.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2">Tests</a>'
        
        # Footer
        $c = $c -replace '<li><a href="test\.html" class="py-2 inline-block hover:text-blue-600 transition-colors">Test IPP</a></li>', '<li><a href="tests.html" class="py-2 inline-block hover:text-blue-600 transition-colors">Tests</a></li>'
        $c = $c -replace '<li><a href="test-ipp\.html" class="py-2 inline-block hover:text-blue-600 transition-colors">Test IPP</a></li>', '<li><a href="tests.html" class="py-2 inline-block hover:text-blue-600 transition-colors">Tests</a></li>'
        
        [System.IO.File]::WriteAllText($f, $c, [System.Text.Encoding]::UTF8)
    }
}
