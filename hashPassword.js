const bcrypt = require('bcrypt');

async function createHash() {
  const password = "Password@123"; 
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

createHash();