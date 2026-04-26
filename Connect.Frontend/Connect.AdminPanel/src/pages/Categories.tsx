import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import { getAllCategories, createCategory, updateCategory, deleteCategory, CategoryDto } from '../api';

export function Categories() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ categoryName: '' });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await getAllCategories();
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenModal = (category?: CategoryDto) => {
    if (category) {
      setEditingId(category.categoryID);
      setFormData({ categoryName: category.categoryName });
    } else {
      setEditingId(null);
      setFormData({ categoryName: '' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateCategory(editingId, formData.categoryName);
      } else {
        await createCategory(formData.categoryName);
      }
      setIsModalOpen(false);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if(confirm('Are you sure you want to delete this category?')) {
      try {
        await deleteCategory(id);
        fetchCategories();
      } catch (error) {
        console.error('Failed to delete category:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Categories Management</h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableCell isHeader>ID</TableCell>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader className="text-right">Actions</TableCell>
            </tr>
          </TableHead>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.categoryID}>
                <TableCell className="font-mono text-xs text-gray-500">#{cat.categoryID}</TableCell>
                <TableCell className="font-medium text-gray-900">{cat.categoryName}</TableCell>
                <TableCell className="text-right space-x-2">
                  <button onClick={() => handleOpenModal(cat)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(cat.categoryID)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Category' : 'Add New Category'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Category Name" value={formData.categoryName} onChange={e => setFormData({...formData, categoryName: e.target.value})} required />
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? 'Update' : 'Create'} Category</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
