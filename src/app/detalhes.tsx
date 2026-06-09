// Tela de detalhes de cada atividade — design completo e moderno,
// consistente com a identidade visual da tela principal.

// ─── Importações ────────────────────────────────────────────────

import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState, useEffect, useRef } from 'react';
import {
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ─── Chave de armazenamento (mesma do index.tsx) ─────────────────

const STORAGE_KEY = '@saude_mais:habitos_feitos';
// Ambas as telas usam a mesma chave — garantia de sincronização

// ─── Funções de persistência ─────────────────────────────────────

async function carregarFeitos(): Promise<Set<string>> {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    if (json) return new Set(JSON.parse(json));
  } catch (e) {
    console.warn('Erro ao carregar:', e);
  }
  return new Set();
}

async function salvarFeitos(feitos: Set<string>): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify([...feitos]));
  } catch (e) {
    console.warn('Erro ao salvar:', e);
  }
}

// ─── Dados extras por atividade ─────────────────────────────────

const detalhesExtras: Record<string, {
  categoria: string;
  dificuldade: string;
  corDificuldade: string;
  beneficios: string[];
  objetivo: string;
  dicas: string[];
  passos: string[];
}> = {
  '1':  { categoria: '🏋️ Exercícios', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Melhora o sistema cardiovascular', 'Queima calorias', 'Reduz o estresse', 'Melhora o humor'], objetivo: 'Manter o corpo ativo e a saúde cardiovascular em dia através de movimento contínuo e moderado.', dicas: ['Use tênis confortáveis', 'Leve água para se hidratar', 'Prefira horários mais frescos', 'Ouça música ou podcast para tornar mais agradável'], passos: ['Faça um aquecimento leve de 5 min', 'Caminhe em ritmo moderado por 20 min', 'Acelere o passo por 5 min', 'Desacelere gradualmente nos últimos 5 min', 'Alongue as pernas ao final'] },
  '2':  { categoria: '🏋️ Exercícios', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Melhora a flexibilidade', 'Previne lesões', 'Alivia tensões musculares', 'Melhora a postura'], objetivo: 'Aumentar a mobilidade articular e relaxar a musculatura através de movimentos lentos e controlados.', dicas: ['Nunca force além do seu limite', 'Respire lentamente durante cada posição', 'Mantenha cada posição por 20 a 30 segundos', 'Faça sempre após atividade física'], passos: ['Alongue o pescoço lateralmente', 'Estique os braços para frente e para os lados', 'Alongue a lombar sentado', 'Estique os quadríceps em pé', 'Alongue panturrilha apoiado na parede'] },
  '3':  { categoria: '🏋️ Exercícios', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Fortalece pernas e glúteos', 'Melhora o equilíbrio', 'Aumenta o metabolismo', 'Melhora a postura'], objetivo: 'Fortalecer a musculatura dos membros inferiores e melhorar a estabilidade corporal.', dicas: ['Mantenha os joelhos alinhados com os pés', 'Desça devagar para mais resultado', 'Não deixe os joelhos ultrapassarem os pés', 'Respire ao subir e ao descer'], passos: ['Fique em pé com pés na largura dos ombros', 'Desça lentamente como se fosse sentar', 'Mantenha as costas retas durante o movimento', 'Suba empurrando o chão com os calcanhares', 'Repita 15 vezes e descanse — faça 3 séries'] },
  '4':  { categoria: '🏋️ Exercícios', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Fortalece braços e peito', 'Trabalha o core', 'Aumenta a força funcional', 'Melhora a postura'], objetivo: 'Desenvolver força no tronco superior e resistência muscular.', dicas: ['Mantenha o corpo reto como uma prancha', 'Não deixe o quadril cair', 'Respire ao descer e force ao subir', 'Comece com joelhos apoiados se precisar'], passos: ['Apoie as mãos na largura dos ombros no chão', 'Estenda o corpo formando uma linha reta', 'Desça o peito até próximo ao chão', 'Suba estendendo os braços completamente', 'Faça 10 repetições e descanse — 3 séries'] },
  '5':  { categoria: '🏋️ Exercícios', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Aumenta a flexibilidade', 'Reduz o estresse', 'Melhora a respiração', 'Equilibra corpo e mente'], objetivo: 'Conectar respiração e movimento para promover equilíbrio físico e mental.', dicas: ['Use roupas confortáveis', 'Pratique em superfície firme e antiderrapante', 'Não compare seu progresso com o dos outros', 'Foque na respiração acima de tudo'], passos: ['Comece em posição de montanha — pé em pé, respirando', 'Faça a postura do gato e da vaca por 5 respirações', 'Entre na postura do cachorro olhando para baixo', 'Flua entre guerreiro 1 e guerreiro 2', 'Finalize em savasana — deitado relaxando por 3 min'] },
  '6':  { categoria: '🥗 Alimentação', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Melhora a função dos órgãos', 'Aumenta a energia', 'Melhora a pele', 'Ajuda na digestão'], objetivo: 'Manter o corpo hidratado ao longo do dia para o funcionamento ideal de todos os sistemas.', dicas: ['Deixe uma garrafinha visível para lembrar', 'Beba um copo ao acordar', 'Adicione limão ou gengibre para variar', 'Evite substituir por sucos industriais'], passos: ['Beba 1 copo ao acordar', 'Beba 1 copo antes de cada refeição', 'Beba 1 copo durante a tarde', 'Beba 1 copo antes de dormir', 'Complete 2 litros ao longo do dia'] },
  '7':  { categoria: '🥗 Alimentação', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Rica em vitaminas', 'Fortalece a imunidade', 'Melhora a digestão', 'Reduz risco de doenças'], objetivo: 'Garantir o aporte diário de vitaminas e fibras essenciais para a saúde.', dicas: ['Varie as frutas para obter nutrientes diferentes', 'Prefira frutas da estação', 'Consuma com casca quando possível', 'Combine com iogurte para um lanche completo'], passos: ['Escolha 2 frutas diferentes para o dia', 'Consuma uma delas no café da manhã', 'Consuma a segunda no lanche da tarde', 'Experimente uma fruta nova a cada semana'] },
  '8':  { categoria: '🥗 Alimentação', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Melhora a concentração', 'Fornece energia para o dia', 'Regula o metabolismo', 'Melhora o humor matinal'], objetivo: 'Abastecer o corpo com energia e nutrientes logo pela manhã para um dia mais produtivo.', dicas: ['Inclua proteínas como ovos ou iogurte', 'Evite açúcar em excesso pela manhã', 'Reserve pelo menos 15 minutos para comer com calma', 'Inclua uma fruta para vitaminas'], passos: ['Acorde com tempo suficiente para não pular', 'Prepare algo simples e nutritivo', 'Inclua proteína, carboidrato e fruta', 'Coma sentado e sem pressa', 'Evite telas durante a refeição'] },
  '9':  { categoria: '🥗 Alimentação', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Reduz inflamação', 'Melhora a saúde intestinal', 'Reduz risco de doenças crônicas', 'Melhora a disposição'], objetivo: 'Substituir alimentos prejudiciais por opções naturais e nutritivas.', dicas: ['Leia os rótulos dos alimentos', 'Prepare refeições em casa sempre que possível', 'Tenha lanches saudáveis à mão', 'Não precisa ser perfeito — reduza aos poucos'], passos: ['Identifique os ultraprocessados que você mais consome', 'Escolha uma alternativa natural para cada um', 'Prepare seu lanche saudável com antecedência', 'No mercado, prefira as prateleiras do perímetro', 'Ao final do dia, avalie como foi'] },
  '10': { categoria: '🥗 Alimentação', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Hidrata com menos açúcar', 'Fornece antioxidantes', 'Melhora a digestão', 'Reduz a dependência de refrigerantes'], objetivo: 'Substituir bebidas industrializadas por opções naturais e mais saudáveis.', dicas: ['Chás de ervas são ótimas opções à noite', 'Sucos devem ser feitos na hora', 'Evite adicionar muito açúcar', 'Chá verde tem cafeína — cuidado à noite'], passos: ['Escolha entre chá ou suco natural', 'Prepare em casa sem açúcar ou com pouco', 'Consuma no lugar do refrigerante ou suco de caixinha', 'Experimente um sabor diferente a cada dia'] },
  '11': { categoria: '🧠 Saúde Mental', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Reduz a ansiedade', 'Melhora o foco', 'Regula as emoções', 'Diminui o cortisol'], objetivo: 'Treinar a mente para o momento presente, reduzindo o estresse e a ansiedade.', dicas: ['Comece com apenas 5 minutos se for iniciante', 'Use um aplicativo de meditação guiada', 'Pratique sempre no mesmo horário', 'Não existe meditar "errado" — apenas observe'], passos: ['Sente em local tranquilo e confortável', 'Feche os olhos e respire naturalmente', 'Foque sua atenção na respiração', 'Quando a mente divagar, gentilmente retorne ao foco', 'Mantenha por 10 minutos'] },
  '12': { categoria: '🧠 Saúde Mental', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Reduz o estresse rapidamente', 'Diminui a ansiedade', 'Melhora a concentração', 'Regula o sistema nervoso'], objetivo: 'Ativar o sistema nervoso parassimpático para reduzir o estresse de forma imediata.', dicas: ['Pratique em qualquer lugar — trabalho, carro, fila', 'A técnica 4-7-8 é muito eficaz', 'Faça pausas de respiração ao longo do dia', 'Combine com meditação para mais resultado'], passos: ['Sente ou deite confortavelmente', 'Inspire pelo nariz contando até 4', 'Segure o ar contando até 7', 'Expire pela boca contando até 8', 'Repita o ciclo 4 vezes'] },
  '13': { categoria: '🧠 Saúde Mental', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Melhora o humor', 'Aumenta a resiliência', 'Reduz o foco no negativo', 'Fortalece relações'], objetivo: 'Treinar o cérebro para reconhecer o positivo, melhorando o bem-estar emocional.', dicas: ['Anote em um caderno específico para isso', 'Seja específico — não apenas "família"', 'Faça isso antes de dormir para melhor sono', 'Compartilhe sua gratidão com alguém'], passos: ['Reserve 5 minutos tranquilos', 'Pense em 3 coisas boas que aconteceram hoje', 'Escreva cada uma com detalhes', 'Reflita por que cada uma é importante', 'Sorria — você tem mais do que imagina'] },
  '14': { categoria: '🧠 Saúde Mental', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Reduz a ansiedade digital', 'Melhora o foco', 'Melhora as relações presenciais', 'Reduz comparações sociais'], objetivo: 'Criar um intervalo saudável do consumo digital para recuperar energia mental.', dicas: ['Coloque o celular em outro cômodo', 'Use esse tempo para algo presencial', 'Avise amigos para não ficarem sem resposta', 'Comece com 30 min e aumente gradualmente'], passos: ['Defina o horário de início da desconexão', 'Coloque o celular no modo não perturbe', 'Afaste-se das redes sociais e notificações', 'Dedique o tempo a algo offline', 'Ao final, observe como você se sente'] },
  '15': { categoria: '🧠 Saúde Mental', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Reduz o estresse', 'Estimula a criatividade', 'Melhora o humor', 'Aumenta a satisfação com a vida'], objetivo: 'Dedicar tempo intencional ao prazer e à diversão como parte essencial da saúde mental.', dicas: ['Não sinta culpa por descansar — é necessário', 'Escolha algo genuinamente prazeroso', 'Desligue as preocupações do trabalho', 'Convide alguém para compartilhar'], passos: ['Escolha um hobby ou atividade que você ama', 'Elimine distrações durante esse tempo', 'Mergulhe completamente na atividade', 'Não pense em produtividade — apenas aproveite', 'Repita amanhã'] },
  '16': { categoria: '📚 Leitura', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Amplia o vocabulário', 'Melhora a concentração', 'Estimula a imaginação', 'Reduz o estresse'], objetivo: 'Desenvolver o hábito de leitura diária para crescimento intelectual e relaxamento.', dicas: ['Tenha um livro sempre à mão', 'Leia antes de dormir no lugar do celular', 'Não force — escolha algo que você goste', 'Marque as páginas com post-its para reflexões'], passos: ['Escolha um livro de seu interesse', 'Encontre um lugar confortável e tranquilo', 'Leia por pelo menos 20 minutos sem interrupções', 'Anote algo que chamou sua atenção', 'Defina a meta de páginas para amanhã'] },
  '17': { categoria: '📚 Leitura', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Aprendizado passivo', 'Estimula novas ideias', 'Aproveita tempo de deslocamento', 'Amplia horizontes'], objetivo: 'Absorver conhecimento de forma prática durante atividades cotidianas.', dicas: ['Ouça durante caminhadas ou exercícios', 'Use fones de ouvido com boa qualidade', 'Anote os pontos principais depois', 'Siga criadores de conteúdo confiáveis'], passos: ['Escolha um podcast educativo do seu interesse', 'Conecte os fones e encontre um momento tranquilo', 'Ouça atentamente por 20 minutos', 'Pause e reflita sobre o que aprendeu', 'Anote 1 ideia que você pode aplicar'] },
  '18': { categoria: '📚 Leitura', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Mantém o cérebro ativo', 'Abre novas oportunidades', 'Aumenta a autoconfiança', 'Estimula a curiosidade'], objetivo: 'Manter o cérebro em constante desenvolvimento através da aquisição de novas habilidades.', dicas: ['Use plataformas como YouTube, Coursera ou Duolingo', 'Escolha algo que você sempre quis aprender', 'Consistência vale mais que intensidade', 'Compartilhe o que aprendeu para fixar melhor'], passos: ['Escolha um tema ou habilidade para aprender', 'Acesse uma fonte confiável sobre o assunto', 'Estude de forma focada por 15 minutos', 'Pratique ou aplique o que aprendeu', 'Compartilhe com alguém ou anote'] },
  '19': { categoria: '📚 Leitura', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Melhora a retenção', 'Organiza o pensamento', 'Melhora a escrita', 'Consolida o aprendizado'], objetivo: 'Reforçar o aprendizado do dia através da escrita e síntese de ideias.', dicas: ['Use um caderno ou aplicativo de notas', 'Escreva com suas próprias palavras', 'Inclua exemplos práticos', 'Revise suas anotações no dia seguinte'], passos: ['Revise mentalmente o que aprendeu hoje', 'Abra um caderno ou app de notas', 'Escreva os pontos principais em suas palavras', 'Adicione um exemplo prático ou reflexão', 'Guarde para revisar depois'] },
  '20': { categoria: '🧩 Memória', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Estimula a memória', 'Amplia o vocabulário', 'Exercita o raciocínio', 'Previne declínio cognitivo'], objetivo: 'Exercitar o cérebro de forma lúdica para manter a agilidade mental.', dicas: ['Comece com nível fácil se for iniciante', 'Use jornal, revista ou aplicativos', 'Não use dicionário logo de cara — tente primeiro', 'Faça no horário em que está mais desperto'], passos: ['Acesse um jogo de palavras cruzadas', 'Leia todas as dicas antes de começar', 'Resolva as mais fáceis primeiro', 'Use o raciocínio para as difíceis', 'Complete o máximo que conseguir em 15 minutos'] },
  '21': { categoria: '🧩 Memória', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Exercita a lógica', 'Melhora a concentração', 'Treina a memória de trabalho', 'Estimula o raciocínio'], objetivo: 'Desenvolver o pensamento lógico e a capacidade de resolução de problemas.', dicas: ['Comece com nível fácil', 'Analise as linhas, colunas e quadrantes', 'Não adivinhe — deduza', 'Use lápis para facilitar correções'], passos: ['Acesse um sudoku de nível adequado', 'Analise os números já preenchidos', 'Comece pelas linhas ou colunas com mais números', 'Deduza os valores faltantes com lógica', 'Complete sem adivinhar'] },
  '22': { categoria: '🧩 Memória', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Treina a memória visual', 'Melhora a atenção', 'Exercita a associação', 'Estimula o cérebro'], objetivo: 'Treinar a capacidade de memorizar e associar informações rapidamente.', dicas: ['Use aplicativos de jogo da memória', 'Aumente a dificuldade gradualmente', 'Pratique com imagens e também com palavras', 'Tente bater seu próprio recorde'], passos: ['Escolha um jogo de memória no seu celular ou tablet', 'Defina um nível de dificuldade adequado', 'Foque e memorize as posições das peças', 'Encontre todos os pares', 'Tente superar seu tempo da última vez'] },
  '23': { categoria: '🧩 Memória', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Estimula o pensamento criativo', 'Melhora a resolução de problemas', 'Exercita a lógica', 'Aumenta a agilidade mental'], objetivo: 'Desenvolver o raciocínio não convencional através de desafios mentais.', dicas: ['Não desista rápido — reflita com calma', 'Pense fora do óbvio', 'Compartilhe com amigos para mais diversão', 'Procure enigmas novos para não repetir'], passos: ['Encontre um enigma ou charada', 'Leia com atenção e reflita', 'Tente múltiplas abordagens de solução', 'Se travar, dê uma pausa e volte', 'Confira a resposta e entenda a lógica'] },
  '24': { categoria: '📋 Organização', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Aumenta a produtividade', 'Reduz a ansiedade', 'Melhora o foco', 'Evita esquecimentos'], objetivo: 'Estruturar o dia com antecedência para maximizar o tempo e reduzir o estresse.', dicas: ['Faça na noite anterior ou de manhã cedo', 'Liste no máximo 3 prioridades do dia', 'Use um aplicativo ou caderno de papel', 'Revise o planejamento ao longo do dia'], passos: ['Abra seu caderno ou aplicativo de tarefas', 'Liste tudo que precisa fazer hoje', 'Priorize as 3 tarefas mais importantes', 'Estime o tempo de cada tarefa', 'Distribua as tarefas ao longo do dia'] },
  '25': { categoria: '📋 Organização', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Melhora o foco', 'Reduz distrações', 'Aumenta a sensação de controle', 'Melhora o bem-estar'], objetivo: 'Criar um ambiente físico organizado que favoreça a produtividade e o bem-estar.', dicas: ['Use a regra: "cada coisa no seu lugar"', 'Descarte o que não usa há mais de 6 meses', 'Organize por categorias', 'Faça aos poucos — não precisa tudo de uma vez'], passos: ['Escolha um ambiente ou área para organizar', 'Retire tudo do lugar e classifique', 'Descarte ou doa o que não precisa', 'Organize o restante de forma lógica', 'Mantenha assim pelos próximos dias'] },
  '26': { categoria: '📋 Organização', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Evita acúmulo de tarefas', 'Reduz o estresse', 'Melhora a organização mental', 'Aumenta a sensação de controle'], objetivo: 'Manter o controle das responsabilidades para evitar sobrecarga e esquecimentos.', dicas: ['Use listas de tarefas digitais ou físicas', 'Risque as tarefas concluídas — é satisfatório', 'Delegue o que não é exclusivamente seu', 'Revise toda semana para não acumular'], passos: ['Abra sua lista de tarefas', 'Marque o que já foi concluído', 'Identifique o que está atrasado', 'Renegocie prazos se necessário', 'Priorize as pendências mais urgentes'] },
  '27': { categoria: '📋 Organização', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Evita dívidas', 'Gera consciência financeira', 'Permite poupar', 'Reduz o estresse financeiro'], objetivo: 'Manter controle diário das finanças para decisões mais conscientes e saúde financeira.', dicas: ['Use um aplicativo de controle financeiro', 'Anote tudo — até o café pequeno', 'Separe gastos essenciais de supérfluos', 'Defina uma meta de economia mensal'], passos: ['Abra seu app ou planilha de finanças', 'Registre todos os gastos do dia', 'Classifique por categoria', 'Compare com seu orçamento planejado', 'Ajuste os próximos gastos se necessário'] },
  '28': { categoria: '😴 Sono', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Consolida a memória', 'Recupera o corpo', 'Melhora o humor', 'Fortalece o sistema imune'], objetivo: 'Garantir o sono reparador necessário para o pleno funcionamento do organismo.', dicas: ['Mantenha horários regulares de sono', 'Evite cafeína após as 15h', 'Deixe o quarto escuro e fresco', 'Evite telas 1 hora antes de dormir'], passos: ['Defina um horário fixo para dormir', 'Inicie a rotina noturna 1 hora antes', 'Afaste-se das telas', 'Relaxe com leitura ou música calma', 'Durma com o ambiente escuro e silencioso'] },
  '29': { categoria: '😴 Sono', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Melhora a qualidade do sono', 'Reduz a ansiedade noturna', 'Facilita adormecer', 'Cria hábitos saudáveis'], objetivo: 'Preparar corpo e mente para um sono de qualidade através de rituais relaxantes.', dicas: ['Seja consistente — faça todo dia', 'Um banho quente ajuda a relaxar', 'Evite conversas estressantes à noite', 'Aromas como lavanda auxiliam no relaxamento'], passos: ['Desligue as telas 1 hora antes de dormir', 'Tome um banho morno', 'Prepare o ambiente — escuro e fresco', 'Leia ou ouça música calma', 'Deite e respire fundo até adormecer'] },
  '30': { categoria: '😴 Sono', dificuldade: 'Fácil', corDificuldade: '#27AE60', beneficios: ['Recupera a energia', 'Melhora o humor', 'Aumenta a produtividade', 'Melhora o humor pós-soneca'], objetivo: 'Recuperar energia durante o dia sem comprometer o sono noturno.', dicas: ['Não ultrapasse 20 minutos', 'Soneca entre 13h e 15h é ideal', 'Use alarme para não passar do tempo', 'Ambiente escuro e silencioso ajuda'], passos: ['Encontre um local tranquilo', 'Deite ou recline confortavelmente', 'Configure um alarme para 20 minutos', 'Feche os olhos e relaxe', 'Ao acordar, tome água para se refrescar'] },
  '31': { categoria: '😴 Sono', dificuldade: 'Moderado', corDificuldade: '#F39C12', beneficios: ['Melhora a qualidade do sono', 'Reduz a insônia', 'Permite que a melatonina atue', 'Diminui a ansiedade noturna'], objetivo: 'Proteger a produção natural de melatonina para um sono mais profundo e reparador.', dicas: ['Ative o modo noturno nos dispositivos', 'Prefira leitura física a digital', 'Substitua por conversa presencial', 'Use essa hora para sua rotina noturna'], passos: ['Defina um horário de corte das telas', 'Ative o modo avião ou não perturbe', 'Afaste o celular do quarto', 'Escolha uma atividade offline para o tempo restante', 'Observe a diferença na qualidade do sono'] },
};

// ─── Componente principal ────────────────────────────────────────

export default function DetalhesScreen() {

  const params = useLocalSearchParams<{
    id: string;
    nome: string;
    icone: string;
    descricao: string;
    cor: string;
    duracao: string;
    marcado: string;
  }>();

  const router = useRouter();

  const [feito, setFeito] = useState(params.marcado === 'true');
  // Estado local inicializado pelo param — mas as mudanças vão para o AsyncStorage

  const extra = detalhesExtras[params.id] ?? detalhesExtras['1'];

  // ── Animações ────────────────────────────────────────────

  const escalaBtn = useRef(new Animated.Value(1)).current;
  const opacidadeSucesso = useRef(new Animated.Value(0)).current;
  const escalaSucesso = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    if (feito) {
      Animated.parallel([
        Animated.spring(opacidadeSucesso, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 6,
        }),
        Animated.spring(escalaSucesso, {
          toValue: 1,
          useNativeDriver: true,
          bounciness: 10,
        }),
      ]).start();
    } else {
      opacidadeSucesso.setValue(0);
      escalaSucesso.setValue(0.8);
    }
  }, [feito]);

  async function handleMarcar() {
    // Animação de pulso no botão
    Animated.sequence([
      Animated.timing(escalaBtn, {
        toValue: 0.94,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(escalaBtn, {
        toValue: 1,
        useNativeDriver: true,
        bounciness: 8,
      }),
    ]).start();

    const novoEstado = !feito;
    setFeito(novoEstado);

    // ── Persiste no AsyncStorage ──────────────────────────
    // Carrega o Set atual, aplica a mudança e salva de volta.
    // Isso garante que o index.tsx leia o estado correto ao voltar.
    const atual = await carregarFeitos();
    if (novoEstado) {
      atual.add(params.id);
    } else {
      atual.delete(params.id);
    }
    await salvarFeitos(atual);
    // ─────────────────────────────────────────────────────

    if (novoEstado) {
      setTimeout(() => {
        router.back();
      }, 1200);
    }
  }

  const cor = params.cor ?? '#27AE60';

  return (
    <SafeAreaView style={styles.container}>

      {/* ── Navbar ──────────────────────────────────────────── */}
      <View style={[styles.navbar, { backgroundColor: cor }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.voltarBtn}>
          <Text style={styles.voltarTexto}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.navbarTitulo}>Detalhes</Text>
        <View style={[styles.statusBadge, { backgroundColor: feito ? '#fff' : 'rgba(255,255,255,0.2)' }]}>
          <Text style={[styles.statusTexto, { color: feito ? cor : '#fff' }]}>
            {feito ? '✓ Feito' : 'Pendente'}
          </Text>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Hero ──────────────────────────────────────────── */}
        <View style={[styles.hero, { backgroundColor: cor }]}>
          <View style={styles.heroIconeBox}>
            <Text style={styles.heroIcone}>{params.icone}</Text>
          </View>
          <Text style={styles.heroTitulo}>{params.nome}</Text>
          <Text style={styles.heroCategoria}>{extra.categoria}</Text>
          <View style={styles.heroBadges}>
            <View style={[styles.badge, { backgroundColor: extra.corDificuldade }]}>
              <Text style={styles.badgeTexto}>⚡ {extra.dificuldade}</Text>
            </View>
            <View style={[styles.badge, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
              <Text style={styles.badgeTexto}>⏱ {params.duracao}</Text>
            </View>
          </View>
        </View>

        {/* ── Banner de sucesso ─────────────────────────────── */}
        <Animated.View style={[
          styles.sucessoBanner,
          { opacity: opacidadeSucesso, transform: [{ scale: escalaSucesso }] }
        ]}>
          <Text style={styles.sucessoEmoji}>🏆</Text>
          <View>
            <Text style={styles.sucessoTitulo}>Atividade Concluída!</Text>
            <Text style={styles.sucessoSubtitulo}>Parabéns! Continue assim!</Text>
          </View>
        </Animated.View>

        <View style={styles.conteudo}>

          {/* ── Descrição ─────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>📄 Sobre esta atividade</Text>
            <Text style={styles.descricao}>{params.descricao}</Text>
          </View>

          {/* ── Objetivo ──────────────────────────────────────── */}
          <View style={[styles.card, styles.cardDestaque, { borderLeftColor: cor }]}>
            <Text style={styles.cardTitulo}>🎯 Objetivo</Text>
            <Text style={styles.descricao}>{extra.objetivo}</Text>
          </View>

          {/* ── Benefícios ────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>✨ Benefícios</Text>
            {extra.beneficios.map((b, i) => (
              <View key={i} style={styles.beneficioItem}>
                <View style={[styles.bullet, { backgroundColor: cor }]} />
                <Text style={styles.beneficioTexto}>{b}</Text>
              </View>
            ))}
          </View>

          {/* ── Passos ────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>📋 O que você irá fazer</Text>
            {extra.passos.map((passo, i) => (
              <View key={i} style={styles.passoItem}>
                <View style={[styles.passoNumero, { backgroundColor: cor }]}>
                  <Text style={styles.passoNumeroTexto}>{i + 1}</Text>
                </View>
                <Text style={styles.passoTexto}>{passo}</Text>
              </View>
            ))}
          </View>

          {/* ── Dicas ─────────────────────────────────────────── */}
          <View style={styles.card}>
            <Text style={styles.cardTitulo}>💡 Dicas e Recomendações</Text>
            {extra.dicas.map((dica, i) => (
              <View key={i} style={styles.dicaItem}>
                <Text style={[styles.dicaBullet, { color: cor }]}>→</Text>
                <Text style={styles.dicaTexto}>{dica}</Text>
              </View>
            ))}
          </View>

          {/* ── Botão de concluir ─────────────────────────────── */}
          <Animated.View style={{ transform: [{ scale: escalaBtn }] }}>
            <TouchableOpacity
              style={[styles.botao, { backgroundColor: feito ? '#EAEAEA' : cor }]}
              onPress={handleMarcar}
              activeOpacity={0.85}
            >
              <Text style={[styles.botaoTexto, { color: feito ? '#888' : '#fff' }]}>
                {feito ? '↩ Desfazer conclusão' : '✓ Marcar como concluída'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {feito && (
            <Text style={styles.desfazerAviso}>
              Marcou por engano? Toque acima para desfazer.
            </Text>
          )}

        </View>
      </ScrollView>

      {/* ── Footer ────────────────────────────────────────────── */}
      <View style={styles.footer}>
        <Text style={styles.footerTexto}>💚 Cuide-se todos os dias</Text>
      </View>

    </SafeAreaView>
  );
}

// ─── Estilos ────────────────────────────────────────────────────

const styles = StyleSheet.create({

  container: { flex: 1, backgroundColor: '#F7F8FC' },

  navbar: {
    paddingVertical: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 3,
  },
  voltarBtn: { width: 80 },
  voltarTexto: { color: '#fff', fontSize: 15, fontWeight: '600' },
  navbarTitulo: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, width: 80, alignItems: 'center' },
  statusTexto: { fontSize: 12, fontWeight: '700' },

  hero: {
    alignItems: 'center', paddingTop: 32, paddingBottom: 40, paddingHorizontal: 24,
    borderBottomLeftRadius: 32, borderBottomRightRadius: 32,
  },
  heroIconeBox: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  heroIcone: { fontSize: 48 },
  heroTitulo: { color: '#fff', fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  heroCategoria: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginBottom: 16 },
  heroBadges: { flexDirection: 'row', gap: 10 },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeTexto: { color: '#fff', fontSize: 13, fontWeight: '600' },

  sucessoBanner: {
    marginHorizontal: 20, marginTop: 16, backgroundColor: '#EAFAF1',
    borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center',
    gap: 12, borderWidth: 1, borderColor: '#27AE60',
  },
  sucessoEmoji: { fontSize: 36 },
  sucessoTitulo: { fontSize: 16, fontWeight: '700', color: '#1e8449' },
  sucessoSubtitulo: { fontSize: 13, color: '#27AE60', marginTop: 2 },

  conteudo: { padding: 20, gap: 16 },

  card: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18,
    elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6,
  },
  cardDestaque: { borderLeftWidth: 4 },
  cardTitulo: { fontSize: 15, fontWeight: '700', color: '#1a1a2e', marginBottom: 12 },
  descricao: { fontSize: 15, color: '#444', lineHeight: 24 },

  beneficioItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 10 },
  bullet: { width: 8, height: 8, borderRadius: 4 },
  beneficioTexto: { fontSize: 14, color: '#444', flex: 1 },

  passoItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14, gap: 12 },
  passoNumero: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 1 },
  passoNumeroTexto: { color: '#fff', fontSize: 13, fontWeight: 'bold' },
  passoTexto: { fontSize: 14, color: '#444', flex: 1, lineHeight: 22 },

  dicaItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10, gap: 8 },
  dicaBullet: { fontSize: 16, fontWeight: 'bold', marginTop: 1 },
  dicaTexto: { fontSize: 14, color: '#444', flex: 1, lineHeight: 22 },

  botao: {
    paddingVertical: 18, borderRadius: 16, alignItems: 'center',
    elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15, shadowRadius: 6,
  },
  botaoTexto: { fontSize: 17, fontWeight: 'bold' },
  desfazerAviso: { textAlign: 'center', fontSize: 13, color: '#999', marginTop: -8 },

  footer: { paddingVertical: 16, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#EAEAEA' },
  footerTexto: { color: '#888', fontSize: 14 },

});