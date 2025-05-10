const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

let pedidos = [];
let historicoFinalizados = [];

// Rota principal para abrir o painel
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "painel.html"));
});

// Rota principal para abrir o painel
app.get("/pedido", (req, res) => {
  res.sendFile(path.join(__dirname, "pedido.html"));
});

app.post("/painel", (req, res) => {
  const pedido = {
    id: uuidv4(),
    ...req.body,
    horario: new Date().toISOString(),
    status: "Aberto",
  };
  pedidos.push(pedido);
  res.status(200).json({ message: "Pedido recebido com sucesso" });
});

app.get("/painel", (req, res) => {
  res.status(200).json(pedidos); // Retorna os pedidos para a tela de painel
});

app.put("/finalizar/:id", (req, res) => {
  const id = req.params.id;
  const index = pedidos.findIndex((p) => p.id === id && p.status === "Aberto");

  if (index !== -1) {
    pedidos[index].status = "Finalizado";
    pedidos[index].finalizadoEm = new Date().toISOString();
    historicoFinalizados.push({ ...pedidos[index] });
    pedidos.splice(index, 1); // Remove o pedido da lista de pedidos abertos
    res.status(200).json({ message: "Pedido finalizado com sucesso" });
  } else {
    res
      .status(400)
      .json({ message: "Pedido não encontrado ou já finalizado." });
  }
});

app.get("/historico-finalizados", (req, res) => {
  res.status(200).json(historicoFinalizados); // Retorna os pedidos finalizados
});

app.delete("/limpar-finalizados", (req, res) => {
  historicoFinalizados = []; // Limpa os pedidos finalizados
  res.status(200).json({ message: "Histórico limpo." });
});

app.post("/exportar-estatisticas", (req, res) => {
  const dadosEstatisticas = req.body; // Recebe os dados de estatísticas

  // Verificando se os dados estão corretos
  if (!dadosEstatisticas || Object.keys(dadosEstatisticas).length === 0) {
    return res.status(400).json({ message: "Nenhum dado para exportar." });
  }

  // Define o caminho onde o arquivo JSON será salvo
  const caminhoArquivo = path.join(
    "C:",
    "Users",
    "Gabriel",
    "Desktop",
    "pedido ferramenta 2.0",
    "sistema_pedidos",
    "arquivo_json",
    "estatisticas.json"
  );

  // Cria a pasta, caso não exista
  const pasta = path.dirname(caminhoArquivo);
  if (!fs.existsSync(pasta)) {
    try {
      fs.mkdirSync(pasta, { recursive: true });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Erro ao criar pasta no diretório." });
    }
  }

  // Grava os dados no arquivo JSON
  fs.writeFile(
    caminhoArquivo,
    JSON.stringify(dadosEstatisticas, null, 2),
    (err) => {
      if (err) {
        console.error("Erro ao escrever no arquivo:", err);
        return res.status(500).json({ message: "Erro ao salvar o arquivo." });
      }
      console.log("Arquivo exportado com sucesso:", caminhoArquivo);
      res.status(200).json({ message: "Arquivo exportado com sucesso." });
    }
  );
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
