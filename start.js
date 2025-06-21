import dotenv from 'dotenv';
dotenv.config();
import { exec } from 'child_process';

const modoHTTPS = process.env.HTTPS === 'true';


console.log(`🟢 Iniciando o projeto na porta 4200... Modo: ${modoHTTPS ? 'HTTPS' : 'HTTP'}`);

const comando = 'npm run dev';

const processo = exec(comando);


processo.stdout.on('data', (data) => {
  console.log(data);

  if (data.includes('localhost:')) {
    const match = data.match(/https?:\/\/localhost:(\d+)/);
    if (match) {
      console.log(`✅ Projeto rodando com sucesso na porta ${match[1]}`);
    }
  }
});

processo.stderr.on('data', (data) => {
  console.error(data);
});

processo.on('exit', (code) => {
  console.log(`🛑 Processo finalizado com código: ${code}`);
});