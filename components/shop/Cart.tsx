import React, { useState } from 'react';
import { X, Plus, Minus, Trash2, CreditCard, Lock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createPendingOrder, finalizeOrder } from '../../services/orderService';
import { createPaymentOrder } from '../../services/paymentService';
import { Address } from '../../types';
import { config } from '../../lib/config';

// Add type definition for Razorpay on window
declare global {
  interface Window {
    Razorpay: any;
  }
}

export const Cart: React.FC = () => {
  const { isCartOpen, setIsCartOpen, items, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  if (!isCartOpen) return null;

  const handleCheckout = async () => {
    if (!user) {
      alert("Please login to complete your purchase.");
      return;
    }
    
    setIsCheckingOut(true);
    try {
      // 1. Prepare Order Data & Mock Address
      const mockAddress: Address = {
        fullName: user.name,
        street: '123 Maker Lane',
        city: 'Craft City',
        state: 'CA',
        zipCode: '90210',
        country: 'USA'
      };

      // 2. Create Pending Order in Backend
      // Note: Backend will recalculate total, but we pass it for validation if needed
      const pendingOrder = await createPendingOrder(
        user.id,
        items,
        cartTotal,
        mockAddress
      );

      // 3. Create Payment Order in Backend (Razorpay)
      const rzpOrder = await createPaymentOrder(cartTotal, 'USD');

      // 4. Open Razorpay Checkout
      const options = {
        key: config.razorpayKeyId,
        amount: rzpOrder.amount,
        currency: rzpOrder.currency,
        name: "KeyCraft Store",
        description: `Order #${pendingOrder.id}`,
        image: "https://via.placeholder.com/150",
        order_id: rzpOrder.id, // This is the Razorpay Order ID
        handler: async function (response: any) {
          try {
            // 5. Verify Payment & Finalize Order in Backend
            const finalizedOrder = await finalizeOrder(pendingOrder.id, {
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature
            });

            // 6. Success UI
            clearCart();
            setIsCartOpen(false);
            alert(`Payment Successful!\nOrder ID: ${finalizedOrder.id}\nRef: ${finalizedOrder.paymentId}`);
          } catch (err: any) {
             console.error("Payment Verification Failed", err);
             alert("Payment verification failed. Please contact support.");
          } finally {
            setIsCheckingOut(false);
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
          contact: "9999999999"
        },
        theme: {
          color: "#4F46E5"
        },
        modal: {
            ondismiss: function() {
                setIsCheckingOut(false);
            }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any){
        alert("Payment Failed: " + response.error.description);
        setIsCheckingOut(false);
      });
      rzp.open();
      
    } catch (error: any) {
      console.error("Checkout failed", error);
      alert(`Checkout Failed: ${error.message}`);
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setIsCartOpen(false)} />
      
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div className="w-screen max-w-md">
          <div className="h-full flex flex-col bg-white shadow-xl">
            <div className="flex-1 py-6 overflow-y-auto px-4 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">Shopping Cart</h2>
                <button
                  type="button"
                  className="-m-2 p-2 text-gray-400 hover:text-gray-500"
                  onClick={() => setIsCartOpen(false)}
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="mt-8">
                {items.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-lg">Your cart is empty.</p>
                    <button 
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 text-indigo-600 hover:text-indigo-500 font-medium"
                    >
                      Continue Shopping &rarr;
                    </button>
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul className="-my-6 divide-y divide-gray-200">
                      {items.map((item) => (
                        <li key={item.id} className="py-6 flex">
                          <div className="flex-shrink-0 w-24 h-24 border border-gray-200 rounded-md overflow-hidden">
                            <img
                              src={item.images[0] || 'https://via.placeholder.com/100'}
                              alt={item.name}
                              className="w-full h-full object-center object-cover"
                            />
                          </div>

                          <div className="ml-4 flex-1 flex flex-col">
                            <div>
                              <div className="flex justify-between text-base font-medium text-gray-900">
                                <h3>{item.name}</h3>
                                <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                              </div>
                              <p className="mt-1 text-sm text-gray-500">{item.category}</p>
                            </div>
                            <div className="flex-1 flex items-end justify-between text-sm">
                              <div className="flex items-center border rounded-md">
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="p-1 hover:bg-gray-100"
                                >
                                  <Minus className="h-4 w-4 text-gray-500" />
                                </button>
                                <span className="px-2 font-medium">{item.quantity}</span>
                                <button 
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="p-1 hover:bg-gray-100"
                                >
                                  <Plus className="h-4 w-4 text-gray-500" />
                                </button>
                              </div>

                              <button
                                type="button"
                                onClick={() => removeFromCart(item.id)}
                                className="font-medium text-red-600 hover:text-red-500 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remove
                              </button>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {items.length > 0 && (
              <div className="border-t border-gray-200 py-6 px-4 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>${cartTotal.toFixed(2)}</p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">Shipping and taxes calculated at checkout.</p>
                
                <div className="mt-4 flex items-center justify-center text-xs text-gray-500 bg-gray-50 p-2 rounded">
                    <Lock className="w-3 h-3 mr-1" />
                    Secure Payment via Razorpay
                </div>

                <div className="mt-4">
                  <button
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                    className={`w-full flex justify-center items-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-indigo-600 hover:bg-indigo-700 ${isCheckingOut ? 'opacity-75 cursor-wait' : ''}`}
                  >
                    {isCheckingOut ? (
                      'Processing Payment...'
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pay Now
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};