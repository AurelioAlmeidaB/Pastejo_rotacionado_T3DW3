// Arquivo: apps/piquetes/vwFormPiquetes.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmPiquetes');

  if (!form) {
    return;
  }

  // oper vem da url: Cr (criar), Re (visualizar), Up (atualizar) e De (remover)
  var oper = new URLSearchParams(window.location.search).get('oper') || 'Cr';
  var btnInserir = document.getElementById('btnInserirPiquete');
  var btnAtualizar = document.getElementById('btnAtualizarPiquete');
  var btnRemover = document.getElementById('btnRemoverPiquete');

  inicializarSelects();

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertPiquete();
    });
    carregarPastosToPiquetes();
  }

  if (oper === 'Re') {
    bloquearCamposPiquete();
    vwGetPiqueteByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', function() {
      vwUpdatePiquete();
    });
    btnAtualizar.disabled = !(await vwGetPiqueteByID());
  }

  if (oper === 'De') {
    bloquearCamposPiquete();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', function() {
      vwDeletePiquete();
    });
    btnRemover.disabled = !(await vwGetPiqueteByID());
  }
});

// Aqui são inicializados os componentes Select2.js em branco
function inicializarSelects() {
  $('#pastoidfk').select2({
    theme: 'bootstrap-5',
    placeholder: 'Selecione um pasto',
    width: '100%'
  });
}

// Aqui é preenchido o componente Select2 com os dados vindos da API getPastosToPiquetes
async function carregarPastosToPiquetes() {
  try {
    var data = await enviarRequisicaoPiquete('/getPastosToPiquetes', {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar a lista de pastos.');

    var select = document.getElementById('pastoidfk');
    select.innerHTML = '<option value="">Selecione um pasto</option>';

    data.registro.forEach(function(item) {
      var option = document.createElement('option');
      option.value = item.pastoid;
      option.textContent = item.descricao;
      select.appendChild(option);
    });

    $('#pastoidfk').trigger('change');
  } catch (error) {
    alert(error.message || 'Erro ao carregar pastos.');
  }
}

function bloquearCamposPiquete() {
  document.getElementById('descricao').readOnly = true;
  document.getElementById('pastoidfk').disabled = true;
  document.getElementById('latitude').readOnly = true;
  document.getElementById('longitude').readOnly = true;
}

function montarPiqueteDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value,
    pastoidfk: Number(document.getElementById('pastoidfk').value),
    latitude: Number(document.getElementById('latitude').value),
    longitude: Number(document.getElementById('longitude').value)
  };
}

function obterPiqueteIdDaUrl() {
  var id = new URLSearchParams(window.location.search).get('piqueteId');

  if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
    throw new Error('ID do piquete inválido.');
  }

  return id;
}

// Faz a requisição ao backend e trata as respostas de erro padrão do sistema.
async function enviarRequisicaoPiquete(caminho, opcoes, mensagemErro) {
  var servidorDw3 = document.getElementById('frmPiquetes').dataset.servidorDw3;

  if (!servidorDw3) {
    throw new Error('Endereço do servidor backend não configurado.');
  }

  var response = await fetch(servidorDw3 + caminho, opcoes);

  if (!response.ok) {
    throw new Error(mensagemErro);
  }

  var data = await response.json();

  if (data.auth === false) {
    dw3SessaoExpirada(); // JWT expirado: volta para a tela de login.
    // Promise que nunca termina: interrompe a operação sem mostrar outro alerta de erro.
    return new Promise(function() {});
  }

  if (data.status !== 'ok') {
    throw new Error(data.status || mensagemErro);
  }

  return data;
}

// Retorna true quando o piquete foi carregado no formulário.
async function vwGetPiqueteByID() {
  try {
    var id = obterPiqueteIdDaUrl();
    var data = await enviarRequisicaoPiquete('/getPiqueteByID/' + encodeURIComponent(id), {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar o piquete.');

    var registro = Array.isArray(data.registro) ? data.registro[0] : null;

    if (!registro) {
      throw new Error('Piquete não encontrado.');
    }

    document.getElementById('piqueteid').value = registro.piqueteid;
    document.getElementById('descricao').value = registro.descricao ?? '';
    document.getElementById('latitude').value = registro.latitude ?? '';
    document.getElementById('longitude').value = registro.longitude ?? '';

    // Carrega os componentes Select2 e seleciona o valor do registro.
    await carregarPastosToPiquetes();
    $('#pastoidfk').val(String(registro.pastoidfk)).trigger('change');
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar piquete.');
    return false;
  }
}

async function vwInsertPiquete() {
  var form = document.getElementById('frmPiquetes');
  var btnInserir = document.getElementById('btnInserirPiquete');

  if (!form.reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await enviarRequisicaoPiquete('/insertPiquete', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPiqueteDoFormulario())
    }, 'Não foi possível inserir o piquete.');

    window.location.href = '/piquetes';
  } catch (error) {
    alert(error.message || 'Erro ao inserir piquete.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdatePiquete() {
  var form = document.getElementById('frmPiquetes');
  var btnAtualizar = document.getElementById('btnAtualizarPiquete');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var id = obterPiqueteIdDaUrl();
    btnAtualizar.disabled = true;

    var data = await enviarRequisicaoPiquete('/updatePiquete/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPiqueteDoFormulario())
    }, 'Não foi possível atualizar o piquete.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum piquete foi atualizado.');
    }

    alert('Piquete atualizado com sucesso.');
    window.location.href = '/piquetes';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar piquete.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeletePiquete() {
  var btnRemover = document.getElementById('btnRemoverPiquete');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção deste piquete?')) {
    return;
  }

  try {
    var id = obterPiqueteIdDaUrl();
    btnRemover.disabled = true;

    var data = await enviarRequisicaoPiquete('/deletePiquete/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível remover o piquete.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum piquete foi removido.');
    }

    window.location.href = '/piquetes';
  } catch (error) {
    alert(error.message || 'Erro ao remover piquete.');
  } finally {
    btnRemover.disabled = false;
  }
}
