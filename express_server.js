const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const cookieSession = require("cookie-session");
const { findUserByEmail } = require("./helpers.js");

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(
  cookieSession({
    name: "session",
    keys: ["key1", "key2"],
  })
);

//------------------------------- Database ---------------------------
//url database
const urlDatabase = {
  "2bxVn2": {
    longURL: "http://www.lighthouselabs.ca",
    shortURL: "2bxVn2",
    userID: "27Gns3",
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    shortURL: "9sm5xK",
    userID: "H1d3g5",
  },
};

//database for users
const users = {
  H1d3g5: {
    id: "H1d3g5",
    email: "user@lighthouselabs.com",
    password: bcrypt.hashSync("lighthouselabs", 10),
  },
  "27Gns3": {
    id: "27Gns3",
    email: "kali@gmail.com",
    password: bcrypt.hashSync("kalikali", 10),
  },
};

//---------------------------- Function ---------------------------
// Generates random ID
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
//return url for a user

const urlsForUser = function (user_id, urlDatabase) {
  const results = {};
  for (let urlKey in urlDatabase) {
    const url = urlDatabase[urlKey];
    if (url.userID === user_id) {
      results[urlKey] = url;
    }
  }
  return results;
};

//Authenticate User

const authenticateUser = (email, password, users) => {
  const userFound = findUserByEmail(email, users);
  if (userFound && bcrypt.compareSync(password, userFound.password)) {
    return userFound;
  }
  return false;
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
//-------------------------- GET requests-------------------------//
app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const userId = req.session["user_id"];
  if (userId) {
    const user = users[userId];
    const urls = urlsForUser(userId, urlDatabase);
    const templateVars = { urls, user };
    return res.render("urls_index", templateVars);
  }
  res.redirect("/login");
});

app.get("/urls/new", (req, res) => {
  const userId = req.session["user_id"];
  if (userId) {
    const user = users[userId];
    const templateVars = { user };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.session["user_id"];
  const urls = urlsForUser(userId, urlDatabase);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urls[req.params.shortURL].longURL,
    user: users[userId],
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  if (!longURL) {
    res.status(403);
    return res.send("URL not found! Please try again");
  }
  longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

app.get("/login", (req, res) => {
  const templateVars = { user: req.session["user_id"] };
  res.render("urls_login", templateVars);
});

//Register New User - works
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.session["user_id"],
  };
  res.render("urls_register", templateVars);
});

app.get("/users", (req, res) => {
  res.json(users);
});

//------------------- POST routes --------------------------

app.post("/urls", (req, res) => {
  const userId = req.session["user_id"];

  if (!users[userId]) {
    res.send("Please Login");
    res.redirect("/login");
  }

  const { longURL } = req.body;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL, shortURL, userID: userId };
  res.redirect("/urls");
});

//delete short URL from database
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

// update
app.post("/urls/:shortURL/update", (req, res) => {
  const userId = req.session["user_id"];
  const shortURL = req.params.shortURL;
  const currentLongURL = urlDatabase[shortURL].longURL;
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: currentLongURL,
    user: users[userId],
  };
  res.render("urls_show", templateVars);
});

//update urlDatabase

app.post("/urls/:shortURL", (req, res) => {
  const user = users[req.session["user_id"]];
  const shortURL = req.params.shortURL;
  if (!user) {
    res.status(403);
    res.send("Sorry, wrong credentials! Please try again.");
  }
  console.log(urlDatabase[shortURL].userID, user.id);
  if (urlDatabase[shortURL].userID !== user.id) {
    res.status(403);
    res.send("Sorry, wrong credentials! Not your URL! Please login.");
    return;
  }
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL].longURL = updatedLongURL;
  res.redirect("/urls");
});

//login a user

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const authenticatedUser = authenticateUser(email, password, users);
  if (!authenticatedUser) {
    res.status(403);
    res.send("Sorry, wrong credentials! Please try again.");
  }
  req.session["user_id"] = authenticatedUser.id;
  // req.session("user_id", user.id);
  res.redirect("/urls");
});

// logout a user

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
});

//handle register form - works
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userFound = findUserByEmail(email, users);

  if (userFound) {
    res.status(403);
    return res.send("The email already exists!");
  }
  if (!email || !password) {
    res.status(403);
    return res.send("Please enter a valid email address or password");
  }
  const newUserId = generateRandomString();

  const newUser = {
    id: newUserId,
    email,
    password,
  };

  users[newUserId] = newUser;
  res.cookie("user_Id", newUserId);
  res.redirect("/urls");
});
