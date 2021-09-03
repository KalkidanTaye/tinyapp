const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");

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
    password: "lighthouselabs",
  },
  "27Gns3": {
    id: "27Gns3",
    email: "kali@gmail.com",
    password: "kalikali",
  },
};

// create new URL

const createNewURL = (content) => {
  const urlId = generateRandomString();

  // creating the new URL object
  const newUrl = {
    id: urlId,
    quote: content,
  };

  // Add the newQuote object to movieQuotesDb

  movieQuotesDb[quoteId] = newQuote;

  return quoteId;
};

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

//find a user object containing a matching email

const findUserByEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

//Authenticate User

const authenticateUser = (email, password, users) => {
  const userFound = findUserByEmail(email, users);
  if (userFound && userFound.password === password) {
    return userFound;
  }
  return false;
};

//-------------------------- app.get -------------------------//
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

//app.get("/urls"

app.get("/urls", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    const user = users[userId];
    const urls = urlsForUser(userId, urlDatabase);
    const templateVars = { urls, user };
    return res.render("urls_index", templateVars);
  }
  res.redirect("/login");
});
// register
app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"];
  if (userId) {
    const user = users[userId];
    const templateVars = { user };
    return res.render("urls_new", templateVars);
  }
  res.redirect("/login"); //redirect
});

app.get("/urls/:shortURL", (req, res) => {
  const userId = req.cookies["user_id"];
  const urls = urlsForUser(userId, urlDatabase);
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urls[req.params.shortURL].longURL,
    user: users[userId],
  };

  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//

app.post("/urls", (req, res) => {
  const userId = req.cookies["user_id"];

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

// show update form
app.post("/urls/:shortURL/", (req, res) => {
  const currentLongURL = urlDatabase[req.params.shortURL];
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: currentLongURL,
    user: req.cookies["user_id"],
  };
  res.render("urls_show", templateVars);
});

//update urlDatabase

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = req.params.shortURL;
  const updatedLongURL = req.body.longURL;
  urlDatabase[shortURL] = updatedLongURL;
  res.redirect("/urls");
});

//Log in a user - works
app.get("/login", (req, res) => {
  const templateVars = { user: req.cookies["user_id"] };
  res.render("urls_login", templateVars);
});
//login a user - works

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = authenticateUser(email, password, users);
  if (user) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Sorry, wrong credentials! Please try again.");
  }
  res.redirect("/urls");
});

// logout a user - works

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});

//Register New User - works
app.get("/register", (req, res) => {
  const templateVars = {
    user: req.cookies["user_id"],
  };
  res.render("urls_register", templateVars);
});

//handle register form - works
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //check if a user exists

  const userFound = findUserByEmail(email, users);
  if (userFound) {
    res.status(403);
    return res.send("The email already exists!");
  }
  if (!email) {
    res.status(403);
    return res.send("Please enter a valid email address");
  }
  if (!password) {
    res.status(403);
    return res.send("Please enter a password");
  }

  //generate a new User ID
  const newUserId = generateRandomString();

  const newUser = {
    id: newUserId,
    email,
    password,
  };

  users[newUserId] = newUser;

  //set the cookie to remeber the user
  res.cookie("user_Id", newUserId);

  res.redirect("/urls");
});

app.get("/users", (req, res) => {
  res.json(users);
});
