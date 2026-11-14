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

//@ Regras de negócio da alocação. Retorna a mensagem de erro ou null se estiver tudo certo.
//@ alocadoIDPar é 0 no insert e o ID do registro no update (para não comparar a alocação com ela mesma).
const ValidaAlocado = async (alocadoIDPar, registroPar) => {
  if (registroPar.datafinal && registroPar.datafinal < registroPar.datainicio) {
    return "A data final não pode ser menor que a data de início.";
  }

  //@ Um animal não pode estar em dois piquetes ao mesmo tempo (períodos que se sobrepõem).
  const conflito = (
    await db.query(
      "SELECT count(*) FROM alocado " +
        "WHERE animalidifk = $1 and alocadoid <> $2 and removido = false " +
        "and (datafinal is null or datafinal >= $3) " +
        "and ($4::date is null or datainicio <= $4::date)",
      [registroPar.animalidifk, alocadoIDPar, registroPar.datainicio, registroPar.datafinal]
    )
  ).rows[0].count;

  if (conflito > 0) {
    return "Este animal já está alocado em outro piquete nesse período.";
  }

  return null;
};

const InsertAlocado = async (registroPar) => {
  //@ Atenção: aqui utilizamos a variável msg para retornar erros de banco de dados.
  let linhasAfetadas;
  let msg = "ok";
  try {
    const erro = await ValidaAlocado(0, registroPar);
    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

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
    msg = "[mdlAlocados|InsertAlocado] " + (error.detail || error.message);
    linhasAfetadas = -1;
  }

  return { msg, linhasAfetadas };
};

const UpdateAlocado = async (alocadoIDPar, registroPar) => {
  let linhasAfetadas;
  let msg = "ok";
  try {
    const erro = await ValidaAlocado(alocadoIDPar, registroPar);
    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

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
    msg = "[mdlAlocados|UpdateAlocado] " + (error.detail || error.message);
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
    msg = "[mdlAlocados|DeleteAlocado] " + (error.detail || error.message);
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
