import React, { useState, useMemo } from 'react';
import { EnrichmentItem, EnrichmentType, EnrichmentStatus } from '../../types';
import Card from '../ui/Card';
import { PlusIcon, EditIcon, TrashIcon, SparklesIcon } from '../ui/Icons';

interface EnrichmentViewProps {
  items: EnrichmentItem[];
  onEditItem: (item: EnrichmentItem) => void;
  onDeleteItem: (item: EnrichmentItem) => void;
}

const typeStyles: Record<EnrichmentType, string> = {
    [EnrichmentType.BOOK]: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    [EnrichmentType.PODCAST]: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    [EnrichmentType.VIDEO]: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
    [EnrichmentType.ARTICLE]: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    [EnrichmentType.COURSE]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    [EnrichmentType.OTHER]: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
};

const statusStyles: Record<EnrichmentStatus, string> = {
    [EnrichmentStatus.BACKLOG]: 'border-gray-400',
    [EnrichmentStatus.IN_PROGRESS]: 'border-blue-500 animate-pulse',
    [EnrichmentStatus.COMPLETED]: 'border-green-500',
};

const EnrichmentCard: React.FC<{ item: EnrichmentItem; onEdit: (item: EnrichmentItem) => void; onDelete: (item: EnrichmentItem) => void; }> = ({ item, onEdit, onDelete }) => {
    return (
        <Card className={`group flex flex-col justify-between hover:shadow-xl transition-shadow relative border-l-4 ${statusStyles[item.status]}`}>
            <div className="flex-grow">
                <div className="flex justify-between items-start">
                    <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${typeStyles[item.type]}`}>{item.type}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                         <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-indigo-600"><EditIcon className="w-4 h-4" /></button>
                         <button onClick={() => onDelete(item)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4" /></button>
                    </div>
                </div>
                <h3 className="mt-2 text-lg font-bold text-gray-800 dark:text-gray-100">{item.title}</h3>
                {item.description && <p className="mt-1 text-sm text-gray-600 dark:text-gray-200 line-clamp-3">{item.description}</p>}
            </div>
            <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                {item.url && (
                    <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200"
                    >
                        פתח קישור &rarr;
                    </a>
                )}
            </div>
        </Card>
    );
}

const EnrichmentView: React.FC<EnrichmentViewProps> = ({ items, onEditItem, onDeleteItem }) => {
    const [filter, setFilter] = useState<'all' | EnrichmentType>('all');
    
    const filteredItems = useMemo(() => {
        if (filter === 'all') return items;
        return items.filter(item => item.type === filter);
    }, [items, filter]);

    const sortedItems = useMemo(() => {
        return [...filteredItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [filteredItems]);

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">העשרה והשראה</h2>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <select 
                            value={filter} 
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 focus:ring-indigo-500 focus:border-indigo-500 text-sm text-gray-700 dark:text-gray-200"
                        >
                            <option value="all">כל הסוגים</option>
                            {Object.values(EnrichmentType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {sortedItems.length === 0 ? (
                <Card>
                    <div className="text-center py-8">
                        <SparklesIcon className="w-12 h-12 mx-auto text-gray-400" />
                        <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">אין פריטי העשרה</h3>
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                           {filter === 'all' ? 'הוסף פריט חדש כדי להתחיל!' : `לא נמצאו פריטים מסוג "${filter}".`}
                        </p>
                    </div>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {sortedItems.map(item => (
                        <EnrichmentCard key={item.id} item={item} onEdit={onEditItem} onDelete={onDeleteItem} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EnrichmentView;