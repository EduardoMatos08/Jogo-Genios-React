import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
} from 'react-native';

const QUADRADOS = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // IDs dos quadrados (0-8)

const Jogo = () => {
  var [sequencia, setSequencia] = useState([]);
  var [sequenciaJogador, setSequenciaJogador] = useState([]);
  const [nivel, setNivel] = useState('fácil'); // fácil, médio, difícil
  const [jogando, setJogando] = useState(false);
  const [exibindoSequencia, setExibindoSequencia] = useState(false);
  const [tempoPiscar, setTempoPiscar] = useState(1000); // Velocidade do piscar
  const [animacoes, setAnimacoes] = useState({});
  const [rodada, setRodada] = useState(0);

  useEffect(() => {
    if (nivel === 'fácil') setTempoPiscar(1000);
    if (nivel === 'médio') setTempoPiscar(700);
    if (nivel === 'difícil') setTempoPiscar(500);
  }, [nivel]);

  const iniciarJogo = () => {
    setSequencia([]);
    setSequenciaJogador([]);
    setAnimacoes({});
    setJogando(false);
    setRodada(0);
    gerarSequencia();
  };

  const gerarSequencia = () => {
    setJogando(false); // Desabilita cliques enquanto a nova sequência é exibida
    setExibindoSequencia(true); // Indica que a sequência está sendo exibida
    setSequenciaJogador([]); // Reinicia a sequência do jogador para a nova rodada
    const novoQuadrado = Math.floor(Math.random() * QUADRADOS.length);
    const novaSequencia = [...sequencia, novoQuadrado];
    setSequencia(novaSequencia);
    setRodada((prevRodada) => prevRodada + 1);
    exibirSequencia(novaSequencia);
  };

  const exibirSequencia = (sequencia) => {
    let i = 0;
    const intervalo = setInterval(() => {
      if (i < sequencia.length) {
        piscarQuadrado(sequencia[i]);
        i++;
      } else {
        clearInterval(intervalo);
        setJogando(true); // Permite o jogador começar a clicar
        setExibindoSequencia(false); // A sequência terminou de ser exibida
      }
    }, tempoPiscar);
  };

  const piscarQuadrado = (id) => {
    const novaAnimacao = new Animated.Value(1);
    setAnimacoes((prev) => ({ ...prev, [id]: novaAnimacao }));

    Animated.sequence([
      Animated.timing(novaAnimacao, {
        toValue: 0,
        duration: tempoPiscar / 2,
        useNativeDriver: true,
      }),
      Animated.timing(novaAnimacao, {
        toValue: 1,
        duration: tempoPiscar / 2,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const verificarSequencia = (id) => {
    console.log(sequencia)
    if (!jogando || exibindoSequencia) return; // Impede cliques durante a exibição

    const novoSequenciaJogador = [...sequenciaJogador, id];
    setSequenciaJogador(novoSequenciaJogador);

    const indiceAtual = novoSequenciaJogador.length - 1;

    if (novoSequenciaJogador[indiceAtual] !== sequencia[indiceAtual]) {
      // Sequência incorreta
      setJogando(false);

      setSequencia([]);
      setSequenciaJogador([]);
      setAnimacoes({});
      setJogando(false);
      setRodada(0);

      console.log('Fim de Jogo!', `Você errou na rodada ${rodada}. Sua pontuação foi ${rodada - 1}`);
      return;
    }

    // Verifica se o jogador completou a sequência atual
    if (novoSequenciaJogador.length === sequencia.length) {
      setJogando(false); // Desabilita cliques antes de gerar a próxima sequência
      setTimeout(gerarSequencia, 700); // Espera 1 segundo antes de exibir a próxima sequência
    }
  };

  const renderizarQuadrados = () => {
    return QUADRADOS.map((id) => (
      <TouchableOpacity
        key={id}
        style={styles.quadrado}
        onPress={() => verificarSequencia(id)}
        disabled={!jogando || exibindoSequencia} // Desabilita durante a exibição
      >
        <Animated.View
          style={[
            styles.quadradoInterno,
            {
              opacity: animacoes[id] ? animacoes[id] : 1,
            },
          ]}
        >
          <Text style={styles.textoQuadrado}>{id + 1}</Text>
        </Animated.View>
      </TouchableOpacity>
    ));
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