import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';

export default function CreateOfferModal({ isOpen, onClose, onOfferCreated, conversation, currentUser }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    delivery_time: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await onOfferCreated(formData);
      onClose();
    } catch (error) {
      console.error('Failed to create offer:', error);
      alert('Could not create offer. Please try again.');
    } finally {
      setIsLoading(false);
      setFormData({ title: '', description: '', price: '', delivery_time: '' });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-800 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle>Create a Custom Offer</DialogTitle>
          <DialogDescription>Send an offer to the client for a specific project.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <Input placeholder="Offer Title (e.g., Edit 3 Gaming Videos)" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="bg-slate-700 border-slate-600" />
          <Textarea placeholder="Describe what's included" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="bg-slate-700 border-slate-600" />
          <div className="grid grid-cols-2 gap-4">
            <Input type="number" placeholder="Price ($)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="bg-slate-700 border-slate-600" />
            <Input placeholder="Delivery Time (e.g., 5 days)" value={formData.delivery_time} onChange={e => setFormData({...formData, delivery_time: e.target.value})} className="bg-slate-700 border-slate-600" />
          </div>
        </div>
        <Button onClick={handleSubmit} disabled={isLoading} className="w-full">
          {isLoading ? <Loader2 className="animate-spin" /> : 'Send Offer'}
        </Button>
      </DialogContent>
    </Dialog>
  );
}