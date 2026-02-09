
import React, { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { LightbulbIcon, ShuffleIcon } from './icons';
import { Expense, OneTimeExpense } from '../types';

interface Tip {
  title: string;
  description: string;
}

interface SavingsTipsCardProps {
  totalIncome: number;
  fixedExpenses: Expense[];
  oneTimeExpenses: OneTimeExpense[];
  remainingBalance: number;
}

const SavingsTipsCard: React.FC<SavingsTipsCardProps> = ({ totalIncome, fixedExpenses, oneTimeExpenses, remainingBalance }) => {
  const [tips, setTips] = useState<Tip[]>([]);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateTips = useCallback(async () => {
    setLoading(true);
    setError(null);
    setTips([]);

    if (totalIncome <= 0) {
        setError("Adicione seu salário para receber dicas personalizadas.");
        setLoading(false);
        return;
    }

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const formatFixedExpenses = fixedExpenses
            .map(e => `- ${e.name}: R$${(e.type === 'FIXED' ? e.value : (totalIncome * e.value / 100)).toFixed(2)}`)
            .join('\n');
        
        const formatOneTimeExpenses = oneTimeExpenses.length > 0 
            ? oneTimeExpenses.map(e => `- ${e.name}: R$${e.value.toFixed(2)}`).join('\n')
            : "Nenhuma despesa pontual.";

        const userPrompt = `
            Analise os seguintes dados financeiros e gere 3 dicas de economia personalizadas, curtas e acionáveis. As dicas devem ser relevantes para a situação financeira. Por exemplo, se os gastos com 'Lazer' são altos, sugira alternativas mais baratas. Se o saldo restante é baixo, dê dicas para economizar em despesas essenciais. Se o saldo for alto, sugira como investir melhor.

            Dados Financeiros:
            - Renda Mensal Total: R$${totalIncome.toFixed(2)}
            - Despesas Fixas:
            ${formatFixedExpenses}
            - Despesas Pontuais:
            ${formatOneTimeExpenses}
            - Saldo Restante: R$${remainingBalance.toFixed(2)}
        `;

        const schema = {
            type: Type.OBJECT,
            properties: {
                tips: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            title: { type: Type.STRING, description: 'O título conciso da dica.' },
                            description: { type: Type.STRING, description: 'A descrição detalhada da dica (1-2 frases).' },
                        },
                        required: ['title', 'description'],
                    },
                },
            },
            required: ['tips'],
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: userPrompt,
            config: {
                systemInstruction: "Você é um consultor financeiro para usuários no Brasil. Sua resposta deve ser exclusivamente um objeto JSON, seguindo o schema fornecido, sem nenhum texto, comentários ou formatação markdown adicional.",
                responseMimeType: 'application/json',
                responseSchema: schema,
            },
        });

        const textResponse = response.text;
        if (!textResponse) {
            throw new Error("A IA não retornou uma resposta de texto.");
        }

        let jsonText = textResponse.trim();
        // Remove markdown fences if the model adds them by mistake
        if (jsonText.startsWith("```json")) {
            jsonText = jsonText.slice(7, -3).trim();
        } else if (jsonText.startsWith("```")) {
            jsonText = jsonText.slice(3, -3).trim();
        }
        
        const parsedJson = JSON.parse(jsonText);
        
        if (parsedJson.tips && parsedJson.tips.length > 0) {
            setTips(parsedJson.tips);
            setCurrentTipIndex(0);
        } else {
            setError("Não foi possível extrair dicas da resposta da IA. Tente novamente.");
        }

    } catch (e) {
        setError("Ocorreu um erro ao gerar as dicas. Verifique sua conexão ou tente mais tarde.");
    } finally {
        setLoading(false);
    }
  }, [totalIncome, fixedExpenses, oneTimeExpenses, remainingBalance]);

  const showNextTip = () => {
    setCurrentTipIndex((prevIndex) => (prevIndex + 1) % tips.length);
  };
  
  const currentTip = tips.length > 0 ? tips[currentTipIndex] : null;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
            <LightbulbIcon />
            <h2 className="text-2xl font-semibold">Dicas com IA</h2>
        </div>
      </div>

      <div className="space-y-3 min-h-[120px] flex flex-col justify-center">
        {loading && (
          <div className="text-center">
            <p className="text-gray-500 animate-pulse">Analisando suas finanças e gerando dicas personalizadas...</p>
          </div>
        )}
        {error && !loading && (
          <div className="text-center p-2 bg-red-50 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
        {!loading && !error && currentTip && (
           <div className="space-y-2 text-left">
              <h3 className="font-bold text-gray-800">{currentTip.title}</h3>
              <p className="text-gray-600 text-sm">{currentTip.description}</p>
          </div>
        )}
        {!loading && !error && tips.length === 0 && (
          <div className="text-center">
            <p className="text-gray-500 text-sm">Clique no botão abaixo para receber dicas de economia personalizadas com base no seu orçamento.</p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex items-center gap-3">
        <button
          onClick={generateTips}
          disabled={loading || totalIncome <= 0}
          className="flex-grow px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors disabled:bg-blue-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Analisando...' : (tips.length > 0 ? 'Gerar Novas Dicas' : 'Analisar e Gerar Dicas')}
        </button>
        {tips.length > 1 && !loading && (
          <button 
            onClick={showNextTip} 
            className="flex-shrink-0 p-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
            aria-label="Ver próxima dica"
          >
              <ShuffleIcon />
          </button>
        )}
      </div>
    </div>
  );
};

export default SavingsTipsCard;
