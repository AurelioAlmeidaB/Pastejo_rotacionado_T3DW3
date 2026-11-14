// arquivo: ./apps/piquetes/vwLstPiquetes.js

document.addEventListener('DOMContentLoaded', function() {
  if (!dw3IsLogged()) {
    return;
  }

  var listagem = document.getElementById('piquetesListagem');
  var alertBox = document.getElementById('piquetesAlert');

  if (!listagem) {
    return;
  }

  var servidorDw3 = listagem.dataset.servidorDw3;

  configurarOperacoesPiquetes();
  vwGetAllPiquetes(servidorDw3, alertBox);
});

async function vwGetAllPiquetes(servidorDw3, alertBox) {
  try {
    if (!servidorDw3) {
      throw new Error('Endereço do servidor backend não configurado.');
    }

    var response = await fetch(servidorDw3 + '/getAllPiquetes', {
      headers: dw3MontarHeadersAutenticacao()
    });

    if (!response.ok) {
      throw new Error('Não foi possível carregar a lista de piquetes.');
    }

    var data = await response.json();

    if (data.auth === false) {
      dw3SessaoExpirada(); // JWT expirado: volta para a tela de login.
      return;
    }

    if (data.status !== 'ok' || !Array.isArray(data.registro)) {
      throw new Error('Resposta inválida do servidor backend.');
    }

    inicializarTabelaPiquetes(data.registro);
  } catch (error) {
    exibirErro(alertBox, error.message || 'Erro ao carregar piquetes.');
    inicializarTabelaPiquetes([]);
  }
}

function inicializarTabelaPiquetes(registros) {
  new DataTable('#tblPiquetes', {
    data: registros,
    columns: [
      { data: 'piqueteid', defaultContent: '' },
      { data: 'descricao', defaultContent: '' },
      { data: 'pastodescricao', defaultContent: '' },
      { data: 'latitude', defaultContent: '' },
      { data: 'longitude', defaultContent: '' },
      {
        data: null,
        orderable: false,
        searchable: false,
        render: function(data, type, row) {
          if (type !== 'display') {
            return '';
          }

          var id = escaparHtml(row.piqueteid || '');

          return [
            '<div class="btn-group btn-group-sm" role="group" aria-label="Operações">',
            '<button class="btn btn-outline-primary" type="button" data-action="visualizar" data-id="' + id + '" title="Visualizar" aria-label="Visualizar"><i class="bi bi-eye"></i></button>',
            '<button class="btn btn-outline-secondary" type="button" data-action="atualizar" data-id="' + id + '" title="Atualizar" aria-label="Atualizar"><i class="bi bi-pencil-square"></i></button>',
            '<button class="btn btn-outline-danger" type="button" data-action="remover" data-id="' + id + '" title="Remover" aria-label="Remover"><i class="bi bi-trash"></i></button>',
            '</div>'
          ].join('');
        }
      }
    ],
    language: {
      emptyTable: 'Nenhum piquete cadastrado.',
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
    }
  });
}

function configurarOperacoesPiquetes() {
  var tabela = document.getElementById('tblPiquetes');

  if (!tabela) {
    return;
  }

  tabela.addEventListener('click', function(event) {
    var botao = event.target.closest('button[data-action][data-id]');

    if (!botao) {
      return;
    }

    var operacoes = { visualizar: 'Re', atualizar: 'Up', remover: 'De' };
    var oper = operacoes[botao.dataset.action];

    if (oper) {
      window.location.href = '/piquetes/form?oper=' + oper + '&piqueteId=' + encodeURIComponent(botao.dataset.id);
    }
  });
}

function escaparHtml(valor) {
  return String(valor)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function exibirErro(alertBox, mensagem) {
  if (!alertBox) {
    return;
  }

  alertBox.textContent = mensagem;
  alertBox.classList.remove('alert-info');
  alertBox.classList.add('alert-danger');
  alertBox.classList.remove('d-none');
}
