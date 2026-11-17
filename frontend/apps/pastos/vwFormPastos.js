document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  const oper = dw3ObterOperacao();
  const btnInserir = document.getElementById('btnInserirPasto');
  const btnAtualizar = document.getElementById('btnAtualizarPasto');
  const btnRemover = document.getElementById('btnRemoverPasto');

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', vwInsertPasto);
  }

  if (oper === 'Re') {
    bloquearCamposPasto();
    vwGetPastoByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', vwUpdatePasto);
    btnAtualizar.disabled = !(await vwGetPastoByID());
  }

  if (oper === 'De') {
    bloquearCamposPasto();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', vwDeletePasto);
    btnRemover.disabled = !(await vwGetPastoByID());
  }
});

function obterServidor() {
  return document.getElementById('frmPastos').dataset.servidorDw3;
}

function bloquearCamposPasto() {
  document.getElementById('descricao').readOnly = true;
  document.getElementById('areatotal').readOnly = true;
}

function montarPastoDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value.trim(),
    areatotal: Number(document.getElementById('areatotal').value)
  };
}

async function vwGetPastoByID() {
  try {
    const id = dw3ObterIdDaUrl('pastoId');
    const data = await dw3Requisicao(obterServidor(), '/getPastoByID/' + id, {}, 'Não foi possível carregar o pasto.');
    const registro = data.registro[0];

    if (!registro) {
      throw new Error('Pasto não encontrado.');
    }

    document.getElementById('pastoid').value = registro.pastoid;
    document.getElementById('descricao').value = registro.descricao ?? '';
    document.getElementById('areatotal').value = registro.areatotal ?? '';

    return true;
  } catch (error) {
    alert(error.message);
    return false;
  }
}

async function vwInsertPasto() {
  const btnInserir = document.getElementById('btnInserirPasto');

  if (!document.getElementById('frmPastos').reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await dw3Requisicao(obterServidor(), '/insertPasto', {
      method: 'POST',
      body: JSON.stringify(montarPastoDoFormulario())
    }, 'Não foi possível inserir o pasto.');

    window.location.href = '/pastos';
  } catch (error) {
    alert(error.message);
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdatePasto() {
  const btnAtualizar = document.getElementById('btnAtualizarPasto');

  if (btnAtualizar.disabled || !document.getElementById('frmPastos').reportValidity()) {
    return;
  }

  try {
    btnAtualizar.disabled = true;

    const id = dw3ObterIdDaUrl('pastoId');
    const data = await dw3Requisicao(obterServidor(), '/updatePasto/' + id, {
      method: 'PUT',
      body: JSON.stringify(montarPastoDoFormulario())
    }, 'Não foi possível atualizar o pasto.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum pasto foi atualizado.');
    }

    alert('Pasto atualizado com sucesso.');
    window.location.href = '/pastos';
  } catch (error) {
    alert(error.message);
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeletePasto() {
  const btnRemover = document.getElementById('btnRemoverPasto');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção deste pasto?')) {
    return;
  }

  try {
    btnRemover.disabled = true;

    const id = dw3ObterIdDaUrl('pastoId');
    const data = await dw3Requisicao(obterServidor(), '/deletePasto/' + id, {
      method: 'DELETE'
    }, 'Não foi possível remover o pasto.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum pasto foi removido.');
    }

    window.location.href = '/pastos';
  } catch (error) {
    alert(error.message);
  } finally {
    btnRemover.disabled = false;
  }
}
