const fs = require('fs');

const indexHtml = fs.readFileSync('articulo25.html', 'utf8');

function extractBlock(html, regex) {
    const match = html.match(regex);
    return match ? match[1] : '';
}

function buildTestPage(sourceFile, destFile, title) {
    let content;
    try {
        content = fs.readFileSync(sourceFile, 'utf8');
    } catch (e) {
        content = fs.readFileSync(`../Pagina web de psicología/${sourceFile}`, 'utf8');
    }

    let styleBlock = extractBlock(content, /(<style>[\s\S]*?<\/style>)/i);
    
    let scriptsBlock = '';
    const scriptMatches = content.match(/<script[\s\S]*?<\/script>/gi);
    if (scriptMatches) {
        scriptsBlock = scriptMatches.filter(s => 
            !s.includes('tailwind') && 
            !s.includes('firebase') && 
            !s.includes('cdnjs.cloudflare.com') &&
            !s.includes('lucide') &&
            !s.includes('theme')
        ).join('\n    ');
    }
    
    let mainContent = extractBlock(content, /(<div class="container test-card">[\s\S]*?)<\/div>\s*<\/div>\s*<!-- FOOTER -->/i);
    if (!mainContent) {
        mainContent = extractBlock(content, /(<div class="container test-card">[\s\S]*?)<script>/i);
        if (mainContent) {
            mainContent = mainContent.replace(/<\/div>\s*<\/div>\s*$/, '');
        }
    }

    // Fix styles
    styleBlock = styleBlock
        .replace(/html\[data-theme="dark"\]/g, 'html.dark')
        .replace(/--color-bg: #f0f9ff;/g, '--color-bg: transparent;')
        .replace(/--color-bg-dark: #0f172a;/g, '--color-bg-dark: transparent;')
        .replace(/--color-texto: #0f172a;/g, '--color-texto: #0f172a;')
        .replace(/--color-borde: #bae6fd;/g, '--color-borde: #bfdbfe;')
        .replace(/--color-primary: #0284c7;/g, '--color-primary: #2563eb;')
        .replace(/--color-primary-dark: #0369a1;/g, '--color-primary-dark: #1d4ed8;')
        .replace(/--color-primary-light: #e0f2fe;/g, '--color-primary-light: rgba(37,99,235,0.1);')
        .replace(/--color-accent: #0ea5e9;/g, '--color-accent: #60a5fa;')
        .replace(/padding-top: calc\(var\(--header-height, 72px\) \+ 2rem\);/g, 'padding-top: 0;')
        .replace(/min-height: calc\(100vh - var\(--header-height, 72px\)\);/g, '')
        .replace(/background-color: var\(--bg-page\);/g, 'background-color: transparent;')
        .replace(/max-width: 850px !important;/g, 'max-width: 850px !important; backdrop-filter: blur(16px);')
        .replace(/border-radius: 12px;/g, 'border-radius: 1.5rem;')
        .replace(/box-shadow: 0 10px 30px rgba\(0,0,0,0.15\);/g, 'box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);');

    const headAddition = `
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
${styleBlock}
`;

    const mainBlock = `
    <main class="flex-grow pt-24 pb-16 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 major-container">
${mainContent}
        </div>
    </main>
    ${scriptsBlock}
`;

    let newPage = indexHtml.replace(/(<link rel='stylesheet' href='style\.css'>)/i, `$1\n${headAddition}`);
    newPage = newPage.replace(/<title>.*?<\/title>/i, `<title>DAIA UCV | ${title}</title>`);
    
    // Fix nav active state for desktop
    newPage = newPage.replace('href="articulo25.html" class="text-blue-600 dark:text-blue-400 transition relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400"', 'href="articulo25.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition"');
    newPage = newPage.replace('href="tests.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition"', 'href="tests.html" class="text-blue-600 dark:text-blue-400 transition relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400"');
    
    // Fix nav active state for mobile
    newPage = newPage.replace('href="articulo25.html" class="text-blue-600 dark:text-blue-400 py-2"', 'href="articulo25.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2 border-b border-slate-100 dark:border-white/5"');
    newPage = newPage.replace('href="tests.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2"', 'href="tests.html" class="text-blue-600 dark:text-blue-400 py-2"');
    
    newPage = newPage.replace(/<main[\s\S]*?<\/main>/i, mainBlock);

    fs.writeFileSync(destFile, newPage, 'utf8');
}

buildTestPage('Test-autopercepcion.html', 'Test-autopercepcion.html', 'Test Autopercepción');
buildTestPage('Test-casm85.html', 'Test-casm85.html', 'Test CASM-85');
buildTestPage('Test-ipp.html', 'Test-ipp.html', 'Test IPP');

// tests.html
const testsMainBlock = `
    <main class="flex-grow pt-32 pb-16 relative z-10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 major-container">
            <div class="text-center mb-16 fade-up">
                <span class="text-blue-600 font-black text-sm tracking-[0.3em] uppercase">Evaluación y Diagnóstico</span>
                <h1 class="font-display text-4xl md:text-6xl font-black text-slate-900 dark:text-white mt-2">NUESTROS <span class="text-blue-600">TESTS</span></h1>
                <div class="w-32 h-1 bg-gradient-to-r from-blue-400 to-blue-600 mx-auto mt-6 rounded-full"></div>
                <p class="text-slate-600 dark:text-gray-300 mt-6 max-w-2xl mx-auto text-lg">Selecciona la prueba psicotécnica o vocacional que deseas realizar para obtener tu informe detallado.</p>
            </div>

            <div id="tests-unauth" style="display: none;" class="text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-white/10 shadow-sm max-w-2xl mx-auto mt-8">
                <i data-lucide="lock" class="w-12 h-12 text-slate-400 mx-auto mb-4"></i>
                <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Acceso Restringido</h3>
                <p class="text-slate-600 dark:text-gray-400 mb-6">Debes iniciar sesión con tu cuenta de Google para poder realizar los tests psicológicos y vocacionales.</p>
                <button onclick="window.DaiaAuth.login()" class="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                    <svg class="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                    Iniciar Sesión con Google
                </button>
            </div>

            <div id="tests-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8 fade-up section-optimize" style="display: none;">
                
                <a href="Test-ipp.html" class="block group">
                    <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform relative z-10 border border-blue-200/50 dark:border-blue-700/30">
                            <i data-lucide="clipboard-list" class="w-7 h-7"></i>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 relative z-10">Test IPP</h3>
                        <p class="text-slate-600 dark:text-gray-400 flex-grow relative z-10">Inventario de Intereses y Preferencias Profesionales. Descubre tu vocación.</p>
                        <div class="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all relative z-10">
                            Realizar test <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                        </div>
                    </div>
                </a>

                <a href="Test-autopercepcion.html" class="block group">
                    <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform relative z-10 border border-blue-200/50 dark:border-blue-700/30">
                            <i data-lucide="user-check" class="w-7 h-7"></i>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 relative z-10">Autopercepción Vocacional</h3>
                        <p class="text-slate-600 dark:text-gray-400 flex-grow relative z-10">Evaluación de la influencia en las decisiones vocacionales y profesionales.</p>
                        <div class="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all relative z-10">
                            Realizar test <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                        </div>
                    </div>
                </a>

                <a href="Test-casm85.html" class="block group">
                    <div class="bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-xl h-full flex flex-col relative overflow-hidden">
                        <div class="absolute -right-4 -top-4 w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full blur-2xl group-hover:bg-blue-200 dark:group-hover:bg-blue-800/40 transition-colors"></div>
                        <div class="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-50 dark:from-blue-900/50 dark:to-blue-800/30 rounded-xl flex items-center justify-center mb-6 text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform relative z-10 border border-blue-200/50 dark:border-blue-700/30">
                            <i data-lucide="book-open" class="w-7 h-7"></i>
                        </div>
                        <h3 class="text-2xl font-black text-slate-900 dark:text-white mb-3 relative z-10">Test CASM-85</h3>
                        <p class="text-slate-600 dark:text-gray-400 flex-grow relative z-10">Inventario de Hábitos de Estudio. Descubre y mejora tus técnicas de aprendizaje.</p>
                        <div class="mt-6 flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all relative z-10">
                            Realizar test <i data-lucide="arrow-right" class="w-4 h-4 ml-1"></i>
                        </div>
                    </div>
                </a>

            </div>
        </div>
    </main>
    <script type="module">
        let checkInterval = setInterval(() => {
            if (window.DaiaAuth) {
                clearInterval(checkInterval);
                window.DaiaAuth.onAuthStateChanged((user) => {
                    const grid = document.getElementById("tests-grid");
                    const unauth = document.getElementById("tests-unauth");
                    if (user) {
                        grid.style.display = "grid";
                        unauth.style.display = "none";
                    } else {
                        grid.style.display = "none";
                        unauth.style.display = "block";
                    }
                });
            }
        }, 100);
    </script>
`;

let testsPage = indexHtml.replace(/<title>.*?<\/title>/i, "<title>DAIA UCV | Nuestros Tests</title>");

// Fix nav active state for desktop
testsPage = testsPage.replace('href="articulo25.html" class="text-blue-600 dark:text-blue-400 transition relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400"', 'href="articulo25.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition"');
testsPage = testsPage.replace('href="tests.html" class="hover:text-blue-600 dark:hover:text-blue-400 transition"', 'href="tests.html" class="text-blue-600 dark:text-blue-400 transition relative after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-blue-600 dark:after:bg-blue-400"');

// Fix nav active state for mobile
testsPage = testsPage.replace('href="articulo25.html" class="text-blue-600 dark:text-blue-400 py-2"', 'href="articulo25.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2 border-b border-slate-100 dark:border-white/5"');
testsPage = testsPage.replace('href="tests.html" class="hover:text-blue-600 dark:hover:text-blue-400 py-2"', 'href="tests.html" class="text-blue-600 dark:text-blue-400 py-2"');

testsPage = testsPage.replace(/<main[\s\S]*?<\/main>/i, testsMainBlock);
fs.writeFileSync('tests.html', testsPage, 'utf8');

console.log('Layout built successfully.');
