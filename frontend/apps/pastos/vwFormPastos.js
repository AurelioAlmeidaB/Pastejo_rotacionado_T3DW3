// Arquivo: apps/pastos/vwFormPastos.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmPastos');

  if (!form) {
    return;
  }

  // oper vem da url: Cr (criar), Re (visualizar), Up (atualizar) e De (remover)
  var oper = new URLSearchParams(window.location.search).get('oper') || 'Cr';
  var btnInserir = document.getElementById('btnInserirPasto');
  var btnAtualizar = document.getElementById('btnAtualizarPasto');
  var btnRemover = document.getElementById('btnRemoverPasto');

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertPasto();
    });
  }

  if (oper === 'Re') {
    bloquearCamposPasto();
    vwGetPastoByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', function() {
      vwUpdatePasto();
    });
    btnAtualizar.disabled = !(await vwGetPastoByID());
  }

  if (oper === 'De') {
    bloquearCamposPasto();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', function() {
      vwDeletePasto();
    });
    btnRemover.disabled = !(await vwGetPastoByID());
  }
});

function bloquearCamposPasto() {
  document.getElementById('descricao').readOnly = true;
  document.getElementById('areatotal').readOnly = true;
}

function montarPastoDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value,
    areatotal: Number(document.getElementById('areatotal').value)
  };
}

function obterPastoIdDaUrl() {
  var id = new URLSearchParams(window.location.search).get('pastoId');

  if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
    throw new Error('ID do pasto inválido.');
  }

  return id;
}

// Faz a requisição ao backend e trata as respostas de erro padrão do sistema.
async function enviarRequisicaoPasto(caminho, opcoes, mensagemErro) {
  var servidorDw3 = document.getElementById('frmPastos').dataset.servidorDw3;

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

// Retorna true quando o pasto foi carregado no formulário.
async function vwGetPastoByID() {
  try {
    var id = obterPastoIdDaUrl();
    var data = await enviarRequisicaoPasto('/getPastoByID/' + encodeURIComponent(id), {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar o pasto.');

    var registro = Array.isArray(data.registro) ? data.registro[0] : null;

    if (!registro) {
      throw new Error('Pasto não encontrado.');
    }

    document.getElementById('pastoid').value = registro.pastoid;
    document.getElementById('descricao').value = registro.descricao ?? '';
    document.getElementById('areatotal').value = registro.areatotal ?? '';
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar pasto.');
    return false;
  }
}

async function vwInsertPasto() {
  var form = document.getElementById('frmPastos');
  var btnInserir = document.getElementById('btnInserirPasto');

  if (!form.reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await enviarRequisicaoPasto('/insertPasto', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPastoDoFormulario())
    }, 'Não foi possível inserir o pasto.');

    window.location.href = '/pastos';
  } catch (error) {
    alert(error.message || 'Erro ao inserir pasto.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdatePasto() {
  var form = document.getElementById('frmPastos');
  var btnAtualizar = document.getElementById('btnAtualizarPasto');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var id = obterPastoIdDaUrl();
    btnAtualizar.disabled = true;

    var data = await enviarRequisicaoPasto('/updatePasto/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarPastoDoFormulario())
    }, 'Não foi possível atualizar o pasto.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum pasto foi atualizado.');
    }

    alert('Pasto atualizado com sucesso.');
    window.location.href = '/pastos';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar pasto.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeletePasto() {
  var btnRemover = document.getElementById('btnRemoverPasto');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção deste pasto?')) {
    return;
  }

  try {
    var id = obterPastoIdDaUrl();
    btnRemover.disabled = true;

    var data = await enviarRequisicaoPasto('/deletePasto/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível remover o pasto.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum pasto foi removido.');
    }

    window.location.href = '/pastos';
  } catch (error) {
    alert(error.message || 'Erro ao remover pasto.');
  } finally {
    btnRemover.disabled = false;
  }
}
