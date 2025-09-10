const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();
const rateLimit = require("express-rate-limit");

const app = express();
app.set("trust proxy", 1);
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Apply rate limiting globally
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per window
  message: `
    <html>
      <head>
        <title>Too Many Requests</title>
        <style>
          body {
            background: #ffefef;
            font-family: 'Segoe UI', sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
          }
          .warnbox {
            background: #fff8;
            border-radius: 20px;
            padding: 32px;
            text-align: center;
            box-shadow: 0 2px 15px #ff4444cc;
          }
          h2 { color: #c33; margin-bottom: 15px; }
        </style>
      </head>
      <body>
        <div class="warnbox">
          <h2>⚠️ Rate Limit Reached</h2>
          <p>Too many requests. Please wait and try again later after 10 min (why brute force...).</p>
        </div>
      </body>
    </html>
  `,
});
app.use(limiter);

// In-memory SQLite setup: resets on each function call
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)"
  );
  db.run(
    "INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'admin', 'supersecret')"
  );
});

// Login form
app.get("/", (req, res) => {
  res.send(`
    <html>
      <head>
        <title>CTFd Login</title>
        <style>
          body {
            background: linear-gradient(135deg, #83a4d4, #b6fbff);
            font-family: 'Segoe UI', sans-serif;
            min-height: 100vh;
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
          }
          .login-box {
            background: #fff9;
            border-radius: 18px;
            box-shadow: 0 2px 24px #3336;
            padding: 32px;
            animation: entrance 0.7s;
          }
          h2 { text-align: center; color: #2e4359; }
          input {
            border: none; border-radius: 7px;
            padding: 8px; font-size: 1rem;
            margin-bottom: 12px; width: 100%;
            transition: box-shadow 0.4s;
          }
          input:focus { box-shadow: 0 0 8px #57cdfc; }
          button {
            background: #57cdfc; color: white;
            border: none; border-radius: 6px;
            padding: 8px 20px; font-weight: bold;
            font-size: 1rem; transition: background 0.3s;
          }
          button:hover { background: #3485a6; }
          @keyframes entrance {
            0% { transform: scale(0.8) translateY(30px); opacity: 0; }
            90% { opacity: 1; }
            100% { transform: scale(1) translateY(0); opacity: 1; }
          }
        </style>
      </head>
      <body>
        <div class="login-box">
          <h2>✨ CTFd Login ✨</h2>
          <form method="POST" action="/login">
            <input name="username" placeholder="Username" required><br>
            <input name="password" type="password" placeholder="Password" required><br>
            <button type="submit">Login</button>
          </form>
        </div>
      </body>
    </html>
  `);
});

// Login POST: check credentials and respond with animations
app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username='${username}' AND password='${password}'`;
  db.get(query, (err, row) => {
    if (err) {
      return res.send(`<html><body><h2>Error: ${err.message}</h2></body></html>`);
    }
    if (row) {
      return res.send(`
        <html>
          <head>
            <style>
              body { text-align:center; background:#cefff7; }
              .flagbox {
                margin:120px auto; background:#fff9; padding:35px 10px;
                border-radius:18px; font-size:1.4rem; color:#262b47; box-shadow:0 2px 24px #3332;
              }
            </style>
            <script src="https://cdn.jsdelivr.net/gh/CoderZ90/confetti/confetti.js"></script>
          </head>
          <body>
            <div class="flagbox"><h2>✅ Welcome!<br>Flag: <b>PhaseShift{you_got_me_now_sV3$s$6}</b></h2></div>
            <script>
              setTimeout(() => { confetti.start(); }, 300);
              setTimeout(() => { confetti.stop(); }, 4000);
            </script>
            <div style="margin-top:30px;"><a href="/">Logout / Home</a></div>
          </body>
        </html>
      `);
    } else {
      return res.send(`
        <html>
          <head>
            <style>
              body {
                background: linear-gradient(135deg, #ffd6d6, #ffcad4);
                display: flex; flex-direction: column;
                justify-content: center; align-items: center;
                min-height: 100vh;
              }
              .error-card {
                background: #fff3;
                padding: 32px;
                border-radius: 20px;
                box-shadow: 0 0 15px #d9534f66;
                margin-top: 60px;
                animation: shakeit 0.5s;
              }
              @keyframes shakeit {
                0%, 100% { transform: translateX(0); }
                20%, 60% { transform: translateX(-16px); }
                40%, 80% { transform: translateX(16px); }
              }
              h2 { color: #d9534f; }
              .rickroll-gif {
                width: 360px;
                border-radius: 20px;
                margin: 12px 0;
              }
            </style>
          </head>
          <body>
            <div class="error-card">
              <h2>❌ Invalid credentials</h2>
              <img class="rickroll-gif" src="https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExdTRjYjdobXVtanE1bTcweWoyZWVmaDZocnl0NXh6dWE5czNwbDViYyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/YExAAySmC0I9u2TjKJ/giphy.gif" alt="Rickroll GIF"><br>
              <div><a href="/">Try Again</a></div>
            </div>
          </body>
        </html>
      `);
    }
  });
});

// Export app for Vercel serverless
module.exports = app;
