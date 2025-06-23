import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select } from '../components/ui/select';

export default function Relatorios() {
  const today = new Date().toISOString().split('T')[0];
  const [dataInicio, setDataInicio] = React.useState(today);
  const [dataFim, setDataFim] = React.useState(today);
  const [entregadorSelecionado, setEntregadorSelecionado] = React.useState('');

  const handleGerarRelatorio = () => {
    // Aqui futuramente você vai implementar a geração real do relatório
    alert('Relatório gerado com sucesso (exemplo)');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[140px]">
          <Label htmlFor="dataInicio">Data Início</Label>
          <Input id="dataInicio" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </div>
        <div className="flex-1 min-w-[140px]">
          <Label htmlFor="dataFim">Data Fim</Label>
          <Input id="dataFim" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </div>
      </div>

      <div className="mb-6">
        <Label htmlFor="entregador">Entregador</Label>
        <Select id="entregador" value={entregadorSelecionado} onChange={(e) => setEntregadorSelecionado(e.target.value)}>
          <option value="">Todos</option>
          <option value="1">Entregador 1</option>
          <option value="2">Entregador 2</option>
          {/* No futuro, substitua por um map vindo da API de entregadores */}
        </Select>
      </div>

      <Button onClick={handleGerarRelatorio}>
        Gerar Relatório
      </Button>
    </div>
  );
}