import express from 'express';

const app = express();
const PORT = 3001;

console.log('[START] Server starting...');

app.get('/test', (req, res) => {
  console.log('[REQUEST] GET /test');
  res.json({ status: 'ok', message: 'Server is running!' });
});

console.log('[LISTEN] Starting to listen on port', PORT);

const server = app.listen(PORT, () => {
  console.log('[SUCCESS] Server listening on http://localhost:' + PORT);
  console.log('[INFO] Server is ready to accept connections');
});

// Keep process alive
server.on('error', (err) => {
  console.error('[ERROR]', err);
});

process.on('exit', () => {
  console.log('[EXIT] Server exiting');
});

console.log('[END] Setup complete - server should now be running');
