import React from 'react';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

interface ChartInsightProps {
  title?: string;
  text: string;
  variant?: 'default' | 'success' | 'warning' | 'info';
}

const ChartInsight: React.FC<ChartInsightProps> = ({ 
  title = 'Insight', 
  text,
  variant = 'default'
}) => {
  const variantStyles = {
    default: 'bg-blue-500/10 border-blue-500/30 text-blue-300',
    success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
    warning: 'bg-amber-500/10 border-amber-500/30 text-amber-300',
    info: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300',
  };

  const iconColors = {
    default: 'text-blue-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    info: 'text-cyan-400',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.4 }}
      className={`mt-4 p-4 rounded-xl border backdrop-blur-sm ${variantStyles[variant]}`}
    >
      <div className="flex items-start gap-3">
        <Lightbulb className={`w-5 h-5 mt-0.5 flex-shrink-0 ${iconColors[variant]}`} />
        <div className="flex-1">
          <p className="text-sm font-semibold mb-1">{title}</p>
          <p className="text-sm leading-relaxed opacity-90">{text}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default ChartInsight;
