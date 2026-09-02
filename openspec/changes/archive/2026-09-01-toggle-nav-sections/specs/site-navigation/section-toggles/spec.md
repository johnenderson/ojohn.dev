## Purpose

Define a única fonte de verdade que diz quais seções do site (menu de navegação) estão ativas ou desativadas, e garante que a navegação, o acesso à rota e a listagem no sitemap fiquem sempre consistentes entre si para uma mesma seção.

## ADDED Requirements

### Requirement: Configuração central de seções alternáveis
O sistema SHALL manter uma única configuração, compartilhada por todos os pontos que precisam saber se uma seção está ativa, que associa cada seção alternável (identificada por uma chave estável, ex.: `contact`, `uses`) a um estado `enabled: boolean`. Qualquer ponto do sistema que decida sobre a visibilidade do menu, o acesso à rota ou a listagem no sitemap de uma seção SHALL derivar essa decisão dessa mesma configuração — nenhum desses pontos SHALL manter seu próprio estado independente para a mesma seção.

#### Scenario: Alterar o estado de uma seção reflete em todos os pontos consistentemente
- **WHEN** o estado de uma seção alternável é alterado na configuração central (de ativado para desativado, ou vice-versa)
- **THEN** o menu de navegação, o acesso à rota da seção e a listagem dessa seção no sitemap refletem todos o novo estado, sem exigir edição em mais de um lugar

### Requirement: Seção desativada aparece no menu como "em breve"
Quando uma seção está desativada, o sistema SHALL continuar exibindo seu item no menu de navegação (desktop e mobile), porém como um elemento não-interativo (sem link navegável) que comunica visualmente que a seção está "em breve".

#### Scenario: Item de menu desativado no desktop
- **WHEN** uma seção está desativada e o usuário visualiza o menu de navegação no layout desktop
- **THEN** o item da seção aparece no menu, mas não é um link clicável e indica "em breve"

#### Scenario: Item de menu desativado no mobile
- **WHEN** uma seção está desativada e o usuário abre o menu de navegação no layout mobile
- **THEN** o item da seção aparece no menu, mas não é um link navegável e indica "em breve"

#### Scenario: Item de menu ativado é um link normal
- **WHEN** uma seção está ativada
- **THEN** seu item no menu de navegação é um link navegável normal, sem indicação de "em breve"

### Requirement: Seção desativada bloqueia acesso direto à rota
Quando uma seção com página própria está desativada, o sistema SHALL bloquear o acesso a essa página mesmo quando acessada diretamente pela URL (não apenas escondê-la do menu), respondendo como página não encontrada.

#### Scenario: Acesso direto a uma rota desativada
- **WHEN** um usuário acessa diretamente a URL de uma seção que está desativada
- **THEN** o sistema responde como página não encontrada, em vez de renderizar o conteúdo da seção

#### Scenario: Acesso direto a uma rota ativada
- **WHEN** um usuário acessa diretamente a URL de uma seção que está ativada
- **THEN** o sistema renderiza normalmente o conteúdo da seção

### Requirement: Sitemap omite seções desativadas
O sistema SHALL excluir do sitemap gerado a URL de qualquer seção que esteja desativada.

#### Scenario: Seção desativada não aparece no sitemap
- **WHEN** o sitemap do site é gerado e uma seção está desativada
- **THEN** a URL dessa seção não está presente na lista de URLs do sitemap

#### Scenario: Seção ativada aparece no sitemap
- **WHEN** o sitemap do site é gerado e uma seção está ativada
- **THEN** a URL dessa seção está presente na lista de URLs do sitemap
