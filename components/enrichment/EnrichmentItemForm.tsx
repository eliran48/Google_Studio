import React, { useState, useEffect } from 'react';
import { EnrichmentItem, EnrichmentType, EnrichmentStatus } from '../../types';
import Modal from '../ui/Modal';

interface EnrichmentItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (item: Omit<EnrichmentItem, 'id' | 'createdAt'> & { id?: string }) => Promise<void>;
  item: EnrichmentItem | null;
}

const EnrichmentItemForm: React.FC<EnrichmentItemFormProps> = ({ isOpen, onClose, onSave, item }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<EnrichmentType>(EnrichmentType.ARTICLE);
  const [status, setStatus] = useState<EnrichmentStatus>(EnrichmentStatus.BACKLOG);
  const [tags, setTags] = useState(''); // Simple string for now
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setIsSaving(false);
        if (item) {
            setTitle(item.title);
            setDescription(item.description || '');
            setUrl(item.url || '');
            setType(item.type);
            setStatus(item.status);
            setTags((item.tags || []).join(', '));
        } else {
            setTitle('');
            setDescription('');
            setUrl('');
            setType(EnrichmentType.ARTICLE);
            setStatus(EnrichmentStatus.BACKLOG);
            setTags('');
        }
    }
  }, [item, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving || !title.trim()) return;

    setIsSaving(true);
    try {
        await onSave({
            id: item?.id,
            title,
            description,
            url,
            type,
            status,
            tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        });
        onClose();
    } catch (error) {
        console.error("Failed to save enrichment item:", error);
    } finally {
        setIsSaving(false);
    }
  };
  
  const commonInputClasses = "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={item ? 'עריכת פריט העשרה' : 'פריט העשרה חדש'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">כותרת</label>
          <input type="text" value={title} onChange={e => setTitle(e.target.value)} className={commonInputClasses} required />
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">קישור (URL)</label>
          <input type="url" value={url} onChange={e => setUrl(e.target.value)} className={commonInputClasses} placeholder="https://example.com"/>
        </div>
        <div>
          <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">תיאור</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} className={commonInputClasses} rows={3}></textarea>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">סוג</label>
              <select value={type} onChange={e => setType(e.target.value as EnrichmentType)} className={commonInputClasses}>
                {Object.values(EnrichmentType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">סטטוס</label>
              <select value={status} onChange={e => setStatus(e.target.value as EnrichmentStatus)} className={commonInputClasses}>
                {Object.values(EnrichmentStatus).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
        </div>
        <div>
            <label className="block mb-1 font-medium text-gray-700 dark:text-gray-200">תגיות (מופרד בפסיק)</label>
            <input type="text" value={tags} onChange={e => setTags(e.target.value)} className={commonInputClasses} placeholder="פרודוקטיביות, שיווק, AI"/>
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50">ביטול</button>
          <button type="submit" disabled={isSaving} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed w-24 text-center">
            {isSaving ? 'שומר...' : 'שמירה'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EnrichmentItemForm;