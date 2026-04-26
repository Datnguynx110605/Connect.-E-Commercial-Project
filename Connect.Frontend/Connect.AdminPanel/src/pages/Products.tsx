import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { Plus, Edit2, Trash2, Loader2 } from 'lucide-react';
import {
  getAllProducts,
  deleteProduct,
  getAllCategories,
  createProduct,
  ProductDto,
  CategoryDto,
} from '../api';

const DEFAULT_FORM = {
  productName: '',
  categoryID: 0,
  originalPrice: 0,
  finalPrice: 0,
  stock: 0,
  description: '',
  ram: 0,
  rom: 0,
  color: '',
  imageURL: [] as string[],
};

export function Products() {
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ ...DEFAULT_FORM });
  const categoriesRef = useRef<CategoryDto[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        getAllProducts(),
        getAllCategories(),
      ]);
      setProducts(productsData);
      setCategories(categoriesData);
      categoriesRef.current = categoriesData;
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (product?: ProductDto) => {
    const cats = categoriesRef.current;
    const defaultCategoryID = cats[0]?.categoryID ?? 0;

    if (product) {
      setEditingId(product.productID);
      setFormData({
        productName: product.productName,
        categoryID: product.categoryID ?? defaultCategoryID,
        originalPrice: product.originalPrice,
        finalPrice: product.finalPrice,
        stock: product.stock,
        description: product.description,
        ram: product.ram,
        rom: product.rom,
        color: product.color,
        imageURL: product.imageURL,
      });
    } else {
      setEditingId(null);
      setFormData({ ...DEFAULT_FORM, categoryID: defaultCategoryID });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        alert('Full product update is not yet supported. Use stock update instead.');
      } else {
        const data = new FormData();
        data.append('ProductName', formData.productName);
        data.append('CategoryID', formData.categoryID.toString());
        data.append('Description', formData.description);
        data.append('OriginalPrice', formData.originalPrice.toString());
        data.append('FinalPrice', formData.finalPrice.toString());
        data.append('Stock', formData.stock.toString());
        data.append('Ram', formData.ram.toString());
        data.append('Rom', formData.rom.toString());
        data.append('Color', formData.color);

        await createProduct(data);
        setIsModalOpen(false);
        fetchData();
      }
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(`Failed to save product: ${error.message}`);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct(id);
        fetchData();
      } catch (error: any) {
        console.error('Failed to delete product:', error);
        alert(`Failed to delete product: ${error.message}`);
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Products Management</h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Add Product
        </Button>
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableCell isHeader>ID</TableCell>
              <TableCell isHeader>Name</TableCell>
              <TableCell isHeader>Category</TableCell>
              <TableCell isHeader>Price</TableCell>
              <TableCell isHeader>Stock</TableCell>
              <TableCell isHeader>Status</TableCell>
              <TableCell isHeader className="text-right">Actions</TableCell>
            </tr>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.productID}>
                <TableCell className="font-mono text-xs text-gray-500">
                  #{product.productID}
                </TableCell>
                <TableCell className="font-medium text-gray-900">
                  {product.productName}
                </TableCell>
                <TableCell>
                  {categories.find((c) => c.categoryID === product.categoryID)?.categoryName ??
                    `#${product.categoryID}`}
                </TableCell>
                <TableCell>${Number(product.finalPrice).toFixed(2)}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant={product.productStatus === 'InStock' ? 'success' : 'danger'}>
                    {product.productStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <button
                    onClick={() => handleOpenModal(product)}
                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.productID)}
                    className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Product' : 'Add New Product'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Product Name"
            value={formData.productName}
            onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Category"
              value={formData.categoryID}
              onChange={(e) =>
                setFormData({ ...formData, categoryID: parseInt(e.target.value, 10) })
              }
              options={categories.map((c) => ({
                label: c.categoryName,
                value: c.categoryID,
              }))}
            />
            <Input
              label="Color"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              step="0.01"
              label="Original Price ($)"
              value={formData.originalPrice}
              onChange={(e) =>
                setFormData({ ...formData, originalPrice: parseFloat(e.target.value) })
              }
              required
            />
            <Input
              type="number"
              step="0.01"
              label="Final Price ($)"
              value={formData.finalPrice}
              onChange={(e) =>
                setFormData({ ...formData, finalPrice: parseFloat(e.target.value) })
              }
              required
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Input
              type="number"
              label="Stock"
              value={formData.stock}
              onChange={(e) =>
                setFormData({ ...formData, stock: parseInt(e.target.value, 10) })
              }
              required
            />
            <Input
              type="number"
              label="RAM (GB)"
              value={formData.ram}
              onChange={(e) =>
                setFormData({ ...formData, ram: parseInt(e.target.value, 10) })
              }
            />
            <Input
              type="number"
              label="ROM (GB)"
              value={formData.rom}
              onChange={(e) =>
                setFormData({ ...formData, rom: parseInt(e.target.value, 10) })
              }
            />
          </div>
          <Input
            label="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            multiline
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">{editingId ? 'Update' : 'Create'} Product</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}