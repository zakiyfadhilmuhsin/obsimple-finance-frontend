'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow 
} from '@/components/ui/table';
import { orderItemsAPI } from '@/lib/api';
import { Upload, Download, Save, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

interface SkuData {
  sku: string;
  itemName: string;
  totalOrders: number;
  totalQuantity: number;
  totalRevenue: number;
  currentHpp: number | null;
  hasHpp: boolean;
  avgPrice: number;
}

interface HppInputDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function HppInputDialog({ open, onClose, onSuccess }: HppInputDialogProps) {
  const [skuList, setSkuList] = useState<SkuData[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hppUpdates, setHppUpdates] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState('');
  const [uploadData, setUploadData] = useState<{ sku: string; hpp: number }[]>([]);

  // Load SKU list when dialog opens
  useEffect(() => {
    if (open) {
      loadSkuList();
    }
  }, [open]);

  const loadSkuList = async () => {
    setLoading(true);
    try {
      const response = await orderItemsAPI.getSkuList();
      setSkuList(response.data.skus);
    } catch (error) {
      console.error('Error loading SKU list:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter SKUs based on search term
  const filteredSkus = skuList.filter(sku => 
    sku.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sku.itemName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle HPP input change
  const handleHppChange = (sku: string, hpp: string) => {
    const numValue = parseFloat(hpp);
    if (isNaN(numValue) || numValue < 0) {
      delete hppUpdates[sku];
      setHppUpdates({ ...hppUpdates });
    } else {
      setHppUpdates({ ...hppUpdates, [sku]: numValue });
    }
  };

  // Download Excel template
  const downloadTemplate = () => {
    const templateData = filteredSkus.map(sku => ({
      SKU: sku.sku,
      'Item Name': sku.itemName,
      'Current HPP': sku.currentHpp || '',
      'New HPP': '',
      'Total Orders': sku.totalOrders,
      'Total Quantity': sku.totalQuantity,
      'Total Revenue': sku.totalRevenue
    }));

    const ws = XLSX.utils.json_to_sheet(templateData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'HPP Input Template');
    XLSX.writeFile(wb, 'hpp-input-template.xlsx');
  };

  // Upload Excel file
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

        const updates: Record<string, number> = {};
        jsonData.forEach((row) => {
          const sku = row['SKU'] || row['sku'];
          const newHpp = parseFloat(row['New HPP'] || row['new_hpp'] || row['hpp']);
          
          if (sku && !isNaN(newHpp) && newHpp >= 0) {
            updates[sku] = newHpp;
          }
        });

        setHppUpdates(updates);
        setUploadData(Object.entries(updates).map(([sku, hpp]) => ({ sku, hpp })));
      } catch (error) {
        console.error('Error reading Excel file:', error);
        alert('Error reading Excel file. Please check the format.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // Submit HPP updates
  const handleSubmit = async () => {
    if (Object.keys(hppUpdates).length === 0) {
      alert('Please enter at least one HPP value');
      return;
    }

    setSubmitting(true);
    try {
      const items = Object.entries(hppUpdates).map(([sku, hpp]) => ({
        sku,
        hpp,
        itemName: skuList.find(s => s.sku === sku)?.itemName
      }));

      await orderItemsAPI.bulkUpdateHpp({ items, notes });
      onSuccess();
      onClose();
      
      // Reset form
      setHppUpdates({});
      setNotes('');
      setUploadData([]);
    } catch (error) {
      console.error('Error updating HPP:', error);
      alert('Error updating HPP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const pendingUpdates = Object.keys(hppUpdates).length;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center space-x-2">
            <span>HPP Mass Input</span>
            {pendingUpdates > 0 && (
              <Badge variant="secondary">{pendingUpdates} pending updates</Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Input HPP (Harga Pokok Penjualan) for your products. You can input manually or upload Excel file.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 min-h-0">
          {/* Upload Controls */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-medium">Bulk Upload</h3>
                <p className="text-sm text-gray-600">Download template, fill in HPP values, then upload</p>
              </div>
              <div className="flex space-x-2">
                <Button variant="outline" onClick={downloadTemplate} size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Label htmlFor="excel-upload" className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Excel
                    </span>
                  </Button>
                  <Input
                    id="excel-upload"
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </Label>
              </div>
            </div>

            {uploadData.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded p-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800">
                    {uploadData.length} SKUs loaded from Excel file
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Search */}
          <div className="flex space-x-4">
            <div className="flex-1">
              <Label htmlFor="search">Search SKU or Product Name</Label>
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by SKU or product name..."
              />
            </div>
          </div>

          {/* SKU Table */}
          <div className="border rounded-lg">
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="bg-gray-50">SKU</TableHead>
                    <TableHead className="bg-gray-50">Product Name</TableHead>
                    <TableHead className="bg-gray-50">Orders</TableHead>
                    <TableHead className="bg-gray-50">Qty Sold</TableHead>
                    <TableHead className="bg-gray-50">Revenue</TableHead>
                    <TableHead className="bg-gray-50">Current HPP</TableHead>
                    <TableHead className="bg-gray-50">New HPP</TableHead>
                    <TableHead className="bg-gray-50">Status</TableHead>
                  </TableRow>
                </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading SKUs...
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredSkus.slice(0, 50).map((sku) => (
                    <TableRow key={sku.sku}>
                      <TableCell>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                          {sku.sku}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={sku.itemName}>
                          {sku.itemName}
                        </div>
                      </TableCell>
                      <TableCell>{sku.totalOrders}</TableCell>
                      <TableCell>{sku.totalQuantity}</TableCell>
                      <TableCell>
                        Rp {sku.totalRevenue.toLocaleString('id-ID')}
                      </TableCell>
                      <TableCell>
                        {sku.currentHpp ? (
                          `Rp ${sku.currentHpp.toLocaleString('id-ID')}`
                        ) : (
                          <span className="text-gray-400">Not set</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={hppUpdates[sku.sku] || ''}
                          onChange={(e) => handleHppChange(sku.sku, e.target.value)}
                          placeholder="Enter HPP"
                          className="w-28"
                        />
                      </TableCell>
                      <TableCell>
                        {hppUpdates[sku.sku] ? (
                          <Badge variant="secondary">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        ) : sku.hasHpp ? (
                          <Badge variant="default">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Set
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Set</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              </Table>
            </div>
            
            {!loading && filteredSkus.length > 50 && (
              <div className="p-4 text-center text-sm text-gray-500 border-t">
                Showing first 50 SKUs. Use search to find specific products.
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this HPP update batch..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-600">
              {pendingUpdates > 0 && `${pendingUpdates} SKUs will be updated`}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit} 
                disabled={submitting || pendingUpdates === 0}
              >
                {submitting ? (
                  <>Loading...</>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Update HPP ({pendingUpdates})
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}