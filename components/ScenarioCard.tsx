import React from 'react';
import { ShieldAlert, Scale, MessageCircle, Heart, PhoneOff, Star, ChevronRight } from 'lucide-react';

interface ScenarioCardProps {
  title: string;
  description: string;
  icon: 'market' | 'chat' | 'impersonate' | 'crypto' | 'service';
  difficulty: number;
  onClick: () => void;
  colorClass: string;
}

const ScenarioCard: React.FC<ScenarioCardProps> = ({ title, description, icon, difficulty, onClick, colorClass }) => {
  const getIcon = () => {
    switch (icon) {
      case 'market': return <Scale className="w-8 h-8 text-white" />;
      case 'chat': return <MessageCircle className="w-8 h-8 text-white" />;
      case 'impersonate': return <ShieldAlert className="w-8 h-8 text-white" />;
      case 'crypto': return <Heart className="w-8 h-8 text-white" />;
      case 'service': return <PhoneOff className="w-8 h-8 text-white" />;
      default: return <ShieldAlert className="w-8 h-8 text-white" />;
    }
  };

  const renderStars = () => {
    return Array(5).fill(0).map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < difficulty ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <button 
      onClick={onClick}
      className="group relative flex items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:-translate-y-1 overflow-hidden w-full text-left"
    >
      {/* Icon Box */}
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform duration-300 ${colorClass} shrink-0 mr-4`}>
        {getIcon()}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{title}</h3>
          <div className="flex gap-0.5 ml-2 shrink-0">
            {renderStars()}
          </div>
        </div>
        <p className="text-gray-500 text-xs leading-relaxed line-clamp-2 group-hover:text-gray-600">
          {description}
        </p>
      </div>

      {/* Arrow */}
      <div className="ml-3 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
        <ChevronRight className="w-6 h-6" />
      </div>
    </button>
  );
};

export default ScenarioCard;