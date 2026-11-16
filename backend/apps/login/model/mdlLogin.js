const db = require("../../../database/databaseconfig");

const GetCredencial = async (usernamePar) => {
  return (
    await db.query(
      "SELECT username, password FROM usuarios WHERE username = $1 AND removido = false",
      [usernamePar]
    )
  ).rows;
};

module.exports = {
  GetCredencial,
};
