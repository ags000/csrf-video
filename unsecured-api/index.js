const express = require('express');
const session = require('express-session');
const cors = require('cors');
const { doubleCsrf } = require("csrf-csrf");
const cookieParser = require('cookie-parser');

const CSRF_SECRET = "super csrf secret";
const COOKIES_SECRET = "super cookie secret";
const CSRF_COOKIE_NAME = "x-csrf-token";

const app = express();
app.use(cors({credentials: true, origin: 'http://localhost:5173'}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { invalidCsrfTokenError, generateToken, doubleCsrfProtection } =
  doubleCsrf({
    getSecret: () => CSRF_SECRET,
    cookieName: CSRF_COOKIE_NAME,
    cookieOptions: { sameSite: false, secure: false }, // not ideal for production, development only
  });

app.use(cookieParser(COOKIES_SECRET));

// Error handling, validation error interception
const csrfErrorHandler = (error, req, res, next) => {
  if (error == invalidCsrfTokenError) {
    res.status(403).json({
      error: "csrf validation error",
    });
  } else {
    next();
  }
};

app.use(session({
  name: 'mysessionname',
  secret: 'secretkey',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24,
  }
}));



app.get('/login', (req, res) => {
  req.session.loggedIn = true;
  return res.send('You are logged in');
});


app.get('/', (req, res) => {
  return res.send('Hello World');
});

app.use((req, res, next) => {
  if (req.session.loggedIn) {
    next();
  } else {
    return res.status(401).send('Not Authorized');
  }
});

app.get("/csrf-token", (req, res) => {
  return res.json({
    token: generateToken(req, res),
  });
});

app.get('/modify', (req, res) => {
  const { id, password } = req.query;

  console.log(`Mod. done successfully for id: ${id} and password: ${password}`); 
  return res.send('Modify route');
}); 

app.get('/secured', (req, res) => {
  return res.send('Secured route');
});

// Secured routes by session
app.post('/change-password', doubleCsrfProtection, csrfErrorHandler, (req, res) => {
  const {
    password,
  } = req.body;

  console.log("New password: ", password);

  return res.status(201).json({ message: `Password changed successfully, new password ${password}` });
})


app.listen(3000, () => {
  console.log('Server is running on http://localhost:3000');
});