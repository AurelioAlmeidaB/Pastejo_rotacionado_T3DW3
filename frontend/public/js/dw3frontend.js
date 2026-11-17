const DW3_IDIOMA_DATATABLES = {
  emptyTable: 'Nenhum registro cadastrado.',
  info: 'Mostrando _START_ até _END_ de _TOTAL_ registros',
  infoEmpty: 'Mostrando 0 até 0 de 0 registros',
  infoFiltered: '(filtrado de _MAX_ registros no total)',
  lengthMenu: 'Mostrar _MENU_ registros',
  loadingRecords: 'Carregando...',
  processing: 'Processando...',
  search: 'Pesquisar:',
  zeroRecords: 'Nenhum registro encontrado',
  paginate: {
    first: 'Primeiro',
    last: 'Último',
    next: 'Próximo',
    previous: 'Anterior'
  }
};

function dw3IsLogged() {
  const isLogged = document.cookie
    .split(';')
    .some((cookie) => cookie.trim().startsWith('IsLogged='));

  if (!isLogged) {
    window.location.href = '/login';
    return false;
  }

  return true;
}

function dw3ClearIsLoggedCookie() {
  document.cookie = 'IsLogged=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

function dw3MontarHeadersAutenticacao(headers) {
  const token = localStorage.getItem('token');
  const finalHeaders = headers || {};

  if (token) {
    finalHeaders.Authorization = 'Bearer ' + token;
  }

  return finalHeaders;
}

function dw3SessaoExpirada() {
  localStorage.removeItem('token');
  localStorage.removeItem('username');
  dw3ClearIsLoggedCookie();
  alert('Sua sessão expirou. Faça login novamente.');
  window.location.href = '/login';
}

async function dw3Requisicao(servidorDw3, caminho, opcoes, mensagemErro) {
  if (!servidorDw3) {
    throw new Error('Endereço do servidor backend não configurado.');
  }

  const config = opcoes || {};
  config.headers = dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' });

  let response;

  try {
    response = await fetch(servidorDw3 + caminho, config);
  } catch (error) {
    throw new Error('Não foi possível conectar ao servidor backend.');
  }

  if (!response.ok) {
    throw new Error(mensagemErro);
  }

  const data = await response.json();

  if (data.auth === false) {
    dw3SessaoExpirada();
    return new Promise(() => {});
  }

  if (data.status !== 'ok') {
    throw new Error(data.status || mensagemErro);
  }

  return data;
}

function dw3ObterIdDaUrl(parametro) {
  const id = new URLSearchParams(window.location.search).get(parametro);

  if (!id || !/^\d+$/.test(id) || Number(id) <= 0) {
    throw new Error('ID inválido.');
  }

  return id;
}

function dw3ObterOperacao() {
  return new URLSearchParams(window.location.search).get('oper') || 'Cr';
}

function dw3DataDeHoje() {
  const hoje = new Date();
  hoje.setMinutes(hoje.getMinutes() - hoje.getTimezoneOffset());
  return hoje.toISOString().split('T')[0];
}

function dw3EscaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function dw3ExibirErro(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }

  alertBox.textContent = mensagem;
  alertBox.classList.remove('d-none');
}

function dw3RenderizarData(textoVazio) {
  return function(data, type) {
    if (!data) {
      return type === 'display' ? (textoVazio || '') : '';
    }

    if (type !== 'display') {
      return data;
    }

    return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
  };
}

function dw3BotoesOperacoes(id) {
  const idSeguro = dw3EscaparHtml(id);

  return [
    '<div class="btn-group btn-group-sm" role="group" aria-label="Operações">',
    '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-id="' + idSeguro + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
    '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-id="' + idSeguro + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
    '<button class="btn btn-outline-danger" type="button" data-action="remover" data-id="' + idSeguro + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
    '</div>'
  ].join('');
}

function dw3ColunaOperacoes(campoId) {
  return {
    data: null,
    orderable: false,
    searchable: false,
    render: function(data, type, row) {
      return type === 'display' ? dw3BotoesOperacoes(row[campoId]) : '';
    }
  };
}

function dw3ConfigurarOperacoes(idTabela, rota, parametroId) {
  const tabela = document.getElementById(idTabela);
  const operacoes = { visualizar: 'Re', atualizar: 'Up', remover: 'De' };

  tabela.addEventListener('click', function(event) {
    const botao = event.target.closest('button[data-action][data-id]');

    if (!botao) {
      return;
    }

    const oper = operacoes[botao.dataset.action];
    window.location.href = rota + '/form?oper=' + oper + '&' + parametroId + '=' + encodeURIComponent(botao.dataset.id);
  });
}

function dw3InicializarSelect(idSelect, placeholder) {
  $('#' + idSelect).select2({
    theme: 'bootstrap-5',
    placeholder: placeholder,
    width: '100%'
  });
}

function dw3PreencherSelect(idSelect, registros, campoValor, montarTexto, placeholder) {
  const select = document.getElementById(idSelect);
  select.innerHTML = '';

  const opcaoVazia = document.createElement('option');
  opcaoVazia.value = '';
  opcaoVazia.textContent = placeholder;
  select.appendChild(opcaoVazia);

  registros.forEach(function(registro) {
    const option = document.createElement('option');
    option.value = registro[campoValor];
    option.textContent = montarTexto(registro);
    select.appendChild(option);
  });

  $('#' + idSelect).trigger('change');
}

function dw3SelecionarOpcao(idSelect, valor, texto) {
  const select = document.getElementById(idSelect);

  if (!select.querySelector('option[value="' + valor + '"]')) {
    const option = document.createElement('option');
    option.value = valor;
    option.textContent = texto + ' (removido)';
    select.appendChild(option);
  }

  $('#' + idSelect).val(String(valor)).trigger('change');
}
