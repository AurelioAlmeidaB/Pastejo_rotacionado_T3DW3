document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  const oper = dw3ObterOperacao();
  const btnInserir = document.getElementById('btnInserirAlocado');
  const btnAtualizar = document.getElementById('btnAtualizarAlocado');
  const btnRemover = document.getElementById('btnRemoverAlocado');

  dw3InicializarSelect('animalidifk', 'Selecione um animal');
  dw3InicializarSelect('piqueteidfk', 'Selecione um piquete');

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', vwInsertAlocado);
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
    btnAtualizar.addEventListener('click', vwUpdateAlocado);
    btnAtualizar.disabled = !(await vwGetAlocadoByID());
  }

  if (oper === 'De') {
    bloquearCamposAlocado();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', vwDeleteAlocado);
    btnRemover.disabled = !(await vwGetAlocadoByID());
  }
});

function obterServidor() {
  return document.getElementById('frmAlocados').dataset.servidorDw3;
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

function validarDatas() {
  const dataInicio = document.getElementById('datainicio').value;
  const dataFinal = document.getElementById('datafinal').value;

  if (dataFinal && dataFinal < dataInicio) {
    alert('A data final não pode ser menor que a data de início.');
    return false;
  }

  return true;
}

async function carregarAnimaisToAlocados() {
  try {
    const data = await dw3Requisicao(obterServidor(), '/getAnimaisToAlocados', {}, 'Não foi possível carregar a lista de animais.');
    dw3PreencherSelect('animalidifk', data.registro, 'animalid', (animal) => animal.nome, 'Selecione um animal');
  } catch (error) {
    alert(error.message);
  }
}

async function carregarPiquetesToAlocados() {
  try {
    const data = await dw3Requisicao(obterServidor(), '/getPiquetesToAlocados', {}, 'Não foi possível carregar a lista de piquetes.');
    dw3PreencherSelect('piqueteidfk', data.registro, 'piqueteid', (piquete) => piquete.descricao + ' (' + piquete.pastodescricao + ')', 'Selecione um piquete');
  } catch (error) {
    alert(error.message);
  }
}

async function vwGetAlocadoByID() {
  try {
    const id = dw3ObterIdDaUrl('alocadoId');
    const data = await dw3Requisicao(obterServidor(), '/getAlocadoByID/' + id, {}, 'Não foi possível carregar a alocação.');
    const registro = data.registro[0];

    if (!registro) {
      throw new Error('Alocação não encontrada.');
    }

    document.getElementById('alocadoid').value = registro.alocadoid;
    document.getElementById('datainicio').value = registro.datainicio ?? '';
    document.getElementById('datafinal').value = registro.datafinal ?? '';

    await carregarAnimaisToAlocados();
    dw3SelecionarOpcao('animalidifk', registro.animalidifk, registro.animalnome);

    await carregarPiquetesToAlocados();
    dw3SelecionarOpcao('piqueteidfk', registro.piqueteidfk, registro.piquetedescricao);

    return true;
  } catch (error) {
    alert(error.message);
    return false;
  }
}

async function vwInsertAlocado() {
  const btnInserir = document.getElementById('btnInserirAlocado');

  if (!document.getElementById('frmAlocados').reportValidity() || !validarDatas()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await dw3Requisicao(obterServidor(), '/insertAlocado', {
      method: 'POST',
      body: JSON.stringify(montarAlocadoDoFormulario())
    }, 'Não foi possível inserir a alocação.');

    window.location.href = '/alocados';
  } catch (error) {
    alert(error.message);
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdateAlocado() {
  const btnAtualizar = document.getElementById('btnAtualizarAlocado');

  if (btnAtualizar.disabled || !document.getElementById('frmAlocados').reportValidity() || !validarDatas()) {
    return;
  }

  try {
    btnAtualizar.disabled = true;

    const id = dw3ObterIdDaUrl('alocadoId');
    const data = await dw3Requisicao(obterServidor(), '/updateAlocado/' + id, {
      method: 'PUT',
      body: JSON.stringify(montarAlocadoDoFormulario())
    }, 'Não foi possível atualizar a alocação.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma alocação foi atualizada.');
    }

    alert('Alocação atualizada com sucesso.');
    window.location.href = '/alocados';
  } catch (error) {
    alert(error.message);
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteAlocado() {
  const btnRemover = document.getElementById('btnRemoverAlocado');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção desta alocação?')) {
    return;
  }

  try {
    btnRemover.disabled = true;

    const id = dw3ObterIdDaUrl('alocadoId');
    const data = await dw3Requisicao(obterServidor(), '/deleteAlocado/' + id, {
      method: 'DELETE'
    }, 'Não foi possível remover a alocação.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhuma alocação foi removida.');
    }

    window.location.href = '/alocados';
  } catch (error) {
    alert(error.message);
  } finally {
    btnRemover.disabled = false;
  }
}
