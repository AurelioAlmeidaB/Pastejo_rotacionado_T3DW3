//-- arquivo apps/alocados/model/mdlAlocados.js

const db = require("../../../database/databaseconfig");

const GetAllAlocados = async () => {
  return (
    await db.query(
      "SELECT al.*, an.nome as animalnome, pi.descricao as piquetedescricao " +
        "FROM alocado al " +
        "INNER JOIN animal an ON an.animalid = al.animalidifk " +
        "INNER JOIN piquete pi ON pi.piqueteid = al.piqueteidfk " +
        "WHERE al.removido = false ORDER BY al.datainicio DESC"
    )
  ).rows;
};

const GetAlocadoByID = async (alocadoIDPar) => {
  return (
    await db.query(
      "SELECT al.*, an.nome as animalnome, pi.descricao as piquetedescricao " +
        "FROM alocado al " +
        "INNER JOIN animal an ON an.animalid = al.animalidifk " +
        "INNER JOIN piquete pi ON pi.piqueteid = al.piqueteidfk " +
        "WHERE al.alocadoid = $1 and al.removido = false",
      [alocadoIDPar]
    )
  ).rows;
};

//@ Animais usados no componente Select do formulário de alocações.
const GetAnimaisToAlocados = async () => {
  return (
    await db.query(
      "SELECT animalid, nome " +
        "FROM animal " +
        "WHERE removido = false ORDER BY nome ASC"
    )
  ).rows;
};

//@ Piquetes usados no componente Select do formulário de alocações.
const GetPiquetesToAlocados = async () => {
  return (
    await db.query(
      "SELECT pi.piqueteid, pi.descricao, pa.descricao as pastodescricao " +
        "FROM piquete pi " +
        "INNER JOIN pasto pa ON pa.pastoid = pi.pastoidfk " +
        "WHERE pi.removido = false ORDER BY pi.descricao ASC"
    )
  ).rows;
};

const InsertAlocado = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO alocado " + "values(default, $1, $2, $3, $4, false)",
        [
          registroPar.animalidifk,
          registroPar.piqueteidfk,
          registroPar.datainicio,
          registroPar.datafinal,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocados|InsertAlocado] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateAlocado = async (alocadoIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE alocado SET " +
          "animalidifk = $2, " +
          "piqueteidfk = $3, " +
          "datainicio = $4, " +
          "datafinal = $5 " +
          "WHERE alocadoid = $1 and removido = false",
        [
          alocadoIDPar,
          registroPar.animalidifk,
          registroPar.piqueteidfk,
          registroPar.datainicio,
          registroPar.datafinal,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocados|UpdateAlocado] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteAlocado = async (alocadoIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE alocado SET " + "removido = true " + "WHERE alocadoid = $1 and removido = false",
        [alocadoIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAlocados|DeleteAlocado] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllAlocados,
  GetAlocadoByID,
  GetAnimaisToAlocados,
  GetPiquetesToAlocados,
  InsertAlocado,
  UpdateAlocado,
  DeleteAlocado,
};
