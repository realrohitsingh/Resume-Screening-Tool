// diagnose.js - Simple script to check port availability
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Diagnostic server is running');
});

// Try to listen on port 3000
server.listen(3000, () => {
  console.log('Diagnostic server is running on port 3000');
  console.log('If you see this message, port 3000 is available');
  console.log('Try accessing http://localhost:3000 in your browser');
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error('Error: Port 3000 is already in use by another application');
    console.error('This could be why Vite is not showing its usual startup message');
    
    // Try another port
    const alternatePort = 3001;
    const alternateServer = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Diagnostic server is running on alternate port');
    });
    
    alternateServer.listen(alternatePort, () => {
      console.log(`Alternate diagnostic server is running on port ${alternatePort}`);
      console.log(`Try accessing http://localhost:${alternatePort} in your browser`);
    });
    
    alternateServer.on('error', (err) => {
      console.error(`Port ${alternatePort} is also unavailable:`, err.message);
    });
  } else {
    console.error('Unexpected error:', err.message);
  }
}); 