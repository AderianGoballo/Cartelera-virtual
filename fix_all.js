const fs = require('fs');

const cspReplacement = `content="default-src 'self'; script-src 'self' 'unsafe-inline' unpkg.com cdnjs.cloudflare.com https://www.gstatic.com https://apis.google.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; img-src 'self' data: https:; font-src 'self' fonts.gstatic.com; connect-src 'self' https://*.firebaseio.com https://firestore.googleapis.com https://identitytoolkit.googleapis.com https://securetoken.googleapis.com; frame-src 'self' https://apis.google.com https://test-daia.firebaseapp.com;">`;

const updateCSP = (content) => {
    return content.replace(/content="default-src 'self';.*?>/g, cspReplacement);
};

const injectAuthUI = (content) => {
    let newContent = content;
    if (!newContent.includes('src="firebase-config.js"')) {
        newContent = newContent.replace('</head>', '\n    <script type="module" src="firebase-config.js"></script>\n</head>');
    }
    if (!newContent.includes('id="auth-container"')) {
        newContent = newContent.replace('<button id="theme-toggle"', '<div id="auth-container"></div>\n                    <button id="theme-toggle"');
    }
    return newContent;
};

const injectTestsHtmlGuard = (content) => {
    if (!content.includes('id="tests-unauth"')) {
        content = content.replace('<div class="grid grid-cols-1 md:grid-cols-3 gap-8 fade-up section-optimize">', `<div id="tests-unauth" style="display: none;" class="text-center bg-white/60 dark:bg-slate-900/60 backdrop-blur-md rounded-2xl p-8 border border-slate-200 dark:border-white/10 shadow-sm max-w-2xl mx-auto mt-8">
                <i data-lucide="lock" class="w-12 h-12 text-slate-400 mx-auto mb-4"></i>
                <h3 class="text-xl font-bold text-slate-800 dark:text-white mb-2">Acceso Restringido</h3>
                <p class="text-slate-600 dark:text-gray-400 mb-6">Debes iniciar sesión con tu cuenta de Google para poder realizar los tests psicológicos y vocacionales.</p>
                <button onclick="window.DaiaAuth.login()" class="inline-flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
                    <svg class="w-5 h-5 bg-white rounded-full p-0.5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/><path fill="none" d="M1 1h22v22H1z"/></svg>
                    Iniciar Sesión con Google
                </button>
            </div>

            <div id="tests-grid" class="grid grid-cols-1 md:grid-cols-3 gap-8 fade-up section-optimize" style="display: none;">`);
        
        content = content.replace('</div>\n        </div>\n    </main>', `</div>\n        </div>\n    </main>\n\n    <script type="module">
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
    </script>`);
    }
    return content;
};

const injectTestGuard = (content, testId, renderFuncName) => {
    if (!content.includes('let currentUserEmail = null;')) {
        // Añadir variable global
        content = content.replace('function calcularResultados() {', `let currentUserEmail = null;\n\n    function calcularResultados() {`);
        
        // Inyectar visualización del usuario
        const userInfoHtml = `<div id="user-info-display" style="text-align:center; padding: 10px; margin-bottom: 20px; background: rgba(37, 99, 235, 0.1); color: var(--primary); font-weight: bold; border-radius: 8px; border: 1px solid var(--primary-light);"></div>`;
        const userInfoResultsHtml = `<div id="user-info-results" style="text-align:center; padding: 10px; margin-bottom: 20px; background: rgba(37, 99, 235, 0.1); color: var(--primary); font-weight: bold; border-radius: 8px; border: 1px solid var(--primary-light);"></div>`;
        if(content.includes('<div class="progress-container">')) {
            content = content.replace('<div class="progress-container">', userInfoHtml + '\n<div class="progress-container">');
        } else if(content.includes('<div id="questions-container">')) {
            content = content.replace('<div id="questions-container">', userInfoHtml + '\n<div id="questions-container">');
        }
        
        content = content.replace(/<h2 class="results-title">.*?<\/h2>/i, `$&` + '\n' + userInfoResultsHtml);
        content = content.replace(/<button[^>]*>Realizar Test Nuevamente<\/button>/i, '');

        let saveLogic = "";
        let authBlock = "";

        if (testId === 'AUTOPERCEPCION') {
            saveLogic = `
        if (window.DaiaDB && currentUserEmail && !window.showingPastResults) {
            let answersToSave = {};
            questions.forEach(q => {
                const sel = document.querySelector(\`input[name="q\${q.id}"]:checked\`);
                if (sel) answersToSave[q.id] = sel.value;
            });
            window.DaiaDB.saveTestResult(currentUserEmail, '${testId}', { totalScore: totalScore, answers: answersToSave });
        }
    }`;
            content = content.replace("window.scrollTo({ top: 0, behavior: 'smooth' });\n        }", "window.scrollTo({ top: 0, behavior: 'smooth' });\n" + saveLogic);
            
            authBlock = `// Wait for Firebase Auth to initialize before rendering
    let checkInterval = setInterval(() => {
        if (window.DaiaAuth && window.DaiaDB) {
            clearInterval(checkInterval);
            window.DaiaAuth.onAuthStateChanged(async (user) => {
                if (!user) {
                    window.location.href = "tests.html";
                    return;
                }
                currentUserEmail = user.email;
                const uiEl = document.getElementById('user-info-display');
                if(uiEl) uiEl.innerText = "Usuario: " + user.email;
                const resEl = document.getElementById('user-info-results');
                if(resEl) resEl.innerText = "Usuario: " + user.email;
                
                ${renderFuncName}();

                const pastResult = await window.DaiaDB.hasUserTakenTest(user.email, '${testId}');
                if (pastResult && pastResult.answers) {
                    alert("Ya completaste este test. Mostrando tus resultados anteriores.");
                    window.showingPastResults = true;
                    for (let qId in pastResult.answers) {
                        let el = document.querySelector(\`input[name="q\${qId}"][value="\${pastResult.answers[qId]}"]\`);
                        if(el) el.checked = true;
                    }
                    document.getElementById('quiz-view').style.display = 'none';
                    document.getElementById('results-view').style.display = 'block';
                    calcularResultados();
                }
            });
        }
    }, 100);
</script>`;
            content = content.replace(new RegExp(`${renderFuncName}\\(\\);\\s*</script>`), authBlock);

        } else if (testId === 'IPP') {
            saveLogic = `
        if (window.DaiaDB && currentUserEmail && !window.showingPastResults) {
            window.DaiaDB.saveTestResult(currentUserEmail, '${testId}', { answers: userAnswers });
        }
    }`;
            content = content.replace("renderResults(results);\n    }", "renderResults(results);\n" + saveLogic);
            
            authBlock = `// Wait for Firebase Auth to initialize before rendering
    let checkInterval = setInterval(() => {
        if (window.DaiaAuth && window.DaiaDB) {
            clearInterval(checkInterval);
            window.DaiaAuth.onAuthStateChanged(async (user) => {
                if (!user) {
                    window.location.href = "tests.html";
                    return;
                }
                currentUserEmail = user.email;
                const uiEl = document.getElementById('user-info-display');
                if(uiEl) uiEl.innerText = "Usuario: " + user.email;
                const resEl = document.getElementById('user-info-results');
                if(resEl) resEl.innerText = "Usuario: " + user.email;

                const pastResult = await window.DaiaDB.hasUserTakenTest(user.email, '${testId}');
                if (pastResult && pastResult.answers) {
                    alert("Ya completaste este test. Mostrando tus resultados anteriores.");
                    window.showingPastResults = true;
                    userAnswers = pastResult.answers;
                    
                    document.getElementById('quiz-view').style.display = 'none';
                    document.getElementById('results-view').style.display = 'block';
                    
                    calcularResultados();
                } else {
                    ${renderFuncName}();
                }
            });
        }
    }, 100);
</script>`;
            content = content.replace(new RegExp(`${renderFuncName}\\(\\);\\s*</script>`), authBlock);
        } else {
            // CASM85
            saveLogic = `
        if (window.DaiaDB && currentUserEmail && !window.showingPastResults) {
            window.DaiaDB.saveTestResult(currentUserEmail, '${testId}', { answers: userAnswers });
        }
    }`;
            content = content.replace("window.scrollTo({ top: 0, behavior: 'smooth' });\n    }", "window.scrollTo({ top: 0, behavior: 'smooth' });\n" + saveLogic);
            
            authBlock = `// Wait for Firebase Auth to initialize before rendering
    let checkInterval = setInterval(() => {
        if (window.DaiaAuth && window.DaiaDB) {
            clearInterval(checkInterval);
            window.DaiaAuth.onAuthStateChanged(async (user) => {
                if (!user) {
                    window.location.href = "tests.html";
                    return;
                }
                currentUserEmail = user.email;
                const uiEl = document.getElementById('user-info-display');
                if(uiEl) uiEl.innerText = "Usuario: " + user.email;
                const resEl = document.getElementById('user-info-results');
                if(resEl) resEl.innerText = "Usuario: " + user.email;

                const pastResult = await window.DaiaDB.hasUserTakenTest(user.email, '${testId}');
                if (pastResult && pastResult.answers) {
                    alert("Ya completaste este test. Mostrando tus resultados anteriores.");
                    window.showingPastResults = true;
                    userAnswers = pastResult.answers;
                    
                    document.getElementById('quiz-view').style.display = 'none';
                    document.getElementById('results-view').style.display = 'block';
                    
                    calcularResultados();
                } else {
                    ${renderFuncName}();
                }
            });
        }
    }, 100);
</script>`;
            content = content.replace(new RegExp(`${renderFuncName}\\(\\);\\s*</script>`), authBlock);
        }

    }
    return content;
};


const files = fs.readdirSync('.').filter(f => f.endsWith('.html'));

files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = updateCSP(content);
    content = injectAuthUI(content);

    if (f === 'tests.html') {
        content = injectTestsHtmlGuard(content);
    } else if (f === 'Test-casm85.html') {
        content = injectTestGuard(content, 'CASM85', 'renderQuestion');
    } else if (f === 'Test-ipp.html') {
        content = injectTestGuard(content, 'IPP', 'renderQuestion');
    } else if (f === 'Test-autopercepcion.html') {
        content = injectTestGuard(content, 'AUTOPERCEPCION', 'renderQuestions');
    }

    // Strip simulate and excel UI elements from all tests
    content = content.replace(/<button[^>]*>Simular Test<\/button>/gi, '');
    content = content.replace(/<div[^>]*>\s*<details[^>]*>[\s\S]*?excel-paste-area[\s\S]*?<\/details>\s*<\/div>/gi, '');
    content = content.replace(/<details[^>]*>[\s\S]*?excel-paste-area[\s\S]*?<\/details>/gi, '');

    fs.writeFileSync(f, content, 'utf8');
    console.log('Updated ' + f);
});
