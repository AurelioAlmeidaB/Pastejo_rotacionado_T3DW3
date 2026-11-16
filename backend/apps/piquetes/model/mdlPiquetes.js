const db = require("../../../database/databaseconfig");
const { textoVazio, numeroInvalido, idInvalido } = require("../../../utils/validacao");

const GetAllPiquetes = async () => {
  return (
    await db.query(
      "SELECT pi.*, pa.descricao AS pastodescricao " +
        "FROM piquete pi " +
        "INNER JOIN pasto pa ON pa.pastoid = pi.pastoidfk " +
        "WHERE pi.removido = false ORDER BY pi.descricao ASC"
    )
  ).rows;
};

const GetPiqueteByID = async (piqueteIDPar) => {
  return (
    await db.query(
      "SELECT pi.*, pa.descricao AS pastodescricao " +
        "FROM piquete pi " +
        "INNER JOIN pasto pa ON pa.pastoid = pi.pastoidfk " +
        "WHERE pi.piqueteid = $1 AND pi.removido = false",
      [piqueteIDPar]
    )
  ).rows;
};

const GetPastosToPiquetes = async () => {
  return (
    await db.query(
      "SELECT pastoid, descricao FROM pasto WHERE removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const ValidaPiquete = (registroPar) => {
  if (textoVazio(registroPar.descricao)) {
    return "Informe a descrição do piquete.";
  }

  if (idInvalido(registroPar.pastoidfk)) {
    return "Selecione o pasto do piquete.";
  }

  if (numeroInvalido(registroPar.latitude) || Math.abs(Number(registroPar.latitude)) > 90) {
    return "A latitude deve estar entre -90 e 90.";
  }

  if (numeroInvalido(registroPar.longitude) || Math.abs(Number(registroPar.longitude)) > 180) {
    return "A longitude deve estar entre -180 e 180.";
  }

  return null;
};

const InsertPiquete = async (registroPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const erro = ValidaPiquete(registroPar);

    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "INSERT INTO piquete VALUES (default, $1, $2, $3, $4, false)",
        [
          registroPar.descricao.trim(),
          registroPar.latitude,
          registroPar.longitude,
          registroPar.pastoidfk,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquetes|InsertPiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdatePiquete = async (piqueteIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const erro = ValidaPiquete(registroPar);

    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET descricao = $2, latitude = $3, longitude = $4, pastoidfk = $5 " +
          "WHERE piqueteid = $1 AND removido = false",
        [
          piqueteIDPar,
          registroPar.descricao.trim(),
          registroPar.latitude,
          registroPar.longitude,
          registroPar.pastoidfk,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquetes|UpdatePiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeletePiquete = async (piqueteIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const totalAlocados = (
      await db.query(
        "SELECT count(*) FROM alocado " +
          "WHERE piqueteidfk = $1 AND datafinal IS NULL AND removido = false",
        [piqueteIDPar]
      )
    ).rows[0].count;

    if (Number(totalAlocados) > 0) {
      return {
        msg: "Este piquete possui animais alocados (alocação em andamento) e não pode ser removido.",
        linhasAfetadas: 0,
      };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET removido = true WHERE piqueteid = $1 AND removido = false",
        [piqueteIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquetes|DeletePiquete] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllPiquetes,
  GetPiqueteByID,
  GetPastosToPiquetes,
  InsertPiquete,
  UpdatePiquete,
  DeletePiquete,
};
