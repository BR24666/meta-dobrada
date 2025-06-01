# Meta Dobrada

Sistema de gerenciamento de metas financeiras desenvolvido com Next.js e Supabase.

## Estado Atual do Projeto

O projeto está em fase de implantação inicial, com as seguintes etapas concluídas:

1. ✅ Desenvolvimento do frontend com Next.js e Material UI
2. ✅ Integração com Supabase para autenticação e banco de dados
3. ✅ Implementação das funcionalidades principais:
   - Login e Registro de usuários
   - Dashboard com visão geral das metas
   - CRUD completo de metas financeiras
   - Layout responsivo com Material UI
4. ✅ Configuração do repositório no GitHub
5. 🔄 Deploy na Vercel (em andamento)

## Tecnologias

- Next.js 14.1.0
- Material UI
- Supabase
- TypeScript

## Estrutura do Projeto

```
src/
├── app/                    # Páginas e rotas da aplicação
│   ├── (protected)/       # Rotas protegidas (requer autenticação)
│   │   ├── dashboard/     # Dashboard principal
│   │   └── goals/        # Gerenciamento de metas
│   ├── login/            # Página de login
│   └── register/         # Página de registro
├── components/           # Componentes reutilizáveis
├── hooks/               # Custom hooks
├── lib/                # Configurações e utilitários
└── theme/              # Configuração do tema Material UI
```

## Como Continuar o Desenvolvimento

1. Clone o repositório:
```bash
git clone https://github.com/BR24666/meta-dobrada.git
cd meta-dobrada
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
Crie um arquivo `.env.local` com:
```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

4. Execute o projeto localmente:
```bash
npm run dev
```

## Deploy

O projeto está sendo implantado na Vercel:
- URL do projeto: https://vercel.com/brdavila-s-projects/meta-dobrada
- Status: Em processo de build e deploy

### Próximos Passos

1. Resolver warnings de dependências depreciadas
2. Completar o processo de deploy na Vercel
3. Configurar variáveis de ambiente na Vercel
4. Testar todas as funcionalidades no ambiente de produção
5. Implementar melhorias baseadas no feedback dos usuários

## Problemas Conhecidos

1. Warnings de pacotes depreciados durante a instalação:
   - @supabase/auth-helpers-nextjs (substituir por @supabase/ssr)
   - eslint (atualizar para versão mais recente)
   - outros pacotes com warnings de depreciação

## Contato

Para mais informações ou contribuições, entre em contato através do GitHub. 