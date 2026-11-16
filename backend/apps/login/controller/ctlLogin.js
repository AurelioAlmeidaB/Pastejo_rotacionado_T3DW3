const jwt = require("jsonwebtoken");
const bCrypt = require("bcryptjs");
const mdlLogin = require("../model/mdlLogin");

const Login = async (req, res) => {
  const credencial = await mdlLogin.GetCredencial(req.body.UserName);

  if (credencial.length === 0) {
    return res.status(403).json({ message: "Usuário não identificado!" });
  }

  if (!bCrypt.compareSync(req.body.Password || "", credencial[0].password)) {
    return res.status(403).json({ message: "Login inválido!" });
  }

  const username = credencial[0].username;
  const token = jwt.sign({ username }, process.env.SECRET_API, { expiresIn: 120 * 60 });

  res.json({ auth: true, token: token, username: username });
};

const AutenticaJWT = (req, res, next) => {
  const tokenHeader = req.headers["authorization"];

  if (!tokenHeader) {
    return res.json({ auth: false, message: "Não foi informado o token JWT" });
  }

  const token = tokenHeader.split(" ")[1];

  jwt.verify(token, process.env.SECRET_API, (err, decoded) => {
    if (err) {
      return res.json({ auth: false, message: "JWT inválido ou expirado" });
    }

    req.username = decoded.username;
    next();
  });
};

const Logout = (req, res) => {
  res.json({ auth: false, token: null });
};

module.exports = {
  Login,
  Logout,
  AutenticaJWT,
};
