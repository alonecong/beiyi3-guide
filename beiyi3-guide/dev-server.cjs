const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8084; // Using a distinct port for the dev server
const ROOT_DIR = __dirname;
const DATA_FILE = path.join(ROOT_DIR, 'data.js');

const server = http.createServer((req, res) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);

    // 1. Handle API: Save Data
    if (req.method === 'POST' && req.url === '/api/save') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                const parsedData = JSON.parse(body);
                const fileContent = `// 配置文件：在此处修改网页内容
// 由 Admin 编辑器生成

const guideData = ${JSON.stringify(parsedData, null, 4)};
`;

                fs.writeFileSync(DATA_FILE, fileContent, 'utf8');
                console.log('Successfully saved data.js');

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Saved successfully' }));
            } catch (err) {
                console.error('Error saving file:', err);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, message: err.message }));
            }
        });
        return;
    }

    // 2. Serve Static Files
    let filePath = path.join(ROOT_DIR, req.url === '/' ? 'index.html' : req.url);

    // Safety check
    if (!filePath.startsWith(ROOT_DIR)) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const extname = path.extname(filePath);
    let contentType = 'text/html';

    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
        case '.ico': contentType = 'image/x-icon'; break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404);
                res.end('File not found');
            } else {
                res.writeHead(500);
                res.end('Server error: ' + error.code);
            }
        } else {
            res.writeHead(200, {
                'Content-Type': contentType + '; charset=utf-8',
                'Content-Length': Buffer.byteLength(content)
            });
            res.end(content);
        }
    });
});

console.log(`Development Server running at http://localhost:${PORT}/`);
console.log(`Open http://localhost:${PORT}/admin.html to edit.`);
server.listen(PORT);
