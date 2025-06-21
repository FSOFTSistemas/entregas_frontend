

import React from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

export default function Relatorios() {
  const handleGerarRelatorio = () => {
    // Aqui futuramente você vai implementar a geração real do relatório
    alert('Relatório gerado com sucesso (exemplo)');
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Relatórios</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="dataInicio">Data Início</Label>
          <Input id="dataInicio" type="date" />
        </div>
        <div>
          <Label htmlFor="dataFim">Data Fim</Label>
          <Input id="dataFim" type="date" />
        </div>
      </div>

      <Button onClick={handleGerarRelatorio}>
        Gerar Relatório
      </Button>
    </div>
  );
}