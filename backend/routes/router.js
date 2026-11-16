const express = require("express");
const routerApp = express.Router();

const appLogin = require("../apps/login/controller/ctlLogin");
const appPastos = require("../apps/pastos/controller/ctlPastos");
const appPiquetes = require("../apps/piquetes/controller/ctlPiquetes");
const appAnimais = require("../apps/animais/controller/ctlAnimais");
const appAlocados = require("../apps/alocados/controller/ctlAlocados");
const validaID = require("../utils/validaID");

routerApp.get("/", (req, res) => {
  res.send("Olá mundo!");
});

routerApp.post("/Login", appLogin.Login);
routerApp.post("/Logout", appLogin.Logout);

routerApp.get("/getAllPastos", appLogin.AutenticaJWT, appPastos.GetAllPastos);
routerApp.get("/getPastoByID/:pastoid", appLogin.AutenticaJWT, validaID, appPastos.GetPastoByID);
routerApp.post("/insertPasto", appLogin.AutenticaJWT, appPastos.InsertPasto);
routerApp.put("/updatePasto/:pastoid", appLogin.AutenticaJWT, validaID, appPastos.UpdatePasto);
routerApp.delete("/deletePasto/:pastoid", appLogin.AutenticaJWT, validaID, appPastos.DeletePasto);

routerApp.get("/getAllPiquetes", appLogin.AutenticaJWT, appPiquetes.GetAllPiquetes);
routerApp.get("/getPiqueteByID/:piqueteid", appLogin.AutenticaJWT, validaID, appPiquetes.GetPiqueteByID);
routerApp.get("/getPastosToPiquetes", appLogin.AutenticaJWT, appPiquetes.GetPastosToPiquetes);
routerApp.post("/insertPiquete", appLogin.AutenticaJWT, appPiquetes.InsertPiquete);
routerApp.put("/updatePiquete/:piqueteid", appLogin.AutenticaJWT, validaID, appPiquetes.UpdatePiquete);
routerApp.delete("/deletePiquete/:piqueteid", appLogin.AutenticaJWT, validaID, appPiquetes.DeletePiquete);

routerApp.get("/getAllAnimais", appLogin.AutenticaJWT, appAnimais.GetAllAnimais);
routerApp.get("/getAnimalByID/:animalid", appLogin.AutenticaJWT, validaID, appAnimais.GetAnimalByID);
routerApp.post("/insertAnimal", appLogin.AutenticaJWT, appAnimais.InsertAnimal);
routerApp.put("/updateAnimal/:animalid", appLogin.AutenticaJWT, validaID, appAnimais.UpdateAnimal);
routerApp.delete("/deleteAnimal/:animalid", appLogin.AutenticaJWT, validaID, appAnimais.DeleteAnimal);

routerApp.get("/getAllAlocados", appLogin.AutenticaJWT, appAlocados.GetAllAlocados);
routerApp.get("/getAlocadoByID/:alocadoid", appLogin.AutenticaJWT, validaID, appAlocados.GetAlocadoByID);
routerApp.get("/getAnimaisToAlocados", appLogin.AutenticaJWT, appAlocados.GetAnimaisToAlocados);
routerApp.get("/getPiquetesToAlocados", appLogin.AutenticaJWT, appAlocados.GetPiquetesToAlocados);
routerApp.post("/insertAlocado", appLogin.AutenticaJWT, appAlocados.InsertAlocado);
routerApp.put("/updateAlocado/:alocadoid", appLogin.AutenticaJWT, validaID, appAlocados.UpdateAlocado);
routerApp.delete("/deleteAlocado/:alocadoid", appLogin.AutenticaJWT, validaID, appAlocados.DeleteAlocado);

module.exports = routerApp;
