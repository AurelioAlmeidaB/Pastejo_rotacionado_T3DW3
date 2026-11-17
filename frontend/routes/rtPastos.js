const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('pastos/vwLstPastos', {
    title: 'Pastos',
    showNavbar: true,
    activeMenu: 'pastos',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

router.get('/form', (req, res) => {
  res.render('pastos/vwFormPastos', {
    title: 'Formulário de pastos',
    showNavbar: true,
    activeMenu: 'pastos',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
