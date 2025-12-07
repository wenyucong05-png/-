import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Shield, AlertTriangle, MoreHorizontal, Mic, Smile, Bot, Phone } from 'lucide-react';
import { Message, ChatScenarioConfig } from '../../types';
import { generateScammerResponse } from '../../services/geminiService';

interface ChatScamProps {
  scenarioConfig: ChatScenarioConfig;
  onEndGame: (result: 'won' | 'lost', message: string) => void;
  onBack: () => void;
}

// 使用比较符合描述的机器人形象
const ROBOT_AVATAR = "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=AntiFraudBot&backgroundColor=b6e3f4"; 

const ChatScam: React.FC<ChatScamProps> = ({ scenarioConfig, onEndGame, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Initialize chat
  useEffect(() => {
    setMessages([
      {
        id: '1',
        sender: 'scammer',
        text: scenarioConfig.initialMessage,
        timestamp: Date.now(),
      }
    ]);
  }, [scenarioConfig]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, showHint]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const newMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: inputValue,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);
    setShowHint(false);

    const lowerText = inputValue.toLowerCase();
    
    // Win conditions
    if (lowerText.includes('报警') || lowerText.includes('警察') || lowerText.includes('骗子') || lowerText.includes('假的') || lowerText.includes('拉黑') || lowerText.includes('不信') || lowerText.includes('核实')) {
      setIsTyping(false);
      setTimeout(() => onEndGame('won', '你成功保持了警惕并识破了骗局！对于任何转账要求，核实身份是第一位的。'), 1500);
      return;
    }

    // Loss conditions
    if (lowerText.includes('转账') || lowerText.includes('汇款') || lowerText.includes('卡号') || lowerText.includes('支付') || lowerText.includes('密码') || lowerText.includes('验证码') || lowerText.includes('屏幕共享')) {
      setIsTyping(false);
      setTimeout(() => onEndGame('lost', '【警报】你泄露了敏感信息或进行了转账操作！在真实场景中，资金可能已经被转移。'), 1500);
      return;
    }

    // AI Response
    try {
      const responseText = await generateScammerResponse(
        messages.filter(m => m.sender !== 'mascot'), 
        newMsg,
        scenarioConfig.scammerPersona,
        scenarioConfig.goal
      );

      const replyMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'scammer',
        text: responseText,
        timestamp: Date.now(),
      };

      // Add blurred sensitive info simulation randomly
      if (Math.random() > 0.8 && scenarioConfig.difficulty > 2) {
         replyMsg.isBlurred = true;
         replyMsg.text = "【对方发送了一个文件/链接】";
      }

      setTimeout(() => {
        setMessages(prev => [...prev, replyMsg]);
        setIsTyping(false);
        
        // Mascot Hint Logic (Random chance after scammer replies)
        if (Math.random() > 0.6 && messages.length > 2) {
            setTimeout(() => {
               setShowHint(true);
            }, 800);
        }
      }, 1500 + Math.random() * 1000); // Simulate typing delay

    } catch (e) {
      console.error(e);
      setIsTyping(false);
    }
  };

  const handleQuickReply = (text: string) => {
    setInputValue(text);
  };

  // Determine header color based on "platform"
  const getHeaderStyle = () => {
      if (scenarioConfig.platform === 'wechat') return 'bg-[#EDEDED] text-black border-b border-gray-300';
      if (scenarioConfig.platform === 'dating') return 'bg-pink-50 text-pink-900 border-b border-pink-100';
      return 'bg-slate-800 text-white';
  };

  const getBubbleStyle = (sender: string) => {
      if (sender === 'user') {
          return 'bg-[#95EC69] text-black border border-[#8ADF63]';
      }
      if (sender === 'scammer') {
          return 'bg-white text-black border border-gray-200';
      }
      return 'bg-blue-100 text-blue-800 border border-blue-200 text-xs py-2'; // Mascot
  };

  const getAvatar = (sender: string) => {
      if (sender === 'user') {
          return "https://api.dicebear.com/9.x/avataaars/svg?seed=Felix&backgroundColor=c0aede";
      }
      if (sender === 'scammer') {
          if (scenarioConfig.platform === 'dating') return "https://api.dicebear.com/9.x/avataaars/svg?seed=Jessica&style=circle"; // Attractive avatar
          if (scenarioConfig.platform === 'service') return "https://api.dicebear.com/9.x/initials/svg?seed=KF&backgroundColor=0052cc&textColor=ffffff"; // Official looking
          return "https://api.dicebear.com/9.x/avataaars/svg?seed=Scammer&style=circle&top=hat";
      }
      return ""; 
  };

  return (
    <div className="flex flex-col h-full bg-[#F5F5F5] relative font-sans overflow-hidden">
      {/* Header */}
      <div className={`px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm ${getHeaderStyle()}`}>
        <button onClick={onBack} className="flex items-center gap-1 -ml-2 px-2 py-1 rounded hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-medium">返回</span>
        </button>
        <div className="flex flex-col items-center">
          <span className="font-bold text-base flex items-center gap-2">
            {scenarioConfig.title}
          </span>
          {scenarioConfig.platform === 'wechat' && <span className="text-[10px] text-gray-500 opacity-80">微信安全中心提醒您注意甄别</span>}
        </div>
        <button className="p-2 hover:bg-black/5 rounded-full">
            <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Safety Warning */}
      <div className="bg-orange-50 px-4 py-2 border-b border-orange-100 flex items-center justify-center gap-2 text-center relative z-20 shadow-sm">
        <Shield className="w-4 h-4 text-orange-600 animate-pulse" />
        <p className="text-[11px] text-orange-700 font-bold">
           反诈卫士提示：这是模拟环境，请勿输入真实密码。
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F5F5F5] pb-24">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
          >
            {msg.sender === 'scammer' && (
                <img src={getAvatar('scammer')} alt="Scammer" className="w-10 h-10 rounded-lg shadow-sm bg-gray-200" />
            )}

            <div
              className={`relative max-w-[70%] rounded-lg px-4 py-2.5 shadow-sm text-sm leading-relaxed ${getBubbleStyle(msg.sender)}`}
            >
               {msg.sender === 'scammer' && (
                   <div className="absolute top-3 -left-1.5 w-3 h-3 bg-white border-l border-b border-gray-200 transform rotate-45"></div>
               )}
               {msg.sender === 'user' && (
                   <div className="absolute top-3 -right-1.5 w-3 h-3 bg-[#95EC69] border-t border-r border-[#8ADF63] transform rotate-45"></div>
               )}

              <p className={msg.isBlurred ? 'blur-[3px] select-none text-red-500 font-bold' : ''}>{msg.text}</p>
              {msg.isBlurred && <span className="text-[10px] text-red-500 italic block mt-1 pt-1 border-t border-red-100">⚠️ 高危信息已自动屏蔽</span>}
            </div>

            {msg.sender === 'user' && (
                <img src={getAvatar('user')} alt="Me" className="w-10 h-10 rounded-lg shadow-sm bg-gray-200" />
            )}
          </div>
        ))}

        {/* Mascot Hint Bubble */}
        {showHint && (
           <div className="flex justify-center my-6 animate-in fade-in zoom-in duration-500 sticky bottom-4 z-10">
               <div className="bg-gradient-to-r from-blue-600 to-blue-500 text-white p-3 pr-4 rounded-2xl rounded-tl-none max-w-[85%] shadow-xl flex items-start gap-3 relative border-2 border-white/20">
                  <div className="absolute -left-3 -top-6 bg-white rounded-full p-1 shadow-md border-2 border-blue-200">
                     <img src={ROBOT_AVATAR} alt="Robot" className="w-10 h-10" />
                  </div>
                  <div className="ml-6">
                      <div className="flex justify-between items-center mb-1">
                         <p className="text-xs font-bold text-blue-100">反诈小卫士</p>
                         <button onClick={() => setShowHint(false)} className="text-[10px] bg-black/20 px-2 rounded hover:bg-black/30">关闭</button>
                      </div>
                      <p className="text-xs font-medium leading-relaxed">
                          {scenarioConfig.goal.includes('屏幕') 
                             ? "警惕！正规客服绝不会让你下载会议软件开启“屏幕共享”。一旦开启，你的验证码和密码都会被对方看见！" 
                             : scenarioConfig.goal.includes('投资') 
                             ? "注意！“内部消息”、“稳赚不赔”都是假象。网络恋人带你理财，就是典型的“杀猪盘”！"
                             : "小心！如果对方让你转账到“安全账户”或“解冻账户”，百分之百是诈骗！"}
                      </p>
                  </div>
               </div>
           </div>
        )}

        {isTyping && (
          <div className="flex justify-start items-center gap-2 pl-14">
             <span className="text-xs text-gray-400">对方正在输入...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="bg-[#F7F7F7] p-3 border-t border-gray-300 sticky bottom-0 z-30 pb-safe">
        
        {/* Quick Actions */}
        {messages.length < 10 && (
          <div className="flex gap-2 mb-3 overflow-x-auto scrollbar-hide pb-1 px-1">
             <button onClick={() => handleQuickReply("你是谁？")} className="px-3 py-1.5 bg-white border border-gray-200 text-xs text-gray-700 rounded-full shadow-sm whitespace-nowrap active:bg-gray-100 hover:scale-105 transition-transform">你是谁？</button>
             <button onClick={() => handleQuickReply("我要报警了！")} className="px-3 py-1.5 bg-white border border-gray-200 text-xs text-red-600 font-medium rounded-full shadow-sm whitespace-nowrap active:bg-gray-100 hover:scale-105 transition-transform">😡 我要报警了</button>
             <button onClick={() => handleQuickReply("真的吗？我要核实一下。")} className="px-3 py-1.5 bg-white border border-gray-200 text-xs text-blue-600 font-medium rounded-full shadow-sm whitespace-nowrap active:bg-gray-100 hover:scale-105 transition-transform">🤔 我要核实一下</button>
             <button onClick={() => handleQuickReply("我不信，除非你视频。")} className="px-3 py-1.5 bg-white border border-gray-200 text-xs text-gray-700 rounded-full shadow-sm whitespace-nowrap active:bg-gray-100 hover:scale-105 transition-transform">我不信</button>
          </div>
        )}
        
        <div className="flex items-end gap-2">
          <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
             <Mic className="w-6 h-6" />
          </button>
          <div className="flex-1 bg-white rounded-xl border border-gray-300 min-h-[40px] flex items-center px-3 shadow-inner focus-within:ring-2 focus-within:ring-green-400 transition-all">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="发送消息..."
                className="flex-1 bg-transparent border-none outline-none text-sm py-2"
              />
          </div>
          <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
             <Smile className="w-6 h-6" />
          </button>
          {inputValue.trim() ? (
              <button 
                onClick={handleSend}
                className="bg-[#95EC69] text-[#06ad5d] hover:bg-[#85d65c] px-4 py-2 rounded-xl font-bold text-sm transition-all shadow-sm active:scale-95"
              >
                发送
              </button>
          ) : (
              <button className="p-2 text-gray-600 hover:bg-gray-200 rounded-full transition-colors">
                 <MoreHorizontal className="w-6 h-6" />
              </button>
          )}
        </div>
        
        {/* Dangerous Actions - Simulated Menu */}
        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-gray-200 pt-3">
           <button onClick={() => onEndGame('won', '成功拉黑并举报！你做得对，对于可疑人员直接拉黑是最好的保护。')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 active:bg-red-50 group">
             <div className="bg-gray-100 p-2 rounded-full group-hover:bg-red-100 transition-colors">
                <AlertTriangle className="w-4 h-4 text-gray-600 group-hover:text-red-500" /> 
             </div>
             <span className="text-[10px] text-gray-500 font-medium">举报拉黑</span>
           </button>

           <button onClick={() => onEndGame('lost', '你接受了视频通话，对方使用AI换脸技术骗取了你的信任！')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 active:bg-blue-50 group">
             <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-100 transition-colors">
                <Phone className="w-4 h-4 text-gray-600 group-hover:text-blue-500" />
             </div>
             <span className="text-[10px] text-gray-500 font-medium">视频通话</span>
           </button>

           <button onClick={() => onEndGame('lost', '你进行了转账操作！资金瞬间被转移，追回难度极大。')} className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-gray-100 active:bg-green-50 group">
             <div className="bg-gray-100 p-2 rounded-full group-hover:bg-green-100 transition-colors">
                <div className="w-4 h-4 border-2 border-gray-600 group-hover:border-green-600 rounded-full flex items-center justify-center text-[8px] group-hover:text-green-600 font-bold">¥</div>
             </div>
             <span className="text-[10px] text-gray-500 font-medium">立即转账</span>
           </button>
        </div>
      </div>
    </div>
  );
};

export default ChatScam;