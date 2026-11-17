const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.render('login', {
    title: 'Login',
    showNavbar: false,
    servidorDw3: process.env.SERVIDOR_DW3
  });
});

module.exports = router;
