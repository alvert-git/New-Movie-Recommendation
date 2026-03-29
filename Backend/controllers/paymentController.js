const db = require('../config/connectDB');
const crypto = require('crypto-js');
const { v4: uuidv4 } = require('uuid');

const generateEsewaSignature = (secretKey, message) => {
    const hash = crypto.HmacSHA256(message, secretKey);
    return crypto.enc.Base64.stringify(hash);
};

// 1. Initiate Payment
exports.initiatePayment = async (req, res) => {
    let { amount, productName, transactionId, method } = req.body;
    amount = Number(amount); // Guarantee amount is always a float/number
    const user_id = req.user.id;
    // We assume 'transactionId' sent from frontend is actually the movie_id for our internal tracking
    const movie_id = transactionId;

    if (!amount || !productName || !transactionId || !method) {
        return res.status(400).json({ error: "Missing required fields" });
    }

    try {
        // Check if user already owns it
        const [existingAuth] = await db.query(
            "SELECT id FROM purchases WHERE user_id = ? AND movie_id = ? AND status = 'COMPLETED'",
            [user_id, movie_id]
        );

        if (existingAuth.length > 0) {
            return res.status(400).json({ error: "You already own this movie" });
        }

        if (method === "esewa") {
            const transaction_uuid = `${movie_id}-${Date.now()}`;

            // 1. eSewa requires a string representation, usually with 1 or 2 decimal places
            const amt = Number(amount).toFixed(1); // "500.0"

            // Insert PENDING record
            await db.query(
                "INSERT INTO purchases (user_id, movie_id, amount, payment_method, status, transaction_uuid) VALUES (?, ?, ?, ?, 'PENDING', ?)",
                [user_id, movie_id, amount, 'esewa', transaction_uuid]
            );

            const esewaConfig = {
                amount: amt,
                tax_amount: "0.0", // Use explicit decimal strings
                total_amount: amt,
                transaction_uuid: transaction_uuid,
                product_code: process.env.ESEWA_MERCHANT_CODE,
                product_service_charge: "0.0",
                product_delivery_charge: "0.0",
                success_url: `${process.env.FRONTEND_URL}/payment/success?method=esewa`,
                failure_url: `${process.env.FRONTEND_URL}/payment/failure?method=esewa`,
                signed_field_names: "total_amount,transaction_uuid,product_code",
            };

            // 2. The signature string MUST use the exact same string as total_amount above
            const signatureString = `total_amount=${esewaConfig.total_amount},transaction_uuid=${esewaConfig.transaction_uuid},product_code=${esewaConfig.product_code}`;
            const signature = generateEsewaSignature(process.env.ESEWA_SECRET_KEY, signatureString);


            // --- LOGGING BLOCK ---
            console.log("=== ESEWA INITIATE DEBUG ===");
            console.log("Secret Key Used:", process.env.ESEWA_SECRET_KEY ? "EXISTS" : "MISSING");
            console.log("Merchant Code:", esewaConfig.product_code);
            console.log("Signature String:", signatureString);
            console.log("Generated Signature:", signature);
            console.log("============================");

            return res.json({
                amount: amount,
                esewaConfig: { ...esewaConfig, signature },
            });
        } else if (method === "khalti") {
            const khaltiConfig = {
                return_url: `${process.env.FRONTEND_URL}/payment/success?method=khalti`,
                website_url: process.env.FRONTEND_URL,
                amount: Math.round(parseFloat(amount) * 100), // Khalti expects paisa
                purchase_order_id: movie_id.toString(), // Store movie_id here
                purchase_order_name: productName,
                customer_info: {
                    name: req.user.email.split('@')[0],
                    email: req.user.email,
                    phone: "9800000000",
                },
            };

            const response = await fetch("https://a.khalti.com/api/v2/epayment/initiate/", {
                method: "POST",
                headers: {
                    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(khaltiConfig),
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Khalti Error:", errorData);
                return res.status(400).json({ error: "Khalti initiation failed" });
            }

            const khaltiResponse = await response.json();

            // Insert PENDING record with pidx
            await db.query(
                "INSERT INTO purchases (user_id, movie_id, amount, payment_method, status, khalti_pidx) VALUES (?, ?, ?, ?, 'PENDING', ?)",
                [user_id, movie_id, amount, 'khalti', khaltiResponse.pidx]
            );

            return res.json({ khaltiPaymentUrl: khaltiResponse.payment_url });
        }

        return res.status(400).json({ error: "Invalid method" });

    } catch (error) {
        console.error("Initiate error:", error);
        res.status(500).json({ error: error.message });
    }
};


// 2. Verify Payment
exports.verifyPayment = async (req, res) => {
    const { method, data, pidx, transaction_id, purchase_order_id } = req.body;

    try {
        if (method === 'esewa') {
            if (!data) return res.status(400).json({ error: "Missing eSewa payload" });

            const decodedStr = Buffer.from(data, "base64").toString("utf-8");
            let decoded;
            try {
                decoded = JSON.parse(decodedStr);
                console.log("eSewa response decoded:", decoded);
            } catch (err) {
                console.error("Failed to parse eSewa JSON:", decodedStr);
                return res.status(400).json({ error: "Invalid eSewa data payload" });
            }

            if (decoded.status !== "COMPLETE") {
                return res.status(400).json({ error: "Payment not completed" });
            }

            // Find pending payment
            const [payments] = await db.query(
                "SELECT * FROM purchases WHERE transaction_uuid = ? AND status = 'PENDING'",
                [decoded.transaction_uuid]
            );

            if (payments.length === 0) {
                return res.status(404).json({ error: "Valid pending payment not found" });
            }
            const payment = payments[0];

            // Verify with eSewa server (optional but recommended in prod, bypassing for brevity/test if verify URL fails)
            const verifyUrl = `${process.env.ESEWA_VERIFY_URL}?product_code=${encodeURIComponent(process.env.ESEWA_MERCHANT_CODE)}&total_amount=${encodeURIComponent(decoded.total_amount)}&transaction_uuid=${encodeURIComponent(decoded.transaction_uuid)}`;

            const verifyResponse = await fetch(verifyUrl, { method: "GET" });
            if (!verifyResponse.ok) {
                return res.status(400).json({ error: "eSewa server verification failed" });
            }
            const verificationResult = await verifyResponse.json();

            if (verificationResult.status !== "COMPLETE" || verificationResult.transaction_uuid !== decoded.transaction_uuid) {
                return res.status(400).json({ error: "eSewa validation mismatch" });
            }

            // Update to completed
            await db.query(
                "UPDATE purchases SET status = 'COMPLETED' WHERE id = ?",
                [payment.id]
            );

            const [movies] = await db.query("SELECT title FROM movies WHERE movie_id = ?", [payment.movie_id]);

            return res.json({
                status: "success",
                movie_id: payment.movie_id,
                movie_title: movies[0]?.title || "Unknown",
                amount: payment.amount,
                transaction_id: payment.transaction_uuid,
                method: payment.payment_method
            });

        } else if (method === 'khalti') {
            const khaltiPidx = pidx || transaction_id;

            if (!khaltiPidx) {
                return res.status(400).json({ error: "Missing Khalti pidx" });
            }

            // 1. First, check if it's already completed in our DB
            const [existing] = await db.query(
                "SELECT * FROM purchases WHERE khalti_pidx = ? AND status = 'COMPLETED'",
                [khaltiPidx]
            );

            if (existing.length > 0) {
                const [movies] = await db.query("SELECT title FROM movies WHERE movie_id = ?", [existing[0].movie_id]);
                return res.json({
                    status: "success",
                    movie_id: existing[0].movie_id,
                    movie_title: movies[0]?.title || "Unknown",
                    amount: existing[0].amount,
                    transaction_id: khaltiPidx,
                    method: 'khalti'
                });
            }

            // 2. If not already completed, verify with Khalti Server
            const resKhalti = await fetch("https://a.khalti.com/api/v2/epayment/lookup/", {
                method: "POST",
                headers: {
                    Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ pidx: khaltiPidx }),
            });

            const json = await resKhalti.json();

            if (json.status !== "Completed") {
                return res.status(400).json({ error: `Khalti status: ${json.status}` });
            }

            // 3. Find the PENDING record
            const [pending] = await db.query(
                "SELECT * FROM purchases WHERE khalti_pidx = ? AND status = 'PENDING'",
                [khaltiPidx]
            );

            if (pending.length === 0) {
                return res.status(404).json({ error: "No matching pending payment found." });
            }

            // 4. Update to COMPLETED
            await db.query(
                "UPDATE purchases SET status = 'COMPLETED' WHERE id = ?",
                [pending[0].id]
            );

            const [movieInfo] = await db.query("SELECT title FROM movies WHERE movie_id = ?", [pending[0].movie_id]);

            return res.json({
                status: "success",
                movie_id: pending[0].movie_id,
                movie_title: movieInfo[0]?.title || "Unknown",
                amount: pending[0].amount,
                transaction_id: khaltiPidx,
                method: 'khalti'
            });
        }

        return res.status(400).json({ error: "Invalid method" });
    } catch (error) {
        console.error("Verify error:", error);
        res.status(500).json({ error: "Payment verification failed" });
    }
};

// 3. Check Access
exports.checkAccess = async (req, res) => {
    const { movie_id } = req.params;
    const user_id = req.user.id;

    try {
        const [rows] = await db.query(
            "SELECT id FROM purchases WHERE user_id = ? AND movie_id = ? AND status = 'COMPLETED'",
            [user_id, movie_id]
        );

        if (rows.length > 0) {
            // User owns the movie, return the video_url from movies table
            const [movies] = await db.query("SELECT video_url FROM movies WHERE movie_id = ?", [movie_id]);
            return res.json({ hasAccess: true, video_url: movies[0]?.video_url });
        }

        return res.json({ hasAccess: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getEarnings = async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT SUM(amount) as totalEarnings, COUNT(*) as totalTransactions FROM purchases WHERE status = 'COMPLETED'"
        );
        res.json({
            totalEarnings: rows[0].totalEarnings || 0,
            totalTransactions: rows[0].totalTransactions || 0
        });
    } catch (error) {
        console.error("Earnings error:", error);
        res.status(500).json({ error: "Failed to fetch earnings" });
    }
};
