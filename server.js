const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const SECRET_CODE = process.env.SECRET_CODE || '0411';

const clients = new Set();

// SSE endpoint
app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);
  clients.add(res);
  req.on('close', () => {
    clearInterval(heartbeat);
    clients.delete(res);
  });
});

function broadcast(event, data = {}) {
  const payload = JSON.stringify(data);
  for (const client of clients) {
    client.write(`event: ${event}\ndata: ${payload}\n\n`);
  }
}

// Check the secret code
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

// Restart the timer (resets to 1 hour)
app.post('/timer/restart', (req, res) => {
  broadcast('timer-restart', { seconds: 3600 });
  return res.json({ result: 'ok', seconds: 3600 });
});

// Set timer to a custom duration and start it
// Body: { seconds: 1800 }  OR  { minutes: 30 }  OR  { hours: 1, minutes: 30 }
app.post('/timer/set', (req, res) => {
  const { seconds, minutes, hours } = req.body;

  let totalSeconds = 0;
  if (typeof seconds === 'number') totalSeconds += seconds;
  if (typeof minutes === 'number') totalSeconds += minutes * 60;
  if (typeof hours   === 'number') totalSeconds += hours   * 3600;

  if (totalSeconds <= 0) {
    return res.status(400).json({ result: 'error', message: 'Provide seconds, minutes, and/or hours > 0' });
  }

  broadcast('timer-set', { seconds: totalSeconds });
  return res.json({ result: 'ok', seconds: totalSeconds });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Secret code: ${SECRET_CODE}`);
});
