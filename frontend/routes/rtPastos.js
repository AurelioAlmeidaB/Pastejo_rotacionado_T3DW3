// Arquivo: ./routes/rtPastos.js

var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('pastos/vwLstPastos', {
    title: 'Pastos',
    showNavbar: true,
    activeMenu: 'pastos',
    servidorDw3: process.env.SERVIDOR_DW3 // É necessário, pois o front em html não tem acesso ao arquivo .env
  });
});

router.get('/form', function(req, res) {
  res.render('pastos/vwFormPastos', {
    title: 'Formulário de pastos',
    showNavbar: true,
    activeMenu: 'pastos',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
