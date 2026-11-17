document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  const listagem = document.getElementById('pastosListagem');
  const alertBox = document.getElementById('pastosAlert');

  dw3ConfigurarOperacoes('tblPastos', '/pastos', 'pastoId');
  vwGetAllPastos(listagem.dataset.servidorDw3, alertBox);
});

async function vwGetAllPastos(servidorDw3, alertBox) {
  try {
    const data = await dw3Requisicao(servidorDw3, '/getAllPastos', {}, 'Não foi possível carregar a lista de pastos.');
    inicializarTabelaPastos(data.registro);
  } catch (error) {
    dw3ExibirErro(alertBox, error.message);
    inicializarTabelaPastos([]);
  }
}

function inicializarTabelaPastos(registros) {
  new DataTable('#tblPastos', {
    data: registros,
    columns: [
      { data: 'pastoid' },
      { data: 'descricao', render: DataTable.render.text() },
      { data: 'areatotal', render: renderizarArea },
      dw3ColunaOperacoes('pastoid')
    ],
    language: DW3_IDIOMA_DATATABLES
  });
}

function renderizarArea(data, type) {
  if (type !== 'display') {
    return Number(data);
  }

  return Number(data).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) + ' ha';
}
