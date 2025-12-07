import React, { useState } from 'react';
import { ShieldCheck, Info, RotateCcw, Trophy, Menu, Zap, Lock, BookOpen, Star, TrendingUp, Users } from 'lucide-react';
import { GameState, ScenarioType, ChatScenarioConfig } from './types';
import ScenarioCard from './components/ScenarioCard';
import ChatScam from './components/scenarios/ChatScam';
import MarketScam from './components/scenarios/MarketScam';

// --- 配置区域 ---
// 蓝色反诈卫士机器人形象
const ROBOT_AVATAR = "https://api.dicebear.com/9.x/bottts-neutral/svg?seed=AntiFraudBot&backgroundColor=b6e3f4"; 

const INITIAL_STATE: GameState = {
  wallet: 1000,
  currentScenario: null,
  gameStatus: 'menu',
  feedback: null,
  score: 0
};

function App() {
  const [gameState, setGameState] = useState<GameState>(INITIAL_STATE);

  const startScenario = (type: ScenarioType) => {
    setGameState(prev => ({
      ...prev,
      currentScenario: type,
      gameStatus: 'playing',
      feedback: null
    }));
  };

  const handleEndGame = (result: 'won' | 'lost', message: string) => {
    const scoreChange = result === 'won' ? 100 : 0;
    setGameState(prev => ({
      ...prev,
      gameStatus: result,
      feedback: message,
      score: prev.score + scoreChange
    }));
  };

  const resetGame = () => {
    setGameState(prev => ({
      ...prev,
      currentScenario: null,
      gameStatus: 'menu',
      feedback: null
    }));
  };

  // --- 场景配置 ---
  const getChatConfig = (type: ScenarioType): ChatScenarioConfig => {
    switch (type) {
      case 'CHAT_REBATE':
        return {
          title: "兼职刷单",
          initialMessage: "亲，在吗？这边有淘宝/京东店铺需要冲销量，手机就能操作。每单立返本金+5%佣金，日结300-500元，有兴趣了解一下吗？",
          scammerPersona: "热情的'派单员'，试图用小额返利诱惑受害者，然后要求大额垫资。",
          goal: "诱导受害者进行大额转账或垫资，不要提及警察。",
          difficulty: 3,
          platform: 'wechat'
        };
      case 'CHAT_IMPERSONATION':
        return {
          title: "冒充领导/亲友",
          initialMessage: "小王啊，我是你李叔。我现在的微信号换这一个了，你存一下。对了，我现在在外面开会，有点急事需要用钱，你手头方便吗？",
          scammerPersona: "冒充长辈或领导，语气威严或亲切，制造紧急情况（如出车祸、送礼、开会）借钱。",
          goal: "利用身份权威或亲情关系，让受害者在不核实身份的情况下转账。",
          difficulty: 4,
          platform: 'wechat'
        };
      case 'CHAT_CRYPTO':
        return {
          title: "杀猪盘 (投资理财)",
          initialMessage: "早安，今天的阳光真好。昨晚跟你提到的那个ETH趋势图你看了吗？我叔叔在这个交易所带我赚了不少，你要不要试试？",
          scammerPersona: "完美的'网恋对象'或'成功人士'，温柔体贴，偶尔透露自己有内幕消息或高超的理财技巧。",
          goal: "建立情感联系，诱导受害者去虚假平台注册并投资。",
          difficulty: 5,
          platform: 'dating'
        };
      case 'CHAT_SERVICE':
        return {
          title: "百万保障客服",
          initialMessage: "您好，这里是微信支付安全中心。系统检测到您的'百万保障'服务免费体验期已结束，如果不关闭，每月将自动扣费800元。",
          scammerPersona: "专业的'官方客服'，语气严肃、规范，利用受害者对扣费的恐慌心理。",
          goal: "诱导受害者下载视频会议软件开启'屏幕共享'，或者将资金转入'安全账户'。",
          difficulty: 4,
          platform: 'service'
        };
      default:
        return {
          title: "未知场景",
          initialMessage: "...",
          scammerPersona: "骗子",
          goal: "骗钱",
          difficulty: 1,
          platform: 'wechat'
        };
    }
  };

  // --- 渲染逻辑 ---

  // 1. 结果弹窗界面
  if (gameState.gameStatus === 'won' || gameState.gameStatus === 'lost') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative overflow-hidden animate-in zoom-in duration-300">
          <div className={`absolute top-0 left-0 w-full h-2 ${gameState.gameStatus === 'won' ? 'bg-green-500' : 'bg-red-500'}`}></div>
          
          <div className="flex flex-col items-center text-center">
            <div className="relative mb-6">
               <img src={ROBOT_AVATAR} alt="Robot" className="w-24 h-24 drop-shadow-lg" />
               <div className={`absolute -bottom-2 -right-2 p-2 rounded-full border-4 border-white ${gameState.gameStatus === 'won' ? 'bg-green-500' : 'bg-red-500'}`}>
                  {gameState.gameStatus === 'won' ? <ShieldCheck className="w-6 h-6 text-white" /> : <Lock className="w-6 h-6 text-white" />}
               </div>
            </div>

            <h2 className={`text-2xl font-bold mb-2 ${gameState.gameStatus === 'won' ? 'text-green-600' : 'text-red-600'}`}>
              {gameState.gameStatus === 'won' ? '挑战成功！' : '你被骗了！'}
            </h2>
            
            <div className="bg-slate-50 p-4 rounded-xl text-slate-700 mb-6 text-sm leading-relaxed border border-slate-100">
               <span className="font-bold text-slate-900 block mb-1">反诈卫士分析：</span>
               {gameState.feedback}
            </div>

            <div className="flex gap-3 w-full">
               <button 
                 onClick={resetGame}
                 className="flex-1 py-3 px-6 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
               >
                 <Menu className="w-4 h-4" /> 返回菜单
               </button>
               {gameState.gameStatus === 'lost' && (
                 <button 
                   onClick={() => setGameState(prev => ({ ...prev, gameStatus: 'playing', feedback: null }))}
                   className="flex-1 py-3 px-6 bg-slate-100 text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                 >
                   <RotateCcw className="w-4 h-4" /> 再试一次
                 </button>
               )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 游戏进行中界面
  if (gameState.gameStatus === 'playing' && gameState.currentScenario) {
    if (gameState.currentScenario === 'MARKET') {
      return <MarketScam onEndGame={handleEndGame} onBack={resetGame} />;
    } else {
      return (
        <ChatScam 
          scenarioConfig={getChatConfig(gameState.currentScenario)} 
          onEndGame={handleEndGame}
          onBack={resetGame}
        />
      );
    }
  }

  // 3. 主菜单界面 (Menu)
  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-10">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white pb-16 pt-12 px-6 rounded-b-[40px] shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <ShieldCheck className="w-64 h-64 rotate-12" />
        </div>
        
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
           <div className="relative">
              <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-30 rounded-full"></div>
              <img src={ROBOT_AVATAR} alt="Robot" className="w-28 h-28 relative z-10 animate-in slide-in-from-left duration-700" />
           </div>
           <div className="text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-blue-500/30 px-3 py-1 rounded-full mb-2 border border-blue-400/30 backdrop-blur-sm">
                <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />
                <span className="text-xs font-semibold tracking-wider uppercase">AI 驱动 · 真实仿真</span>
              </div>
              <h1 className="text-4xl font-extrabold mb-2 tracking-tight">全民反诈模拟器</h1>
              <p className="text-blue-100 max-w-lg leading-relaxed text-sm">
                骗子手段千变万化，你能识破几个？通过模拟真实场景，提升你的防骗意识值。
              </p>
           </div>
           
           <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4 ml-auto border border-white/20">
              <div className="bg-yellow-400/20 p-2 rounded-lg">
                <Trophy className="w-8 h-8 text-yellow-300" />
              </div>
              <div>
                 <p className="text-xs text-blue-200">反诈意识分</p>
                 <p className="text-2xl font-bold font-mono">{gameState.score}</p>
              </div>
           </div>
        </div>
      </div>

      {/* Scenarios Grid */}
      <div className="max-w-4xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="md:col-span-2 mb-2 flex items-center gap-2 text-slate-500 text-sm font-medium">
             <BookOpen className="w-4 h-4" /> 选择挑战场景
          </div>

          <ScenarioCard
            title="海鲜市场鬼秤"
            description="菜市场买鱼遇到商家做手脚？体验如何识别'八两秤'和'加水袋'。"
            icon="market"
            difficulty={1}
            onClick={() => startScenario('MARKET')}
            colorClass="bg-gradient-to-br from-orange-400 to-red-500"
          />

          <ScenarioCard
            title="兼职刷单返利"
            description="轻松动手指，日赚三百？揭秘小额返利背后的巨大陷阱。"
            icon="chat"
            difficulty={3}
            onClick={() => startScenario('CHAT_REBATE')}
            colorClass="bg-gradient-to-br from-green-400 to-emerald-600"
          />

          <ScenarioCard
            title="冒充亲友/领导"
            description="微信上突然收到'老熟人'的借钱请求？小心这可能是一场骗局。"
            icon="impersonate"
            difficulty={4}
            onClick={() => startScenario('CHAT_IMPERSONATION')}
            colorClass="bg-gradient-to-br from-blue-400 to-cyan-600"
          />

          <ScenarioCard
            title="杀猪盘 (投资理财)"
            description="完美的网恋对象带你投资致富？当心在这个温柔陷阱中倾家荡产。"
            icon="crypto"
            difficulty={5}
            onClick={() => startScenario('CHAT_CRYPTO')}
            colorClass="bg-gradient-to-br from-purple-500 to-indigo-600"
          />

          <ScenarioCard
            title="百万保障/客服诈骗"
            description="微信客服来电说你开通了收费服务？警惕屏幕共享新骗术。"
            icon="service"
            difficulty={4}
            onClick={() => startScenario('CHAT_SERVICE')}
            colorClass="bg-gradient-to-br from-slate-600 to-slate-800"
          />

        </div>

        <div className="mt-8 text-center text-gray-400 text-xs">
           <p>© 2024 反诈骗科普教育 | 仅供学习参考</p>
        </div>
      </div>
    </div>
  );
}

export default App;
