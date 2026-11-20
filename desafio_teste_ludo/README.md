# Ludo para 2 jogadores

Implementação da lógica de uma partida de Ludo para **dois jogadores**, com casos de teste automatizados em JavaScript utilizando o executor nativo do Node.js (`node:test`).

Este projeto segue a especificação do desafio Ludo: testar uma partida para 02 jogadores por meio de casos de teste em JavaScript.

## Como rodar

Requisito: Node.js 18 ou mais novo. Não é necessário instalar dependências.

```bash
npm test
```

O comando executa os 40 casos de teste automatizados.

## Arquivos

| Arquivo | Conteúdo |
|---|---|
| `ludo.js` | Regras da partida: criação, dado, movimentação, captura, chegada e vitória |
| `ludo.test.js` | Casos de teste automatizados (CT01 a CT40) |
| `package.json` | Configuração do projeto e comando `npm test` |

---

## Especificação e regras implementadas

### Jogadores e peças

- A partida possui exatamente **2 jogadores**.
- Cada jogador possui **4 peças**.
- Todas as peças começam na base.
- O jogador de índice `0` começa a partida.

### Percurso

- O percurso compartilhado possui **52 casas**.
- Os jogadores começam em posições opostas: casa `0` e casa `26`.
- Depois de completar o percurso comum, cada peça entra na sua chegada, que possui **6 casas**.
- Uma peça só é considerada finalizada ao alcançar exatamente o progresso `58`.
- Uma peça na base é representada pelo progresso `-1`.

### Dado e movimentação

- O dado possui resultados inteiros de `1` a `6`.
- Uma peça só pode sair da base quando o jogador tira `6`.
- Ao sair da base, a peça é posicionada na casa inicial do jogador.
- Peças que já estão no percurso avançam a quantidade indicada pelo dado.
- O jogador deve obter o valor exato para chegar ao final. Não é permitido ultrapassar a chegada.
- Uma peça que já chegou não pode ser movimentada novamente.
- Após movimentar uma peça com resultado `6`, o mesmo jogador recebe outra jogada.
- Quando nenhuma peça puder ser movimentada, a vez passa para o adversário.
- Não é permitido lançar o dado novamente enquanto houver uma peça aguardando movimentação.

### Capturas e casas seguras

- As casas seguras são as posições `0`, `8`, `13`, `21`, `26`, `34`, `39` e `47`.
- Ao terminar o movimento em uma casa não segura ocupada por peça adversária, a peça adversária é enviada de volta à base.
- Peças em casas seguras não são capturadas.
- Peças que já entraram na chegada não podem ser capturadas.
- Nesta implementação, peças não formam bloqueios: cada peça é movimentada individualmente. Se mais de uma peça adversária estiver na mesma casa não segura alcançada, todas são enviadas à base.

### Fim da partida

- Vence o jogador que levar suas **4 peças** até a chegada.
- A partida passa para o status `encerrada` e registra o índice do vencedor.
- Depois do encerramento, não são aceitos novos lançamentos de dado nem movimentações.

### Observação sobre a variante

O enunciado do desafio informa que a partida deve ter dois jogadores, mas não determina todas as variações das regras do Ludo. Para que os testes tenham resultados objetivos e reproduzíveis, este projeto registra acima a variante adotada, incluindo percurso, casas seguras, captura, jogada extra com seis e chegada exata.

---

## Casos de teste

Os testes utilizam `node:test` e `node:assert/strict`. O resultado do dado pode ser informado diretamente nas funções para permitir cenários controlados e repetíveis; quando não informado, o valor é sorteado.

### Criação da partida para dois jogadores

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT01 | Criar partida | Dois jogadores cadastrados |
| CT02 | Quantidade de peças | Cada jogador possui quatro peças |
| CT03 | Nomes personalizados | Os nomes informados são armazenados |
| CT04 | Quantidade inválida de jogadores | Criação rejeitada |
| CT05 | Nomes vazios ou inválidos | Criação rejeitada |
| CT06 | Estado inicial das peças | Todas as peças começam na base |
| CT07 | Jogador inicial e status | O jogador de índice 0 começa e a partida fica ativa |

### Tabuleiro e casas seguras

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT08 | Tamanho do percurso | O percurso possui 52 casas |
| CT09 | Posições iniciais | Os jogadores começam em posições opostas |
| CT10 | Posição do primeiro jogador | A posição é calculada corretamente |
| CT11 | Posição do segundo jogador | A posição é calculada corretamente |
| CT12 | Volta pelo percurso | A posição permanece dentro dos limites do percurso |
| CT13 | Peça na chegada | Peças na chegada não ocupam o percurso comum |
| CT14 | Casas seguras | As casas seguras são identificadas corretamente |
| CT15 | Jogador ou progresso inválido | O cálculo rejeita os parâmetros inválidos |

### Lançamento do dado e entrada das peças

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT16 | Resultados válidos do dado | Valores de 1 a 6 são aceitos |
| CT17 | Resultados inválidos do dado | Valores fora do intervalo ou não inteiros são rejeitados |
| CT18 | Tirar 6 com peça na base | Uma peça pode sair da base |
| CT19 | Tirar valor diferente de 6 com peças na base | Nenhuma peça sai da base e a vez passa |
| CT20 | Nenhuma peça pode ser movimentada | A vez passa para o adversário |
| CT21 | Lançar novamente antes de mover | O segundo lançamento é rejeitado |

### Movimentação das peças

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT22 | Avançar pelo valor do dado | A peça avança a quantidade correta de casas |
| CT23 | Movimento sem tirar 6 | A vez passa para o outro jogador |
| CT24 | Movimento após tirar 6 | O mesmo jogador recebe outra jogada |
| CT25 | Jogar fora da vez | A movimentação é rejeitada |
| CT26 | Mover antes de lançar o dado | A movimentação é rejeitada |
| CT27 | Selecionar peça inexistente | A movimentação é rejeitada |
| CT28 | Selecionar peça indisponível | A movimentação é rejeitada |
| CT29 | Ultrapassar a chegada | O movimento não é permitido |
| CT30 | Valor exato para chegar | A peça só pode finalizar com o valor exato |
| CT31 | Alcançar exatamente a chegada | A peça é marcada como finalizada |
| CT32 | Mover peça já finalizada | A peça finalizada não aparece entre os movimentos possíveis |

### Capturas e proteção das casas seguras

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT33 | Capturar em casa desprotegida | A peça adversária volta à base |
| CT34 | Registrar captura | A captura aparece no histórico da partida |
| CT35 | Pousar em casa segura | A peça adversária não é capturada |
| CT36 | Encontrar peça na chegada | A peça que já entrou na chegada não é capturada |

### Vitória e encerramento

| Nº | Caso | Resultado esperado |
|---|---|---|
| CT37 | Verificar quatro peças na chegada | A vitória é identificada corretamente |
| CT38 | Finalizar a última peça | A partida é encerrada e o vencedor é registrado |
| CT39 | Lançar dado após o encerramento | A operação é rejeitada |
| CT40 | Mover peça após o encerramento | A operação é rejeitada |


