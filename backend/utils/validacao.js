const textoVazio = (valor) => typeof valor !== "string" || valor.trim() === "";

const numeroInvalido = (valor) => valor === null || valor === undefined || valor === "" || isNaN(Number(valor));

const idInvalido = (valor) => !/^\d+$/.test(String(valor)) || Number(valor) <= 0;

const dataInvalida = (valor) => typeof valor !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(valor);

const dataDeHoje = () => new Date().toISOString().split("T")[0];

module.exports = {
  textoVazio,
  numeroInvalido,
  idInvalido,
  dataInvalida,
  dataDeHoje,
};
