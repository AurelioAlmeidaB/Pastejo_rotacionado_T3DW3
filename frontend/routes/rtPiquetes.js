const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('piquetes/vwLstPiquetes', {
    title: 'Piquetes',
    showNavbar: true,
    activeMenu: 'piquetes',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

router.get('/form', (req, res) => {
  res.render('piquetes/vwFormPiquetes', {
    title: 'Formulário de piquetes',
    showNavbar: true,
    activeMenu: 'piquetes',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
