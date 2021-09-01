const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");

function generateRandomString() {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies["username"] };

  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    username: req.cookies["username"],
    longURL: req.params.longURL,
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  res.redirect("/urls");
});

//delete short URL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// show update form
app.post("/urls/:shortURL/update", (req, res) => {
  const currentLongURL = urlDatabase[req.params.shortURL];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: currentLongURL,
    username: req.cookies["username"],
  };
  res.render("urls_show", templateVars);
});

//update urlDatabase

app.post("/urls/:shortURL", (req, res) => {
  // extract the shortURL
  const shortURL = req.params.shortURL;

  // extract the updated longURL from the form
  const updatedLongURL = req.body.longURL;

  // update the db
  urlDatabase[shortURL] = updatedLongURL;

  // redirect to /quotes
  res.redirect("/urls");
});

//login a random User

app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

// logout a user

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

//Register New User
app.get("/register", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    username: req.cookies["username"],
    longURL: req.params.longURL,
  };
  res.render("urls_register", templateVars);
});
