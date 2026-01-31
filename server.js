const express = require("express");
const { CONSTS } = require("./src/utils/ENV");
const app = express();
const PORT = CONSTS.PORT;

// Middleware per parsare JSON
app.use(express.json());

// Rotta di esempio
app.get("/status", (req, res) => {
	res.send("Ciao! Il server Express funziona!");
});

// Avvia il server
app.listen(PORT, () => {
	console.log(`Server in ascolto sulla porta ${PORT}`);
});
