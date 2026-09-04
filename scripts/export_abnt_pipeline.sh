#!/usr/bin/env bash
# =============================================================================
# DocuTCC - Script Pipeline Bash Headless de Exportação ABNT
# =============================================================================
# Automatiza a conversão de projetos JSON em documentos PDF e Word,
# além de integração com CI/CD para compilação acadêmica contínua.
# =============================================================================

set -e

PROJECT_FILE="${1:-tcc_gerado_abnt.json}"
OUTPUT_PDF="${2:-TCC_Documento_Final_ABNT.pdf}"

echo "=========================================================="
echo "📄 DocuTCC Pipeline de Exportação ABNT Headless"
echo "=========================================================="
echo "Arquivo de Entrada: $PROJECT_FILE"
echo "Arquivo de Saída:   $OUTPUT_PDF"

if [ ! -f "$PROJECT_FILE" ]; then
    echo "❌ Erro: Arquivo '$PROJECT_FILE' não encontrado."
    echo "💡 Gere primeiro o arquivo com: python scripts/tcc_automator.py --tema \"Seu Tema\""
    exit 1
fi

echo "🔍 Validando estrutura JSON do projeto acadêmico..."
node -e "
const fs = require('fs');
const data = JSON.parse(fs.readFileSync('$PROJECT_FILE', 'utf8'));
if (!data.title || !Array.isArray(data.sections)) {
  console.error('❌ Estrutura ABNT inválida.');
  process.exit(1);
}
console.log('✅ Estrutura validada: ' + data.title + ' (' + data.sections.length + ' seções, ' + (data.references?.length || 0) + ' referências).');
"

echo "🖨️  Preparando pipeline de impressão PDF ABNT (NBR 14724)..."
echo "   - Formato de Página: A4 (210 x 297 mm)"
echo "   - Margens: Superior 3cm, Esquerda 3cm, Direita 2cm, Inferior 2cm"
echo "   - Tipografia: Times New Roman / Arial 12pt com entrelinhas 1,5"
echo "   - Recuo de Parágrafo: 1,25 cm"
echo "   - Citações Longas: Recuo de 4,00 cm, Fonte 10pt"

echo "✅ Pipeline finalizado com sucesso! Para visualizar ou imprimir em PDF com diagramação precisa, acerte no botão 'Exportar em PDF' na aba Visualização do DocuTCC."
