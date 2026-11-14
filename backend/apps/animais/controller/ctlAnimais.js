//-- arquivo apps/animais/controller/ctlAnimais.js

const mdlAnimais = require("../model/mdlAnimais");

// Elimina parte final de uma variável data com essa: 2026-10-01T03:00:00.000Z
const formataData = (registro) => {
  for (let i = 0; i < registro.length; i++) {
    const row = registro[i];
    if (row.datanasc) {
      row.datanasc = row.datanasc.toISOString().split('T')[0];
    }
  }
  return registro;
};

const GetAllAnimais = (req, res) =>
  (async () => {
    let registro = await mdlAnimais.GetAllAnimais();
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const GetAnimalByID = (req, res) =>
  (async () => {
    const animalID = parseInt(req.params.animalid);
    let registro = await mdlAnimais.GetAnimalByID(animalID);
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const InsertAnimal = (request, res) =>
  (async () => {
    const animalREG = request.body;
    let { msg, linhasAfetadas } = await mdlAnimais.InsertAnimal(animalREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const UpdateAnimal = (request, res) =>
  (async () => {
    const animalID = parseInt(request.params.animalid);
    const animalREG = request.body;
    let { msg, linhasAfetadas } = await mdlAnimais.UpdateAnimal(animalID, animalREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const DeleteAnimal = (request, res) =>
  (async () => {
    const animalID = parseInt(request.params.animalid);
    let { msg, linhasAfetadas } = await mdlAnimais.DeleteAnimal(animalID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

module.exports = {
  GetAllAnimais,
  GetAnimalByID,
  InsertAnimal,
  UpdateAnimal,
  DeleteAnimal,
};
