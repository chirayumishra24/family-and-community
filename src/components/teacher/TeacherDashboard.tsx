import React, { useState } from 'react';
import { Question, QuestionCategory, DifficultyLevel, QuestionType } from '../../types/community';
import {
  GraduationCap,
  Plus,
  Trash2,
  Edit3,
  Check,
  X,
  Search,
  BookOpen,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';

interface TeacherDashboardProps {
  questions: Question[];
  onUpdateQuestions: (updated: Question[]) => void;
  onExit: () => void;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  questions,
  onUpdateQuestions,
  onExit,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [currentEdit, setCurrentEdit] = useState<Partial<Question>>({
    id: `q-custom-${Date.now()}`,
    question: '',
    type: 'mcq',
    options: ['', '', '', ''],
    correctAnswer: 0,
    category: 'family',
    difficulty: 'easy',
    explanation: '',
    buildingReward: 'Houses & Families',
  });

  const categories: QuestionCategory[] = [
    'family',
    'family-types',
    'kinship',
    'relationships',
    'responsibilities',
    'values',
    'community',
    'cooperation',
    'interdependence',
    'community-services',
    'shared-spaces',
    'community-life',
    'festivals',
  ];

  const filteredQuestions = questions.filter((q) => {
    const matchesCat = filterCategory === 'all' || q.category === filterCategory;
    const matchesSearch =
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.explanation.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleSave = () => {
    if (!currentEdit.question || !currentEdit.explanation) return;
    const existingIdx = questions.findIndex((q) => q.id === currentEdit.id);
    let updated: Question[];
    if (existingIdx >= 0) {
      updated = [...questions];
      updated[existingIdx] = currentEdit as Question;
    } else {
      updated = [currentEdit as Question, ...questions];
    }
    onUpdateQuestions(updated);
    setIsEditing(false);
  };

  const handleDelete = (id: string) => {
    const updated = questions.filter((q) => q.id !== id);
    onUpdateQuestions(updated);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 xl:p-8 animate-in fade-in select-none">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[90vh] shadow-2xl border border-sky-200 flex flex-col overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-800 font-display">
                TEACHER DASHBOARD
              </h2>
              <p className="text-xs font-semibold text-slate-500">
                Manage Curriculum Questions, Scenarios & Building Rewards
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCurrentEdit({
                  id: `q-custom-${Date.now()}`,
                  question: '',
                  type: 'mcq',
                  options: ['', '', '', ''],
                  correctAnswer: 0,
                  category: 'family',
                  difficulty: 'easy',
                  explanation: '',
                  buildingReward: 'Houses & Families',
                });
                setIsEditing(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-md transition-colors"
            >
              <Plus className="w-4 h-4" />
              CREATE QUESTION
            </button>

            <button
              onClick={onExit}
              className="p-2.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold text-xs transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search questions or explanations..."
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c.replace('-', ' ').toUpperCase()}
                </option>
              ))}
            </select>
          </div>
          <div className="text-xs font-bold text-slate-500">
            Showing {filteredQuestions.length} of {questions.length} Questions
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-md transition-all flex items-start justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold text-[10px] uppercase">
                    {q.category}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 font-bold text-[10px] uppercase">
                    {q.type}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px] uppercase">
                    Reward: {q.buildingReward}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 mb-1">
                  {idx + 1}. {q.question}
                </h4>
                {q.options && (
                  <div className="grid grid-cols-2 gap-1.5 my-2">
                    {q.options.map((opt, oIdx) => (
                      <div
                        key={oIdx}
                        className={`p-1.5 rounded-lg text-xs font-medium border ${
                          Number(q.correctAnswer) === oIdx
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold'
                            : 'bg-white text-slate-600 border-slate-200'
                        }`}
                      >
                        {String.fromCharCode(65 + oIdx)}. {opt}
                      </div>
                    ))}
                  </div>
                )}
                <p className="text-xs text-slate-500 mt-1 italic">
                  Explanation: {q.explanation}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => {
                    setCurrentEdit(q);
                    setIsEditing(true);
                  }}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-sky-50 hover:text-sky-600 text-slate-600 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(q.id)}
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit / Create Question Modal Drawer */}
        {isEditing && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 max-w-xl w-full shadow-2xl border border-sky-200 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b pb-3">
                <h3 className="text-lg font-black text-slate-800 font-display">
                  {currentEdit.id?.startsWith('q-custom') ? 'Create Question' : 'Edit Question'}
                </h3>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Question Text:
                </label>
                <textarea
                  value={currentEdit.question || ''}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, question: e.target.value })
                  }
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-sky-400 focus:outline-none"
                  placeholder="Enter the question prompt..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Category:
                  </label>
                  <select
                    value={currentEdit.category || 'family'}
                    onChange={(e) =>
                      setCurrentEdit({
                        ...currentEdit,
                        category: e.target.value as QuestionCategory,
                      })
                    }
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Reward Building:
                  </label>
                  <input
                    type="text"
                    value={currentEdit.buildingReward || 'Houses & Families'}
                    onChange={(e) =>
                      setCurrentEdit({ ...currentEdit, buildingReward: e.target.value })
                    }
                    className="w-full p-2 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Options (A - D):
                </label>
                <div className="space-y-2">
                  {(currentEdit.options || ['', '', '', '']).map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-md bg-slate-100 font-bold text-xs flex items-center justify-center text-slate-600">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => {
                          const opts = [...(currentEdit.options || ['', '', '', ''])];
                          opts[i] = e.target.value;
                          setCurrentEdit({ ...currentEdit, options: opts });
                        }}
                        className="flex-1 p-2 rounded-xl border border-slate-300 text-xs"
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      />
                      <input
                        type="radio"
                        name="correctAnswerRadio"
                        checked={Number(currentEdit.correctAnswer) === i}
                        onChange={() => setCurrentEdit({ ...currentEdit, correctAnswer: i })}
                        className="w-4 h-4 text-emerald-600"
                        title="Mark as correct"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Educational Explanation:
                </label>
                <textarea
                  value={currentEdit.explanation || ''}
                  onChange={(e) =>
                    setCurrentEdit({ ...currentEdit, explanation: e.target.value })
                  }
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs"
                  placeholder="Explain why this answer is correct according to NCERT..."
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-md"
                >
                  Save Question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
