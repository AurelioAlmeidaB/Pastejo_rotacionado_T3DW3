//-- arquivo apps/alocados/controller/ctlAlocados.js

const mdlAlocados = require("../model/mdlAlocados");

// Elimina parte final de uma variável data com essa: 2026-10-01T03:00:00.000Z
const formataData = (registro) => {
  for (let i = 0; i < registro.length; i++) {
    const row = registro[i];
    if (row.datainicio) {
      row.datainicio = row.datainicio.toISOString().split('T')[0];
    }
    if (row.datafinal) {
      row.datafinal = row.datafinal.toISOString().split('T')[0];
    }
  }
  return registro;
};

const GetAllAlocados = (req, res) =>
  (async () => {
    let registro = await mdlAlocados.GetAllAlocados();
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const GetAlocadoByID = (req, res) =>
  (async () => {
    const alocadoID = parseInt(req.params.alocadoid);
    let registro = await mdlAlocados.GetAlocadoByID(alocadoID);
    res.json({ status: "ok", "registro": formataData(registro) });
  })();

const GetAnimaisToAlocados = (req, res) =>
  (async () => {
    let registro = await mdlAlocados.GetAnimaisToAlocados();
    res.json({ status: "ok", "registro": registro });
  })();

const GetPiquetesToAlocados = (req, res) =>
  (async () => {
    let registro = await mdlAlocados.GetPiquetesToAlocados();
    res.json({ status: "ok", "registro": registro });
  })();

const InsertAlocado = (request, res) =>
  (async () => {
    const alocadoREG = request.body;
    let { msg, linhasAfetadas } = await mdlAlocados.InsertAlocado(alocadoREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const UpdateAlocado = (request, res) =>
  (async () => {
    const alocadoID = parseInt(request.params.alocadoid);
    const alocadoREG = request.body;
    let { msg, linhasAfetadas } = await mdlAlocados.UpdateAlocado(alocadoID, alocadoREG);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

const DeleteAlocado = (request, res) =>
  (async () => {
    const alocadoID = parseInt(request.params.alocadoid);
    let { msg, linhasAfetadas } = await mdlAlocados.DeleteAlocado(alocadoID);
    res.json({ "status": msg, "linhasAfetadas": linhasAfetadas });
  })();

module.exports = {
  GetAllAlocados,
  GetAlocadoByID,
  GetAnimaisToAlocados,
  GetPiquetesToAlocados,
  InsertAlocado,
  UpdateAlocado,
  DeleteAlocado,
};
