const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('animais/vwLstAnimais', {
    title: 'Animais',
    showNavbar: true,
    activeMenu: 'animais',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

router.get('/form', (req, res) => {
  res.render('animais/vwFormAnimais', {
    title: 'Formulário de animais',
    showNavbar: true,
    activeMenu: 'animais',
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
