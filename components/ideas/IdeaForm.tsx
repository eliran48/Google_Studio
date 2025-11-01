import React, { useState, useEffect } from 'react';
import { Idea, IdeaCategory, IdeaImpact, IdeaEffort } from '../../types';
import Modal from '../ui/Modal';

interface IdeaFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (idea: Omit<Idea, 'id'> & { id?: string }) => void;
  idea: Idea | null;
}

const IdeaForm: React.FC<IdeaFormProps> = ({ isOpen, onClose, onSave, idea }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IdeaCategory>(IdeaCategory.PRODUCT);
  const [impact, setImpact] = useState<IdeaImpact>(IdeaImpact.MEDIUM);
  const [effort, setEffort] = useState<IdeaEffort>(IdeaEffort.MEDIUM);

   useEffect(() => {
    if (isOpen) {
      if (idea) {
        setTitle(idea.title);
        setDescription(idea.description);
        setCategory(idea.category);
        setImpact(idea.impact);
        setEffort(idea.effort);
      } else {
        setTitle('');
        setDescription('');
        setCategory(IdeaCategory.PRODUCT);
        setImpact(IdeaImpact.MEDIUM);
        setEffort(IdeaEffort.MEDIUM);
      }
    }
  }, [idea, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;
    
    onSave({ 
        id: idea?.id,
        title, 
        description, 
        category, 
        impact, 
        effort 
    });
  };
  
  const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={idea ? 'עריכת רעיון' : 'רעיון חדש'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium">כותרת הרעיון</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={commonInputClasses}
            required
          />
        </div>
        <div>
          <label className="block mb-1 font-medium">תיאור</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={commonInputClasses}
            rows={4}
            required
          ></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
                <label className="block mb-1 font-medium">קטגוריה</label>
                <select value={category} onChange={e => setCategory(e.target.value as IdeaCategory)} className={commonInputClasses}>
                    {Object.values(IdeaCategory).map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>
             <div>
                <label className="block mb-1 font-medium">השפעה</label>
                <select value={impact} onChange={e => setImpact(e.target.value as IdeaImpact)} className={commonInputClasses}>
                    {Object.values(IdeaImpact).map(i => <option key={i} value={i}>{i}</option>)}
                </select>
            </div>
             <div>
                <label className="block mb-1 font-medium">מאמץ</label>
                <select value={effort} onChange={e => setEffort(e.target.value as IdeaEffort)} className={commonInputClasses}>
                    {Object.values(IdeaEffort).map(e => <option key={e} value={e}>{e}</option>)}
                </select>
            </div>
        </div>
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">ביטול</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">שמור רעיון</button>
        </div>
      </form>
    </Modal>
  );
};

export default IdeaForm;