import fs from 'fs';
import https from 'https';
import { exec } from 'child_process';

const modoHTTPS = process.env.HTTPS === 'true';

console.log(`🟢 Iniciando o projeto na porta 4200... Modo: ${modoHTTPS ? 'HTTPS' : 'HTTP'}`);

const comando = modoHTTPS
  ? 'npm run dev -- --https --ssl-cert /etc/letsencrypt/live/gestao-api.dev.br/fullchain.pem --ssl-key /etc/letsencrypt/live/gestao-api.dev.br/privkey.pem --port 4200'
  : 'npm run dev -- --port 4200';

const processo = exec(comando);

// const processo = exec('npm run dev -- --port 4200');

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