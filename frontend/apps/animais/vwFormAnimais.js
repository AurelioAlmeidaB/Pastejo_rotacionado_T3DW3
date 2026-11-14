// Arquivo: apps/animais/vwFormAnimais.js

document.addEventListener('DOMContentLoaded', async function() {
  if (!dw3IsLogged()) {
    return;
  }

  var form = document.getElementById('frmAnimais');

  if (!form) {
    return;
  }

  // oper vem da url: Cr (criar), Re (visualizar), Up (atualizar) e De (remover)
  var oper = new URLSearchParams(window.location.search).get('oper') || 'Cr';
  var btnInserir = document.getElementById('btnInserirAnimal');
  var btnAtualizar = document.getElementById('btnAtualizarAnimal');
  var btnRemover = document.getElementById('btnRemoverAnimal');

  if (oper === 'Cr') {
    btnInserir.classList.remove('d-none');
    btnInserir.addEventListener('click', function() {
      vwInsertAnimal();
    });
  }

  if (oper === 'Re') {
    bloquearCamposAnimal();
    vwGetAnimalByID();
  }

  if (oper === 'Up') {
    btnAtualizar.classList.remove('d-none');
    btnAtualizar.disabled = true;
    btnAtualizar.addEventListener('click', function() {
      vwUpdateAnimal();
    });
    btnAtualizar.disabled = !(await vwGetAnimalByID());
  }

  if (oper === 'De') {
    bloquearCamposAnimal();
    btnRemover.classList.remove('d-none');
    btnRemover.disabled = true;
    btnRemover.addEventListener('click', function() {
      vwDeleteAnimal();
    });
    btnRemover.disabled = !(await vwGetAnimalByID());
  }
});

function bloquearCamposAnimal() {
  document.getElementById('nome').readOnly = true;
  document.getElementById('datanasc').readOnly = true;
}

function montarAnimalDoFormulario() {
  return {
    nome: document.getElementById('nome').value,
    datanasc: document.getElementById('datanasc').value
  };
}

function obterAnimalIdDaUrl() {
  var id = new URLSearchParams(window.location.search).get('animalId');

  if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
    throw new Error('ID do animal inválido.');
  }

  return id;
}

// Faz a requisição ao backend e trata as respostas de erro padrão do sistema.
async function enviarRequisicaoAnimal(caminho, opcoes, mensagemErro) {
  var servidorDw3 = document.getElementById('frmAnimais').dataset.servidorDw3;

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

// Retorna true quando o animal foi carregado no formulário.
async function vwGetAnimalByID() {
  try {
    var id = obterAnimalIdDaUrl();
    var data = await enviarRequisicaoAnimal('/getAnimalByID/' + encodeURIComponent(id), {
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível carregar o animal.');

    var registro = Array.isArray(data.registro) ? data.registro[0] : null;

    if (!registro) {
      throw new Error('Animal não encontrado.');
    }

    document.getElementById('animalid').value = registro.animalid;
    document.getElementById('nome').value = registro.nome ?? '';
    document.getElementById('datanasc').value = registro.datanasc ?? '';
    return true;
  } catch (error) {
    alert(error.message || 'Erro ao carregar animal.');
    return false;
  }
}

async function vwInsertAnimal() {
  var form = document.getElementById('frmAnimais');
  var btnInserir = document.getElementById('btnInserirAnimal');

  if (!form.reportValidity()) {
    return;
  }

  try {
    btnInserir.disabled = true;

    await enviarRequisicaoAnimal('/insertAnimal', {
      method: 'POST',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarAnimalDoFormulario())
    }, 'Não foi possível inserir o animal.');

    window.location.href = '/animais';
  } catch (error) {
    alert(error.message || 'Erro ao inserir animal.');
  } finally {
    btnInserir.disabled = false;
  }
}

async function vwUpdateAnimal() {
  var form = document.getElementById('frmAnimais');
  var btnAtualizar = document.getElementById('btnAtualizarAnimal');

  if (btnAtualizar.disabled || !form.reportValidity()) {
    return;
  }

  try {
    var id = obterAnimalIdDaUrl();
    btnAtualizar.disabled = true;

    var data = await enviarRequisicaoAnimal('/updateAnimal/' + encodeURIComponent(id), {
      method: 'PUT',
      headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' }),
      body: JSON.stringify(montarAnimalDoFormulario())
    }, 'Não foi possível atualizar o animal.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum animal foi atualizado.');
    }

    alert('Animal atualizado com sucesso.');
    window.location.href = '/animais';
  } catch (error) {
    alert(error.message || 'Erro ao atualizar animal.');
  } finally {
    btnAtualizar.disabled = false;
  }
}

async function vwDeleteAnimal() {
  var btnRemover = document.getElementById('btnRemoverAnimal');

  if (btnRemover.disabled || !window.confirm('Confirma a remoção deste animal?')) {
    return;
  }

  try {
    var id = obterAnimalIdDaUrl();
    btnRemover.disabled = true;

    var data = await enviarRequisicaoAnimal('/deleteAnimal/' + encodeURIComponent(id), {
      method: 'DELETE',
      headers: dw3MontarHeadersAutenticacao()
    }, 'Não foi possível remover o animal.');

    if (data.linhasAfetadas !== 1) {
      throw new Error('Nenhum animal foi removido.');
    }

    window.location.href = '/animais';
  } catch (error) {
    alert(error.message || 'Erro ao remover animal.');
  } finally {
    btnRemover.disabled = false;
  }
}
