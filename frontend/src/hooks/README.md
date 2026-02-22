# Custom Hooks

Este diretório contém React hooks customizados para reutilização em toda a aplicação.

## 📁 Arquivos

### `useFormSubmit.js` - Hook de Submissão de Formulários

Hook para gerenciar estado e lógica de submissão de formulários.

**Funcionalidades**:
- Gerenciamento de estado de loading
- Tratamento de erros
- Callbacks de sucesso/erro
- Reset de estado
- Suporte a validação

**Parâmetros**:
- `submitFn` (Function) - Função assíncrona que realiza a submissão
- `options` (Object) - Opções de configuração
  - `onSuccess` (Function) - Callback executado em caso de sucesso
  - `onError` (Function) - Callback executado em caso de erro
  - `resetOnSuccess` (Boolean) - Se deve resetar estado após sucesso

**Retorna**:
- `loading` (Boolean) - Estado de carregamento
- `error` (String) - Mensagem de erro
- `success` (Boolean) - Estado de sucesso
- `handleSubmit` (Function) - Função para submeter o formulário
- `reset` (Function) - Função para resetar estado
- `setError` (Function) - Função para definir erro manualmente

---

## 💡 Exemplo de Uso

### Formulário de Login

```javascript
import { useFormSubmit } from '../hooks/useFormSubmit';
import { authSvc } from '../services/api';

function LoginForm({ onLoginSuccess }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const { loading, error, handleSubmit } = useFormSubmit(
        async (data) => {
            const response = await authSvc.login(data.email, data.password);
            return response.data;
        },
        {
            onSuccess: (result) => {
                localStorage.setItem('token', result.token);
                onLoginSuccess(result.user);
            },
            onError: (err) => {
                console.error('Login failed:', err);
            }
        }
    );

    const onSubmit = async (e) => {
        e.preventDefault();
        await handleSubmit({ email, password });
    };

    return (
        <form onSubmit={onSubmit}>
            <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
            />
            
            {error && <div className="error">{error}</div>}
            
            <button type="submit" disabled={loading}>
                {loading ? 'Entrando...' : 'Entrar'}
            </button>
        </form>
    );
}
```

### Formulário de Cadastro com Reset

```javascript
const { loading, error, success, handleSubmit, reset } = useFormSubmit(
    async (data) => await authSvc.register(data),
    {
        onSuccess: () => {
            alert('Cadastro realizado com sucesso!');
        },
        resetOnSuccess: true // Reseta após 3 segundos
    }
);
```

### Formulário com Validação Customizada

```javascript
const { loading, error, handleSubmit, setError } = useFormSubmit(
    async (data) => await productSvc.create(data)
);

const onSubmit = async (e) => {
    e.preventDefault();
    
    // Validação customizada
    if (!name.trim()) {
        setError('Nome é obrigatório');
        return;
    }
    
    if (price <= 0) {
        setError('Preço deve ser maior que zero');
        return;
    }
    
    await handleSubmit({ name, price });
};
```

---

## 🎯 Quando Usar

Use `useFormSubmit` quando:
- Criar formulários com submissão assíncrona
- Precisar gerenciar loading, erro e sucesso
- Quiser padronizar comportamento de formulários
- Evitar código repetitivo de gerenciamento de estado

**Não use** quando:
- Formulário não faz chamadas assíncronas
- Precisa de lógica muito específica e única
- Formulário é extremamente simples (1-2 campos)

---

## 🔄 Adicionando Novos Hooks

Ao criar novos hooks customizados:

1. **Nomeie** seguindo o padrão `use[Nome]`
2. **Documente** com JSDoc e exemplos
3. **Teste** em múltiplos componentes
4. **Atualize** este README
5. **Considere** se o hook é realmente reutilizável

### Template para Novo Hook

```javascript
/**
 * Hook para [descrição]
 * 
 * @param {Type} param - Descrição do parâmetro
 * @returns {Object} - Objeto com propriedades retornadas
 */
export const useNomeDoHook = (param) => {
    // Implementação
    
    return {
        // Valores retornados
    };
};
```

---

## ⚠️ Boas Práticas

1. **Hooks devem ser puros**: Não causem efeitos colaterais inesperados
2. **Mantenha simples**: Um hook deve fazer uma coisa bem feita
3. **Documente bem**: Outros desenvolvedores precisam entender rapidamente
4. **Teste isoladamente**: Hooks devem funcionar em diferentes contextos
5. **Siga as regras do React**: Não chame hooks condicionalmente

---

## 📚 Referências

- [React Hooks Documentation](https://react.dev/reference/react)
- [Building Your Own Hooks](https://react.dev/learn/reusing-logic-with-custom-hooks)
- Documentação do projeto: `Kiro/docs/OTIMIZACOES_APLICADAS.md`
