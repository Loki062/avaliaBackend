const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

// Rota de Login
app.post('/login', async (req, res) => {
  const { email, senha } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.senha === senha) {
    res.json({ message: 'Login bem-sucedido!' });
  } else {
    res.status(401).json({ error: 'Credenciais inválidas' });
  }
});

// Rota para listar avaliações
app.get('/avaliacoes', async (req, res) => {
  const avaliacoes = await prisma.avaliacao.findMany();
  res.json(avaliacoes);
});

// Rota para enviar respostas
app.post('/responder', async (req, res) => {
  const { id_usuario, id_avaliacao, respostas } = req.body;
  await prisma.resposta.create({
    data: { id_usuario, id_avaliacao, respostas },
  });

  // Incrementar contador de avaliações
  const user = await prisma.user.update({
    where: { id: id_usuario },
    data: { avaliacoes_realizadas: { increment: 1 } },
  });

  // Verificar se o usuário ganhou um prêmio
  if (user.avaliacoes_realizadas >= 10) {
    await prisma.user.update({
      where: { id: id_usuario },
      data: { premios: { increment: 1 }, avaliacoes_realizadas: 0 },
    });
    res.json({ message: 'Parabéns! Você ganhou um prêmio!' });
  } else {
    res.json({ message: 'Resposta enviada com sucesso!' });
  }
});

app.listen(3000, () => console.log('Servidor rodando na porta 3000'));