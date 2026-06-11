const fs = require('fs');
const content = fs.readFileSync('../Pagina web de psicología/Test-autopercepcion.html', 'utf8');
const scriptMatches = content.match(/<script[\s\S]*?<\/script>/gi);
console.log(scriptMatches ? scriptMatches.length : 0);
if(scriptMatches) {
    scriptMatches.forEach((s, i) => {
        console.log(`Script ${i}: ${s.length} chars. Starts with: ${s.substring(0, 50).replace(/\n/g, ' ')}`);
    });
}
