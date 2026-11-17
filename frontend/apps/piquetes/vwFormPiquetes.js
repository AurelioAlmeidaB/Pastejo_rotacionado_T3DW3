document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  const oper = dw3ObterOperacao();
  const btnInserir = document.getElementById('btnInserirPiquete');
  const btnAtualizar = document.getElementById('btnAtualizarPiquete');
  const btnRemover = document.getElementById('btnRemoverPiquete');

  dw3InicializarSelect('pastoidfk', 'Selecione um pasto');

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', vwInsertPiquete);
    carregarPastosToPiquetes();
  }

  if (oper === 'Re') {
    bloquearCamposPiquete();
    vwGetPiqueteByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', vwUpdatePiquete);
    btnAtualizar.disabled = !(await vwGetPiqueteByID());
  }

  if (oper === 'De') {
    bloquearCamposPiquete();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', vwDeletePiquete);
    btnRemover.disabled = !(await vwGetPiqueteByID());
  }
});

function obterServidor() {
  return document.getElementById('frmPiquetes').dataset.servidorDw3;
}

function bloquearCamposPiquete() {
  document.getElementById('descricao').readOnly = true;
  document.getElementById('pastoidfk').disabled = true;
  document.getElementById('latitude').readOnly = true;
  document.getElementById('longitude').readOnly = true;
}

function montarPiqueteDoFormulario() {
  return {
    descricao: document.getElementById('descricao').value.trim(),
    pastoidfk: Number(document.getElementById('pastoidfk').value),
    latitude: Number(document.getElementById('latitude').value),
    longitude: Number(document.getElementById('longitude').value)
  };
}

async function carregarPastosToPiquetes() {
  try {
    const data = await dw3Requisicao(obterServidor(), '/getPastosToPiquetes', {}, 'Não foi possível carregar a lista de pastos.');
    dw3PreencherSelect('pastoidfk', data.registro, 'pastoid', (pasto) => pasto.descricao, 'Selecione um pasto');
  } catch (error) {
    alert(error.message);
  }
}

async function vwGetPiqueteByID() {
  try {
    const id = dw3ObterIdDaUrl('piqueteId');
    const data = await dw3Requisicao(obterServidor(), '/getPiqueteByID/' + id, {}, 'Não foi possível carregar o piquete.');
    const registro = data.registro[0];

    if (!registro) {
      throw new Error('Piquete não encontrado.');
    }

    document.getElementById('piqueteid').value = registro.piqueteid;
    document.getElementById('descricao').value = registro.descricao ?? '';
    document.getElementById('latitude').value = registro.latitude ?? '';
    document.getElementById('longitude').value = registro.longitude ?? '';

    await carregarPastosToPiquetes();
    dw3SelecionarOpcao('pastoidfk', registro.pastoidfk, registro.pastodescricao);

    return true;
  } catch (error) {
    alert(error.message);
    return false;
  }
}

async function vwInsertPiquete() {
  const btnInserir = document.getElementById('btnInserirPiquete');

  if (!document.getElementById('frmPiquetes').reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await dw3Requisicao(obterServidor(), '/insertPiquete', {
      method: 'POST',
      body: JSON.stringify(montarPiqueteDoFormulario())
    }, 'Não foi possível inserir o piquete.');

    window.location.href = '/piquetes';
  } catch (error) {
    alert(error.message);
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdatePiquete() {
  const btnAtualizar = document.getElementById('btnAtualizarPiquete');

  if (btnAtualizar.disabled || !document.getElementById('frmPiquetes').reportValidity()) {
    return;
  }

  try {
    btnAtualizar.disabled = true;

    const id = dw3ObterIdDaUrl('piqueteId');
    const data = await dw3Requisicao(obterServidor(), '/updatePiquete/' + id, {
      method: 'PUT',
      body: JSON.stringify(montarPiqueteDoFormulario())
    }, 'Não foi possível atualizar o piquete.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum piquete foi atualizado.');
    }

    alert('Piquete atualizado com sucesso.');
    window.location.href = '/piquetes';
  } catch (error) {
    alert(error.message);
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeletePiquete() {
  const btnRemover = document.getElementById('btnRemoverPiquete');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção deste piquete?')) {
    return;
  }

  try {
    btnRemover.disabled = true;

    const id = dw3ObterIdDaUrl('piqueteId');
    const data = await dw3Requisicao(obterServidor(), '/deletePiquete/' + id, {
      method: 'DELETE'
    }, 'Não foi possível remover o piquete.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum piquete foi removido.');
    }

    window.location.href = '/piquetes';
  } catch (error) {
    alert(error.message);
  } finally {
    btnRemover.disabled = false;
  }
}
