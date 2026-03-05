import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const PaymentSuccess = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // 'verifying', 'success', 'error'
    const [message, setMessage] = useState('Verifying your payment...');

    useEffect(() => {
        // ALWAYS LOG THE RAW URL TO CONSOLE
        console.log("=== PAYMENT SUCCESS MOUNT ===");
        console.log("Raw Window Location Search String:", window.location.search);
        console.log("Parsed SearchParams Object:", Object.fromEntries(searchParams.entries()));
        console.log("===============================");

        const verifyPayment = async () => {
            // Gateway redirects sometimes strip custom query parameters.
            // Let's dynamically detect the method based on the primary parameter present.
            let method = searchParams.get('method');
            let dataParam = searchParams.get('data');

            // Handle eSewa's malformed URL bug: "?method=esewa?data=..."
            if (method && method.includes('?data=')) {
                // React router bundled the second param into the first because of the '?'
                const parts = method.split('?data=');
                method = parts[0]; // "esewa"
                dataParam = parts[1]; // base64 payload
            } else if (window.location.search.includes('?data=')) {
                // Secondary fallback if method wasn't present at all
                dataParam = window.location.search.split('?data=')[1].split('&')[0];
                method = 'esewa';
            }

            if (!method) {
                if (dataParam) method = 'esewa';
                else if (searchParams.get('pidx') || searchParams.get('transaction_id')) method = 'khalti';
            }

            try {
                let payload = {};

                if (method === 'esewa') {
                    payload = {
                        method: 'esewa',
                        data: dataParam
                    };
                } else if (method === 'khalti') {
                    // Khalti sends pidx, transaction_id, purchase_order_id, etc.
                    payload = {
                        method: 'khalti',
                        pidx: searchParams.get('pidx'),
                        transaction_id: searchParams.get('transaction_id'),
                        purchase_order_id: searchParams.get('purchase_order_id')
                    };
                } else {
                    setStatus('error');
                    setMessage('Invalid payment method. No gateway data found.');
                    return;
                }

                // Call our backend verification route
                const res = await api.post('/payment/verify', payload);

                if (res.data.status === 'success') {
                    setStatus('success');
                    setMessage('Payment verified successfully! Redirecting...');
                    // Redirect to the movie page after a short delay
                    setTimeout(() => {
                        navigate(`/movie/${res.data.movie_id}/watch`); // Or just back to movie details
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage('Payment verification failed.');
                }
            } catch (error) {
                console.error("Verification error:", error);
                setStatus('error');
                setMessage(error.response?.data?.error || 'An error occurred during verification.');
            }
        };

        if (searchParams.toString()) {
            verifyPayment();
        }
    }, [searchParams, navigate]);

    return (
        <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center">
                        <Loader className="w-16 h-16 text-red-500 animate-spin mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Verifying Payment</h2>
                        <p className="text-gray-400">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center">
                        <CheckCircle className="w-16 h-16 text-green-500 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Successful!</h2>
                        <p className="text-gray-400 mb-6">Enjoy your movie!</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-full transition-colors w-full"
                        >
                            Go to Home
                        </button>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center">
                        <XCircle className="w-16 h-16 text-red-500 mb-6" />
                        <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>
                        <p className="text-gray-400 mb-6">{message}</p>
                        <button
                            onClick={() => navigate(-1)} // Go back
                            className="bg-gray-800 hover:bg-gray-700 text-white border border-gray-700 font-bold py-2 px-6 rounded-full transition-colors w-full"
                        >
                            Try Again
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentSuccess;
