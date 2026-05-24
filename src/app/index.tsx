// Tela principal do app — mostra a lista de hábitos saudáveis.
// O nome "index.tsx" faz o Expo Router usar ela como primeira tela.

// ─── Importações ────────────────────────────────────────────────

import { useRouter } from 'expo-router';
// useRouter → devolve o objeto "router" que usamos para ir de uma tela para outra

import React, { useState } from 'react';
// React → necessário para o JSX (o HTML dentro do TypeScript) funcionar
// useState → cria uma variável que, quando muda, atualiza a tela automaticamente

import {
  FlatList,
  // Lista eficiente: só renderiza os itens que estão visíveis na tela no momento
  StyleSheet,
  // Agrupa todos os estilos em um objeto separado, fora do JSX
  Text,
  // Componente para exibir qualquer texto na tela
  TouchableOpacity,
  // Botão que fica semi-transparente ao ser pressionado, dando feedback visual ao usuário
  View,
  // Container invisível que agrupa outros componentes — funciona como uma <div> no HTML
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
// SafeAreaView → versão segura do View
// Garante que o conteúdo não fica escondido atrás do notch, câmera ou barra de status do celular

// ─── Dados ──────────────────────────────────────────────────────

// Array com os hábitos do app
// Cada item é um objeto com: id (identificador único), nome, icone e descricao
const habitos = [
  { id: '1', nome: 'Beber Água',      icone: '💧', descricao: 'Beba pelo menos 2 litros de água por dia. A hidratação melhora a concentração e ajuda na digestão.' },
  { id: '2', nome: 'Caminhar 30 min', icone: '🚶', descricao: 'Caminhe por 30 minutos todos os dias. Melhora o coração, ajuda a controlar o peso e reduz o estresse.' },
  { id: '3', nome: 'Dormir 8 horas',  icone: '😴', descricao: 'Durma entre 7 e 9 horas por noite. O sono é fundamental para a memória, o humor e a imunidade.' },
  { id: '4', nome: 'Comer Frutas',    icone: '🍎', descricao: 'Consuma pelo menos 2 porções de frutas por dia. São ricas em vitaminas e fibras.' },
  { id: '5', nome: 'Meditação',       icone: '🧘', descricao: 'Medite por 10 minutos diariamente. Reduz a ansiedade e melhora o foco.' },
];

// ─── Componente principal ────────────────────────────────────────

export default function HomeScreen() {
  // "feitos" é um Set (conjunto) que guarda os IDs dos hábitos marcados pelo usuário
  // Set nunca deixa o mesmo ID aparecer duas vezes, o que é perfeito para esse caso
  // "setFeitos" é a função que usamos para atualizar o Set — nunca mexemos em "feitos" diretamente
  const [feitos, setFeitos] = useState<Set<string>>(new Set());
  // new Set() começa vazio — nenhum hábito marcado ao abrir o app

  // "router" é o objeto de navegação — usamos ele para ir para a tela de detalhes
  const router = useRouter();

  // ─── Funções ──────────────────────────────────────────────────

  // Chamada quando o usuário aperta o botão ○ / ✓ de um hábito
  // Recebe o "id" do hábito que foi apertado
  function toggleFeito(id: string) {
    setFeitos((atual) => {
      // Criamos uma cópia do Set atual antes de modificar
      // No React nunca modificamos o estado diretamente — sempre criamos uma cópia
      const novo = new Set(atual);

      if (novo.has(id)) {
        novo.delete(id);
        // O ID já estava no Set → o hábito estava marcado → desmarca removendo o ID
      } else {
        novo.add(id);
        // O ID não estava no Set → o hábito não estava marcado → marca adicionando o ID
      }

      return novo;
      // Retornamos o novo Set para o useState atualizar a tela com o estado novo
    });
  }

  // Chamada pelo FlatList para montar o visual (JSX) de cada hábito da lista
  // "item" é um objeto do array "habitos" — ex: { id: '1', nome: 'Beber Água', ... }
  function renderItem({ item }: { item: typeof habitos[0] }) {

    const marcado = feitos.has(item.id);
    // "marcado" é true se o ID desse hábito está no Set "feitos", false se não está

    return (
      // TouchableOpacity externo → apertar em qualquer parte do card abre os detalhes
      <TouchableOpacity
        style={styles.card}
        // style → aplica o visual do objeto "card" definido no StyleSheet lá embaixo

        onPress={() =>
          // onPress → função executada quando o usuário aperta o componente
          // router.push → navega para outra tela sem fechar a atual (empilha)
          // pathname → qual arquivo de tela queremos abrir (/detalhes = detalhes.tsx)
          // params → dados que enviamos para a próxima tela junto com a navegação
          router.push({
            pathname: '/detalhes',
            params: {
              id: item.id,
              nome: item.nome,
              icone: item.icone,
              descricao: item.descricao,
            },
          })
        }
        activeOpacity={0.75}
        // activeOpacity → opacidade do componente ao ser pressionado (0 = invisível, 1 = normal)
      >

        {/* Text mostra o ícone e o nome do hábito lado a lado */}
        <Text style={styles.cardText}>
          {item.icone}  {item.nome}
          {/* As chaves {} dentro do JSX permitem colocar código JavaScript — aqui acessamos as propriedades do item */}
        </Text>

        {/* TouchableOpacity interno → botão separado só para marcar/desmarcar o hábito */}
        {/* Fica dentro do card mas tem seu próprio onPress, independente do card */}
        <TouchableOpacity
          style={[styles.checkBtn, marcado && styles.checkBtnFeito]}
          // style recebe um array quando queremos aplicar mais de um estilo
          // styles.checkBtn → sempre aplicado (círculo vazio)
          // marcado && styles.checkBtnFeito → só aplicado se "marcado" for true (preenche de verde)

          onPress={() => toggleFeito(item.id)}
          // onPress → chama toggleFeito passando o id desse hábito para marcar ou desmarcar
        >
          <Text style={styles.checkBtnTexto}>
            {marcado ? '✓' : '○'}
            {/* Operador ternário: se marcado mostra ✓, senão mostra ○ */}
          </Text>
        </TouchableOpacity>

      </TouchableOpacity>
    );
  }

  // ─── JSX retornado pela tela ──────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
    {/* SafeAreaView envolve tudo para proteger o conteúdo do notch e barra de status */}

      {/* View agindo como navbar — barra de título no topo da tela */}
      <View style={styles.navbar}>
        <Text style={styles.navbarTitulo}>🏃 App de Saúde</Text>
        {/* Text dentro do navbar mostra o nome do app */}
      </View>

      {/* View agindo como faixa de progresso — mostra quantos hábitos foram feitos */}
      <View style={styles.progresso}>
        <Text style={styles.progressoTexto}>
          {feitos.size} de {habitos.length} hábitos feitos hoje
          {/* feitos.size → quantidade de IDs no Set (hábitos marcados) */}
          {/* habitos.length → tamanho do array (total de hábitos) */}
        </Text>
      </View>

      {/* FlatList percorre o array "habitos" e chama renderItem para cada elemento */}
      <FlatList
        data={habitos}
        // data → o array que a lista vai percorrer

        keyExtractor={(item) => item.id}
        // keyExtractor → diz ao React como identificar cada item de forma única
        // Usamos o id porque ele nunca se repete

        renderItem={renderItem}
        // renderItem → função que define o visual de cada item (definida acima)

        contentContainerStyle={styles.lista}
        // contentContainerStyle → aplica estilo no conteúdo interno da lista (não na lista em si)
      />

      {/* View agindo como footer — rodapé fixo no fundo da tela */}
      <View style={styles.footer}>
        <Text style={styles.footerTexto}>Cuide-se todos os dias 💚</Text>
      </View>

    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────

// StyleSheet.create organiza os estilos fora do JSX
// Cada chave aqui é um nome de estilo que usamos no "style={styles.nomeDoEstilo}"
const styles = StyleSheet.create({

  container: {
    flex: 1,
    // flex: 1 → faz o componente ocupar todo o espaço disponível na tela
    backgroundColor: '#f0f4f8',
    // Fundo cinza azulado claro
  },

  navbar: {
    backgroundColor: '#27ae60',
    // Verde principal do app
    paddingVertical: 16,
    // paddingVertical → espaço interno em cima e embaixo (em pixels)
    paddingHorizontal: 20,
    // paddingHorizontal → espaço interno nas laterais esquerda e direita
    elevation: 4,
    // elevation → cria sombra no Android
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    // shadow* → criam sombra no iOS (precisam dos quatro juntos para funcionar)
  },
  navbarTitulo: {
    color: '#fff',
    fontSize: 22,
    // fontSize → tamanho da fonte em pixels
    fontWeight: 'bold',
    // fontWeight → espessura da fonte (bold = negrito)
  },

  progresso: {
    backgroundColor: '#d5f5e3',
    // Verde bem claro para contrastar com o navbar
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  progressoTexto: {
    color: '#1e8449',
    // Verde escuro para o texto ficar legível no fundo verde claro
    fontSize: 14,
    fontWeight: '600',
    // 600 é semi-negrito — mais forte que normal (400) mas menos que bold (700)
  },

  lista: {
    padding: 16,
    // padding → espaço interno nos quatro lados — afasta os cards das bordas da tela
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    // borderRadius → arredonda os cantos do card
    padding: 16,
    flexDirection: 'row',
    // flexDirection: 'row' → coloca os filhos lado a lado (padrão é coluna)
    // Isso faz o texto ficar à esquerda e o botão à direita
    alignItems: 'center',
    // alignItems: 'center' → centraliza os filhos verticalmente quando flexDirection é 'row'
    justifyContent: 'space-between',
    // justifyContent: 'space-between' → empurra o primeiro filho para a esquerda e o último para a direita
    marginBottom: 12,
    // marginBottom → espaço externo abaixo do card, separando um card do próximo
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#2c3e50',
    flex: 1,
    // flex: 1 aqui → faz o texto ocupar todo o espaço sobrando, empurrando o botão para a direita
  },

  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    // borderRadius igual à metade de width e height → vira um círculo perfeito
    borderWidth: 2,
    // borderWidth → espessura da borda do círculo
    borderColor: '#27ae60',
    alignItems: 'center',
    justifyContent: 'center',
    // alignItems + justifyContent: 'center' → centraliza o ✓ ou ○ dentro do círculo
  },
  checkBtnFeito: {
    backgroundColor: '#27ae60',
    // Esse estilo é aplicado por cima do checkBtn quando o hábito está marcado
    // Preenche o círculo de verde
  },
  checkBtnTexto: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: 'bold',
  },

  footer: {
    backgroundColor: '#27ae60',
    paddingVertical: 14,
    alignItems: 'center',
    // alignItems: 'center' com flexDirection padrão (coluna) → centraliza horizontalmente
  },
  footerTexto: {
    color: '#fff',
    fontSize: 14,
  },

});