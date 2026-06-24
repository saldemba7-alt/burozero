from app.models.process import ProcessStep

# Passo-a-passo pré-definido para cada tipo de processo
PROCESS_TEMPLATES: dict[str, list[ProcessStep]] = {

    "IRS — Modelo 3": [
        ProcessStep(order=1, name="Recolher documentos",       detail="Recibos verdes, retenções na fonte, dependentes, despesas dedutíveis"),
        ProcessStep(order=2, name="Aceder ao Portal Finanças", detail="portaldasfinancas.gov.pt → Cidadãos → IRS → Entregar Declaração"),
        ProcessStep(order=3, name="Preencher Modelo 3",        detail="Escolher anexos correctos: B (cat. B), A (dependente), H (despesas saúde)"),
        ProcessStep(order=4, name="Validar e submeter",        detail="Verificar simulação antes de submeter — prazo: 30 de Junho"),
        ProcessStep(order=5, name="Aguardar liquidação",       detail="Reembolso em 30–60 dias após submissão"),
    ],

    "IVA — Declaração Periódica": [
        ProcessStep(order=1, name="Apurar IVA do período",      detail="IVA liquidado nas vendas − IVA dedutível nas compras"),
        ProcessStep(order=2, name="Aceder ao Portal Finanças",  detail="Cidadãos → IVA → Declaração Periódica"),
        ProcessStep(order=3, name="Preencher e submeter",       detail="Mensal (grandes empresas) ou Trimestral (regime geral)"),
        ProcessStep(order=4, name="Pagar IVA (se devido)",      detail="Pagamento até ao último dia do prazo — referência MB gerada no portal"),
    ],

    "IRC — Modelo 22": [
        ProcessStep(order=1, name="Encerrar contabilidade",      detail="Garantir que todos os lançamentos do exercício estão fechados"),
        ProcessStep(order=2, name="Calcular matéria colectável", detail="Resultado líquido ± ajustamentos fiscais"),
        ProcessStep(order=3, name="Preencher Modelo 22",         detail="Portal Finanças → IRC → Entregar Declaração → Modelo 22"),
        ProcessStep(order=4, name="Submeter declaração",         detail="Prazo: último dia útil de Maio do ano seguinte"),
        ProcessStep(order=5, name="Pagar IRC ou pedir reembolso",detail="Derrama estadual pode aplicar-se a lucros > €1,5M"),
    ],

    "Declaração Trimestral SS": [
        ProcessStep(order=1, name="Apurar remunerações",         detail="Salários brutos + subsídios pagos no trimestre"),
        ProcessStep(order=2, name="Aceder à Seg. Social Direta", detail="seg-social.pt → Empregadores → Declarações de Remunerações"),
        ProcessStep(order=3, name="Preencher declaração",        detail="Verificar NIF e categoria de cada trabalhador"),
        ProcessStep(order=4, name="Submeter e pagar",            detail="Contribuição = 23,75% entidade + 11% trabalhador"),
    ],

    "Renovação Autorização Residência": [
        ProcessStep(order=1, name="Agendar na AIMA",             detail="aima.gov.pt → Agendamentos → Título de Residência"),
        ProcessStep(order=2, name="Preparar documentação",       detail="Passaporte, prova de meios de subsistência, NIF, comprovativo morada"),
        ProcessStep(order=3, name="Comparecer ao agendamento",   detail="Levar originais + fotocópias de todos os documentos"),
        ProcessStep(order=4, name="Pagar taxa",                  detail="Taxa variável: residência temporária ~€83 / permanente ~€137"),
        ProcessStep(order=5, name="Aguardar emissão do título",  detail="Prazo legal: 60 dias. Acompanha em aima.gov.pt → Estado do processo"),
    ],

    "Licença de Actividade": [
        ProcessStep(order=1, name="Verificar CAE",               detail="Confirmar CAE correcto no portal do INE"),
        ProcessStep(order=2, name="Submeter pedido na Câmara",   detail="Balcão único online da câmara municipal correspondente"),
        ProcessStep(order=3, name="Pagar taxas municipais",      detail="Valor varia por município e tipo de actividade"),
        ProcessStep(order=4, name="Aguardar vistoria",           detail="Câmara agenda vistoria ao local em 15–30 dias"),
        ProcessStep(order=5, name="Receber licença",             detail="Emitida após aprovação — válida por período determinado"),
    ],
}
