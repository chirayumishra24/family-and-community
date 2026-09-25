import React, { useEffect } from 'react';
import { Sparkles, Users, School, PartyPopper, Check } from 'lucide-react';
import confetti from 'canvas-confetti';

interface CommunityEventModalProps {
  event: 'community-day' | 'school-opening' | 'community-festival' | 'thriving-community';
  onClose: () => void;
}

export const CommunityEventModal: React.FC<CommunityEventModalProps> = ({ event, onClose }) => {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  }, [event]);

  const eventData = {
    'community-day': {
      title: 'COMMUNITY DAY!',
      subtitle: '5 Developments Completed',
      icon: <Users className="w-10 h-10 text-sky-600" />,
      desc: 'Families and neighbours gather across the new public spaces to meet, share stories, and celebrate community bonds!',
      bg: 'from-sky-500 to-indigo-600',
    },
    'school-opening': {
      title: 'SCHOOL OPENING CEREMONY!',
      subtitle: '10 Developments Completed',
      icon: <School className="w-10 h-10 text-emerald-600" />,
      desc: 'The school gates swing open! Children assemble for morning prayers, nutritious Midday Meals, and joyful learning together.',
      bg: 'from-emerald-500 to-teal-600',
    },
    'community-festival': {
      title: 'COMMUNITY FESTIVAL FAIR!',
      subtitle: '15 Developments Completed',
      icon: <PartyPopper className="w-10 h-10 text-amber-500" />,
      desc: 'The fairgrounds illuminate with festive lights and folk performances! Families celebrate togetherness and regional harmony.',
      bg: 'from-amber-500 to-orange-600',
    },
    'thriving-community': {
      title: 'THRIVING COMMUNITY COMPLETE!',
      subtitle: 'All 20 Developments Achieved',
      icon: <Sparkles className="w-10 h-10 text-yellow-500" />,
      desc: '“A community grows when people contribute, cooperate and care for one another.” Our entire neighborhood is vibrant and connected!',
      bg: 'from-blue-600 via-indigo-600 to-purple-600',
    },
  }[event];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border-2 border-amber-300 text-center relative overflow-hidden">
        {/* Top Glow Bar */}
        <div className={`absolute top-0 left-0 right-0 h-3 bg-gradient-to-r ${eventData.bg}`} />

        <div className="w-20 h-20 rounded-3xl bg-amber-50 border-2 border-amber-200 shadow-md flex items-center justify-center mx-auto mb-4">
          {eventData.icon}
        </div>

        <div className="text-xs font-black tracking-widest uppercase text-amber-600 mb-1">
          {eventData.subtitle}
        </div>

        <h3 className="text-2xl font-black text-slate-800 font-display mb-3">
          {eventData.title}
        </h3>

        <p className="text-sm text-slate-600 leading-relaxed mb-6">
          {eventData.desc}
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-sm tracking-wider shadow-lg shadow-sky-500/30 transition-all active:scale-[0.99] flex items-center justify-center gap-2"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>CONTINUE BUILDING</span>
        </button>
      </div>
    </div>
  );
};
