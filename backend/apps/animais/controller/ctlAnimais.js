const mdlAnimais = require("../model/mdlAnimais");
const formataData = require("../../../utils/formataData");

const CAMPOS_DATA = ["datanasc"];

const GetAllAnimais = async (req, res) => {
  const registro = await mdlAnimais.GetAllAnimais();
  res.json({ status: "ok", registro: formataData(registro, CAMPOS_DATA) });
};

const GetAnimalByID = async (req, res) => {
  const registro = await mdlAnimais.GetAnimalByID(parseInt(req.params.animalid));
  res.json({ status: "ok", registro: formataData(registro, CAMPOS_DATA) });
};

const InsertAnimal = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlAnimais.InsertAnimal(req.body);
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

const UpdateAnimal = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlAnimais.UpdateAnimal(parseInt(req.params.animalid), req.body);
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

const DeleteAnimal = async (req, res) => {
  const { msg, linhasAfetadas } = await mdlAnimais.DeleteAnimal(parseInt(req.params.animalid));
  res.json({ status: msg, linhasAfetadas: linhasAfetadas });
};

module.exports = {
  GetAllAnimais,
  GetAnimalByID,
  InsertAnimal,
  UpdateAnimal,
  DeleteAnimal,
};
