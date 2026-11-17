document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');

  vwLogout(form.dataset.servidorDw3);

  form.addEventListener('submit', function(event) {
    event.preventDefault();
    vwLogin(form.dataset.servidorDw3);
  });
});

async function vwLogin(servidorDw3) {
  const errorBox = document.getElementById('loginError');
  const submitButton = document.querySelector('#loginForm button[type="submit"]');

  errorBox.classList.add('d-none');
  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    const response = await fetch(servidorDw3 + '/Login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        UserName: document.getElementById('usuario').value.trim(),
        Password: document.getElementById('senha').value
      })
    });

    const data = await response.json();

    if (!response.ok || !data.token) {
      throw new Error('Usuário ou senha inválidos.');
    }

    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    document.cookie = 'IsLogged=true; path=/; max-age=' + (120 * 60);
    window.location.href = '/home';
  } catch (error) {
    const mensagem = error instanceof TypeError ? 'Não foi possível conectar ao servidor backend.' : error.message;
    dw3ExibirErro(errorBox, mensagem);
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
}

async function vwLogout(servidorDw3) {
  if (localStorage.getItem('token')) {
    try {
      await fetch(servidorDw3 + '/Logout', {
        method: 'POST',
        headers: dw3MontarHeadersAutenticacao({ 'content-type': 'application/json' })
      });
    } catch (error) {
      console.log('Não foi possível avisar o backend do logout.');
    }
  }

  localStorage.removeItem('token');
  localStorage.removeItem('username');
  dw3ClearIsLoggedCookie();
}
