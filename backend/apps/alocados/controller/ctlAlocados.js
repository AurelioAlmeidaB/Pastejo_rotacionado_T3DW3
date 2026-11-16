const mdlAlocados = require("../model/mdlAlocados");
const formataData = require("../../../utils/formataData");

const CAMPOS_DATA = ["datainicio", "datafinal"];

const GetAllAlocados = async (req, res) => {
  const registro = await mdlAlocados.GetAllAlocados();
  res.json({ status: "ok", registro: formataData(registro, CAMPOS_DATA) });
};

const GetAlocadoByID = async (req, res) => {
  const registro = await mdlAlocados.GetAlocadoByID(parseInt(req.params.alocadoid));
  res.json({ status: "ok", registro: formataData(registro, CAMPOS_DATA) });
};

const GetAnimaisToAlocados = async (req, res) => {
  const registro = await mdlAlocados.GetAnimaisToAlocados();
  res.json({ status: "ok", registro: registro });
};

const GetPiquetesToAlocados = async (req, res) => {
  const registro = await mdlAlocados.GetPiquetesToAlocados();
  res.json({ status: "ok", registro: registro });
};

const InsertAlocado = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlAlocados.InsertAlocado(req.body);
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

const UpdateAlocado = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlAlocados.UpdateAlocado(parseInt(req.params.alocadoid), req.body);
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

const DeleteAlocado = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlAlocados.DeleteAlocado(parseInt(req.params.alocadoid));
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
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
