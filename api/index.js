const path = require('path');

// Static files (CSS, JS) serve করার জন্য
app.use(express.static(path.join(__dirname, '..')));

// Root (/) রিকোয়েস্টে index.html পাঠানোর জন্য
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'index.html'));
});