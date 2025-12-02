import React from 'react';
import { Edit2, X, Copy, FileText, Plus, Save } from 'lucide-react';

interface ActionBarProps {
  isEditing: boolean;
  hasText: boolean;
  onToggleEdit: () => void;
  onCopy: () => void;
  onExport: () => void;
  onNewSession: () => void;
  onSave: () => void;
}

export const ActionBar: React.FC<ActionBarProps> = ({
  isEditing,
  hasText,
  onToggleEdit,
  onCopy,
  onExport,
  onNewSession,
  onSave
}) => {
  const btnClass = "flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold text-white shadow transition-colors";

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
      
      {/* Edit Button */}
      <button
        onClick={onToggleEdit}
        className={`${btnClass} ${isEditing ? 'bg-action-red hover:bg-red-700' : 'bg-action-blue hover:bg-blue-700'}`}
      >
        {isEditing ? <X size={18} /> : <Edit2 size={18} />}
        <span>{isEditing ? 'إلغاء' : 'تعديل'}</span>
      </button>

      {/* Save Button (Only in Edit Mode) */}
      <button
        onClick={onSave}
        disabled={!isEditing}
        className={`${btnClass} ${isEditing ? 'bg-action-green hover:bg-green-700' : 'bg-gray-300 cursor-not-allowed'}`}
      >
        <Save size={18} />
        <span>حفظ</span>
      </button>

      {/* Copy Button */}
      <button
        onClick={onCopy}
        className={`${btnClass} bg-action-purple hover:bg-purple-800`}
      >
        <Copy size={18} />
        <span>نسخ</span>
      </button>

      {/* Export TXT */}
      <button
        onClick={onExport}
        className={`${btnClass} bg-action-cyan hover:bg-cyan-700`}
      >
        <FileText size={18} />
        <span>تصدير TXT</span>
      </button>

      {/* New Session */}
      <button
        onClick={onNewSession}
        className={`${btnClass} bg-action-teal hover:bg-teal-700`}
      >
        <Plus size={18} />
        <span>جلسة جديدة</span>
      </button>
    </div>
  );
};