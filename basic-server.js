const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Teste básico - Se você vê este texto, o servidor está funcionando!');
});

// Forçando uso do IPv4
server.listen(5000, '127.0.0.1', () => {
    console.log('\n=== Servidor rodando (apenas IPv4) ===');
    console.log('Tente acessar:');
    console.log('http://127.0.0.1:5000');
    console.log('\nPara parar o servidor, pressione Ctrl+C');
}); 