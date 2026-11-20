'use strict';

const QUANTIDADE_JOGADORES = 2;
const PECAS_POR_JOGADOR = 4;
const CASAS_PISTA = 52;
const CASAS_CHEGADA = 6;
const PROGRESSO_FINAL = CASAS_PISTA + CASAS_CHEGADA;

const CASAS_SEGURAS = [0, 8, 13, 21, 26, 34, 39, 47];
const POSICOES_INICIAIS = [0, 26];

function validarJogador(jogador) {
    if (!Number.isInteger(jogador) || jogador < 0 || jogador >= QUANTIDADE_JOGADORES) {
        throw new RangeError('Jogador inválido');
    }
}

function validarPeca(peca) {
    if (!Number.isInteger(peca) || peca < 0 || peca >= PECAS_POR_JOGADOR) {
        throw new RangeError('Peça inválida');
    }
}

function validarDado(dado) {
    if (!Number.isInteger(dado) || dado < 1 || dado > 6) {
        throw new RangeError('O dado deve apresentar um valor inteiro entre 1 e 6');
    }
}

function validarPartidaEmAndamento(partida) {
    if (!partida || partida.status !== 'jogando') {
        throw new Error('A partida não está em andamento');
    }
}

function criarPartida(nomes = ['Jogador 1', 'Jogador 2']) {
    if (!Array.isArray(nomes) || nomes.length !== QUANTIDADE_JOGADORES ||
        nomes.some(nome => typeof nome !== 'string' || nome.trim() === '')) {
        throw new TypeError('Informe exatamente dois nomes de jogadores válidos');
    }

    return {
        jogadores: nomes.map((nome, id) => ({
            id,
            nome: nome.trim(),
            pecas: Array.from({ length: PECAS_POR_JOGADOR }, (_, peca) => ({
                id: peca,
                progresso: -1
            }))
        })),
        jogadorDaVez: 0,
        dado: null,
        ultimoDado: null,
        movimentosPossiveis: [],
        status: 'jogando',
        vencedor: null,
        historico: []
    };
}

function obterPosicaoNaPista(jogador, progresso) {
    validarJogador(jogador);

    if (!Number.isInteger(progresso) || progresso < 0 || progresso > PROGRESSO_FINAL) {
        throw new RangeError('Progresso da peça inválido');
    }

    if (progresso >= CASAS_PISTA) return null;
    return (POSICOES_INICIAIS[jogador] + progresso) % CASAS_PISTA;
}

function ehCasaSegura(posicao) {
    return CASAS_SEGURAS.includes(posicao);
}

function obterMovimentosPossiveis(partida, jogador, dado) {
    validarPartidaEmAndamento(partida);
    validarJogador(jogador);
    validarDado(dado);

    return partida.jogadores[jogador].pecas
        .filter(peca => {
            if (peca.progresso === PROGRESSO_FINAL) return false;
            if (peca.progresso === -1) return dado === 6;
            return peca.progresso + dado <= PROGRESSO_FINAL;
        })
        .map(peca => peca.id);
}

function lancarDado(partida, valor = Math.floor(Math.random() * 6) + 1) {
    validarPartidaEmAndamento(partida);

    if (partida.dado !== null) {
        throw new Error('Escolha uma peça antes de lançar o dado novamente');
    }

    validarDado(valor);

    const jogador = partida.jogadorDaVez;
    const movimentos = obterMovimentosPossiveis(partida, jogador, valor);
    partida.ultimoDado = valor;

    if (movimentos.length === 0) {
        partida.movimentosPossiveis = [];
        partida.jogadorDaVez = (jogador + 1) % QUANTIDADE_JOGADORES;
        return [];
    }

    partida.dado = valor;
    partida.movimentosPossiveis = movimentos;
    return [...movimentos];
}

function moverPeca(partida, jogador, idPeca) {
    validarPartidaEmAndamento(partida);
    validarJogador(jogador);
    validarPeca(idPeca);

    if (jogador !== partida.jogadorDaVez) {
        throw new Error('Não é a vez deste jogador');
    }

    if (partida.dado === null) {
        throw new Error('É necessário lançar o dado antes de mover uma peça');
    }

    if (!partida.movimentosPossiveis.includes(idPeca)) {
        throw new Error('A peça não pode ser movimentada com este resultado do dado');
    }

    const valorDado = partida.dado;
    const peca = partida.jogadores[jogador].pecas[idPeca];
    const progressoAnterior = peca.progresso;

    peca.progresso = progressoAnterior === -1 ? 0 : progressoAnterior + valorDado;

    const capturadas = [];
    const posicao = obterPosicaoNaPista(jogador, peca.progresso);

    if (posicao !== null && !ehCasaSegura(posicao)) {
        const adversario = partida.jogadores[(jogador + 1) % QUANTIDADE_JOGADORES];

        for (const pecaAdversaria of adversario.pecas) {
            if (pecaAdversaria.progresso >= 0 && pecaAdversaria.progresso < CASAS_PISTA &&
                obterPosicaoNaPista(adversario.id, pecaAdversaria.progresso) === posicao) {
                pecaAdversaria.progresso = -1;
                capturadas.push(pecaAdversaria.id);
            }
        }
    }

    partida.historico.push({
        jogador,
        peca: idPeca,
        dado: valorDado,
        progressoAnterior,
        progressoNovo: peca.progresso,
        capturadas
    });

    partida.dado = null;
    partida.movimentosPossiveis = [];

    if (verificarVitoria(partida, jogador)) {
        partida.status = 'encerrada';
        partida.vencedor = jogador;
        return partida;
    }

    if (valorDado !== 6) {
        partida.jogadorDaVez = (jogador + 1) % QUANTIDADE_JOGADORES;
    }

    return partida;
}

function verificarVitoria(partida, jogador) {
    validarJogador(jogador);
    if (!partida || !Array.isArray(partida.jogadores) || !partida.jogadores[jogador]) {
        throw new TypeError('Partida inválida');
    }

    return partida.jogadores[jogador].pecas.every(peca => peca.progresso === PROGRESSO_FINAL);
}

module.exports = {
    QUANTIDADE_JOGADORES,
    PECAS_POR_JOGADOR,
    CASAS_PISTA,
    CASAS_CHEGADA,
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
};
