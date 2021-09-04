//find a user object containing a matching email

const findUserByEmail = (email, users) => {
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

module.exports = { findUserByEmail };
