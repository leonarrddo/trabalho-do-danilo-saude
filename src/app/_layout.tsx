// Arquivo de layout raiz do app — envolve todas as telas.
// O nome "_layout.tsx" é especial no Expo Router: ele define
// a estrutura que fica por volta de todas as outras telas.

// ─── Importações ────────────────────────────────────────────────

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
// DarkTheme → tema escuro padrão do React Navigation
// DefaultTheme → tema claro padrão do React Navigation
// ThemeProvider → componente que aplica o tema escolhido em todas as telas filhas

import { Stack } from 'expo-router';
// Stack → tipo de navegação em pilha
// Funciona assim: ao ir para uma tela nova ela "empilha" em cima da atual
// Ao apertar Voltar, a tela do topo da pilha é removida e a anterior aparece

import React from 'react';

import { useColorScheme } from 'react-native';
// useColorScheme → detecta se o celular está no modo claro ou escuro
// Retorna 'light', 'dark' ou null

// ─── Componente principal ────────────────────────────────────────

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // Guarda o esquema de cores atual do celular ('light' ou 'dark')

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
    {/* ThemeProvider envolve tudo — se o celular estiver no modo escuro usa DarkTheme,
        senão usa DefaultTheme. Isso afeta cores de fundo e texto em todo o app. */}

      <Stack screenOptions={{ headerShown: false }}>
      {/* Stack configura a navegação em pilha para todas as telas */}
      {/* headerShown: false → esconde o header padrão do Expo Router em todas as telas */}
      {/* Escondemos porque criamos nosso próprio navbar verde personalizado em cada tela */}
      {/* Se deixássemos true, apareceriam dois headers sobrepostos */}

        <Stack.Screen name="index" />
        {/* Registra a tela index.tsx como parte da pilha de navegação */}

        <Stack.Screen name="detalhes" />
        {/* Registra a tela detalhes.tsx como parte da pilha de navegação */}
        {/* Quando chamamos router.push('/detalhes'), o Stack sabe que essa tela existe */}

<<<<<<< HEAD
        <Stack.Screen name="resumo" />
        {/* Registra a tela resumo.tsx como parte da pilha de navegação */}
        {/* Quando chamamos router.push('/resumo'), o Stack sabe que essa tela existe */}

=======
>>>>>>> 19028a9ce4299999a80185912d392ae5c612db4b
      </Stack>

    </ThemeProvider>
  );
}