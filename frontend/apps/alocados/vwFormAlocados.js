// Arquivo: apps/alocados/vwFormAlocados.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmAlocados');

  if (!form) {
    return;
  }

  // oper vem da url: Cr (criar), Re (visualizar), Up (atualizar) e De (remover)
  var oper = new URLSearchParams(window.location.search).get('oper') || 'Cr';
  var btnInserir = document.getElementById('btnInserirAlocado');
  var btnAtualizar = document.getElementById('btnAtualizarAlocado');
  var btnRemover = document.getElementById('btnRemoverAlocado');

  inicializarSelects();

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertAlocado();
    });
    carregarAnimaisToAlocados();
    carregarPiquetesToAlocados();
  }

  if (oper === 'Re') {
    bloquearCamposAlocado();
    vwGetAlocadoByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', function() {
      vwUpdateAlocado();
    });
    btnAtualizar.disabled = !(await vwGetAlocadoByID());
  }

  if (oper === 'De') {
    bloquearCamposAlocado();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', function() {
      vwDeleteAlocado();
    });
    btnRemover.disabled = !(await vwGetAlocadoByID());
  }
});

// Aqui são inicializados os componentes Select2.js em branco
function inicializarSelects() {
  $('#animalidifk').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um animal',
    width: '100%'
  });
  $('#piqueteidfk').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um piquete',
    width: '100%'
  });
}

// Aqui é preenchido o componente Select2 com os dados vindos da API getAnimaisToAlocados
async function carregarAnimaisToAlocados() {
  try {
    var data = await enviarRequisicaoAlocado('/getAnimaisToAlocados', {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar a lista de animal.');

    var select = document.getElementById('animalidifk');
    select.innerHTML = '<option value="">Selecione um animal</option>';

    data.registro.forEach(function(item) {
      var option = document.createElement('option');
      option.value = item.animalid;
      option.textContent = item.nome;
      select.appendChild(option);
    });

    $('#animalidifk').trigger('change');
  } catch (error) {
    alert(error.message || 'Erro ao carregar animal.');
  }
}

// Aqui é preenchido o componente Select2 com os dados vindos da API getPiquetesToAlocados
async function carregarPiquetesToAlocados() {
  try {
    var data = await enviarRequisicaoAlocado('/getPiquetesToAlocados', {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar a lista de piquete.');

    var select = document.getElementById('piqueteidfk');
    select.innerHTML = '<option value="">Selecione um piquete</option>';

    data.registro.forEach(function(item) {
      var option = document.createElement('option');
      option.value = item.piqueteid;
      option.textContent = item.descricao + ' (' + item.pastodescricao + ')';
      select.appendChild(option);
    });

    $('#piqueteidfk').trigger('change');
  } catch (error) {
    alert(error.message || 'Erro ao carregar piquete.');
  }
}

function bloquearCamposAlocado() {
  document.getElementById('animalidifk').disabled = true;
  document.getElementById('piqueteidfk').disabled = true;
  document.getElementById('datainicio').readOnly = true;
  document.getElementById('datafinal').readOnly = true;
}

function montarAlocadoDoFormulario() {
  return {
    animalidifk: Number(document.getElementById('animalidifk').value),
    piqueteidfk: Number(document.getElementById('piqueteidfk').value),
    datainicio: document.getElementById('datainicio').value,
    datafinal: document.getElementById('datafinal').value || null
  };
}

function obterAlocadoIdDaUrl() {
  var id = new URLSearchParams(window.location.search).get('alocadoId');

  if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
    throw new Error('ID da alocação inválido.');
  }

  return id;
}

// Faz a requisição ao backend e trata as respostas de erro padrão do sistema.
async function enviarRequisicaoAlocado(caminho, opcoes, mensagemErro) {
  var servidorDw3 = document.getElementById('frmAlocados').dataset.servidorDw3;

  if (!servidorDw3) {
    throw new Error('Endereço do servidor backend não configurado.');
  }

  var response = await fetch(servidorDw3 + caminho, opcoes);

  if (!response.ok) {
    throw new Error(mensagemErro);
  }

  var data = await response.json();

  if (data.auth === false) {
    throw new Error(data.message || 'Sessão expirada. Faça login novamente.');
  }

  if (data.status !== 'ok') {
    throw new Error(data.status || mensagemErro);
  }

  return data;
}

// Retorna true quando a alocação foi carregada no formulário.
async function vwGetAlocadoByID() {
  try {
    var id = obterAlocadoIdDaUrl();
    var data = await enviarRequisicaoAlocado('/getAlocadoByID/' + encodeURIComponent(id), {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar a alocação.');

    var registro = Array.isArray(data.registro) ? data.registro[0] : null;

    if (!registro) {
      throw new Error('Alocação não encontrada.');
    }

    document.getElementById('alocadoid').value = registro.alocadoid;
    document.getElementById('datainicio').value = registro.datainicio ?? '';
    document.getElementById('datafinal').value = registro.datafinal ?? '';

    // Carrega os componentes Select2 e seleciona o valor do registro.
    await carregarAnimaisToAlocados();
    $('#animalidifk').val(String(registro.animalidifk)).trigger('change');
    await carregarPiquetesToAlocados();
    $('#piqueteidfk').val(String(registro.piqueteidfk)).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar alocação.');
    return false;
  }
}

async function vwInsertAlocado() {
  var form = document.getElementById('frmAlocados');
  var btnInserir = document.getElementById('btnInserirAlocado');

  if (!form.reportValidity()) {
    return;
  }

  var dataInicio = document.getElementById('datainicio').value;
  var dataFinal = document.getElementById('datafinal').value;

  if (dataFinal && dataFinal < dataInicio) {
    alert('A data final não pode ser menor que a data de início.');
    return;
  }

  try {
    btnInserir.disabled = true;

    await enviarRequisicaoAlocado('/insertAlocado', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarAlocadoDoFormulario())
    }, 'Não foi possível inserir a alocação.');

    window.location.href = '/alocados';
  } catch (error) {
    alert(error.message || 'Erro ao inserir alocação.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdateAlocado() {
  var form = document.getElementById('frmAlocados');
  var btnAtualizar = document.getElementById('btnAtualizarAlocado');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  var dataInicio = document.getElementById('datainicio').value;
  var dataFinal = document.getElementById('datafinal').value;

  if (dataFinal && dataFinal < dataInicio) {
    alert('A data final não pode ser menor que a data de início.');
    return;
  }

  try {
    var id = obterAlocadoIdDaUrl();
    btnAtualizar.disabled = true;

    var data = await enviarRequisicaoAlocado('/updateAlocado/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarAlocadoDoFormulario())
    }, 'Não foi possível atualizar a alocação.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma alocação foi atualizada.');
    }

    alert('Alocação atualizada com sucesso.');
    window.location.href = '/alocados';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar alocação.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteAlocado() {
  var btnRemover = document.getElementById('btnRemoverAlocado');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção desta alocação?')) {
    return;
  }

  try {
    var id = obterAlocadoIdDaUrl();
    btnRemover.disabled = true;

    var data = await enviarRequisicaoAlocado('/deleteAlocado/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível remover a alocação.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma alocação foi removida.');
    }

    window.location.href = '/alocados';
  } catch (error) {
    alert(error.message || 'Erro ao remover alocação.');
  } finally {
    btnRemover.disabled = false;
  }
}
