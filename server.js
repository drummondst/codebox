const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SECRET_CODE = process.env.SECRET_CODE || '1337';

// Keep track of all connected browser clients
const clients = new Set();

// SSE endpoint — browsers connect here to receive live updates
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.add(res);
  req.on('close', () => clients.delete(res));
});

function broadcast(event) {
  for (const client of clients) {
    client.write(`event: ${event}\ndata: {}\n\n`);
  }
}

// The endpoint your external service hits
app.post('/check', (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string' || !/^\d{4}$/.test(code)) {
    return res.status(400).json({ result: 'error', message: 'Must be a 4-digit number' });
  }

  if (code === SECRET_CODE) {
    broadcast('win');
    return res.json({ result: 'win' });
  } else {
    broadcast('nope');
    return res.json({ result: 'nope' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Secret code: ${SECRET_CODE}`);
});
