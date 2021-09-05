const bcrypt = require("bcryptjs");

//find a user object containing a matching email

const findUserByEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

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

module.exports = {
  findUserByEmail,
  generateRandomString,
  authenticateUser,
  urlsForUser,
};
