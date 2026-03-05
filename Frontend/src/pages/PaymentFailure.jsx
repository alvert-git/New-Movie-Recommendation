import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { useEffect } from 'react';

const PaymentFailure = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    useEffect(() => {
        // Log all URL parameters to see if eSewa sent an error code
        const params = Object.fromEntries(searchParams.entries());
        console.log("Full Failure URL Params:", params);

        // In eSewa V2, check if 'data' exists in failure URL (uncommon but helpful)
        if (params.data) {
            try {
                const decoded = JSON.parse(atob(params.data));
                console.log("Decoded Failure Data:", decoded);
            } catch (e) {
                console.log("Could not decode failure data param");
            }
        }
    }, [searchParams]);

    // Extracting potential error details from URL
    const method = searchParams.get('method');
    const errorMessage = searchParams.get('error') || searchParams.get('message') || searchParams.get('msg') || "The transaction could not be completed at this time.";

    return (
        <div className="min-h-screen bg-black flex items-center justify-center pt-20 px-4">
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                <div className="flex flex-col items-center">
                    <XCircle className="w-16 h-16 text-red-500 mb-6" />
                    <h2 className="text-2xl font-bold text-white mb-2">Payment Failed</h2>

                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 w-full text-left">
                        <p className="text-sm text-gray-400 mb-1">Gateway: <span className="text-white capitalize">{method || 'Unknown'}</span></p>
                        <p className="text-sm text-gray-400">Reason: <span className="text-red-400 font-medium">{errorMessage}</span></p>
                    </div>

                    <p className="text-gray-400 mb-8 text-sm">Please check your balance or try a different payment method.</p>

                    <button
                        onClick={() => navigate('/')}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-6 rounded-full transition-colors w-full mb-3"
                    >
                        Go to Home
                    </button>
                    <button
                        onClick={() => navigate(-1)}
                        className="text-gray-500 hover:text-white text-sm transition-colors py-2"
                    >
                        Go Back and Try Again
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentFailure;
