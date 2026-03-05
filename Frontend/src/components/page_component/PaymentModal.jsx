import React from 'react';
import { X } from 'lucide-react';

const PaymentModal = ({ isOpen, onClose, onSelectMethod, price, movieTitle }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-white">Select Payment</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="text-center mb-6">
                    <p className="text-gray-400 text-sm mb-1">Total to pay for {movieTitle}</p>
                    <p className="text-3xl font-black text-white">NPR {price}</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {/* eSewa Option */}
                    <button
                        onClick={() => onSelectMethod('esewa')}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-green-600/20 hover:border-green-500/50 transition-all group"
                    >
                        <img src="/esewa.png" alt="eSewa" className="h-8 object-contain" />
                        <span className="font-semibold text-white group-hover:text-green-400">Pay with eSewa</span>
                    </button>

                    {/* Khalti Option */}
                    <button
                        onClick={() => onSelectMethod('khalti')}
                        className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-purple-600/20 hover:border-purple-500/50 transition-all group"
                    >
                        <img src="/khalti.png" alt="Khalti" className="h-8 object-contain" />
                        <span className="font-semibold text-white group-hover:text-purple-400">Pay with Khalti</span>
                    </button>
                </div>

                <p className="mt-6 text-center text-[10px] text-gray-500 uppercase tracking-widest">
                    Secure Encrypted Transaction
                </p>
            </div>
        </div>
    );
};

export default PaymentModal;