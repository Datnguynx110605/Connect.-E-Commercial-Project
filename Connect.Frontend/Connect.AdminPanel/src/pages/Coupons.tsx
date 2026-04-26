import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Table, TableBody, TableCell, TableHead, TableRow } from '../components/ui/Table';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input, Select } from '../components/ui/Input';
import { Plus, Edit2, Trash2, Ticket, Loader2 } from 'lucide-react';
import { getAllCoupons, createCoupon, CouponDto } from '../api';

export function Coupons() {
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ 
    couponCode: '', 
    discountAmount: 0, 
    couponQuantity: 0, 
    minimumPriceRequired: 0, 
    expiryDate: new Date().toISOString().split('T')[0] 
  });

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const data = await getAllCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Failed to fetch coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleOpenModal = (coupon?: CouponDto) => {
    if (coupon) {
      setEditingId(coupon.couponID);
      setFormData({
        couponCode: coupon.couponCode,
        discountAmount: coupon.discountAmount,
        couponQuantity: coupon.couponQuantity,
        minimumPriceRequired: coupon.minimumPriceRequired,
        expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0]
      });
    } else {
      setEditingId(null);
      setFormData({ 
        couponCode: '', 
        discountAmount: 0, 
        couponQuantity: 0, 
        minimumPriceRequired: 0, 
        expiryDate: new Date().toISOString().split('T')[0] 
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        // Update logic not clearly defined in README for all fields
        alert('Update not implemented yet');
      } else {
        await createCoupon(formData);
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      console.error('Failed to save coupon:', error);
    }
  };

  const handleDelete = async (id: number) => {
    // Delete not in README for coupons, but usually exists
    alert('Delete not implemented in API');
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
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Coupons Management</h1>
        <Button onClick={() => handleOpenModal()} className="gap-2">
          <Plus className="w-4 h-4" /> Create Coupon
        </Button>
      </div>

      <Card>
        <Table>
          <TableHead>
            <tr>
              <TableCell isHeader>Code</TableCell>
              <TableCell isHeader>Discount</TableCell>
              <TableCell isHeader>Quantity</TableCell>
              <TableCell isHeader>Min Price</TableCell>
              <TableCell isHeader>Expiry</TableCell>
              <TableCell isHeader className="text-right">Actions</TableCell>
            </tr>
          </TableHead>
          <TableBody>
            {coupons.map((coupon) => (
              <TableRow key={coupon.couponID}>
                <TableCell className="font-mono font-medium text-gray-900 flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-gray-400" />
                  {coupon.couponCode}
                </TableCell>
                <TableCell>${coupon.discountAmount}</TableCell>
                <TableCell>{coupon.couponQuantity}</TableCell>
                <TableCell>${coupon.minimumPriceRequired}</TableCell>
                <TableCell>
                  {new Date(coupon.expiryDate).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <button onClick={() => handleOpenModal(coupon)} className="p-1 text-gray-400 hover:text-blue-600 transition-colors"><Edit2 className="w-4 h-4" /></button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Coupon' : 'Create New Coupon'}>
        <form onSubmit={handleSave} className="space-y-4">
          <Input label="Coupon Code" value={formData.couponCode} onChange={e => setFormData({...formData, couponCode: e.target.value.toUpperCase()})} required placeholder="e.g. SUMMER20" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Discount Amount ($)" value={formData.discountAmount} onChange={e => setFormData({...formData, discountAmount: parseFloat(e.target.value)})} required />
            <Input type="number" label="Quantity" value={formData.couponQuantity} onChange={e => setFormData({...formData, couponQuantity: parseInt(e.target.value, 10)})} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" label="Min Price Required ($)" value={formData.minimumPriceRequired} onChange={e => setFormData({...formData, minimumPriceRequired: parseFloat(e.target.value)})} required />
            <Input type="date" label="Expiry Date" value={formData.expiryDate} onChange={e => setFormData({...formData, expiryDate: e.target.value})} required />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingId ? 'Update' : 'Create'} Coupon</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
