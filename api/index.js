const express = require("express");
const bodyParser = require("body-parser");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// In-memory SQLite setup: resets every function invocation (stateless)
const db = new sqlite3.Database(":memory:");
db.serialize(() => {
  db.run("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, password TEXT)");
  db.run("INSERT OR IGNORE INTO users (id, username, password) VALUES (1, 'admin', 'supersecret')");
});

// Show login form
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
            transition: background 0.5s;
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
            transition: box-shadow 0.4s;
            margin-bottom: 12px;
            width: 100%;
          }
          input:focus { box-shadow: 0 0 8px #57cdfc; }
          button {
            background: #57cdfc;
            color: white; border: none;
            border-radius: 6px;
            padding: 8px 20px; font-weight: bold;
            font-size: 1rem;
            transition: background 0.3s;
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
      // Valid login - show flag with confetti animation
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
            <div class="flagbox">
              <h2>✅ Welcome!<br>Flag: <b>PhaseShift{you_got_me_now_sV3$s$6}</b></h2>
            </div>
            <script>
              setTimeout(() => { confetti.start(); }, 300);
              setTimeout(() => { confetti.stop(); }, 4000);
            </script>
            <div style="margin-top:30px;"><a href="/">Logout / Home</a></div>
          </body>
        </html>
      `);
    } else {
      // Invalid login - show Rickroll gif + shake effect
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
              <img class="rickroll-gif" src="https://media.tenor.com/4KJXvtrr98cAAAAd/rickroll.gif" alt="Rickroll GIF"><br>
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
