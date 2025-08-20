const http = require('http');
const httpProxy = require('http-proxy');
const auth = require('basic-auth');

// Configuration
const PORT = 3128;
const USERNAME = 'user';
const PASSWORD = 'pass';

// Create proxy server
const proxy = httpProxy.createProxyServer({});

// Helper to log request body
function getRequestBody(req, callback) {
  let body = [];
  req.on('data', chunk => body.push(chunk));
  req.on('end', () => {
    body = Buffer.concat(body).toString();
    callback(body);
  });
}

const server = http.createServer((req, res) => {
  const credentials = auth(req);

  if (!credentials || credentials.name !== USERNAME || credentials.pass !== PASSWORD) {
    res.writeHead(401, { 'WWW-Authenticate': 'Basic realm="Proxy"' });
    return res.end('Access denied');
  }

  // Log request details
  getRequestBody(req, body => {
    console.log('--- Incoming Request ---');
    console.log(`${req.method} ${req.url} from ${req.connection.remoteAddress}`);
    console.log('Headers:', req.headers);
    if (body) console.log('Body:', body);
    console.log('------------------------');

    // Proxy the request
    proxy.web(req, res, { target: req.url, changeOrigin: true }, err => {
      res.writeHead(502);
      res.end('Bad Gateway');
    });
  });
});

server.listen(PORT, () => {
  console.log(`HTTP Proxy running on port ${PORT}`);
});
