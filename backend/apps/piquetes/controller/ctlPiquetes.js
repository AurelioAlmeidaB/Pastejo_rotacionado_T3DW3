const mdlPiquetes = require("../model/mdlPiquetes");

const GetAllPiquetes = async (req, res) => {
  const registro = await mdlPiquetes.GetAllPiquetes();
  res.json({ status: "ok", registro: registro });
};

const GetPiqueteByID = async (req, res) => {
  const registro = await mdlPiquetes.GetPiqueteByID(parseInt(req.params.piqueteid));
  res.json({ status: "ok", registro: registro });
};

const GetPastosToPiquetes = async (req, res) => {
  const registro = await mdlPiquetes.GetPastosToPiquetes();
  res.json({ status: "ok", registro: registro });
};

const InsertPiquete = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlPiquetes.InsertPiquete(req.body);
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

const UpdatePiquete = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlPiquetes.UpdatePiquete(parseInt(req.params.piqueteid), req.body);
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

const DeletePiquete = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlPiquetes.DeletePiquete(parseInt(req.params.piqueteid));
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

module.exports = {
  GetAllPiquetes,
  GetPiqueteByID,
  GetPastosToPiquetes,
  InsertPiquete,
  UpdatePiquete,
  DeletePiquete,
};
