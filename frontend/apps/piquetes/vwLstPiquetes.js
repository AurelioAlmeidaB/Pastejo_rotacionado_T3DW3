document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  const listagem = document.getElementById('piquetesListagem');
  const alertBox = document.getElementById('piquetesAlert');

  dw3ConfigurarOperacoes('tblPiquetes', '/piquetes', 'piqueteId');
  vwGetAllPiquetes(listagem.dataset.servidorDw3, alertBox);
});

async function vwGetAllPiquetes(servidorDw3, alertBox) {
  try {
    const data = await dw3Requisicao(servidorDw3, '/getAllPiquetes', {}, 'Não foi possível carregar a lista de piquetes.');
    inicializarTabelaPiquetes(data.registro);
  } catch (error) {
    dw3ExibirErro(alertBox, error.message);
    inicializarTabelaPiquetes([]);
  }
}

function inicializarTabelaPiquetes(registros) {
  new DataTable('#tblPiquetes', {
    data: registros,
    columns: [
      { data: 'piqueteid' },
      { data: 'descricao', render: DataTable.render.text() },
      { data: 'pastodescricao', render: DataTable.render.text() },
      { data: 'latitude' },
      { data: 'longitude' },
      dw3ColunaOperacoes('piqueteid')
    ],
    language: DW3_IDIOMA_DATATABLES
  });
}
