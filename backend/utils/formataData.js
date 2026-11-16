const formataData = (registros, campos) => {
  for (const registro of registros) {
    for (const campo of campos) {
      if (registro[campo]) {
        registro[campo] = registro[campo].toISOString().split("T")[0];
      }
    }
  }

  return registros;
};

module.exports = formataData;
