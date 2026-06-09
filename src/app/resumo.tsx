// Tela de resumo diário — aparece quando o usuário aperta "Finalizar Dia".
// Mostra um resumo completo do que foi feito, com percentual, tempo e destaques.
// Ao final, o usuário pode iniciar um novo dia (reseta os hábitos).

// ─── Importações ────────────────────────────────────────────────

import { useLocalSearchParams, useRouter } from 'expo-router';
// useLocalSearchParams → lê os dados enviados via params pelo index.tsx
// useRouter → permite navegar entre telas

import React, { useEffect, useRef } from 'react';
// useEffect → executa código quando o componente aparece na tela
// useRef → guarda referências a valores sem causar re-renderização

import {
  Animated,
  // Animated → permite criar animações nos componentes
  ScrollView,
  // ScrollView → permite rolar o conteúdo quando maior que a tela
  StyleSheet,
  // StyleSheet → agrupa os estilos fora do JSX
  Text,
  // Text → exibe texto na tela
  TouchableOpacity,
  // TouchableOpacity → botão que fica translúcido ao ser pressionado
  View,
  // View → container invisível que agrupa outros componentes
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
// SafeAreaView → garante que o conteúdo não fica atrás do notch ou barra de status

import AsyncStorage from '@react-native-async-storage/async-storage';
// AsyncStorage → salva e lê dados persistentes no dispositivo

// ─── Chave de armazenamento ──────────────────────────────────────

const STORAGE_KEY = '@saude_mais:habitos_feitos';
// Mesma chave usada no index.tsx — precisa ser idêntica para acessar os mesmos dados

// ─── Componente principal ────────────────────────────────────────

export default function ResumoScreen() {

  const router = useRouter();
  // router.back() → volta para o index, router.replace() → substitui a tela atual

  // ── Lê os dados enviados pelo index.tsx via params ──
  const params = useLocalSearchParams<{
    feitos: string;     // JSON com array de IDs dos hábitos concluídos
    total: string;      // Total de hábitos disponíveis no dia
    porcentagem: string; // Percentual de conclusão já calculado
    tempoTotal: string; // Tempo total somado dos hábitos concluídos
  }>();

  // Converte os params de string para os tipos corretos
  const feitosIds: string[] = params.feitos ? JSON.parse(params.feitos) : [];
  // feitosIds → array com os IDs dos hábitos que foram marcados como feitos

  const total = parseInt(params.total ?? '0', 10);
  // parseInt converte a string '31' para o número 31

  const porcentagem = parseInt(params.porcentagem ?? '0', 10);
  // porcentagem → ex: 75 (significa 75%)

  const tempoTotal = params.tempoTotal ?? '0 min';
  // tempoTotal → string formatada, ex: '2h 15min'

  const qtdFeitos = feitosIds.length;
  // Quantos hábitos foram concluídos

  // ── Animação da barra de progresso ──
  const barraAnim = useRef(new Animated.Value(0)).current;
  // Começa em 0 (barra vazia) e vai até o valor da porcentagem

  useEffect(() => {
    // Quando a tela aparecer, anima a barra de progresso do zero até o valor real
    Animated.timing(barraAnim, {
      toValue: porcentagem,
      // Valor final = porcentagem real do usuário (ex: 75)
      duration: 1200,
      // Duração da animação em milissegundos (1,2 segundos)
      useNativeDriver: false,
      // false porque estamos animando a largura (layout), não transform/opacity
    }).start();
  }, []);
  // [] → executa só uma vez, quando a tela é montada

  // Converte o valor animado de 0-100 para uma string de porcentagem usável no style
  const larguraBarra = barraAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
    // Ex: valor 75 vira '75%'
  });

  // ── Mensagem motivacional baseada no desempenho ──
  function getMensagem(): { emoji: string; titulo: string; texto: string } {
    if (porcentagem === 100) {
      return {
        emoji: '🏆',
        titulo: 'Dia perfeito!',
        texto: 'Você completou todos os hábitos do dia. Isso é incrível — continue assim!',
      };
    } else if (porcentagem >= 75) {
      return {
        emoji: '🌟',
        titulo: 'Excelente dia!',
        texto: 'Você concluiu a grande maioria dos seus hábitos. Seu comprometimento é inspirador!',
      };
    } else if (porcentagem >= 50) {
      return {
        emoji: '💪',
        titulo: 'Bom trabalho!',
        texto: 'Você passou da metade! Cada hábito concluído é um passo em direção à melhor versão de você.',
      };
    } else if (porcentagem >= 25) {
      return {
        emoji: '🌱',
        titulo: 'Você começou!',
        texto: 'Começar já é a parte mais difícil. Amanhã você pode ir ainda mais longe!',
      };
    } else {
      return {
        emoji: '🤍',
        titulo: 'Tudo bem!',
        texto: 'Hoje foi difícil, mas você está aqui. Isso já é um passo. Amanhã é um novo dia!',
      };
    }
  }

  const mensagem = getMensagem();
  // Guarda a mensagem calculada para usar no JSX

  // ── Cor da barra de progresso baseada no desempenho ──
  function getCorBarra(): string {
    if (porcentagem >= 75) return '#27AE60'; // Verde — ótimo desempenho
    if (porcentagem >= 50) return '#F39C12'; // Laranja — desempenho médio
    return '#E74C3C';                         // Vermelho — desempenho baixo
  }

  // ── Função para iniciar novo dia ──
  async function iniciarNovoDia() {
    try {
      // Apaga todos os hábitos marcados do AsyncStorage
      // Isso faz o index.tsx carregar um Set vazio ao voltar
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Erro ao resetar hábitos:', e);
    }

    // Volta para a tela principal (index.tsx)
    // router.replace substitui essa tela na pilha — o usuário não pode voltar pro resumo
    router.replace('/');
  }

  // ─── JSX — estrutura visual da tela ─────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
    {/* SafeAreaView protege o conteúdo do notch e barra de status */}

      {/* ── Navbar ─────────────────────────────────────────── */}
      <View style={styles.navbar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.voltarBtn}>
        {/* router.back() → volta para o index sem resetar os hábitos */}
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.navbarTitulo}>Resumo do Dia</Text>

        <View style={styles.voltarBtn} />
        {/* View vazia para equilibrar o espaço e centralizar o título */}
      </View>

      {/* ── Conteúdo rolável ────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        // Esconde a barra de rolagem lateral
      >

        {/* ── Card de mensagem motivacional ───────────────── */}
        <View style={styles.cardMensagem}>
          <Text style={styles.mensagemEmoji}>{mensagem.emoji}</Text>
          <Text style={styles.mensagemTitulo}>{mensagem.titulo}</Text>
          <Text style={styles.mensagemTexto}>{mensagem.texto}</Text>
        </View>

        {/* ── Card de estatísticas ─────────────────────────── */}
        <View style={styles.cardStats}>
          <Text style={styles.cardTitulo}>📊 Resumo do dia</Text>

          {/* Três métricas lado a lado */}
          <View style={styles.statsRow}>

            <View style={styles.statItem}>
              <Text style={styles.statNumero}>{qtdFeitos}</Text>
              <Text style={styles.statLabel}>Concluídos</Text>
            </View>

            <View style={styles.statDivisor} />
            {/* Linha vertical separando os itens */}

            <View style={styles.statItem}>
              <Text style={styles.statNumero}>{total - qtdFeitos}</Text>
              <Text style={styles.statLabel}>Pendentes</Text>
            </View>

            <View style={styles.statDivisor} />

            <View style={styles.statItem}>
              <Text style={styles.statNumero}>{tempoTotal}</Text>
              <Text style={styles.statLabel}>Tempo total</Text>
            </View>

          </View>
        </View>

        {/* ── Card de progresso com barra animada ─────────── */}
        <View style={styles.cardProgresso}>
          <Text style={styles.cardTitulo}>🎯 Progresso</Text>

          <View style={styles.progressoTopo}>
            <Text style={styles.progressoLabel}>Taxa de conclusão</Text>
            <Text style={[styles.progressoPorcentagem, { color: getCorBarra() }]}>
              {porcentagem}%
            </Text>
          </View>

          {/* Barra de fundo (cinza) com a barra animada por cima */}
          <View style={styles.barraFundo}>
            <Animated.View
              style={[
                styles.barraFrente,
                {
                  width: larguraBarra,
                  // larguraBarra é o valor animado que vai de '0%' até ex: '75%'
                  backgroundColor: getCorBarra(),
                  // Cor muda conforme o desempenho
                },
              ]}
            />
          </View>

          <Text style={styles.progressoDescricao}>
            {qtdFeitos} de {total} hábitos concluídos hoje
          </Text>
        </View>

        {/* ── Card de hábitos concluídos (só aparece se tiver algum) ── */}
        {qtdFeitos > 0 && (
          <View style={styles.cardFeitos}>
            <Text style={styles.cardTitulo}>✅ O que você fez hoje</Text>
            <Text style={styles.feitosSubtitulo}>
              {qtdFeitos} {qtdFeitos === 1 ? 'hábito concluído' : 'hábitos concluídos'} — ótimo trabalho!
            </Text>
          </View>
        )}

        {/* ── Card de nenhum hábito (só aparece se não fez nada) ── */}
        {qtdFeitos === 0 && (
          <View style={styles.cardVazio}>
            <Text style={styles.cardVazioEmoji}>🤍</Text>
            <Text style={styles.cardVazioTexto}>
              Você não marcou nenhum hábito hoje, mas amanhã é uma nova oportunidade!
            </Text>
          </View>
        )}

        {/* ── Botão de iniciar novo dia ────────────────────── */}
        <TouchableOpacity
          style={styles.botaoNovoDia}
          onPress={iniciarNovoDia}
          activeOpacity={0.85}
        >
          <Text style={styles.botaoNovoDiaTexto}>🌅 Iniciar Novo Dia</Text>
          <Text style={styles.botaoNovoDiaSubtexto}>Isso vai resetar os hábitos de hoje</Text>
        </TouchableOpacity>

        {/* ── Botão secundário para voltar sem resetar ────── */}
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Text style={styles.botaoVoltarTexto}>Continuar de onde parei</Text>
        </TouchableOpacity>

      </ScrollView>

    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────

const styles = StyleSheet.create({

  container: {
    flex: 1,
    // flex: 1 → ocupa toda a tela disponível
    backgroundColor: '#F7F8FC',
  },

  // ── Navbar ──────────────────────────────────────────────────

  navbar: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    // flexDirection: 'row' → coloca os filhos lado a lado horizontalmente
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  voltarBtn: {
    width: 100,
    // Largura fixa igual dos dois lados para o título ficar centralizado
  },
  voltarTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  navbarTitulo: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ── ScrollView ───────────────────────────────────────────────

  scroll: {
    padding: 20,
    paddingBottom: 40,
    // paddingBottom extra para o último botão não ficar colado no fundo
  },

  // ── Card de mensagem motivacional ───────────────────────────

  cardMensagem: {
    backgroundColor: '#1a1a2e',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  mensagemEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  mensagemTitulo: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  mensagemTexto: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },

  // ── Cards genéricos ──────────────────────────────────────────

  cardTitulo: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1a1a2e',
    marginBottom: 16,
  },

  // ── Card de estatísticas ─────────────────────────────────────

  cardStats: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  statsRow: {
    flexDirection: 'row',
    // Coloca os três itens de estatística lado a lado
    alignItems: 'center',
    justifyContent: 'space-around',
    // space-around → distribui o espaço igualmente ao redor de cada item
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a2e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    textAlign: 'center',
  },
  statDivisor: {
    width: 1,
    height: 40,
    backgroundColor: '#EAEAEA',
    // Linha vertical fina separando os itens
  },

  // ── Card de progresso ────────────────────────────────────────

  cardProgresso: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  progressoTopo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  progressoLabel: {
    fontSize: 14,
    color: '#555',
  },
  progressoPorcentagem: {
    fontSize: 14,
    fontWeight: 'bold',
    // Cor definida dinamicamente via getCorBarra()
  },
  barraFundo: {
    height: 12,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    overflow: 'hidden',
    // overflow: 'hidden' → garante que a barra animada não vaze para fora
    marginBottom: 10,
  },
  barraFrente: {
    height: '100%',
    borderRadius: 10,
    // Cor e largura definidas dinamicamente
  },
  progressoDescricao: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },

  // ── Card de hábitos concluídos ───────────────────────────────

  cardFeitos: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  feitosSubtitulo: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: '600',
  },

  // ── Card vazio (nenhum hábito feito) ────────────────────────

  cardVazio: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
  },
  cardVazioEmoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  cardVazioTexto: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },

  // ── Botão principal — iniciar novo dia ──────────────────────

  botaoNovoDia: {
    backgroundColor: '#27AE60',
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginBottom: 12,
    elevation: 4,
    shadowColor: '#27AE60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  botaoNovoDiaTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  botaoNovoDiaSubtexto: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
  },

  // ── Botão secundário — continuar de onde parou ──────────────

  botaoVoltar: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  botaoVoltarTexto: {
    color: '#888',
    fontSize: 14,
    textDecorationLine: 'underline',
    // Sublinhado para parecer um link
  },

});