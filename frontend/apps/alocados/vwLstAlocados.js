document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  const listagem = document.getElementById('alocadosListagem');
  const alertBox = document.getElementById('alocadosAlert');

  dw3ConfigurarOperacoes('tblAlocados', '/alocados', 'alocadoId');
  vwGetAllAlocados(listagem.dataset.servidorDw3, alertBox);
});

async function vwGetAllAlocados(servidorDw3, alertBox) {
  try {
    const data = await dw3Requisicao(servidorDw3, '/getAllAlocados', {}, 'Não foi possível carregar a lista de alocados.');
    inicializarTabelaAlocados(data.registro);
  } catch (error) {
    dw3ExibirErro(alertBox, error.message);
    inicializarTabelaAlocados([]);
  }
}

function inicializarTabelaAlocados(registros) {
  new DataTable('#tblAlocados', {
    data: registros,
    order: [[3, 'desc']],
    columns: [
      { data: 'alocadoid' },
      { data: 'animalnome', render: DataTable.render.text() },
      { data: 'piquetedescricao', render: DataTable.render.text() },
      { data: 'datainicio', render: dw3RenderizarData() },
      { data: 'datafinal', render: dw3RenderizarData('Em andamento') },
      dw3ColunaOperacoes('alocadoid')
    ],
    language: DW3_IDIOMA_DATATABLES
  });
}
