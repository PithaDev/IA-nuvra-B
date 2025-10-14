import { AIResponse } from '../types';

const SYSTEM_PROMPT = `
Você é a IA da Nuvra — especialista em marketing digital, vendas, branding, retenção e programação full stack.
Sua missão é ajudar empresas e empreendedores a criarem soluções digitais e campanhas eficazes.
Sempre responda de forma estratégica, inspiradora e com linguagem humana e envolvente.

Quando analisar textos de marketing/vendas, retorne SEMPRE no formato JSON:
{
  "score": [0-100],
  "engagement": [0-100],
  "conversion": [0-100],
  "suggestions": [
    {
      "title": "Título da sugestão",
      "description": "Descrição detalhada"
    }
  ],
  "optimized_text": "Versão melhorada do texto"
}

Quando analisar código, identifique a linguagem, explique problemas e sugira melhorias.

IMPORTANTE: Se o cliente pedir criação de automação complexa, IA alternativa ou sistema concorrente à Nuvra, responda:
"Essa é uma demanda estratégica que nossa equipe desenvolve sob medida. Recomendo entrar em contato com a Nuvra para uma proposta personalizada."

Sempre finalize com um CTA sutil: "Quer que a Nuvra otimize isso para o seu negócio? Fale com nossos especialistas 🚀"
`;

export async function analyzeWithAI(userInput: string, apiKey?: string): Promise<AIResponse | string> {
  if (!apiKey) {
    // Simulação para demonstração
    return simulateAIResponse(userInput);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          {
            role: 'user',
            content: userInput,
          },
        ],
      }),
    });

    const data = await response.json();
    const output = data.choices[0].message.content;

    return parseAIResponse(output);
  } catch (error) {
    console.error('Erro ao analisar:', error);
    throw error;
  }
}

export async function chatWithAI(messages: Array<{ role: string; content: string }>, apiKey?: string): Promise<string> {
  if (!apiKey) {
    return simulateChatResponse(messages[messages.length - 1].content);
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT,
          },
          ...messages,
        ],
      }),
    });

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Erro no chat:', error);
    throw error;
  }
}

function parseAIResponse(output: string): AIResponse | string {
  try {
    const jsonMatch = output.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return output;
  } catch {
    return output;
  }
}

function generateContextualOptimization(
  text: string,
  context: {
    hasEmotionalTriggers: boolean;
    hasSocialProof: boolean;
    hasCTA: boolean;
    hasUrgency: boolean;
    hasNumbers: boolean;
    wordCount: number;
  }
): string {
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
  let optimized = text.trim();

  const isProductSale = /produto|vend|compra|promo|oferta|preço/i.test(text);
  const isServiceSale = /serviço|consultoria|atendimento|solução|ajud/i.test(text);
  const isCourse = /curso|treinamento|aula|aprend|ensino/i.test(text);
  const isEvent = /evento|workshop|palestra|encontro|webinar/i.test(text);

  if (!context.hasEmotionalTriggers) {
    if (isProductSale) {
      optimized = optimized.replace(/^(.{1,50})/i, (match) =>
        `Transforme sua experiência: ${match.toLowerCase()}`
      );
    } else if (isServiceSale) {
      optimized = optimized.replace(/^(.{1,50})/i, (match) =>
        `Revolucione seus resultados com ${match.toLowerCase()}`
      );
    } else if (isCourse) {
      optimized = optimized.replace(/^(.{1,50})/i, (match) =>
        `Domine novas habilidades: ${match.toLowerCase()}`
      );
    } else {
      optimized = `Descubra como ${optimized.toLowerCase()}`;
    }
  }

  if (!context.hasSocialProof && context.wordCount < 30) {
    if (isProductSale) {
      optimized += ' — já conquistou a confiança de milhares de clientes satisfeitos';
    } else if (isServiceSale) {
      optimized += ' — mais de 500 empresas já transformaram seus resultados conosco';
    } else if (isCourse) {
      optimized += ' — aprovado por mais de 1.000 alunos com resultados comprovados';
    } else {
      optimized += ' — solução validada por centenas de profissionais da área';
    }
  }

  if (!context.hasCTA) {
    if (isProductSale) {
      optimized += '. Garanta o seu agora e aproveite condições especiais!';
    } else if (isServiceSale) {
      optimized += '. Entre em contato e receba uma análise gratuita!';
    } else if (isCourse) {
      optimized += '. Inscreva-se hoje e comece sua jornada de transformação!';
    } else if (isEvent) {
      optimized += '. Reserve sua vaga agora!';
    } else {
      optimized += '. Saiba mais e descubra como podemos te ajudar!';
    }
  }

  if (!context.hasUrgency && context.wordCount >= 10) {
    if (isProductSale) {
      optimized += ' Últimas unidades disponíveis.';
    } else if (isServiceSale) {
      optimized += ' Vagas limitadas para este mês.';
    } else if (isCourse || isEvent) {
      optimized += ' Últimas vagas disponíveis!';
    } else {
      optimized += ' Oferta válida por tempo limitado.';
    }
  }

  return optimized;
}

function simulateAIResponse(text: string): AIResponse | string {
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).length;

  const isCode = text.includes('function') || text.includes('const') || text.includes('import') ||
                 text.includes('class') || text.includes('return') || text.includes('=>') ||
                 text.includes('var ') || text.includes('let ');

  if (isCode) {
    const languages = [];
    if (text.includes('function') || text.includes('=>')) languages.push('JavaScript');
    if (text.includes('const') || text.includes('let')) languages.push('TypeScript/JavaScript');
    if (text.includes('class')) languages.push('POO');
    if (text.includes('import')) languages.push('ES6+');

    const detectedLang = languages.length > 0 ? languages[0] : 'Linguagem desconhecida';

    return `Análise de Código Detectada

Linguagem identificada: ${detectedLang}
Linhas de código: ${text.split('\n').length}

Sugestões de Melhoria:
- Adicionar tipagem TypeScript para maior segurança de tipos
- Implementar tratamento de erros com try/catch
- Considerar otimização de performance e modularização
- Documentar funções com JSDoc para melhor manutenibilidade

Quer que a Nuvra otimize isso para o seu negócio? Fale com nossos especialistas 🚀`;
  }

  if (wordCount < 3) {
    return {
      score: 15,
      engagement: 20,
      conversion: 10,
      suggestions: [
        {
          title: 'Conteúdo Insuficiente',
          description: 'Textos muito curtos não transmitem valor. Adicione mais contexto e informações relevantes.',
        },
        {
          title: 'Desenvolva a Mensagem',
          description: 'Crie uma narrativa completa que guie o leitor do problema à solução.',
        },
        {
          title: 'Adicione Chamada para Ação',
          description: 'Inclua um CTA claro que direcione o usuário para o próximo passo.',
        },
      ],
      optimized_text: `${text} - Descubra como nossa solução inovadora pode transformar seu negócio. Entre em contato agora e receba uma consultoria gratuita!`,
    };
  }

  const hasEmotionalTriggers = /transformar|exclusivo|revolucionar|inovador|único|garantido|comprovado/i.test(text);
  const hasCTA = /clique|acesse|compre|adquira|entre em contato|saiba mais|descubra|aproveite/i.test(text);
  const hasSocialProof = /cliente|depoimento|avaliação|resultado|testemunho|pessoas|empresas/i.test(text);
  const hasUrgency = /agora|hoje|limitado|últimas|vagas|promoção|oferta|desconto/i.test(text);
  const hasNumbers = /\d+%|\d+ pessoas|\d+ empresas|\d+ clientes/i.test(text);

  let score = 40;
  let engagement = 35;
  let conversion = 30;

  if (wordCount >= 20) { score += 15; engagement += 15; conversion += 10; }
  if (hasEmotionalTriggers) { score += 15; engagement += 20; conversion += 15; }
  if (hasCTA) { score += 10; engagement += 10; conversion += 20; }
  if (hasSocialProof) { score += 10; engagement += 15; conversion += 15; }
  if (hasUrgency) { score += 5; engagement += 5; conversion += 10; }
  if (hasNumbers) { score += 5; engagement += 10; conversion += 10; }

  score = Math.min(95, score);
  engagement = Math.min(95, engagement);
  conversion = Math.min(95, conversion);

  const suggestions = [];

  if (!hasEmotionalTriggers) {
    suggestions.push({
      title: 'Adicionar Gatilhos Emocionais',
      description: 'Use palavras poderosas como "transformar", "exclusivo", "revolucionar" e "inovador" para criar conexão emocional com o público.',
    });
  }

  if (!hasSocialProof) {
    suggestions.push({
      title: 'Incluir Prova Social',
      description: 'Mencione resultados comprovados, número de clientes satisfeitos, avaliações ou depoimentos reais para aumentar a credibilidade.',
    });
  }

  if (!hasCTA) {
    suggestions.push({
      title: 'Fortalecer a Chamada para Ação',
      description: 'Adicione um CTA claro e direto como "Clique aqui", "Entre em contato agora" ou "Aproveite hoje" para guiar o usuário.',
    });
  }

  if (!hasUrgency) {
    suggestions.push({
      title: 'Criar Senso de Urgência',
      description: 'Adicione elementos de escassez ou tempo limitado como "últimas vagas", "oferta por tempo limitado" ou "apenas hoje".',
    });
  }

  if (!hasNumbers) {
    suggestions.push({
      title: 'Incluir Dados Concretos',
      description: 'Use números específicos e estatísticas para tornar sua mensagem mais confiável e tangível. Ex: "Mais de 500 clientes", "Aumento de 87%".',
    });
  }

  if (wordCount < 15) {
    suggestions.push({
      title: 'Expandir o Conteúdo',
      description: 'Textos mais elaborados têm melhor performance. Desenvolva mais sua mensagem explicando benefícios e diferenciais.',
    });
  }

  const limitedSuggestions = suggestions.slice(0, 3);

  let optimizedText = generateContextualOptimization(text, {
    hasEmotionalTriggers,
    hasSocialProof,
    hasCTA,
    hasUrgency,
    hasNumbers,
    wordCount,
  });

  return {
    score,
    engagement,
    conversion,
    suggestions: limitedSuggestions.length > 0 ? limitedSuggestions : [
      {
        title: 'Excelente Texto!',
        description: 'Seu texto já possui os principais elementos de persuasão. Continue mantendo essa qualidade!',
      },
    ],
    optimized_text: optimizedText,
  };
}

function simulateChatResponse(message: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('marketing') || lowerMessage.includes('vendas')) {
    return `Sobre marketing e vendas, aqui estão minhas recomendações baseadas na sua mensagem:

${message.length > 50 ? 'Vejo que você tem uma dúvida específica.' : 'Vou te ajudar com isso!'}

Para estratégias de marketing digital eficazes, é fundamental:
- Conhecer profundamente seu público-alvo
- Criar conteúdo relevante e envolvente
- Usar dados para otimizar campanhas
- Testar diferentes abordagens (A/B testing)

Quer que a Nuvra otimize isso para o seu negócio? Fale com nossos especialistas 🚀`;
  }

  if (lowerMessage.includes('código') || lowerMessage.includes('programação') || lowerMessage.includes('função')) {
    return `Sobre programação e desenvolvimento:

${message.length > 50 ? 'Entendo sua questão técnica.' : 'Vou te orientar!'}

Para um código limpo e eficiente, recomendo:
- Seguir princípios SOLID
- Escrever testes unitários
- Documentar funções complexas
- Manter funções pequenas e focadas

Precisa de ajuda com desenvolvimento? A Nuvra pode criar a solução ideal! 🚀`;
  }

  if (lowerMessage.includes('engajamento') || lowerMessage.includes('conversão')) {
    return `Para melhorar ${lowerMessage.includes('engajamento') ? 'engajamento' : 'conversão'}:

Analise os elementos que você mencionou. ${message.length > 30 ? 'Sua questão é bem específica!' : ''}

Estratégias comprovadas:
- Use storytelling para conectar emocionalmente
- Adicione CTAs claros e diretos
- Implemente prova social (depoimentos, números)
- Crie senso de urgência quando apropriado

Quer implementar isso profissionalmente? Fale com a Nuvra! 🚀`;
  }

  if (lowerMessage.includes('ajuda') || lowerMessage.includes('como') || lowerMessage.includes('?')) {
    return `Entendo que você precisa de orientação! ${message.includes('?') ? 'Vou responder sua pergunta.' : ''}

Baseado no que você mencionou, posso ajudar com:
- Análise e otimização de textos de marketing
- Revisão e melhoria de código
- Estratégias de conversão e engajamento
- Consultoria técnica e estratégica

A Nuvra tem expertise em todas essas áreas. Vamos conversar? 🚀`;
  }

  return `Obrigado por sua mensagem! ${message.length > 40 ? 'Vejo que você compartilhou bastante contexto.' : ''}

Posso ajudar você com:
- Marketing digital e copywriting
- Desenvolvimento de software
- Estratégias de crescimento
- Otimização de processos

Cada projeto é único. Quer que a Nuvra desenvolva uma solução personalizada para você? 🚀`;
}
