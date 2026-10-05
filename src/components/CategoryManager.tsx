import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderPlus, AlertCircle, CheckCircle, Tag } from 'lucide-react';
import { Category } from '../types/library';
import { createCategory, updateCategory, deleteCategory } from '../lib/api';
import { ConfirmationModal } from './ConfirmationModal';

interface CategoryManagerProps {
  categories: Category[];
  onRefreshCategories: () => Promise<void>;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({
  categories,
  onRefreshCategories
}) => {
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  const [formName, setFormName] = useState('');
  const [formDescription, setFormDescription] = useState('');
  
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const handleStartAdd = () => {
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
    setIsAddingNew(true);
    setMessage(null);
  };

  const handleStartEdit = (category: Category) => {
    setIsAddingNew(false);
    setEditingCategory(category);
    setFormName(category.name);
    setFormDescription(category.description || '');
    setMessage(null);
  };

  const handleCancelForm = () => {
    setIsAddingNew(false);
    setEditingCategory(null);
    setFormName('');
    setFormDescription('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setMessage({ text: 'Category name is required', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      setMessage(null);

      if (editingCategory) {
        await updateCategory(editingCategory.id, formName.trim(), formDescription.trim());
        setMessage({ text: `Category "${formName}" updated successfully.`, type: 'success' });
      } else {
        await createCategory(formName.trim(), formDescription.trim());
        setMessage({ text: `Category "${formName}" created successfully.`, type: 'success' });
      }

      handleCancelForm();
      await onRefreshCategories();
    } catch (err: any) {
      setMessage({ text: err.message || 'Operation failed', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    try {
      setIsSubmitting(true);
      await deleteCategory(categoryToDelete.id);
      setMessage({ 
        text: `Category "${categoryToDelete.name}" deleted. Any attached books were reassigned to "Other".`, 
        type: 'success' 
      });
      setCategoryToDelete(null);
      await onRefreshCategories();
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to delete category', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-serif text-lg font-bold text-stone-900">
            Category Management
          </h3>
          <p className="text-xs text-stone-500">
            Organize books into genres and topics. Categories created here instantly appear across public filters and forms.
          </p>
        </div>

        {!isAddingNew && !editingCategory && (
          <button
            onClick={handleStartAdd}
            className="px-3.5 py-2 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Category</span>
          </button>
        )}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
          message.type === 'success' 
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Add / Edit Form Modal or Inline Box */}
      {(isAddingNew || editingCategory) && (
        <div className="bg-stone-50 rounded-xl border border-stone-300 p-5">
          <div className="flex items-center gap-2 mb-3">
            <Tag className="w-4 h-4 text-amber-900" />
            <h4 className="font-medium text-stone-900 text-xs uppercase tracking-wider">
              {editingCategory ? `Edit Category: ${editingCategory.name}` : 'New Category'}
            </h4>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Category Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                required
                value={formName}
                onChange={e => setFormName(e.target.value)}
                placeholder="e.g. Science & Nature"
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Description <span className="text-stone-400 font-normal">(Optional)</span>
              </label>
              <textarea
                rows={2}
                value={formDescription}
                onChange={e => setFormDescription(e.target.value)}
                placeholder="Brief summary of books in this subject..."
                className="w-full px-3 py-1.5 text-xs bg-white border border-stone-300 rounded-md focus:outline-none focus:ring-1 focus:ring-amber-900"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleCancelForm}
                disabled={isSubmitting}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-3.5 py-1.5 text-xs font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-md transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100/70 border-b border-stone-200 text-stone-600 uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Slug</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Books</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {categories.map(cat => (
                <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4 font-medium text-stone-900">
                    {cat.name}
                  </td>
                  <td className="py-3 px-4 font-mono text-stone-500 text-[11px]">
                    {cat.slug}
                  </td>
                  <td className="py-3 px-4 text-stone-600 max-w-xs truncate">
                    {cat.description || '—'}
                  </td>
                  <td className="py-3 px-4 text-center font-mono tabular-nums text-stone-700">
                    {cat.book_count ?? 0}
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleStartEdit(cat)}
                      className="p-1 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded transition-colors"
                      title="Edit Category"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setCategoryToDelete(cat)}
                      className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={Boolean(categoryToDelete)}
        title={`Delete Category "${categoryToDelete?.name}"?`}
        message="Are you sure you want to delete this category? Any books currently assigned to this category will be automatically reassigned to 'Other'."
        confirmLabel="Delete Category"
        onConfirm={handleConfirmDelete}
        onCancel={() => setCategoryToDelete(null)}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};
