# Utilitários do Frontend

Este diretório contém funções utilitárias reutilizáveis para uso em toda a aplicação.

## 📁 Arquivos

### `priceUtils.js` - Utilitários de Preço

Funções para cálculo e formatação de preços.

**Funções disponíveis**:
- `calculateDiscountedPrice(basePrice, discountPercentage, hasDiscount)` - Calcula preço com desconto
- `hasActiveDiscount(hasDiscount, discountPercentage)` - Verifica se desconto está ativo
- `formatPrice(price)` - Formata preço para exibição (R$ 99,99)
- `splitPrice(price)` - Separa preço em inteiro e centavos
- `calculateFinalPrice(item)` - Calcula preço final de um item do carrinho

**Exemplo de uso**:
```javascript
import { formatPrice, calculateDiscountedPrice, hasActiveDiscount } from '../utils/priceUtils';

const basePrice = 100;
const discount = 20;
const hasDiscount = true;

if (hasActiveDiscount(hasDiscount, discount)) {
    const finalPrice = calculateDiscountedPrice(basePrice, discount, hasDiscount);
    console.log(formatPrice(finalPrice)); // R$ 80,00
}
```

---

### `stockUtils.js` - Utilitários de Estoque

Funções para gerenciamento e verificação de estoque.

**Funções disponíveis**:
- `isOutOfStock(stock, sizes)` - Verifica se produto está esgotado
- `formatStock(stock)` - Formata estoque para exibição
- `usesSizes(categoryData, categories)` - Verifica se categoria usa tamanhos

**Exemplo de uso**:
```javascript
import { isOutOfStock, formatStock } from '../utils/stockUtils';

const product = {
    stock: { P: 0, M: 0, G: 5 },
    sizes: ['P', 'M', 'G']
};

if (isOutOfStock(product.stock, product.sizes)) {
    console.log('Produto esgotado');
} else {
    console.log(formatStock(product.stock)); // "G: 5"
}
```

---

### `apiHelpers.js` - Helpers de API

Funções auxiliares para interação com a API.

**Funções disponíveis**:
- `getErrorMessage(error)` - Extrai mensagem de erro
- `isAuthError(error)` - Verifica erro de autenticação (401)
- `isPermissionError(error)` - Verifica erro de permissão (403)
- `isValidationError(error)` - Verifica erro de validação (400)
- `buildQueryString(params)` - Constrói query string
- `retryRequest(fn, retries, delay)` - Implementa retry automático

**Exemplo de uso**:
```javascript
import { getErrorMessage, isAuthError, retryRequest } from '../utils/apiHelpers';

try {
    const result = await retryRequest(() => api.get('/products'), 3, 1000);
} catch (error) {
    if (isAuthError(error)) {
        // Redirecionar para login
    }
    alert(getErrorMessage(error));
}
```

---

## 🎯 Quando Usar

### Use `priceUtils.js` quando:
- Calcular preços com desconto
- Formatar preços para exibição
- Verificar se um produto tem desconto ativo
- Trabalhar com valores monetários

### Use `stockUtils.js` quando:
- Verificar disponibilidade de produtos
- Formatar estoque para exibição
- Trabalhar com categorias que usam tamanhos
- Validar estoque antes de adicionar ao carrinho

### Use `apiHelpers.js` quando:
- Fazer chamadas à API
- Tratar erros de requisições
- Construir URLs com parâmetros
- Implementar retry logic

---

## ⚠️ Importante

- **Sempre importe** estas funções ao invés de duplicar a lógica
- **Não modifique** estas funções sem atualizar todos os usos
- **Adicione testes** ao criar novas funções utilitárias
- **Documente** novas funções seguindo o padrão JSDoc

---

## 🔄 Manutenção

Ao adicionar novas funções utilitárias:

1. Escolha o arquivo correto (preço, estoque ou API)
2. Adicione documentação JSDoc
3. Atualize este README
4. Teste em pelo menos 2 componentes diferentes
5. Verifique se não há duplicação de lógica existente

---

## 📚 Referências

- Documentação completa: `Kiro/docs/OTIMIZACOES_APLICADAS.md`
- Resumo: `Kiro/docs/RESUMO_OTIMIZACOES.md`
