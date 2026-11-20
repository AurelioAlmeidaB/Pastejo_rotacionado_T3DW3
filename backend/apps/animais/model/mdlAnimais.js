const db = require("../../../database/databaseconfig");
const { textoVazio, dataInvalida, dataDeHoje } = require("../../../utils/validacao");

const GetAllAnimais = async () => {
  return (
    await db.query(
      "SELECT * FROM animal WHERE removido = false ORDER BY nome ASC"
    )
  ).rows;
};

const GetAnimalByID = async (animalIDPar) => {
  return (
    await db.query(
      "SELECT * FROM animal WHERE animalid = $1 AND removido = false",
      [animalIDPar]
    )
  ).rows;
};

const ValidaAnimal = (registroPar) => {
  if (textoVazio(registroPar.nome)) {
    return "Informe o nome do animal.";
  }

  if (dataInvalida(registroPar.datanasc)) {
    return "Informe a data de nascimento do animal.";
  }

  if (registroPar.datanasc > dataDeHoje()) {
    return "A data de nascimento não pode ser uma data futura.";
  }

  return null;
};

const InsertAnimal = async (registroPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const erro = ValidaAnimal(registroPar);

    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "INSERT INTO animal VALUES (default, $1, $2, false)",
        [registroPar.nome.trim(), registroPar.datanasc]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimais|InsertAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateAnimal = async (animalIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const erro = ValidaAnimal(registroPar);

    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET nome = $2, datanasc = $3 " +
          "WHERE animalid = $1 AND removido = false",
        [animalIDPar, registroPar.nome.trim(), registroPar.datanasc]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimais|UpdateAnimal] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const DeleteAnimal = async (animalIDPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const totalAlocados = (
      await db.query(
        "SELECT count(*) FROM alocado " +
          "WHERE animalidifk = $1 AND (datafinal IS NULL OR datafinal >= CURRENT_DATE) AND removido = false",
        [animalIDPar]
      )
    ).rows[0].count;

    if (Number(totalAlocados) > 0) {
      return {
        msg: "Este animal está alocado em um piquete (alocação em andamento ou futura) e não pode ser removido.",
        linhasAfetadas: 0,
      };
    }

    linhasAfetadas = (
      await db.query(
        "UPDATE animal SET removido = true WHERE animalid = $1 AND removido = false",
        [animalIDPar]
      )
    ).rowCount;
  } catch (error) {
    msg = "[mdlAnimais|DeleteAnimal] " + (error.detail || error.message);
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
