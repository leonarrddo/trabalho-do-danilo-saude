<<<<<<< HEAD
// Tela principal do app — lista completa de hábitos organizada por categorias.

// ─── Importações ────────────────────────────────────────────────

import { useRouter, useFocusEffect } from 'expo-router';
// useRouter → navegação para a tela de detalhes e resumo
// useFocusEffect → executa código toda vez que a tela volta ao foco

import React, { useState, useCallback } from 'react';
// useState → guarda quais hábitos foram concluídos
// useCallback → memoriza funções para evitar re-criações desnecessárias

import {
  Animated,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SectionList,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
// AsyncStorage → armazenamento persistente no dispositivo
// Os dados sobrevivem ao fechar/reabrir o app

// ─── Chave de armazenamento ──────────────────────────────────────

const STORAGE_KEY = '@saude_mais:habitos_feitos';
// Chave única usada para salvar e ler os hábitos concluídos
// A mesma chave é usada no resumo.tsx para apagar ao iniciar novo dia

// ─── Dados organizados por categoria ────────────────────────────

const categorias = [
  {
    titulo: '🏋️ Exercícios e Alongamentos',
    cor: '#E74C3C',
    data: [
      { id: '1',  nome: 'Caminhada',         icone: '🚶', cor: '#E74C3C', corClara: '#FDEDEC', duracao: '30 min', descricao: 'Caminhe em ritmo moderado por 30 minutos. Melhora o sistema cardiovascular, queima calorias e reduz o estresse.' },
      { id: '2',  nome: 'Alongamento',        icone: '🤸', cor: '#E74C3C', corClara: '#FDEDEC', duracao: '15 min', descricao: 'Realize uma sequência de alongamentos para todo o corpo. Melhora a flexibilidade, postura e previne lesões.' },
      { id: '3',  nome: 'Agachamentos',       icone: '🦵', cor: '#E74C3C', corClara: '#FDEDEC', duracao: '10 min', descricao: 'Faça 3 séries de 15 agachamentos. Fortalece pernas e glúteos, melhora o equilíbrio e a postura.' },
      { id: '4',  nome: 'Flexões',            icone: '💪', cor: '#E74C3C', corClara: '#FDEDEC', duracao: '10 min', descricao: 'Faça 3 séries de 10 flexões. Fortalece braços, peito e core, melhorando a força funcional do corpo.' },
      { id: '5',  nome: 'Yoga',               icone: '🧘', cor: '#E74C3C', corClara: '#FDEDEC', duracao: '20 min', descricao: 'Pratique uma sequência básica de yoga. Combina alongamento, equilíbrio e respiração para bem-estar completo.' },
    ],
  },
  {
    titulo: '🥗 Alimentação e Hidratação',
    cor: '#27AE60',
    data: [
      { id: '6',  nome: 'Beber Água',         icone: '💧', cor: '#27AE60', corClara: '#EAFAF1', duracao: 'Dia todo', descricao: 'Beba pelo menos 2 litros de água ao longo do dia. A hidratação é essencial para o funcionamento de todos os órgãos.' },
      { id: '7',  nome: 'Comer Frutas',        icone: '🍎', cor: '#27AE60', corClara: '#EAFAF1', duracao: '—',       descricao: 'Consuma pelo menos 2 porções de frutas variadas. São ricas em vitaminas, minerais e fibras que protegem o organismo.' },
      { id: '8',  nome: 'Café da Manhã',       icone: '🍳', cor: '#27AE60', corClara: '#EAFAF1', duracao: '—',       descricao: 'Não pule o café da manhã. Uma refeição matinal equilibrada melhora o desempenho físico e mental durante o dia.' },
      { id: '9',  nome: 'Evitar Ultraprocessados', icone: '🚫', cor: '#27AE60', corClara: '#EAFAF1', duracao: '—', descricao: 'Evite alimentos ultraprocessados hoje. Prefira alimentos naturais e minimamente processados para melhor saúde.' },
      { id: '10', nome: 'Chá ou Suco Natural', icone: '🍵', cor: '#27AE60', corClara: '#EAFAF1', duracao: '—',       descricao: 'Tome um chá ou suco natural no lugar de refrigerantes. Hidrata o corpo com menos açúcar e mais nutrientes.' },
    ],
  },
  {
    titulo: '🧠 Saúde Mental e Bem-Estar',
    cor: '#8E44AD',
    data: [
      { id: '11', nome: 'Meditação',          icone: '🌿', cor: '#8E44AD', corClara: '#F5EEF8', duracao: '10 min', descricao: 'Sente-se em silêncio e foque na respiração por 10 minutos. Reduz a ansiedade, melhora o foco e o equilíbrio emocional.' },
      { id: '12', nome: 'Respiração Profunda',icone: '🌬️', cor: '#8E44AD', corClara: '#F5EEF8', duracao: '5 min',  descricao: 'Pratique respiração diafragmática por 5 minutos. Ativa o sistema nervoso parassimpático, reduzindo o estresse rapidamente.' },
      { id: '13', nome: 'Gratidão',           icone: '🙏', cor: '#8E44AD', corClara: '#F5EEF8', duracao: '5 min',  descricao: 'Escreva ou pense em 3 coisas pelas quais você é grato hoje. Melhora o humor e a perspectiva sobre a vida.' },
      { id: '14', nome: 'Desconectar das Redes', icone: '📵', cor: '#8E44AD', corClara: '#F5EEF8', duracao: '1 hora', descricao: 'Fique 1 hora longe das redes sociais. Reduz ansiedade, melhora o foco e a qualidade das interações presenciais.' },
      { id: '15', nome: 'Momento de Lazer',   icone: '🎨', cor: '#8E44AD', corClara: '#F5EEF8', duracao: '30 min', descricao: 'Dedique 30 minutos a um hobby ou atividade prazerosa. O lazer é essencial para a saúde mental e a criatividade.' },
    ],
  },
  {
    titulo: '📚 Leitura e Aprendizado',
    cor: '#2980B9',
    data: [
      { id: '16', nome: 'Leitura',            icone: '📖', cor: '#2980B9', corClara: '#EBF5FB', duracao: '20 min', descricao: 'Leia por pelo menos 20 minutos. Aumenta o vocabulário, melhora a concentração e estimula a imaginação.' },
      { id: '17', nome: 'Podcast Educativo',  icone: '🎧', cor: '#2980B9', corClara: '#EBF5FB', duracao: '20 min', descricao: 'Ouça um episódio de podcast sobre um tema de interesse. Uma forma prática de aprender enquanto faz outras atividades.' },
      { id: '18', nome: 'Aprender algo Novo', icone: '💡', cor: '#2980B9', corClara: '#EBF5FB', duracao: '15 min', descricao: 'Dedique 15 minutos para aprender algo novo — um idioma, uma habilidade ou um conceito. O aprendizado contínuo mantém o cérebro ativo.' },
      { id: '19', nome: 'Resumir o que Aprendeu', icone: '✏️', cor: '#2980B9', corClara: '#EBF5FB', duracao: '10 min', descricao: 'Escreva um resumo rápido do que aprendeu hoje. Fixar o conhecimento por escrito melhora muito a retenção.' },
    ],
  },
  {
    titulo: '🧩 Memória e Raciocínio',
    cor: '#D35400',
    data: [
      { id: '20', nome: 'Palavras Cruzadas',  icone: '🔤', cor: '#D35400', corClara: '#FBEEE6', duracao: '15 min', descricao: 'Resolva um jogo de palavras cruzadas. Estimula a memória, amplia o vocabulário e exercita o raciocínio.' },
      { id: '21', nome: 'Sudoku',             icone: '🔢', cor: '#D35400', corClara: '#FBEEE6', duracao: '15 min', descricao: 'Complete um sudoku. Exercita a lógica, a concentração e a memória de trabalho de forma divertida.' },
      { id: '22', nome: 'Jogo de Memória',    icone: '🃏', cor: '#D35400', corClara: '#FBEEE6', duracao: '10 min', descricao: 'Jogue um jogo de memória ou associação. Treina a capacidade de reter e recuperar informações.' },
      { id: '23', nome: 'Desafio Mental',     icone: '🤔', cor: '#D35400', corClara: '#FBEEE6', duracao: '10 min', descricao: 'Resolva um enigma ou charada. Estimula o pensamento criativo e a resolução de problemas.' },
    ],
  },
  {
    titulo: '📋 Organização Pessoal',
    cor: '#16A085',
    data: [
      { id: '24', nome: 'Planejar o Dia',     icone: '📅', cor: '#16A085', corClara: '#E8F8F5', duracao: '10 min', descricao: 'Reserve 10 minutos para planejar suas tarefas do dia. Aumenta a produtividade e reduz a sensação de sobrecarga.' },
      { id: '25', nome: 'Organizar o Espaço', icone: '🧹', cor: '#16A085', corClara: '#E8F8F5', duracao: '15 min', descricao: 'Arrume e organize seu ambiente de trabalho ou quarto. Um espaço limpo melhora o foco e a sensação de controle.' },
      { id: '26', nome: 'Revisar Pendências', icone: '✅', cor: '#16A085', corClara: '#E8F8F5', duracao: '10 min', descricao: 'Revise suas tarefas pendentes e priorize as mais importantes. Evita o acúmulo de compromissos e reduz a ansiedade.' },
      { id: '27', nome: 'Finanças Pessoais',  icone: '💰', cor: '#16A085', corClara: '#E8F8F5', duracao: '10 min', descricao: 'Anote seus gastos do dia e compare com seu planejamento. O controle financeiro diário evita surpresas no final do mês.' },
    ],
  },
  {
    titulo: '😴 Sono e Descanso',
    cor: '#2C3E50',
    data: [
      { id: '28', nome: 'Dormir 8 Horas',     icone: '😴', cor: '#2C3E50', corClara: '#EAECEE', duracao: '8 horas', descricao: 'Durma entre 7 e 9 horas por noite. O sono é fundamental para a memória, o humor, o sistema imune e a saúde geral.' },
      { id: '29', nome: 'Rotina Noturna',      icone: '🌙', cor: '#2C3E50', corClara: '#EAECEE', duracao: '20 min', descricao: 'Crie uma rotina relaxante antes de dormir — desligue as telas, leia ou tome um banho quente para sinalizar ao corpo que é hora de descansar.' },
      { id: '30', nome: 'Soneca Rápida',       icone: '💤', cor: '#2C3E50', corClara: '#EAECEE', duracao: '20 min', descricao: 'Uma soneca de 15 a 20 minutos à tarde pode recuperar energia e melhorar o humor sem prejudicar o sono noturno.' },
      { id: '31', nome: 'Sem Telas à Noite',   icone: '📴', cor: '#2C3E50', corClara: '#EAECEE', duracao: '—',       descricao: 'Evite telas pelo menos 1 hora antes de dormir. A luz azul dos dispositivos atrapalha a produção de melatonina e prejudica o sono.' },
    ],
  },
];

// Junta todos os hábitos de todas as categorias em um array único
// flatMap → achata o array de categorias, pegando só o campo "data" de cada uma
const todosHabitos = categorias.flatMap((c) => c.data);

const detalhesExtras: Record<string, { beneficios: string[] }> = {
  '1':  { beneficios: ['Melhora o sistema cardiovascular', 'Queima calorias', 'Reduz o estresse', 'Melhora o humor'] },
  '2':  { beneficios: ['Melhora a flexibilidade', 'Previne lesões', 'Alivia tensões musculares', 'Melhora a postura'] },
  '3':  { beneficios: ['Fortalece pernas e glúteos', 'Melhora o equilíbrio', 'Aumenta o metabolismo', 'Melhora a postura'] },
  '4':  { beneficios: ['Fortalece braços e peito', 'Trabalha o core', 'Aumenta a força funcional', 'Melhora a postura'] },
  '5':  { beneficios: ['Aumenta a flexibilidade', 'Reduz o estresse', 'Melhora a respiração', 'Equilibra corpo e mente'] },
  '6':  { beneficios: ['Melhora a função dos órgãos', 'Aumenta a energia', 'Melhora a pele', 'Ajuda na digestão'] },
  '7':  { beneficios: ['Rica em vitaminas', 'Fortalece a imunidade', 'Melhora a digestão', 'Reduz risco de doenças'] },
  '8':  { beneficios: ['Melhora a concentração', 'Fornece energia para o dia', 'Regula o metabolismo', 'Melhora o humor matinal'] },
  '9':  { beneficios: ['Reduz inflamação', 'Melhora a saúde intestinal', 'Reduz risco de doenças crônicas', 'Melhora a disposição'] },
  '10': { beneficios: ['Hidrata com menos açúcar', 'Fornece antioxidantes', 'Melhora a digestão', 'Reduz a dependência de refrigerantes'] },
  '11': { beneficios: ['Reduz a ansiedade', 'Melhora o foco', 'Regula as emoções', 'Diminui o cortisol'] },
  '12': { beneficios: ['Reduz o estresse rapidamente', 'Diminui a ansiedade', 'Melhora a concentração', 'Regula o sistema nervoso'] },
  '13': { beneficios: ['Melhora o humor', 'Aumenta a resiliência', 'Reduz o foco no negativo', 'Fortalece relações'] },
  '14': { beneficios: ['Reduz a ansiedade digital', 'Melhora o foco', 'Melhora as relações presenciais', 'Reduz comparações sociais'] },
  '15': { beneficios: ['Reduz o estresse', 'Estimula a criatividade', 'Melhora o humor', 'Aumenta a satisfação com a vida'] },
  '16': { beneficios: ['Amplia o vocabulário', 'Melhora a concentração', 'Estimula a imaginação', 'Reduz o estresse'] },
  '17': { beneficios: ['Aprendizado passivo', 'Estimula novas ideias', 'Aproveita tempo de deslocamento', 'Amplia horizontes'] },
  '18': { beneficios: ['Mantém o cérebro ativo', 'Abre novas oportunidades', 'Aumenta a autoconfiança', 'Estimula a curiosidade'] },
  '19': { beneficios: ['Melhora a retenção', 'Organiza o pensamento', 'Melhora a escrita', 'Consolida o aprendizado'] },
  '20': { beneficios: ['Estimula a memória', 'Amplia o vocabulário', 'Exercita o raciocínio', 'Previne declínio cognitivo'] },
  '21': { beneficios: ['Exercita a lógica', 'Melhora a concentração', 'Treina a memória de trabalho', 'Estimula o raciocínio'] },
  '22': { beneficios: ['Treina a memória visual', 'Melhora a atenção', 'Exercita a associação', 'Estimula o cérebro'] },
  '23': { beneficios: ['Estimula o pensamento criativo', 'Melhora a resolução de problemas', 'Exercita a lógica', 'Aumenta a agilidade mental'] },
  '24': { beneficios: ['Aumenta a produtividade', 'Reduz a ansiedade', 'Melhora o foco', 'Evita esquecimentos'] },
  '25': { beneficios: ['Melhora o foco', 'Reduz distrações', 'Aumenta a sensação de controle', 'Melhora o bem-estar'] },
  '26': { beneficios: ['Evita acúmulo de tarefas', 'Reduz o estresse', 'Melhora a organização mental', 'Aumenta a sensação de controle'] },
  '27': { beneficios: ['Evita dívidas', 'Gera consciência financeira', 'Permite poupar', 'Reduz o estresse financeiro'] },
  '28': { beneficios: ['Consolida a memória', 'Recupera o corpo', 'Melhora o humor', 'Fortalece o sistema imune'] },
  '29': { beneficios: ['Melhora a qualidade do sono', 'Reduz a ansiedade noturna', 'Facilita adormecer', 'Cria hábitos saudáveis'] },
  '30': { beneficios: ['Recupera a energia', 'Melhora o humor', 'Aumenta a produtividade', 'Melhora o humor pós-soneca'] },
  '31': { beneficios: ['Melhora a qualidade do sono', 'Reduz a insônia', 'Permite que a melatonina atue', 'Diminui a ansiedade noturna'] },
};

// ─── Função auxiliar: calcula o tempo total dos hábitos feitos ───

function calcularTempoTotal(feitosIds: string[]): string {
  // Mapa de duração em minutos para cada hábito
  // '—' e 'Dia todo' são tratados como 0 pois não têm duração fixa
  const duracaoMinutos: Record<string, number> = {
    '1': 30, '2': 15, '3': 10, '4': 10, '5': 20,
    '6': 0,  '7': 0,  '8': 0,  '9': 0,  '10': 0,
    '11': 10,'12': 5, '13': 5, '14': 60,'15': 30,
    '16': 20,'17': 20,'18': 15,'19': 10,
    '20': 15,'21': 15,'22': 10,'23': 10,
    '24': 10,'25': 15,'26': 10,'27': 10,
    '28': 0, '29': 20,'30': 20,'31': 0,
  };

  // Soma os minutos de todos os hábitos concluídos
  const totalMinutos = feitosIds.reduce((soma, id) => {
    return soma + (duracaoMinutos[id] ?? 0);
    // ?? 0 → usa 0 se o id não estiver no mapa (nunca deve acontecer, mas é seguro)
  }, 0);
  // 0 → valor inicial da soma

  if (totalMinutos === 0) return '—';
  // Se nenhum hábito com tempo fixo foi feito, retorna traço

  if (totalMinutos < 60) return `${totalMinutos} min`;
  // Menos de 1 hora → mostra só minutos, ex: '45 min'

  const horas = Math.floor(totalMinutos / 60);
  // Math.floor → arredonda para baixo, ex: 75 min → 1 hora
  const minutos = totalMinutos % 60;
  // % → resto da divisão, ex: 75 % 60 = 15 minutos restantes

  if (minutos === 0) return `${horas}h`;
  // Hora exata → ex: '2h'

  return `${horas}h ${minutos}min`;
  // Com minutos restantes → ex: '1h 15min'
}

// ─── Funções de persistência ─────────────────────────────────────

// Carrega os IDs salvos do AsyncStorage e retorna como Set
async function carregarFeitos(): Promise<Set<string>> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    // getItem → busca o valor salvo pela chave; retorna null se não existir

    if (json) {
      const arr: string[] = JSON.parse(json);
      // JSON.parse converte a string '["1","3","7"]' de volta para o array ['1','3','7']
      return new Set(arr);
      // Converte o array para Set antes de retornar
    }
  } catch (e) {
    console.warn('Erro ao carregar hábitos:', e);
  }
  return new Set();
  // Retorna Set vazio se não havia nada salvo ou se deu erro
}

// Salva o Set de IDs concluídos no AsyncStorage
async function salvarFeitos(feitos: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...feitos]));
    // [...feitos] → converte Set para array usando spread operator
    // JSON.stringify → converte o array para string JSON para poder salvar
  } catch (e) {
    console.warn('Erro ao salvar hábitos:', e);
  }
}

// ─── Componente principal ────────────────────────────────────────

export default function HomeScreen() {
  const [feitos, setFeitos] = useState<Set<string>>(new Set());
  // feitos → Set com os IDs dos hábitos marcados como concluídos
  const router = useRouter();

  const [animacoes] = useState<Record<string, Animated.Value>>(() => {
    // Cria um Animated.Value para cada hábito — usado para a animação de bounce ao marcar
    const obj: Record<string, Animated.Value> = {};
    todosHabitos.forEach((h) => {
      obj[h.id] = new Animated.Value(1);
      // 1 = escala normal — a animação vai de 1 → 0.96 → 1 (efeito de pressão)
    });
    return obj;
  });

  // ── Carrega estado persistido toda vez que a tela ganha foco ──
  // useFocusEffect garante que ao voltar de "detalhes" ou "resumo",
  // o estado é relido do AsyncStorage — capturando qualquer mudança feita lá
  useFocusEffect(
    useCallback(() => {
      carregarFeitos().then((dados) => setFeitos(dados));
    }, [])
  );

  // ── Marca ou desmarca um hábito, com animação e persistência ──
  function marcarFeito(id: string) {
    // Animação: pressiona levemente e volta com bounce
    Animated.sequence([
      Animated.timing(animacoes[id], {
        toValue: 0.96,
        // Reduz a escala para 96% — dá sensação de pressão
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(animacoes[id], {
        toValue: 1,
        // Volta para escala normal com efeito mola
        useNativeDriver: true,
        bounciness: 8,
        // bounciness → intensidade do quique ao voltar
      }),
    ]).start();

    setFeitos((atual) => {
      const novo = new Set(atual);
      if (novo.has(id)) {
        novo.delete(id);
        // Já estava marcado → desmarca
      } else {
        novo.add(id);
        // Não estava marcado → marca
      }
      salvarFeitos(novo);
      // Persiste imediatamente após cada mudança
      return novo;
    });
  }

  // ── Navega para a tela de resumo com todos os dados necessários ──
  function irParaResumo() {
    const feitosArray = [...feitos];
    // Converte o Set para array para poder serializar via params

    const porcentagem = Math.round((feitos.size / todosHabitos.length) * 100);
    // Calcula o percentual de conclusão do dia

    const tempoTotal = calcularTempoTotal(feitosArray);
    // Calcula o tempo total somado dos hábitos concluídos

    router.push({
      pathname: '/resumo',
      // Navega para resumo.tsx
      params: {
        feitos: JSON.stringify(feitosArray),
        // Serializa o array para string — params só aceitam string
        total: String(todosHabitos.length),
        porcentagem: String(porcentagem),
        tempoTotal,
      },
    });
  }

  // ── Renderiza cada card de hábito ──
  function renderItem({ item }: { item: typeof todosHabitos[0] }) {
    const marcado = feitos.has(item.id);
    // true se o ID desse hábito está no Set "feitos"

    return (
      <Animated.View style={{ transform: [{ scale: animacoes[item.id] }] }}>
      {/* Animated.View aplica a animação de escala definida em animacoes[item.id] */}
        <TouchableOpacity
          style={[styles.card, marcado && { backgroundColor: item.cor }]}
          // Quando marcado, o fundo do card muda para a cor da categoria
          onPress={() =>
            router.push({
              pathname: '/detalhes',
              params: {
                id: item.id,
                nome: item.nome,
                icone: item.icone,
                descricao: item.descricao,
                cor: item.cor,
                duracao: item.duracao,
                marcado: marcado ? 'true' : 'false',
                beneficios: JSON.stringify(detalhesExtras[item.id]?.beneficios ?? []),
              },
            })
          }
          activeOpacity={0.85}
        >
          <View style={[
            styles.iconeBox,
            { backgroundColor: marcado ? 'rgba(255,255,255,0.25)' : item.corClara }
            // Quando marcado, o fundo do ícone fica branco translúcido
          ]}>
            <Text style={styles.icone}>{item.icone}</Text>
          </View>

          <View style={styles.cardInfo}>
            <Text style={[styles.cardNome, { color: marcado ? '#fff' : '#1a1a2e' }]}>
              {item.nome}
            </Text>
            <Text style={[styles.cardDuracao, { color: marcado ? 'rgba(255,255,255,0.8)' : '#888' }]}>
              ⏱ {item.duracao}
            </Text>
            {marcado && (
              // Só aparece quando o hábito está marcado
              <View style={styles.seloRow}>
                <View style={styles.selo}>
                  <Text style={styles.seloTexto}>✓ Concluído</Text>
                </View>
                <Text style={styles.desfazerTexto}>toque para desfazer</Text>
              </View>
            )}
          </View>

          <View style={[
            styles.indicador,
            { backgroundColor: marcado ? 'rgba(255,255,255,0.2)' : '#F0F0F0' }
          ]}>
            <Text style={[styles.indicadorTexto, { color: marcado ? '#fff' : '#aaa' }]}>
              {marcado ? '✓' : '›'}
              {/* ✓ quando marcado, › (seta) quando não marcado */}
            </Text>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  // ── Renderiza o cabeçalho de cada seção (categoria) ──
  function renderSectionHeader({ section }: { section: typeof categorias[0] }) {
    return (
      <View style={[styles.categoriaHeader, { borderLeftColor: section.cor }]}>
      {/* borderLeftColor muda conforme a cor de cada categoria */}
        <Text style={styles.categoriaTitulo}>{section.titulo}</Text>
      </View>
    );
  }

  const porcentagem = Math.round((feitos.size / todosHabitos.length) * 100);
  // Porcentagem de conclusão — usada na barra de progresso

  // ─── JSX — estrutura visual da tela ─────────────────────────────

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Header ────────────────────────────────────────── */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerLogo}>Saúde+</Text>
          <Text style={styles.headerSub}>Seus hábitos de hoje</Text>
        </View>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeTexto}>{feitos.size}/{todosHabitos.length}</Text>
          {/* Mostra quantos hábitos foram feitos do total */}
        </View>
      </View>

      {/* ── Barra de progresso ────────────────────────────── */}
      <View style={styles.progressoContainer}>
        <View style={styles.progressoTopo}>
          <Text style={styles.progressoLabel}>Progresso de hoje</Text>
          <Text style={styles.progressoPorcentagem}>{porcentagem}%</Text>
        </View>
        <View style={styles.progressoBarraFundo}>
          <View style={[styles.progressoBarraFrente, { width: `${porcentagem}%` }]} />
          {/* width dinâmica — vai de '0%' a '100%' conforme os hábitos são marcados */}
        </View>
        <Text style={styles.progressoMotivacao}>
          {porcentagem === 100
            ? '🏆 Parabéns! Meta do dia concluída!'
            : porcentagem >= 50
            ? '💪 Você está indo muito bem!'
            : '🌱 Vamos lá, você consegue!'}
          {/* Mensagem muda conforme o progresso */}
        </Text>
      </View>

      {/* ── Lista com seções por categoria ────────────────── */}
      <SectionList
        sections={categorias}
        // sections → array de categorias, cada uma com título, cor e array de hábitos
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        contentContainerStyle={styles.lista}
        showsVerticalScrollIndicator={false}
        stickySectionHeadersEnabled={false}
        // stickySectionHeadersEnabled: false → os cabeçalhos de seção rolam com a lista
        ListFooterComponent={
          // ListFooterComponent → renderizado depois do último item da lista
          // Perfeito para o botão "Finalizar Dia" que fica no final do scroll
          <View style={styles.footerLista}>

            {/* ── Botão Finalizar Dia ───────────────────────── */}
            <TouchableOpacity
              style={styles.botaoFinalizarDia}
              onPress={irParaResumo}
              // irParaResumo → calcula os dados e navega para resumo.tsx
              activeOpacity={0.85}
            >
              <Text style={styles.botaoFinalizarDiaTexto}>🌅 Finalizar Dia</Text>
              <Text style={styles.botaoFinalizarDiaSub}>Ver resumo e encerrar o dia</Text>
            </TouchableOpacity>

          </View>
        }
      />

      {/* ── Footer ────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerTexto}>💚 Cuide-se todos os dias</Text>
=======
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
>>>>>>> 19028a9ce4299999a80185912d392ae5c612db4b
      </View>

    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────

<<<<<<< HEAD
=======
// StyleSheet.create organiza os estilos fora do JSX
// Cada chave aqui é um nome de estilo que usamos no "style={styles.nomeDoEstilo}"
>>>>>>> 19028a9ce4299999a80185912d392ae5c612db4b
const styles = StyleSheet.create({

  container: {
    flex: 1,
<<<<<<< HEAD
    backgroundColor: '#F7F8FC',
  },

  // ── Header ──────────────────────────────────────────────────

  header: {
    backgroundColor: '#1a1a2e',
    paddingVertical: 24,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  headerLogo: {
    color: '#fff',
    fontSize: 26,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  headerSub: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
    marginTop: 2,
  },
  headerBadge: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  headerBadgeTexto: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  // ── Barra de progresso ───────────────────────────────────────

  progressoContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 4,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
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
    fontWeight: '600',
  },
  progressoPorcentagem: {
    fontSize: 14,
    color: '#27AE60',
    fontWeight: 'bold',
  },
  progressoBarraFundo: {
    height: 10,
    backgroundColor: '#EAEAEA',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressoBarraFrente: {
    height: '100%',
    backgroundColor: '#27AE60',
    borderRadius: 10,
  },
  progressoMotivacao: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
  },

  // ── Lista ────────────────────────────────────────────────────

  lista: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },

  // ── Cabeçalho de categoria ───────────────────────────────────

  categoriaHeader: {
    borderLeftWidth: 4,
    paddingLeft: 12,
    marginTop: 24,
    marginBottom: 12,
  },
  categoriaTitulo: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a1a2e',
  },

  // ── Card de hábito ───────────────────────────────────────────

  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconeBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  icone: {
    fontSize: 26,
  },
  cardInfo: {
    flex: 1,
    // flex: 1 → ocupa o espaço restante entre o ícone e o indicador
  },
  cardNome: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 3,
  },
  cardDuracao: {
    fontSize: 12,
    marginBottom: 4,
  },
  seloRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  selo: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  seloTexto: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  desfazerTexto: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
  },
  indicador: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  indicadorTexto: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  // ── Footer da lista (botão Finalizar Dia) ────────────────────

  footerLista: {
    marginTop: 12,
    marginBottom: 8,
  },
  botaoFinalizarDia: {
    backgroundColor: '#1a1a2e',
    // Cor escura para contrastar com os cards coloridos acima
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#1a1a2e',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  botaoFinalizarDiaTexto: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  botaoFinalizarDiaSub: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 12,
  },

  // ── Footer fixo do app ───────────────────────────────────────

  footer: {
    paddingVertical: 16,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#EAEAEA',
  },
  footerTexto: {
    color: '#888',
=======
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
>>>>>>> 19028a9ce4299999a80185912d392ae5c612db4b
    fontSize: 14,
  },

});