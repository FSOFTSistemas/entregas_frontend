import { exec } from 'child_process';

console.log('🟢 Iniciando o projeto na porta 4200... Aguarde...');

const processo = exec('npm run dev -- --port 4200');

processo.stdout.on('data', (data) => {
  console.log(data);

  if (data.includes('http://localhost:')) {
    const match = data.match(/http:\/\/localhost:(\d+)/);
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