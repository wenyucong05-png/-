import React, { useState } from 'react';
import { ArrowLeft, ShoppingBag, Droplets, Smartphone, Scale } from 'lucide-react';
import { evaluateMarketInteraction } from '../../services/geminiService';

interface MarketScamProps {
  onEndGame: (result: 'won' | 'lost', message: string) => void;
  onBack: () => void;
}

const MarketScam: React.FC<MarketScamProps> = ({ onEndGame, onBack }) => {
  const [vendorMood, setVendorMood] = useState('neutral'); // neutral, suspicious, angry, happy
  const [vendorText, setVendorText] = useState("来来来！新鲜的海鱼！市场最低价！50块钱一斤，包你满意！");
  const [displayedWeight, setDisplayedWeight] = useState(1.2); // Jin
  const [actualWeight] = useState(0.8); // It's rigged
  const [hasWaterBag, setHasWaterBag] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const cost = Math.round(displayedWeight * 50);

  const handleAction = async (actionType: 'pay' | 'drain' | 'check_scale') => {
    setIsProcessing(true);
    let userActionText = "";

    if (actionType === 'pay') {
      userActionText = "行，我要了，给你钱。";
    } else if (actionType === 'drain') {
      userActionText = "老板，你这袋子里水太多了，先帮我把水沥干，或者把角剪破放水。";
    } else if (actionType === 'check_scale') {
      userActionText = "我这有个手机我知道多重，放你秤上试试准不准。";
    }

    // Call AI for reaction
    const reaction = await evaluateMarketInteraction(userActionText, vendorMood);
    setVendorText(reaction.text);
    setVendorMood(reaction.newMood);

    // Logic for game state
    if (actionType === 'pay') {
      setIsProcessing(false);
      onEndGame('lost', `你付了 ${cost} 元，但这条鱼实际只值 ${(actualWeight * 50).toFixed(0)} 元。这台秤是“八两秤”（调快了），而且袋子里装了很重的水。`);
      return;
    }

    if (actionType === 'drain') {
      if (hasWaterBag) {
        setHasWaterBag(false);
        // Reduce displayed weight partially
        setDisplayedWeight(prev => Math.max(prev - 0.2, actualWeight)); 
      }
    }

    if (actionType === 'check_scale') {
        // If we check scale, the displayed weight resets to closer to actual, or vendor kicks us out
        if (reaction.newMood === 'angry') {
             setIsProcessing(false);
             onEndGame('won', "摊主心虚生气了，因为你要验秤，他拒绝卖给你。你成功避开了“鬼秤”欺诈！使用随身物品验秤是防范鬼秤的有效方法。");
             return;
        }
    }

    setIsProcessing(false);
  };

  const getMoodEmoji = () => {
      if (vendorMood === 'happy') return '😊';
      if (vendorMood === 'angry') return '😡';
      if (vendorMood === 'suspicious') return '😒';
      return '😐';
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white p-4 shadow-sm flex items-center gap-3 sticky top-0 z-10 border-b border-gray-100">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <h1 className="font-bold text-lg text-slate-800 flex items-center gap-2">
            <Scale className="w-5 h-5 text-blue-600" />
            海鲜摊位挑战
        </h1>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center space-y-6 overflow-y-auto">
        
        {/* Vendor Area */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-lg border border-blue-50 relative mt-4">
          <div className="absolute -top-3 left-6 bg-blue-600 text-white px-3 py-1 rounded-lg text-[10px] font-bold shadow-md uppercase tracking-wide">
            摊主 (AI扮演)
          </div>
          <div className="flex flex-col items-center text-center mt-2">
             <div className="text-6xl mb-4 bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center border-4 border-white shadow-inner animate-in zoom-in duration-300">
                 {getMoodEmoji()}
             </div>
             <div className="bg-gray-100 p-4 rounded-2xl rounded-tr-none w-full relative shadow-sm">
                <p className="text-gray-800 font-medium leading-relaxed">"{vendorText}"</p>
                <div className="absolute -bottom-2 -left-2 text-6xl opacity-10 rotate-12 pointer-events-none">🐟</div>
             </div>
          </div>
        </div>

        {/* Scale Visualization */}
        <div className="w-full max-w-xs bg-gray-800 rounded-xl p-4 text-center shadow-2xl ring-4 ring-gray-200 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:animate-ping"></div>
           <p className="text-gray-400 text-[10px] mb-1 uppercase tracking-widest">Digital Scale</p>
           <div className="bg-[#2a3038] rounded-lg p-4 font-mono text-green-500 text-5xl font-bold tracking-widest shadow-inner border border-gray-700 relative">
             {displayedWeight.toFixed(2)} 
             <span className="text-sm absolute bottom-4 right-4 text-gray-500">斤</span>
           </div>
           <div className="mt-4 flex justify-between text-gray-400 text-xs border-t border-gray-700 pt-3">
             <span className="bg-gray-700 px-2 py-1 rounded">单价: 50/斤</span>
             <span className="text-white font-bold bg-green-900 px-2 py-1 rounded">总价: {Math.round(displayedWeight * 50)} 元</span>
           </div>
        </div>

        {/* Action Controls */}
        <div className="w-full max-w-md grid grid-cols-2 gap-3 pb-8">
            <button 
                onClick={() => handleAction('pay')}
                disabled={isProcessing}
                className="col-span-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 active:scale-95"
            >
                <ShoppingBag className="w-5 h-5" /> 
                <span>直接支付 {Math.round(displayedWeight * 50)} 元</span>
            </button>
            
            <button 
                onClick={() => handleAction('drain')}
                disabled={isProcessing || !hasWaterBag}
                className={`bg-white border-2 border-blue-100 hover:border-blue-300 text-blue-800 py-3 rounded-xl font-bold text-sm shadow-sm flex flex-col items-center justify-center gap-1 transition-all ${!hasWaterBag ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:-translate-y-0.5 hover:bg-blue-50'}`}
            >
                <Droplets className={`w-5 h-5 ${hasWaterBag ? 'text-blue-500' : 'text-gray-400'}`} />
                {hasWaterBag ? "要求沥水/去袋" : "水已沥干"}
            </button>

            <button 
                onClick={() => handleAction('check_scale')}
                disabled={isProcessing}
                className="bg-white border-2 border-purple-100 hover:border-purple-300 text-purple-800 py-3 rounded-xl font-bold text-sm shadow-sm flex flex-col items-center justify-center gap-1 transition-all hover:-translate-y-0.5 hover:bg-purple-50"
            >
                <Smartphone className="w-5 h-5 text-purple-500" /> 
                拿出手机验秤
            </button>
        </div>

      </div>
    </div>
  );
};

export default MarketScam;