//-- arquivo apps/piquetes/model/mdlPiquetes.js

const db = require("../../../database/databaseconfig");

const GetAllPiquetes = async () => {
  return (
    await db.query(
      "SELECT pi.*, pa.descricao as pastodescricao " +
        "FROM piquete pi " +
        "INNER JOIN pasto pa ON pa.pastoid = pi.pastoidfk " +
        "WHERE pi.removido = false ORDER BY pi.descricao ASC"
    )
  ).rows;
};

const GetPiqueteByID = async (piqueteIDPar) => {
  return (
    await db.query(
      "SELECT pi.*, pa.descricao as pastodescricao " +
        "FROM piquete pi " +
        "INNER JOIN pasto pa ON pa.pastoid = pi.pastoidfk " +
        "WHERE pi.piqueteid = $1 and pi.removido = false",
      [piqueteIDPar]
    )
  ).rows;
};

//@ Pastos usados no componente Select do formulário de piquetes.
const GetPastosToPiquetes = async () => {
  return (
    await db.query(
      "SELECT pastoid, descricao " +
        "FROM pasto " +
        "WHERE removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const InsertPiquete = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO piquete " + "values(default, $1, $2, $3, $4, false)",
        [
          registroPar.descricao,
          registroPar.latitude,
          registroPar.longitude,
          registroPar.pastoidfk,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquetes|InsertPiquete] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdatePiquete = async (piqueteIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET " +
          "descricao = $2, " +
          "latitude = $3, " +
          "longitude = $4, " +
          "pastoidfk = $5 " +
          "WHERE piqueteid = $1 and removido = false",
        [
          piqueteIDPar,
          registroPar.descricao,
          registroPar.latitude,
          registroPar.longitude,
          registroPar.pastoidfk,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquetes|UpdatePiquete] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeletePiquete = async (piqueteIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    //@ Regra de negócio: não deixa remover se houver registros ligados a ele.
    const totalLigados = (
      await db.query(
        "SELECT count(*) FROM alocado WHERE piqueteidfk = $1 and removido = false",
        [piqueteIDPar]
      )
    ).rows[0].count;

    if (totalLigados > 0) {
      return { msg: "Este piquete possui animais alocados e não pode ser removido.", linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE piquete SET " + "removido = true " + "WHERE piqueteid = $1 and removido = false",
        [piqueteIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlPiquetes|DeletePiquete] " + error.detail;
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
