document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  const listagem = document.getElementById('animaisListagem');
  const alertBox = document.getElementById('animaisAlert');

  dw3ConfigurarOperacoes('tblAnimais', '/animais', 'animalId');
  vwGetAllAnimais(listagem.dataset.servidorDw3, alertBox);
});

async function vwGetAllAnimais(servidorDw3, alertBox) {
  try {
    const data = await dw3Requisicao(servidorDw3, '/getAllAnimais', {}, 'Não foi possível carregar a lista de animais.');
    inicializarTabelaAnimais(data.registro);
  } catch (error) {
    dw3ExibirErro(alertBox, error.message);
    inicializarTabelaAnimais([]);
  }
}

function inicializarTabelaAnimais(registros) {
  new DataTable('#tblAnimais', {
    data: registros,
    columns: [
      { data: 'animalid' },
      { data: 'nome', render: DataTable.render.text() },
      { data: 'datanasc', render: dw3RenderizarData() },
      dw3ColunaOperacoes('animalid')
    ],
    language: DW3_IDIOMA_DATATABLES
  });
}
