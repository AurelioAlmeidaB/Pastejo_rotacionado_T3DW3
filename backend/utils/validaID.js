const { idInvalido } = require("./validacao");

const validaID = (req, res, next) => {
  if (Object.values(req.params).some(idInvalido)) {
    return res.json({ status: "ID inválido.", linhasAfetadas: 0, registro: [] });
  }

  next();
};

module.exports = validaID;
