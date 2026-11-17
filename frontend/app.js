const createError = require('http-errors');
const express = require('express');
const path = require('path');
const nunjucks = require('nunjucks');

require('dotenv').config({ path: path.join(__dirname, 'dw3frontend.env'), quiet: true });

const indexRouter = require('./routes/rtIndex');
const loginRouter = require('./routes/rtLogin');
const homeRouter = require('./routes/rtHome');
const pastosRouter = require('./routes/rtPastos');
const piquetesRouter = require('./routes/rtPiquetes');
const animaisRouter = require('./routes/rtAnimais');
const alocadosRouter = require('./routes/rtAlocados');

const app = express();
const port = process.env.PORT || 43100;
const viewsPath = path.join(__dirname, 'views');
const appsPath = path.join(__dirname, 'apps');

app.set('views', [viewsPath, appsPath]);
app.set('view engine', 'njk');

nunjucks.configure([viewsPath, appsPath], {
  autoescape: true,
  express: app,
  noCache: app.get('env') === 'development'
});

app.use(express.static(path.join(__dirname, 'public')));
app.use('/apps', express.static(path.join(__dirname, 'apps')));

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/home', homeRouter);
app.use('/pastos', pastosRouter);
app.use('/piquetes', piquetesRouter);
app.use('/animais', animaisRouter);
app.use('/alocados', alocadosRouter);

app.use((req, res, next) => {
  next(createError(404, 'Página não encontrada.'));
});

app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error', { title: 'Erro', showNavbar: true });
});

app.listen(port, () => {
  console.log('Executando a aplicação:', process.env.APP_NAME);
  console.log(`App listening at port ${port}`);
});
