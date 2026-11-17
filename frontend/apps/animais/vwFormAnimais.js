document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  const oper = dw3ObterOperacao();
  const btnInserir = document.getElementById('btnInserirAnimal');
  const btnAtualizar = document.getElementById('btnAtualizarAnimal');
  const btnRemover = document.getElementById('btnRemoverAnimal');

  document.getElementById('datanasc').max = dw3DataDeHoje();

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', vwInsertAnimal);
  }

  if (oper === 'Re') {
    bloquearCamposAnimal();
    vwGetAnimalByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', vwUpdateAnimal);
    btnAtualizar.disabled = !(await vwGetAnimalByID());
  }

  if (oper === 'De') {
    bloquearCamposAnimal();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', vwDeleteAnimal);
    btnRemover.disabled = !(await vwGetAnimalByID());
  }
});

function obterServidor() {
  return document.getElementById('frmAnimais').dataset.servidorDw3;
}

function bloquearCamposAnimal() {
  document.getElementById('nome').readOnly = true;
  document.getElementById('datanasc').readOnly = true;
}

function montarAnimalDoFormulario() {
  return {
    nome: document.getElementById('nome').value.trim(),
    datanasc: document.getElementById('datanasc').value
  };
}

async function vwGetAnimalByID() {
  try {
    const id = dw3ObterIdDaUrl('animalId');
    const data = await dw3Requisicao(obterServidor(), '/getAnimalByID/' + id, {}, 'Não foi possível carregar o animal.');
    const registro = data.registro[0];

    if (!registro) {
      throw new Error('Animal não encontrado.');
    }

    document.getElementById('animalid').value = registro.animalid;
    document.getElementById('nome').value = registro.nome ?? '';
    document.getElementById('datanasc').value = registro.datanasc ?? '';

    return true;
  } catch (error) {
    alert(error.message);
    return false;
  }
}

async function vwInsertAnimal() {
  const btnInserir = document.getElementById('btnInserirAnimal');

  if (!document.getElementById('frmAnimais').reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await dw3Requisicao(obterServidor(), '/insertAnimal', {
      method: 'POST',
      body: JSON.stringify(montarAnimalDoFormulario())
    }, 'Não foi possível inserir o animal.');

    window.location.href = '/animais';
  } catch (error) {
    alert(error.message);
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdateAnimal() {
  const btnAtualizar = document.getElementById('btnAtualizarAnimal');

  if (btnAtualizar.disabled || !document.getElementById('frmAnimais').reportValidity()) {
    return;
  }

  try {
    btnAtualizar.disabled = true;

    const id = dw3ObterIdDaUrl('animalId');
    const data = await dw3Requisicao(obterServidor(), '/updateAnimal/' + id, {
      method: 'PUT',
      body: JSON.stringify(montarAnimalDoFormulario())
    }, 'Não foi possível atualizar o animal.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum animal foi atualizado.');
    }

    alert('Animal atualizado com sucesso.');
    window.location.href = '/animais';
  } catch (error) {
    alert(error.message);
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteAnimal() {
  const btnRemover = document.getElementById('btnRemoverAnimal');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção deste animal?')) {
    return;
  }

  try {
    btnRemover.disabled = true;

    const id = dw3ObterIdDaUrl('animalId');
    const data = await dw3Requisicao(obterServidor(), '/deleteAnimal/' + id, {
      method: 'DELETE'
    }, 'Não foi possível remover o animal.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum animal foi removido.');
    }

    window.location.href = '/animais';
  } catch (error) {
    alert(error.message);
  } finally {
    btnRemover.disabled = false;
  }
}
