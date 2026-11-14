//-- arquivo apps/pastos/model/mdlPastos.js

const db = require("../../../database/databaseconfig");

const GetAllPastos = async () => {
  return (
    await db.query(
      "SELECT * " +
        "FROM pasto " +
        "WHERE removido = false ORDER BY descricao ASC"
    )
  ).rows;
};

const GetPastoByID = async (pastoIDPar) => {
  return (
    await db.query(
      "SELECT * " +
        "FROM pasto " +
        "WHERE pastoid = $1 and removido = false",
      [pastoIDPar]
    )
  ).rows;
};

const InsertPasto = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO pasto " + "values(default, $1, $2, false)",
        [
          registroPar.descricao,
          registroPar.areatotal,
        ]
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
    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET " +
          "descricao = $2, " +
          "areatotal = $3 " +
          "WHERE pastoid = $1 and removido = false",
        [
          pastoIDPar,
          registroPar.descricao,
          registroPar.areatotal,
        ]
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
    //@ Regra de negócio: não deixa remover se houver registros ligados a ele.
    const totalLigados = (
      await db.query(
        "SELECT count(*) FROM piquete WHERE pastoidfk = $1 and removido = false",
        [pastoIDPar]
      )
    ).rows[0].count;

    if (totalLigados > 0) {
      return { msg: "Este pasto possui piquetes e não pode ser removido.", linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE pasto SET " + "removido = true " + "WHERE pastoid = $1 and removido = false",
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
