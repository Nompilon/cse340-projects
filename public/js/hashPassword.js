const bcrypt = require('bcrypt')

async function createHash() {
  const password = "#node hashPassword.jsPassword123"
  const hash = await bcrypt.hash(password, 10)
  console.log(hash);
}

createHash()