const db = require("../../../database/databaseconfig");
const { idInvalido, dataInvalida } = require("../../../utils/validacao");

const GetAllAlocados = async () => {
  return (
    await db.query(
      "SELECT al.*, an.nome AS animalnome, pi.descricao AS piquetedescricao " +
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
      "SELECT al.*, an.nome AS animalnome, pi.descricao AS piquetedescricao " +
        "FROM alocado al " +
        "INNER JOIN animal an ON an.animalid = al.animalidifk " +
        "INNER JOIN piquete pi ON pi.piqueteid = al.piqueteidfk " +
        "WHERE al.alocadoid = $1 AND al.removido = false",
      [alocadoIDPar]
    )
  ).rows;
};

const GetAnimaisToAlocados = async () => {
  return (
    await db.query(
      "SELECT animalid, nome FROM animal WHERE removido = false ORDER BY nome ASC"
    )
  ).rows;
};

const GetPiquetesToAlocados = async () => {
  return (
    await db.query(
      "SELECT pi.piqueteid, pi.descricao, pa.descricao AS pastodescricao " +
        "FROM piquete pi " +
        "INNER JOIN pasto pa ON pa.pastoid = pi.pastoidfk " +
        "WHERE pi.removido = false ORDER BY pi.descricao ASC"
    )
  ).rows;
};

const ValidaAlocado = async (alocadoIDPar, registroPar) => {
  if (idInvalido(registroPar.animalidifk)) {
    return "Selecione o animal.";
  }

  if (idInvalido(registroPar.piqueteidfk)) {
    return "Selecione o piquete.";
  }

  if (dataInvalida(registroPar.datainicio)) {
    return "Informe a data de início.";
  }

  if (registroPar.datafinal && dataInvalida(registroPar.datafinal)) {
    return "A data final é inválida.";
  }

  if (registroPar.datafinal && registroPar.datafinal < registroPar.datainicio) {
    return "A data final não pode ser menor que a data de início.";
  }

  const totalConflitos = (
    await db.query(
      "SELECT count(*) FROM alocado " +
        "WHERE animalidifk = $1 AND alocadoid <> $2 AND removido = false " +
        "AND (datafinal IS NULL OR datafinal >= $3) " +
        "AND ($4::date IS NULL OR datainicio <= $4::date)",
      [registroPar.animalidifk, alocadoIDPar, registroPar.datainicio, registroPar.datafinal || null]
    )
  ).rows[0].count;

  if (Number(totalConflitos) > 0) {
    return "Este animal já está alocado em outro piquete nesse período.";
  }

  return null;
};

const InsertAlocado = async (registroPar) => {
  let linhasAfetadas;
  let msg = "ok";

  try {
    const erro = await ValidaAlocado(0, registroPar);

    if (erro) {
      return { msg: erro, linhasAfetadas: 0 };
    }

    linhasAfetadas = (
      await db.query(
        "INSERT INTO alocado VALUES (default, $1, $2, $3, $4, false)",
        [
          registroPar.animalidifk,
          registroPar.piqueteidfk,
          registroPar.datainicio,
          registroPar.datafinal || null,
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
        "UPDATE alocado SET animalidifk = $2, piqueteidfk = $3, datainicio = $4, datafinal = $5 " +
          "WHERE alocadoid = $1 AND removido = false",
        [
          alocadoIDPar,
          registroPar.animalidifk,
          registroPar.piqueteidfk,
          registroPar.datainicio,
          registroPar.datafinal || null,
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
        "UPDATE alocado SET removido = true WHERE alocadoid = $1 AND removido = false",
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
