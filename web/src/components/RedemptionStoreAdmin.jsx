import React, { useState, useEffect } from 'react';
import { ShoppingBag, Gift, CheckCircle, Package, PlusCircle, AlertCircle } from 'lucide-react';
import { getStoreItems, addStoreItem, getStoreRedemptions, fulfillRedemption } from '../api/adminApi';

const MitanCoin = () => (
  <span style={{
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #B45309, #D97706)',
    fontSize: '12px',
    marginRight: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
  }}>🌾</span>
);

const RedemptionStoreAdmin = () => {
  const [items, setItems] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Form state for adding a new item
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    point_cost: '',
    stock_quantity: '',
    image_url: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsData, redemptionsData] = await Promise.all([
        getStoreItems(),
        getStoreRedemptions()
      ]);
      setItems(itemsData);
      setRedemptions(redemptionsData);
    } catch (err) {
      console.error(err);
      setError('Failed to load store data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      await addStoreItem({
        name: newItem.name,
        description: newItem.description,
        point_cost: parseInt(newItem.point_cost, 10),
        stock_quantity: parseInt(newItem.stock_quantity, 10),
        image_url: newItem.image_url
      });
      
      // Reset form
      setNewItem({
        name: '',
        description: '',
        point_cost: '',
        stock_quantity: '',
        image_url: ''
      });
      
      // Refresh items list
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to add item. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFulfill = async (id) => {
    try {
      await fulfillRedemption(id);
      fetchData();
    } catch (err) {
      console.error(err);
      alert('Failed to fulfill redemption.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500 font-medium">Loading store data...</div>;
  }

  const activeOrders = redemptions.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Redemption Store</h2>
          <p className="text-sm text-gray-500 mt-1">Manage rewards inventory and fulfill citizen redemptions.</p>
        </div>
        <div className="flex space-x-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-emerald-50 rounded-lg">
              <Package className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Items</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">{items.length}</p>
            </div>
          </div>
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-orange-50 rounded-lg">
              <ShoppingBag className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Active Orders</p>
              <p className="text-lg font-bold text-gray-900 leading-tight">{activeOrders}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Add Item Form */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Gift className="w-5 h-5 text-emerald-600" />
                Add New Reward
              </h3>
            </div>
            <div className="p-6">
              <form onSubmit={handleAddItem} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    required
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="e.g., Cloth Bag"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={newItem.description}
                    onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="Reusable eco-friendly bag"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Point Cost</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newItem.point_cost}
                      onChange={(e) => setNewItem({...newItem, point_cost: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newItem.stock_quantity}
                      onChange={(e) => setNewItem({...newItem, stock_quantity: e.target.value})}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                      placeholder="100"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    value={newItem.image_url}
                    onChange={(e) => setNewItem({...newItem, image_url: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all"
                    placeholder="https://..."
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
                >
                  <PlusCircle className="w-5 h-5" />
                  {isSubmitting ? 'Adding...' : 'Add Reward Item'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Right Column: Redemptions Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-500" />
                Redemption Orders
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white border-b border-gray-100">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Citizen</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Reward Item</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Mitan-Mudra Spent</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {redemptions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500 text-sm">
                        No redemption orders found.
                      </td>
                    </tr>
                  ) : (
                    redemptions.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          #{order.id.toString().padStart(4, '0')}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-gray-900">{order.user_name}</div>
                          <div className="text-xs text-gray-500">
                            {new Date(order.redeemed_at).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {order.item_name}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                            <MitanCoin/> {order.points_spent}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {order.status === 'pending' ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                              Pending
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Fulfilled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          {order.status === 'pending' && (
                            <button
                              onClick={() => handleFulfill(order.id)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Fulfill
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RedemptionStoreAdmin;
