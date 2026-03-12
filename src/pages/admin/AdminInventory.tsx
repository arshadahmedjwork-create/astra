import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Edit2, Trash2, Check, X, Loader2, Eye, ImageIcon } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const productImages: Record<string, string> = {
    'Cow Milk': '/assets/product-raw-milk.png',
    'Buffalo Milk': '/assets/product-pasteurized-milk.png',
    'A2 Milk': '/assets/product-homogenized-milk.png',
    'Paneer': '/assets/product-paneer.png',
    'Ghee': '/assets/product-ghee.png',
    'Curd': '/assets/product-curd.png',
    'Buttermilk': '/assets/product-buttermilk.png',
    'Flavoured Milk': '/assets/product-chocolate-milk.png',
    'Natural Kulfi': '/assets/product-kulfi.png',
};

const AdminInventory = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const { toast } = useToast();

    // Modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any | null>(null);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        category: 'Milk',
        price: '',
        unit: 'litre',
        description: '',
        image_url: '',
        stock_quantity: 0,
        active: true,
        is_sample: false,
    });

    const [previewProduct, setPreviewProduct] = useState<any | null>(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .order('category', { ascending: true })
                .order('name', { ascending: true });

            if (error) throw error;
            if (data) setProducts(data);
        } catch (error: any) {
            toast({ title: 'Error', description: 'Failed to load products.', variant: 'destructive' });
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                category: formData.category,
                price: parseFloat(formData.price),
                unit: formData.unit,
                description: formData.description,
                image_url: formData.image_url || null,
                stock_quantity: parseInt(formData.stock_quantity.toString()) || 0,
                active: formData.active,
                is_sample: formData.is_sample,
            };

            if (editingProduct) {
                const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
                if (error) throw error;
                toast({ title: 'Success', description: 'Product updated successfully.' });
            } else {
                const { error } = await supabase.from('products').insert([payload]);
                if (error) throw error;
                toast({ title: 'Success', description: 'Product added successfully.' });
            }

            setIsAddModalOpen(false);
            setEditingProduct(null);
            fetchProducts();
        } catch (error: any) {
            toast({ title: 'Error', description: error.message || 'Failed to save product.', variant: 'destructive' });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Are you sure you want to delete ${name}?`)) return;
        try {
            const { error } = await supabase.from('products').delete().eq('id', id);
            if (error) throw error;
            toast({ title: 'Success', description: 'Product deleted.' });
            fetchProducts();
        } catch (error: any) {
            toast({ title: 'Error', description: 'Cannot delete product if it is linked to orders/subscriptions.', variant: 'destructive' });
        }
    };

    const openEditModal = (product: any) => {
        setFormData({
            name: product.name,
            category: product.category,
            price: product.price.toString(),
            unit: product.unit,
            description: product.description || '',
            image_url: product.image_url || '',
            stock_quantity: product.stock_quantity || 0,
            active: product.active,
            is_sample: product.is_sample,
        });
        setEditingProduct(product);
        setIsAddModalOpen(true);
    };

    const openAddModal = () => {
        setFormData({
            name: '',
            category: 'Milk',
            price: '',
            unit: 'litre',
            description: '',
            image_url: '',
            stock_quantity: 0,
            active: true,
            is_sample: false,
        });
        setEditingProduct(null);
        setIsAddModalOpen(true);
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
                    <p className="text-muted-foreground mt-1">Add, edit, or remove products</p>
                </div>

                <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={openAddModal} className="forest-gradient text-primary-foreground">
                            <Plus className="w-4 h-4 mr-2" /> Add New Product
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSaveProduct} className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>Product Name</Label>
                                    <Input
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g. Cow Milk"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2 sm:col-span-1">
                                    <Label>Category</Label>
                                    <select
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    >
                                        <option value="Milk">Milk</option>
                                        <option value="Dairy">Dairy</option>
                                        <option value="Dessert">Dessert</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price (₹)</Label>
                                    <Input
                                        required
                                        type="number"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: e.target.value })}
                                        placeholder="70.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Unit</Label>
                                    <Input
                                        required
                                        value={formData.unit}
                                        onChange={e => setFormData({ ...formData, unit: e.target.value })}
                                        placeholder="litre, kg, piece"
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label>Stock Quantity</Label>
                                    <Input
                                        required
                                        type="number"
                                        value={formData.stock_quantity}
                                        onChange={e => setFormData({ ...formData, stock_quantity: parseInt(e.target.value) || 0 })}
                                        placeholder="Available Pieces/Litres"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Description</Label>
                                <textarea
                                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Farm fresh A2 milk..."
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Image URL (Optional)</Label>
                                <Input
                                    value={formData.image_url}
                                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                                    placeholder="https://example.com/image.jpg"
                                />
                            </div>

                            <div className="flex gap-6 pt-2">
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.active}
                                        onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    Active / Available
                                </label>
                                <label className="flex items-center gap-2 text-sm font-medium cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_sample}
                                        onChange={e => setFormData({ ...formData, is_sample: e.target.checked })}
                                        className="rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    Available as Sample
                                </label>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="forest-gradient" disabled={saving}>
                                    {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                    Save Product
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <Card className="border-border/50 shadow-sm">
                <div className="p-4 border-b border-border flex items-center gap-4 bg-secondary/20">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search products by name or category..."
                            className="pl-9 bg-background"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium w-16">Image</th>
                                <th className="px-4 py-3 font-medium">Product Name</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium text-right">Price</th>
                                <th className="px-4 py-3 font-medium text-center">Stock</th>
                                <th className="px-4 py-3 font-medium text-center">Status</th>
                                <th className="px-4 py-3 font-medium text-center">Sample</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                                        Loading inventory
                                    </td>
                                </tr>
                            ) : filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">No products found.</td>
                                </tr>
                            ) : (
                                filteredProducts.map((product) => (
                                    <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="w-12 h-12 rounded-lg border border-border bg-secondary/30 flex items-center justify-center overflow-hidden shrink-0">
                                                {(productImages[product.name] || product.image_url) ? (
                                                    <img src={productImages[product.name] || product.image_url} alt={product.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <ImageIcon className="w-5 h-5 text-muted-foreground/50" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-medium text-foreground">{product.name}</div>
                                            <div className="text-xs text-muted-foreground truncate max-w-[200px]">{product.description}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground border border-border">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-right">
                                            ₹{product.price}<span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
                                        </td>
                                        <td className="px-4 py-3 text-center font-mono text-xs">
                                            {product.stock_quantity}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {product.active ?
                                                <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full"><Check className="w-3 h-3" /> Active</span> :
                                                <span className="inline-flex items-center gap-1 text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full"><X className="w-3 h-3" /> Inactive</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {product.is_sample ?
                                                <span className="text-xs text-blue-600 font-medium">Yes</span> :
                                                <span className="text-xs text-muted-foreground">No</span>
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-amber-600 hover:bg-amber-50" onClick={() => setPreviewProduct(product)}>
                                                    <Eye className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => openEditModal(product)}>
                                                    <Edit2 className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50" onClick={() => handleDelete(product.id, product.name)}>
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Product Card Preview Dialog */}
            <Dialog open={!!previewProduct} onOpenChange={(open) => !open && setPreviewProduct(null)}>
                <DialogContent className="sm:max-w-[400px] bg-background">
                    <DialogHeader>
                        <DialogTitle>Card Preview</DialogTitle>
                    </DialogHeader>
                    {previewProduct && (
                        <div className="py-4 flex justify-center">
                            <Card className="border-border/50 shadow-sm overflow-hidden flex flex-col w-[300px]">
                                <div className="aspect-square bg-secondary/30 relative flex items-center justify-center p-6 border-b border-border/50 bg-white">
                                    {previewProduct.is_sample && (
                                        <span className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full shadow-sm z-10">
                                            SAMPLE
                                        </span>
                                    )}
                                    {(productImages[previewProduct.name] || previewProduct.image_url) ? (
                                        <img src={productImages[previewProduct.name] || previewProduct.image_url} alt={previewProduct.name} className="w-full h-full object-contain drop-shadow-md" />
                                    ) : (
                                        <div className="w-full h-full bg-secondary/50 rounded-xl flex items-center justify-center border-2 border-dashed border-border text-muted-foreground/50">
                                            No Image
                                        </div>
                                    )}
                                </div>
                                <CardContent className="p-5 flex-1 flex flex-col">
                                    <div className="mb-1 text-xs font-semibold tracking-wider text-muted-foreground uppercase">{previewProduct.category}</div>
                                    <h3 className="text-xl font-bold text-foreground mb-2 leading-tight">{previewProduct.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2 leading-relaxed flex-1">{previewProduct.description}</p>

                                    <div className="flex items-end justify-between mt-auto">
                                        <div>
                                            <div className="text-xl font-bold text-primary">₹{previewProduct.price}</div>
                                            <div className="text-xs text-muted-foreground">per {previewProduct.unit}</div>
                                        </div>
                                        <Button className="forest-gradient h-10 w-10 p-0 rounded-full shadow-md text-primary-foreground">
                                            <Plus className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AdminInventory;
