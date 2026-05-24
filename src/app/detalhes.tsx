// Tela de detalhes de um hábito — aparece quando o usuário toca em um card da lista.
// O nome "detalhes.tsx" faz o Expo Router criar automaticamente a rota /detalhes.

// ─── Importações ────────────────────────────────────────────────

import { useLocalSearchParams, useRouter } from 'expo-router';
// useLocalSearchParams → lê os dados que vieram da tela anterior via router.push params
// useRouter → devolve o objeto "router" para navegar entre telas

import React, { useState } from 'react';
// useState → guarda se o usuário marcou esse hábito como feito nessa tela

import {
  ScrollView,
  // Permite rolar o conteúdo quando ele é maior que a tela
  StyleSheet,
  // Agrupa os estilos fora do JSX
  Text,
  // Exibe texto na tela
  TouchableOpacity,
  // Botão que fica semi-transparente ao ser pressionado
  View,
  // Container invisível que agrupa outros componentes
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
// Garante que o conteúdo não fica atrás do notch ou barra de status

// ─── Componente principal ────────────────────────────────────────

export default function DetalhesScreen() {

  const { nome, icone, descricao } = useLocalSearchParams<{
    nome: string;
    icone: string;
    descricao: string;
  }>();
  // Lê os dados que o index.tsx enviou via params no router.push
  // Desestruturamos direto: nome, icone e descricao já ficam prontos para usar

  const router = useRouter();
  // router.back() vai voltar para a tela anterior (index.tsx)

  const [feito, setFeito] = useState(false);
  // "feito" começa false — o hábito ainda não foi marcado ao abrir a tela
  // Quando o usuário apertar o botão, vira true e a tela atualiza

  return (
    <SafeAreaView style={styles.container}>
    {/* SafeAreaView protege o conteúdo do notch e barra de status */}

      {/* View agindo como navbar com botão de voltar e título */}
      <View style={styles.navbar}>

        <TouchableOpacity onPress={() => router.back()} style={styles.voltarBtn}>
        {/* router.back() → volta para a tela anterior, removendo essa da pilha */}
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.navbarTitulo}>Detalhes do Hábito</Text>

        <View style={styles.voltarBtn} />
        {/* View vazia com o mesmo tamanho do botão Voltar */}
        {/* Truque para centralizar o título: ocupa o mesmo espaço dos dois lados */}

      </View>

      {/* ScrollView permite rolar caso o conteúdo não caiba na tela */}
      <ScrollView contentContainerStyle={styles.conteudo}>

        {/* View circular que exibe o ícone grande do hábito */}
        <View style={styles.iconeContainer}>
          <Text style={styles.icone}>{icone}</Text>
          {/* {icone} exibe o emoji que veio via params do index.tsx */}
        </View>

        <Text style={styles.nome}>{nome}</Text>
        {/* {nome} exibe o nome do hábito que veio via params */}

        <View style={styles.separador} />
        {/* View fina que age como linha separadora entre o nome e a descrição */}

        <Text style={styles.secaoTitulo}>Sobre esse hábito</Text>
        {/* Título fixo da seção de descrição */}

        <Text style={styles.descricao}>{descricao}</Text>
        {/* {descricao} exibe o texto longo que veio via params */}

        <TouchableOpacity
          style={[styles.botao, feito && styles.botaoFeito]}
          // style recebe array — aplica botao sempre, e botaoFeito só se feito for true
          onPress={() => setFeito(!feito)}
          // !feito inverte o valor — se era false vira true, se era true vira false
          activeOpacity={0.8}
        >
          <Text style={styles.botaoTexto}>
            {feito ? '✓ Feito hoje!' : 'Marcar como feito'}
            {/* Operador ternário — muda o texto do botão dependendo do estado */}
          </Text>
        </TouchableOpacity>

        {feito && (
          // Esse bloco só aparece na tela quando "feito" for true
          // O && funciona assim: se o lado esquerdo for true, renderiza o lado direito
          <View style={styles.mensagemBox}>
            <Text style={styles.mensagemTexto}>🎉 Parabéns! Continue assim!</Text>
          </View>
        )}

      </ScrollView>

      {/* View agindo como footer fixo no fundo */}
      <View style={styles.footer}>
        <Text style={styles.footerTexto}>App de Saúde 💚</Text>
      </View>

    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────

const styles = StyleSheet.create({

  container: {
    flex: 1,
    // flex: 1 → ocupa toda a tela
    backgroundColor: '#f0f4f8',
  },

  navbar: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    // flexDirection: 'row' → coloca os filhos lado a lado
    alignItems: 'center',
    // alignItems: 'center' → centraliza verticalmente os filhos
    justifyContent: 'space-between',
    // justifyContent: 'space-between' → espaça os filhos igualmente
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  voltarBtn: {
    width: 80,
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

  conteudo: {
    padding: 24,
    // padding → espaço interno nos quatro lados
    alignItems: 'center',
    // alignItems: 'center' → centraliza os filhos horizontalmente
  },

  iconeContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    // borderRadius metade do tamanho → círculo perfeito
    backgroundColor: '#d5f5e3',
    alignItems: 'center',
    justifyContent: 'center',
    // alignItems + justifyContent center → centraliza o emoji dentro do círculo
    marginBottom: 16,
    marginTop: 8,
  },
  icone: {
    fontSize: 50,
    // Emoji grande para destaque visual
  },

  nome: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a252f',
    textAlign: 'center',
    // textAlign: 'center' → centraliza o texto horizontalmente
    marginBottom: 16,
  },

  separador: {
    width: '100%',
    // Ocupa toda a largura disponível
    height: 1,
    // Altura de 1px → linha fina
    backgroundColor: '#ccc',
    marginBottom: 20,
  },

  secaoTitulo: {
    fontSize: 14,
    fontWeight: '700',
    color: '#27ae60',
    textTransform: 'uppercase',
    // textTransform: 'uppercase' → deixa o texto em maiúsculas
    letterSpacing: 1,
    // letterSpacing → espaço entre as letras
    alignSelf: 'flex-start',
    // alignSelf: 'flex-start' → alinha esse elemento à esquerda mesmo o pai sendo center
    marginBottom: 8,
  },

  descricao: {
    fontSize: 16,
    color: '#34495e',
    lineHeight: 26,
    // lineHeight → espaço entre as linhas do texto
    alignSelf: 'stretch',
    // alignSelf: 'stretch' → ocupa toda a largura disponível
    marginBottom: 32,
  },

  botao: {
    backgroundColor: '#27ae60',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    // borderRadius grande → botão com cantos bem arredondados
    alignSelf: 'stretch',
    // Ocupa toda a largura disponível
    alignItems: 'center',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
  },
  botaoFeito: {
    backgroundColor: '#1e8449',
    // Verde mais escuro — aplicado por cima do botao quando feito for true
  },
  botaoTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },

  mensagemBox: {
    backgroundColor: '#d5f5e3',
    borderRadius: 12,
    padding: 16,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  mensagemTexto: {
    color: '#1e8449',
    fontSize: 16,
    fontWeight: '600',
  },

  footer: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    alignItems: 'center',
  },
  footerTexto: {
    color: '#fff',
    fontSize: 14,
  },

});