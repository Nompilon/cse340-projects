const bcrypt = require("bcryptjs");

async function hashPassword(plainPassword) {
  try {
    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    console.log("Plain password: ", plainPassword);
    console.log("Hashed password: ", hashedPassword);
  } catch (err) {
    console.error(err);
  }
}

// Replace this with your password
const myPassword = "I@mABas1cCl!3nt";
hashPassword(myPassword);
