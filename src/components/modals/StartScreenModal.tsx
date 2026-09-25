import React from 'react';
import { Play, HelpCircle, GraduationCap, Sparkles } from 'lucide-react';

interface StartScreenModalProps {
  onStart: () => void;
  onHowToPlay: () => void;
  onTeacherMode: () => void;
}

export const StartScreenModal: React.FC<StartScreenModalProps> = ({
  onStart,
  onHowToPlay,
  onTeacherMode,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 select-none">
      <div className="bg-[#faf6ef]/98 backdrop-blur-sm rounded-3xl p-8 max-w-3xl w-full shadow-2xl border-2 border-amber-200 text-center relative overflow-hidden">
        {/* Background glow orbs */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-sky-200/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Title Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-black uppercase text-amber-800 tracking-wider mb-4 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          NCERT Class 6 Social Science • Family & Community
        </div>

        <h1 className="text-4xl xl:text-5xl font-black text-sky-950 font-display tracking-tight leading-tight">
          COMMUNITY <span className="text-orange-600">BUILDER</span>
        </h1>
        <p className="text-base font-bold text-slate-500 mt-1 mb-6">
          "Build Together. Learn Together. Grow Together."
        </p>

        {/* Two Team Showcase Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {/* Team Knowledge */}
          <div className="p-5 rounded-2xl bg-sky-50/80 border-2 border-sky-300 text-left relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-sky-400 shadow-md bg-sky-100">
                <img
                  src="./images/avatar-boy.jpg"
                  alt="Team Knowledge"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const el = e.target as HTMLElement;
                    el.style.display = 'none';
                    el.parentElement!.innerHTML = '<div class="w-full h-full bg-sky-500 text-white flex items-center justify-center font-black text-xl">TK</div>';
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-sky-950 font-display">
                  TEAM KNOWLEDGE
                </h3>
                <div className="text-xs font-bold text-sky-700">
                  Explore • Learn • Build
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Explore family types, intergenerational kinship ties, and civic responsibilities.
            </p>
          </div>

          {/* Team Heritage */}
          <div className="p-5 rounded-2xl bg-orange-50/80 border-2 border-orange-300 text-left relative overflow-hidden shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-orange-400 shadow-md bg-orange-100">
                <img
                  src="./images/avatar-girl.jpg"
                  alt="Team Heritage"
                  className="w-full h-full object-cover object-top"
                  onError={(e) => {
                    const el = e.target as HTMLElement;
                    el.style.display = 'none';
                    el.parentElement!.innerHTML = '<div class="w-full h-full bg-orange-500 text-white flex items-center justify-center font-black text-xl">TH</div>';
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-black text-orange-950 font-display">
                  TEAM HERITAGE
                </h3>
                <div className="text-xs font-bold text-orange-700">
                  Analyse • Collaborate • Grow
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Analyse community interdependence, public amenities, and collaborative celebration.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-blue-700 text-white font-black text-base shadow-lg shadow-sky-500/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
          >
            <Play className="w-5 h-5 fill-white" />
            START BUILDING
          </button>

          <button
            onClick={onHowToPlay}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm border border-slate-300 transition-all flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" />
            HOW TO PLAY
          </button>

          <button
            onClick={onTeacherMode}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-sm border border-amber-300 transition-all flex items-center justify-center gap-2"
          >
            <GraduationCap className="w-4 h-4" />
            TEACHER MODE
          </button>
        </div>
      </div>
    </div>
  );
};
