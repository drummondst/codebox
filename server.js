const express = require('express');
const path = require('path');
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// The secret 4-digit code - change this!
const SECRET_CODE = process.env.SECRET_CODE || '1337';

app.post('/check', (req, res) => {
  const { code } = req.body;

  if (!code || typeof code !== 'string' || !/^\d{4}$/.test(code)) {
    return res.status(400).json({ result: 'error', message: 'Must be a 4-digit number' });
  }

  if (code === SECRET_CODE) {
    return res.json({ result: 'win' });
  } else {
    return res.json({ result: 'nope' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Secret code: ${SECRET_CODE}`);
});
