import { Recipe } from '../types/Recipe';

const GEMINI_API_KEY = 'AIzaSyA0mqYWuVSye6qfOmfe0lsT8SwVe0swXuM';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export interface GeminiRecipeData {
  title?: string;
  description?: string;
  ingredients?: { item: string; quantity: string }[];
  instructions?: string[];
  prepTime?: string;
  cookTime?: string;
  servings?: string;
  difficulty?: 'facil' | 'medio' | 'dificil';
  category?: string;
  tags?: string[];
}

export class GeminiService {
  private static async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // Para React Native, usar fetch diretamente
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove o prefixo data:image/jpeg;base64, se existir
          const base64Data = base64.split(',')[1] || base64;
          resolve(base64Data);
        };
        reader.onerror = (error) => {
          console.error('Erro no FileReader:', error);
          reject(error);
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Erro ao converter imagem para base64:', error);
      throw new Error('Não foi possível processar a imagem');
    }
  }

  private static createPrompt(): string {
    return `
Analise esta imagem de uma receita culinária e extraia as seguintes informações em formato JSON:

{
  "title": "Nome da receita",
  "description": "Breve descrição da receita",
  "ingredients": [
    {"item": "nome do ingrediente", "quantity": "quantidade"}
  ],
  "instructions": [
    "Passo 1 do modo de preparo",
    "Passo 2 do modo de preparo"
  ],
  "prepTime": "tempo de preparo em minutos (apenas número)",
  "cookTime": "tempo de cozimento em minutos (apenas número)",
  "servings": "número de porções (apenas número)",
  "difficulty": "facil|medio|dificil",
  "category": "categoria da receita (ex: sobremesa, prato principal, etc)",
  "tags": ["tag1", "tag2", "tag3"]
}

IMPORTANTE:
- Retorne APENAS o JSON válido, sem texto adicional
- Se alguma informação não estiver visível na imagem, use null para esse campo
- Para ingredientes, separe claramente o nome do ingrediente da quantidade
- Para instruções, quebre em passos lógicos e sequenciais
- Use apenas números para prepTime, cookTime e servings
- Para difficulty, use apenas: facil, medio ou dificil
- Seja específico nas categorias (ex: "sobremesa", "prato principal", "entrada", "bebida")
- Adicione tags relevantes como "vegetariano", "sem glúten", "rápido", etc.

Analise a imagem e retorne o JSON:
`;
  }

  static async analyzeRecipeImage(imageUri: string): Promise<GeminiRecipeData> {
    try {
      const base64Image = await this.convertImageToBase64(imageUri);
      const prompt = this.createPrompt();

      const requestBody = {
        contents: [
          {
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.1,
          topK: 32,
          topP: 1,
          maxOutputTokens: 2048,
        }
      };

      const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Erro na API do Gemini:', errorText);
        throw new Error(`Erro na API do Gemini: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Resposta inválida da API do Gemini');
      }

      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Tentar extrair JSON da resposta
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Não foi possível extrair dados estruturados da imagem');
      }

      const recipeData = JSON.parse(jsonMatch[0]);
      
      // Validar e limpar os dados
      return this.validateAndCleanData(recipeData);
      
    } catch (error) {
      console.error('Erro ao analisar imagem com Gemini:', error);
      throw new Error('Não foi possível analisar a imagem. Tente novamente.');
    }
  }

  private static validateAndCleanData(data: any): GeminiRecipeData {
    const cleaned: GeminiRecipeData = {};

    if (data.title && typeof data.title === 'string') {
      cleaned.title = data.title.trim();
    }

    if (data.description && typeof data.description === 'string') {
      cleaned.description = data.description.trim();
    }

    if (Array.isArray(data.ingredients)) {
      cleaned.ingredients = data.ingredients
        .filter((ing: any) => ing && typeof ing.item === 'string' && typeof ing.quantity === 'string')
        .map((ing: any) => ({
          item: ing.item.trim(),
          quantity: ing.quantity.trim()
        }));
    }

    if (Array.isArray(data.instructions)) {
      cleaned.instructions = data.instructions
        .filter((inst: any) => typeof inst === 'string' && inst.trim())
        .map((inst: any) => inst.trim());
    }

    if (data.prepTime && typeof data.prepTime === 'string') {
      const prepTime = data.prepTime.replace(/\D/g, '');
      if (prepTime) {
        cleaned.prepTime = prepTime;
      }
    }

    if (data.cookTime && typeof data.cookTime === 'string') {
      const cookTime = data.cookTime.replace(/\D/g, '');
      if (cookTime) {
        cleaned.cookTime = cookTime;
      }
    }

    if (data.servings && typeof data.servings === 'string') {
      const servings = data.servings.replace(/\D/g, '');
      if (servings) {
        cleaned.servings = servings;
      }
    }

    if (data.difficulty && ['facil', 'medio', 'dificil'].includes(data.difficulty)) {
      cleaned.difficulty = data.difficulty;
    }

    if (data.category && typeof data.category === 'string') {
      cleaned.category = data.category.trim();
    }

    if (Array.isArray(data.tags)) {
      cleaned.tags = data.tags
        .filter((tag: any) => typeof tag === 'string' && tag.trim())
        .map((tag: any) => tag.trim());
    }

    return cleaned;
  }
}
