//-- arquivo apps/animais/model/mdlAnimais.js

const db = require("../../../database/databaseconfig");

const GetAllAnimais = async () => {
  return (
    await db.query(
      "SELECT * " +
        "FROM animal " +
        "WHERE removido = false ORDER BY nome ASC"
    )
  ).rows;
};

const GetAnimalByID = async (animalIDPar) => {
  return (
    await db.query(
      "SELECT * " +
        "FROM animal " +
        "WHERE animalid = $1 and removido = false",
      [animalIDPar]
    )
  ).rows;
};

const InsertAnimal = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "INSERT INTO animal " + "values(default, $1, $2, false)",
        [
          registroPar.nome,
          registroPar.datanasc,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimais|InsertAnimal] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateAnimal = async (animalIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET " +
          "nome = $2, " +
          "datanasc = $3 " +
          "WHERE animalid = $1 and removido = false",
        [
          animalIDPar,
          registroPar.nome,
          registroPar.datanasc,
        ]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimais|UpdateAnimal] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteAnimal = async (animalIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    //@ Regra de negócio: não deixa remover se houver registros ligados a ele.
    const totalLigados = (
      await db.query(
        "SELECT count(*) FROM alocado WHERE animalidifk = $1 and removido = false",
        [animalIDPar]
      )
    ).rows[0].count;

    if (totalLigados > 0) {
      return { msg: "Este animal possui alocações e não pode ser removido.", linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET " + "removido = true " + "WHERE animalid = $1 and removido = false",
        [animalIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimais|DeleteAnimal] " + error.detail;
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

module.exports = {
  GetAllAnimais,
  GetAnimalByID,
  InsertAnimal,
  UpdateAnimal,
  DeleteAnimal,
};
