const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('alocados/vwLstAlocados', {
    title: 'Alocações',
    showNavbar: true,
    activeMenu: 'alocados',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

router.get('/form', (req, res) => {
  res.render('alocados/vwFormAlocados', {
    title: 'Formulário de alocações',
    showNavbar: true,
    activeMenu: 'alocados',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
