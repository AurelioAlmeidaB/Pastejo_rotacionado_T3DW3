const db = require("../../../database/databaseconfig");
const { textoVazio, numeroInvalido } = require("../../../utils/validacao");

const GetAllPastos = async () => {
  return (
    await db.query(
      "SELECT * FROM pasto WHERE removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const GetPastoByID = async (pastoIDPar) => {
  return (
    await db.query(
      "SELECT * FROM pasto WHERE pastoid = $1 AND removido = false",
      [pastoIDPar]
    )
  ).rows;
};

const ValidaPasto = (registroPar) => {
  if (textoVazio(registroPar.descricao)) {
    return "Informe a descrição do pasto.";
  }

  if (numeroInvalido(registroPar.areatotal) || Number(registroPar.areatotal) <= 0) {
    return "A área total deve ser maior que zero.";
  }

  return null;
};

const InsertPasto = async (registroPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const erro = ValidaPasto(registroPar);

    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "INSERT INTO pasto VALUES (default, $1, $2, false)",
        [registroPar.descricao.trim(), registroPar.areatotal]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPastos|InsertPasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdatePasto = async (pastoIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const erro = ValidaPasto(registroPar);

    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET descricao = $2, areatotal = $3 " +
          "WHERE pastoid = $1 AND removido = false",
        [pastoIDPar, registroPar.descricao.trim(), registroPar.areatotal]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPastos|UpdatePasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeletePasto = async (pastoIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const totalPiquetes = (
      await db.query(
        "SELECT count(*) FROM piquete WHERE pastoidfk = $1 AND removido = false",
        [pastoIDPar]
      )
    ).rows[0].count;

    if (Number(totalPiquetes) > 0) {
      return { msg: "Este pasto possui piquetes e não pode ser removido.", linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET removido = true WHERE pastoid = $1 AND removido = false",
        [pastoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPastos|DeletePasto] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPastos,
  GetPastoByID,
  InsertPasto,
  UpdatePasto,
  DeletePasto,
};
