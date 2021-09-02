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
//url database
const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//database for the users
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};
//find a user object containing a matching email

const findUserByEmail = (email, users) => {
  // return Object.keys(usersDb).find(key => usersDb[key].email === email)

  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId]; // return the user object
    }
  }
  return false;
};

//Authenticate User

const authenticateUser = (email, password, users) => {
  // contained the user info if found or false if not
  const userFound = findUserByEmail(email, users);

  if (userFound && userFound.password === password) {
    return userFound;
  }
  return false;
};

//
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
  const templateVars = { urls: urlDatabase, email: req.cookies["email.email"] };

  res.render("urls_index", templateVars);
});
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    email: req.cookies["user_id"],
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
    email: req.cookies["user_id"],
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

//Log in a user
app.get("/login", (req, res) => {
  const templateVars = {
    email: req.cookies["user_id"],
  };
  res.render("urls_login", templateVars);
});
//login a random User

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  const user = authenticateUser(email, password, users);
  if (user) {
    // log the user in
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(403);
    res.send("Sorry, wrong credentials! Please try again.");
  }
});

// logout a user

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

//Register New User
app.get("/register", (req, res) => {
  const templateVars = {
    email: req.cookies["user_id"],
  };
  res.render("urls_register", templateVars);
});

//handle register form
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
