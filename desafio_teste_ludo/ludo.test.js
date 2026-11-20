'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {
    QUANTIDADE_JOGADORES,
    PECAS_POR_JOGADOR,
    CASAS_PISTA,
    PROGRESSO_FINAL,
    CASAS_SEGURAS,
    POSICOES_INICIAIS,
    criarPartida,
    obterPosicaoNaPista,
    ehCasaSegura,
    obterMovimentosPossiveis,
    lancarDado,
    moverPeca,
    verificarVitoria
} = require('./ludo');

function prepararPeca(partida, jogador, idPeca, progresso) {
    partida.jogadores[jogador].pecas[idPeca].progresso = progresso;
    partida.jogadorDaVez = jogador;
    partida.dado = null;
    partida.movimentosPossiveis = [];
}

test.describe('Criação da partida para dois jogadores', () => {
    test('CT01 - Deve criar uma partida com dois jogadores', () => {
        const partida = criarPartida();
        assert.equal(partida.jogadores.length, QUANTIDADE_JOGADORES);
    });

    test('CT02 - Cada jogador deve possuir quatro peças', () => {
        const partida = criarPartida();
        assert.ok(partida.jogadores.every(jogador => jogador.pecas.length === PECAS_POR_JOGADOR));
    });

    test('CT03 - Deve aceitar nomes personalizados para os jogadores', () => {
        const partida = criarPartida(['Ana', 'Bruno']);
        assert.deepEqual(partida.jogadores.map(jogador => jogador.nome), ['Ana', 'Bruno']);
    });

    test('CT04 - Deve rejeitar quantidade diferente de dois jogadores', () => {
        assert.throws(() => criarPartida(['Ana']), TypeError);
        assert.throws(() => criarPartida(['Ana', 'Bruno', 'Caio']), TypeError);
    });

    test('CT05 - Deve rejeitar nomes vazios ou inválidos', () => {
        assert.throws(() => criarPartida(['', 'Bruno']), TypeError);
        assert.throws(() => criarPartida(['Ana', null]), TypeError);
    });

    test('CT06 - Todas as peças devem iniciar na base', () => {
        const partida = criarPartida();
        for (const jogador of partida.jogadores) {
            assert.ok(jogador.pecas.every(peca => peca.progresso === -1));
        }
    });

    test('CT07 - O jogador 1 deve começar e a partida deve estar ativa', () => {
        const partida = criarPartida();
        assert.equal(partida.jogadorDaVez, 0);
        assert.equal(partida.status, 'jogando');
        assert.equal(partida.vencedor, null);
    });
});

test.describe('Tabuleiro e casas seguras', () => {
    test('CT08 - O percurso deve possuir 52 casas', () => {
        assert.equal(CASAS_PISTA, 52);
    });

    test('CT09 - Os jogadores devem iniciar em posições opostas', () => {
        assert.deepEqual(POSICOES_INICIAIS, [0, 26]);
    });

    test('CT10 - Deve calcular a posição da peça do primeiro jogador', () => {
        assert.equal(obterPosicaoNaPista(0, 0), 0);
        assert.equal(obterPosicaoNaPista(0, 5), 5);
    });

    test('CT11 - Deve calcular a posição da peça do segundo jogador', () => {
        assert.equal(obterPosicaoNaPista(1, 0), 26);
        assert.equal(obterPosicaoNaPista(1, 5), 31);
    });

    test('CT12 - Deve dar a volta completa no percurso sem sair dos limites', () => {
        assert.equal(obterPosicaoNaPista(0, 51), 51);
        assert.equal(obterPosicaoNaPista(1, 51), 25);
    });

    test('CT13 - Peças na chegada não devem ocupar casas do percurso comum', () => {
        assert.equal(obterPosicaoNaPista(0, 52), null);
        assert.equal(obterPosicaoNaPista(1, PROGRESSO_FINAL), null);
    });

    test('CT14 - Deve identificar casas seguras', () => {
        for (const casa of CASAS_SEGURAS) assert.equal(ehCasaSegura(casa), true);
        assert.equal(ehCasaSegura(5), false);
    });

    test('CT15 - Deve rejeitar jogador ou progresso inválido ao calcular posição', () => {
        assert.throws(() => obterPosicaoNaPista(2, 0), RangeError);
        assert.throws(() => obterPosicaoNaPista(-1, 0), RangeError);
        assert.throws(() => obterPosicaoNaPista(0, -1), RangeError);
        assert.throws(() => obterPosicaoNaPista(0, 59), RangeError);
    });
});

test.describe('Lançamento do dado e entrada das peças', () => {
    test('CT16 - Deve aceitar resultados de dado entre 1 e 6', () => {
        for (let valor = 1; valor <= 6; valor++) {
            const partida = criarPartida();
            assert.equal(lancarDado(partida, valor).length, valor === 6 ? 4 : 0);
        }
    });

    test('CT17 - Deve rejeitar valores inválidos no dado', () => {
        for (const valor of [0, 7, -1, 2.5, '6', null]) {
            const partida = criarPartida();
            assert.throws(() => lancarDado(partida, valor), RangeError);
        }
    });

    test('CT18 - Deve permitir retirar uma peça da base ao tirar 6', () => {
        const partida = criarPartida();
        const movimentos = lancarDado(partida, 6);
        assert.deepEqual(movimentos, [0, 1, 2, 3]);
        moverPeca(partida, 0, 0);
        assert.equal(partida.jogadores[0].pecas[0].progresso, 0);
    });

    test('CT19 - Não deve permitir retirar uma peça da base com resultado diferente de 6', () => {
        const partida = criarPartida();
        const movimentos = lancarDado(partida, 5);
        assert.deepEqual(movimentos, []);
        assert.equal(partida.jogadorDaVez, 1);
        assert.equal(partida.jogadores[0].pecas[0].progresso, -1);
    });

    test('CT20 - Deve passar a vez quando nenhuma peça puder ser movimentada', () => {
        const partida = criarPartida();
        for (const peca of partida.jogadores[0].pecas) peca.progresso = PROGRESSO_FINAL;
        assert.deepEqual(lancarDado(partida, 3), []);
        assert.equal(partida.jogadorDaVez, 1);
        assert.equal(partida.dado, null);
    });

    test('CT21 - Não deve permitir lançar o dado novamente antes de mover uma peça', () => {
        const partida = criarPartida();
        lancarDado(partida, 6);
        assert.throws(() => lancarDado(partida, 2), /Escolha uma peça/);
    });
});

test.describe('Movimentação das peças', () => {
    test('CT22 - Deve avançar a peça pela quantidade indicada no dado', () => {
        const partida = criarPartida();
        partida.jogadores[0].pecas[0].progresso = 4;
        lancarDado(partida, 3);
        moverPeca(partida, 0, 0);
        assert.equal(partida.jogadores[0].pecas[0].progresso, 7);
    });

    test('CT23 - Deve alternar o jogador após uma jogada sem seis', () => {
        const partida = criarPartida();
        partida.jogadores[0].pecas[0].progresso = 4;
        lancarDado(partida, 2);
        moverPeca(partida, 0, 0);
        assert.equal(partida.jogadorDaVez, 1);
    });

    test('CT24 - Deve conceder nova jogada ao jogador que tirar seis', () => {
        const partida = criarPartida();
        lancarDado(partida, 6);
        moverPeca(partida, 0, 0);
        assert.equal(partida.jogadorDaVez, 0);
        assert.equal(partida.dado, null);
    });

    test('CT25 - Deve rejeitar movimento fora da vez', () => {
        const partida = criarPartida();
        lancarDado(partida, 6);
        assert.throws(() => moverPeca(partida, 1, 0), /Não é a vez/);
    });

    test('CT26 - Deve rejeitar movimento antes de lançar o dado', () => {
        const partida = criarPartida();
        assert.throws(() => moverPeca(partida, 0, 0), /lançar o dado/);
    });

    test('CT27 - Deve rejeitar peça inexistente', () => {
        const partida = criarPartida();
        lancarDado(partida, 6);
        assert.throws(() => moverPeca(partida, 0, 4), RangeError);
    });

    test('CT28 - Deve rejeitar movimento de peça não disponível', () => {
        const partida = criarPartida();
        partida.jogadores[0].pecas[0].progresso = PROGRESSO_FINAL;
        lancarDado(partida, 6);
        assert.throws(() => moverPeca(partida, 0, 0), /não pode ser movimentada/);
    });

    test('CT29 - Deve impedir que uma peça ultrapasse a chegada', () => {
        const partida = criarPartida();
        prepararPeca(partida, 0, 0, 56);
        assert.deepEqual(obterMovimentosPossiveis(partida, 0, 3), []);
        lancarDado(partida, 3);
        assert.equal(partida.jogadorDaVez, 1);
        assert.equal(partida.jogadores[0].pecas[0].progresso, 56);
    });

    test('CT30 - Deve exigir o valor exato para finalizar uma peça', () => {
        const partida = criarPartida();
        prepararPeca(partida, 0, 0, 57);
        assert.deepEqual(obterMovimentosPossiveis(partida, 0, 1), [0]);
        assert.deepEqual(obterMovimentosPossiveis(partida, 0, 2), []);
    });

    test('CT31 - Deve finalizar a peça ao alcançar exatamente a chegada', () => {
        const partida = criarPartida();
        prepararPeca(partida, 0, 0, 57);
        lancarDado(partida, 1);
        moverPeca(partida, 0, 0);
        assert.equal(partida.jogadores[0].pecas[0].progresso, PROGRESSO_FINAL);
    });

    test('CT32 - Peça que já chegou não pode ser movimentada novamente', () => {
        const partida = criarPartida();
        prepararPeca(partida, 0, 0, PROGRESSO_FINAL);
        assert.deepEqual(obterMovimentosPossiveis(partida, 0, 6), [1, 2, 3]);
    });
});

test.describe('Capturas e proteção das casas seguras', () => {
    test('CT33 - Deve capturar uma peça adversária em casa desprotegida', () => {
        const partida = criarPartida();
        partida.jogadores[0].pecas[0].progresso = 9;
        partida.jogadores[1].pecas[0].progresso = 36;
        lancarDado(partida, 1);
        moverPeca(partida, 0, 0);
        assert.equal(partida.jogadores[1].pecas[0].progresso, -1);
    });

    test('CT34 - Deve registrar a peça capturada no histórico', () => {
        const partida = criarPartida();
        partida.jogadores[0].pecas[0].progresso = 9;
        partida.jogadores[1].pecas[2].progresso = 36;
        lancarDado(partida, 1);
        moverPeca(partida, 0, 0);
        assert.deepEqual(partida.historico.at(-1).capturadas, [2]);
    });

    test('CT35 - Não deve capturar peça adversária em casa segura', () => {
        const partida = criarPartida();
        partida.jogadores[0].pecas[0].progresso = 7;
        partida.jogadores[1].pecas[0].progresso = 34;
        lancarDado(partida, 1);
        moverPeca(partida, 0, 0);
        assert.equal(partida.jogadores[1].pecas[0].progresso, 34);
    });

    test('CT36 - Não deve capturar peça adversária que já entrou na chegada', () => {
        const partida = criarPartida();
        partida.jogadores[0].pecas[0].progresso = 9;
        partida.jogadores[1].pecas[0].progresso = 52;
        lancarDado(partida, 1);
        moverPeca(partida, 0, 0);
        assert.equal(partida.jogadores[1].pecas[0].progresso, 52);
    });
});

test.describe('Vitória e encerramento', () => {
    test('CT37 - Deve identificar quando todas as peças chegaram', () => {
        const partida = criarPartida();
        for (const peca of partida.jogadores[0].pecas) peca.progresso = PROGRESSO_FINAL;
        assert.equal(verificarVitoria(partida, 0), true);
        assert.equal(verificarVitoria(partida, 1), false);
    });

    test('CT38 - Deve encerrar a partida quando a última peça chega', () => {
        const partida = criarPartida();
        for (let i = 0; i < 3; i++) partida.jogadores[0].pecas[i].progresso = PROGRESSO_FINAL;
        prepararPeca(partida, 0, 3, 57);
        lancarDado(partida, 1);
        moverPeca(partida, 0, 3);
        assert.equal(partida.status, 'encerrada');
        assert.equal(partida.vencedor, 0);
    });

    test('CT39 - Não deve permitir lançar o dado após o fim da partida', () => {
        const partida = criarPartida();
        for (const peca of partida.jogadores[0].pecas) peca.progresso = PROGRESSO_FINAL;
        partida.status = 'encerrada';
        partida.vencedor = 0;
        assert.throws(() => lancarDado(partida, 6), /não está em andamento/);
    });

    test('CT40 - Deve rejeitar movimento após o fim da partida', () => {
        const partida = criarPartida();
        partida.status = 'encerrada';
        partida.vencedor = 0;
        assert.throws(() => moverPeca(partida, 0, 0), /não está em andamento/);
    });
});
