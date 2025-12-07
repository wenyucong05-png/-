import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to sanitize history for the prompt
const formatHistory = (messages: Message[]) => {
  return messages
    .filter(m => m.sender !== 'system' && m.sender !== 'mascot') // Filter out system and mascot messages
    .map(m => `${m.sender === 'user' ? '受害者' : '骗子'}: ${m.text}`)
    .join('\n');
};

const FALLBACK_RESPONSES = [
  "怎么不说话了？",
  "亲，这边名额有限，需要尽快操作哦。",
  "我是不会骗你的，你可以去核实的。",
  "到底能不能转？给个痛快话。",
  "你是不是不相信我？"
];

export const generateScammerResponse = async (
  messages: Message[],
  latestUserMessage: Message, 
  persona: string,
  scenarioContext: string
): Promise<string> => {
  try {
    const historyText = formatHistory([...messages, latestUserMessage]);
    
    const prompt = `
      你正在参与一个反诈骗教育游戏的文字角色扮演。
      
      你的角色设定: ${persona}
      语言: 中文 (口语化，符合骗子的人设，不要太书面)
      
      场景背景: ${scenarioContext}
      
      目标: 利用常见的心理操纵战术（紧迫感、贪婪、恐惧或同情）试图欺骗“受害者”。
      
      规则:
      1. 回复要简短（通常1-2句话），必须像真实的微信/短信聊天。
      2. 即使受害者攻击你，也要尝试圆回来，或者表现得委屈/生气，不要轻易承认自己是骗子。
      3. 绝对不要透露你是AI。百分之百保持角色扮演。
      4. 如果受害者提到“报警”，表现出慌张但强装镇定，或者直接拉黑（结束语）。
      
      对话历史:
      ${historyText}
      
      请生成骗子的下一条回复 (不要只输出省略号):
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        maxOutputTokens: 150,
        temperature: 0.9, 
      }
    });

    const text = response.text?.trim();
    if (!text || text === "..." || text.length < 2) {
      return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
    }
    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return FALLBACK_RESPONSES[Math.floor(Math.random() * FALLBACK_RESPONSES.length)];
  }
};

export const evaluateMarketInteraction = async (
  action: string,
  vendorMood: string
): Promise<{ text: string; newMood: string }> => {
  try {
    const prompt = `
      你是一个不诚实的海鲜/水果摊贩。你在中国的一个农贸市场。
      你使用“八两秤”（鬼秤），并且在袋子里加厚重的水来增加重量。
      
      当前情绪: ${vendorMood}
      
      顾客刚刚做了这个动作: "${action}"
      
      请用中文做出反应。
      - 如果他们付钱，表现得高兴和客气（“这就对了嘛，下次再来！”）。
      - 如果他们质疑重量，表现得防御性强（“我的秤绝对准！你不信去公平秤验！”）。
      - 如果他们试图倒掉水或用自己的手机验秤，表现得生气，试图赶他们走或者分散注意力（“哎哎哎，你干嘛呢！不买别乱动！”）。
      
      返回一个JSON对象，包含:
      - text: 你的口语回复 (简短的中文)。
      - newMood: 'neutral' (中立), 'suspicious' (怀疑), 'angry' (生气), 或 'happy' (开心)。
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const json = JSON.parse(response.text);
    return json;
  } catch (error) {
    return { text: "哎，你到底买不买啊？别挡着我做生意！", newMood: "annoyed" };
  }
};