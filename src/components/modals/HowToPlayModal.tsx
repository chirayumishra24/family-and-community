import React from 'react';
import { X, HelpCircle, Hammer, HeartHandshake, CheckCircle2, Users, Building, Timer, Award } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl border border-sky-200 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-1">
          <div className="w-10 h-10 rounded-xl bg-sky-100 flex items-center justify-center">
            <HelpCircle className="w-6 h-6 text-sky-600" />
          </div>
          <div>
            <h3 className="text-xl font-black text-slate-800 font-display">
              HOW TO PLAY COMMUNITY BUILDER
            </h3>
            <p className="text-xs font-semibold text-slate-400">
              Class 6 Social Science: Family and Community
            </p>
          </div>
        </div>

        {/* 4 Stats Chips */}
        <div className="grid grid-cols-4 gap-2 my-5">
          <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 text-center">
            <Building className="w-5 h-5 text-sky-600 mx-auto mb-1" />
            <div className="text-sm font-black text-sky-950">20</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Developments</div>
          </div>
          <div className="p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-center">
            <Users className="w-5 h-5 text-orange-600 mx-auto mb-1" />
            <div className="text-sm font-black text-orange-950">2</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Teams</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-center">
            <Timer className="w-5 h-5 text-amber-600 mx-auto mb-1" />
            <div className="text-sm font-black text-amber-950">5 MIN</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Class Timer</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-center">
            <Award className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
            <div className="text-sm font-black text-emerald-950">1</div>
            <div className="text-[10px] font-bold text-slate-500 uppercase">Shared Town</div>
          </div>
        </div>

        {/* 3 Core Steps */}
        <div className="space-y-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center shrink-0">
              1
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">ANSWER</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Each team receives independent questions about family types, kinship terms, mutual responsibilities, and civic institutions.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500 text-white font-black flex items-center justify-center shrink-0">
              2
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">BUILD</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                A correct answer unlocks and physically constructs a new building in the 3D neighbourhood: houses, school, health centre, market, or water supply.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white font-black flex items-center justify-center shrink-0">
              3
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">GROW</h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Both teams contribute to the same town! People arrive, vehicles travel, and together you create a thriving, interdependent community.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow-md transition-colors"
        >
          GOT IT! LET'S BUILD
        </button>
      </div>
    </div>
  );
};
