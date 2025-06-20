import fs from 'fs';
import { exec } from 'child_process';
import path from 'path';

console.log('🟢 Iniciando o projeto em HTTPS na porta 4200... Aguarde...');

const sslKey = '/etc/letsencrypt/live/gestao-api.dev.br/privkey.pem';
const sslCert = '/etc/letsencrypt/live/gestao-api.dev.br/fullchain.pem';

if (!fs.existsSync(sslKey) || !fs.existsSync(sslCert)) {
  console.error('❌ Certificados SSL reais não encontrados no caminho LetsEncrypt.');
  process.exit(1);
}

const comando = `vite --https --key ${sslKey} --cert ${sslCert} --port 4200`;

const processo = exec(comando);

processo.stdout.on('data', (data) => {
  console.log(data);
  if (data.includes('https://localhost:')) {
    const match = data.match(/https:\/\/localhost:(\d+)/);
    if (match) {
      console.log(`✅ Projeto rodando com sucesso em HTTPS na porta ${match[1]}`);
    }
  }
});

processo.stderr.on('data', (data) => {
  console.error(data);
});

processo.on('exit', (code) => {
  console.log(`🛑 Processo finalizado com código: ${code}`);
});