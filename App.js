import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';

// Array que contém os IDs dos quadrados, representando as posições dos quadrados
const QUADRADOS = [0, 1, 2, 3, 4, 5, 6, 7, 8];

const Jogo = () => {
  // Estados do jogo
  var [sequencia, setSequencia] = useState([]); // Sequência aleatória gerada para o jogador
  var [sequenciaJogador, setSequenciaJogador] = useState([]); // Sequência de cliques do jogador
  const [nivel, setNivel] = useState('fácil'); // Nível do jogo (fácil, médio, difícil)
  const [jogando, setJogando] = useState(false); // Indica se o jogador pode interagir com o jogo
  const [exibindoSequencia, setExibindoSequencia] = useState(false); // Indica se a sequência está sendo exibida
  const [tempoPiscar, setTempoPiscar] = useState(1000); // Velocidade do piscar (em milissegundos)
  const [animacoes, setAnimacoes] = useState({}); // Armazena as animações dos quadrados
  const [rodada, setRodada] = useState(0); // Controla a rodada atual

  // Atualiza o tempo de piscar baseado no nível do jogo
  useEffect(() => {
    if (nivel === 'fácil') setTempoPiscar(1000);
    if (nivel === 'médio') setTempoPiscar(700);
    if (nivel === 'difícil') setTempoPiscar(500);
  }, [nivel]);

  // Função que inicia o jogo, reseta os estados e começa uma nova rodada
  const iniciarJogo = () => {
    setSequencia([]); // Reseta a sequência gerada
    setSequenciaJogador([]); // Reseta a sequência do jogador
    setAnimacoes({}); // Reseta as animações
    setJogando(false); // Desabilita a interação do jogador
    setRodada(0); // Reseta o contador de rodadas
    gerarSequencia(); // Gera uma nova sequência aleatória
  };

  // Função que gera uma nova sequência de quadrados
  const gerarSequencia = () => {
    setJogando(false); // Desabilita cliques enquanto a sequência está sendo exibida
    setExibindoSequencia(true); // Indica que a sequência está sendo exibida
    setSequenciaJogador([]); // Reseta a sequência de cliques do jogador
    const novoQuadrado = Math.floor(Math.random() * QUADRADOS.length); // Gera um quadrado aleatório
    const novaSequencia = [...sequencia, novoQuadrado]; // Adiciona o novo quadrado à sequência
    setSequencia(novaSequencia); // Atualiza a sequência no estado
    setRodada((prevRodada) => prevRodada + 1); // Incrementa o contador de rodadas
    exibirSequencia(novaSequencia); // Inicia a exibição da sequência
  };

  // Função que exibe a sequência de quadrados piscando
  const exibirSequencia = (sequencia) => {
    let i = 0;
    const intervalo = setInterval(() => {
      if (i < sequencia.length) {
        piscarQuadrado(sequencia[i]); // Faz o quadrado piscar
        i++; // Avança para o próximo quadrado na sequência
      } else {
        clearInterval(intervalo); // Para o intervalo quando a sequência for exibida
        setJogando(true); // Permite ao jogador clicar após a exibição
        setExibindoSequencia(false); // A sequência terminou de ser exibida
      }
    }, tempoPiscar); // A cada intervalo (tempoPiscar), o próximo quadrado é piscado
  };

  // Função que anima o "piscar" de um quadrado específico
  const piscarQuadrado = (id) => {
    const novaAnimacao = new Animated.Value(1); // Cria uma nova animação com valor inicial 1 (opacidade total)
    setAnimacoes((prev) => ({ ...prev, [id]: novaAnimacao })); // Atualiza o estado com a animação do quadrado

    // Cria a sequência de animações (fade in e fade out)
    Animated.sequence([
      Animated.timing(novaAnimacao, {
        toValue: 0, // Diminui a opacidade para 0 (desaparece)
        duration: tempoPiscar / 2, // Meio do tempoPiscar
        useNativeDriver: true,
      }),
      Animated.timing(novaAnimacao, {
        toValue: 1, // Aumenta a opacidade de volta para 1 (aparece)
        duration: tempoPiscar / 2, // Meio do tempoPiscar
        useNativeDriver: true,
      }),
    ]).start(); // Inicia a animação
  };

  // Função que verifica a sequência de cliques do jogador
  const verificarSequencia = (id) => {
    console.log(sequencia); // Exibe a sequência gerada para depuração
    if (!jogando || exibindoSequencia) return; // Impede cliques durante a exibição da sequência

    const novoSequenciaJogador = [...sequenciaJogador, id]; // Adiciona o quadrado clicado à sequência do jogador
    setSequenciaJogador(novoSequenciaJogador); // Atualiza a sequência do jogador no estado

    const indiceAtual = novoSequenciaJogador.length - 1; // Índice do quadrado clicado

    // Verifica se o quadrado clicado é o esperado
    if (novoSequenciaJogador[indiceAtual] !== sequencia[indiceAtual]) {
      // Se o jogador errou, o jogo reinicia
      setJogando(false); // Desabilita a interação com o jogador

      setSequencia([]); // Reseta a sequência
      setSequenciaJogador([]); // Reseta a sequência do jogador
      setAnimacoes({}); // Reseta as animações
      setJogando(false); // Desabilita a interação novamente
      setRodada(0); // Reseta o contador de rodadas

      console.log('Fim de Jogo!', `Você errou na rodada ${rodada}. Sua pontuação foi ${rodada - 1}`);
      return; // Fim de jogo
    }

    // Verifica se o jogador completou a sequência corretamente
    if (novoSequenciaJogador.length === sequencia.length) {
      setJogando(false); // Desabilita cliques antes de gerar a próxima sequência
      setTimeout(gerarSequencia, 700); // Gera uma nova sequência após um pequeno intervalo
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Jogo Gênios</Text>
      <Text style={styles.rodada}>Rodada: {rodada}</Text>
      <View style={styles.grid}>{renderizarQuadrados()}</View>
      <TouchableOpacity style={styles.botao} onPress={iniciarJogo}>
        <Text style={styles.textoBotao}>Iniciar Jogo</Text>
      </TouchableOpacity>
      <View style={styles.niveis}>
        <TouchableOpacity onPress={() => setNivel('fácil')}>
          <Text style={[styles.nivelTexto, nivel === 'fácil' && styles.nivelSelecionado]}>Fácil</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setNivel('médio')}>
          <Text style={[styles.nivelTexto, nivel === 'médio' && styles.nivelSelecionado]}>Médio</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setNivel('difícil')}>
          <Text style={[styles.nivelTexto, nivel === 'difícil' && styles.nivelSelecionado]}>Difícil</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  rodada: {
    fontSize: 20,
    marginBottom: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 300,
    marginBottom: 20,
  },
  quadrado: {
    width: 90,
    height: 90,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  quadradoInterno: {
    width: '100%',
    height: '100%',
    backgroundColor: 'orange',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  textoQuadrado: {
    color: 'white',
    fontSize: 18,
  },
  botao: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 8,
    marginBottom: 20,
  },
  textoBotao: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  niveis: {
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    width: '80%',
  },
  nivelTexto: {
    fontSize: 16,
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  nivelSelecionado: {
    backgroundColor: '#007AFF',
    color: 'white',
    borderColor: '#007AFF',
  },
});

export default Jogo;
