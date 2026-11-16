const mdlPastos = require("../model/mdlPastos");

const GetAllPastos = async (req, res) => {
  const registro = await mdlPastos.GetAllPastos();
  res.json({ status: "ok", registro: registro });
};

const GetPastoByID = async (req, res) => {
  const registro = await mdlPastos.GetPastoByID(parseInt(req.params.pastoid));
  res.json({ status: "ok", registro: registro });
};

const InsertPasto = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlPastos.InsertPasto(req.body);
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

const UpdatePasto = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlPastos.UpdatePasto(parseInt(req.params.pastoid), req.body);
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

const DeletePasto = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlPastos.DeletePasto(parseInt(req.params.pastoid));
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

module.exports = {
  GetAllPastos,
  GetPastoByID,
  InsertPasto,
  UpdatePasto,
  DeletePasto,
};
