const { AdminSeller } = require("./AdminSellerUser");
const SellerCard = require("./SellerCard");


const addSellerCardDetails = async (req, res) => {
    try {
        const { sellerId, cardHolderName, cardNumber, expiryDate, cvv } = req.body;

        const seller = await AdminSeller.findById(sellerId);
        if (!seller) {
            return res.status(404).json({ error: "Seller not found" });
        }

        const savedCard = await SellerCard.findOneAndUpdate(
            { sellerId },
            { sellerId, cardHolderName, cardNumber, expiryDate, cvv },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(201).json({ message: "Card details saved successfully", card: savedCard });
    } catch (error) {
        console.error("Error adding card details:", error.message);
        res.status(500).json({ error: error.message });
    }
};

const getSellerCardDetails = async (req, res) => {
    try {
        const { sellerId } = req.params;
        const card = await SellerCard.findOne({ sellerId });
        if (!card) {
            return res.status(404).json({ error: "Card details not found" });
        }
        res.status(200).json({ card });
    } catch (error) {
        console.error("Error getting card details:", error.message);
        res.status(500).json({ error: error.message });
    }
};
const cron = require('node-cron');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;

const processMonthlyPayments = async () => {
    try {
        if (!stripe) {
            console.warn('STRIPE_SECRET_KEY is not set; skipping scheduled seller payouts.');
            return;
        }
        const sellers = await AdminSeller.find();

        for (const seller of sellers) {
            if (seller.payOnViews > 0) {
                const card = await SellerCard.findOne({ sellerId: seller._id });
                if (!card) {
                    console.error(`No card found for seller ${seller.name}`);
                    continue;
                }

                // Process payment using Stripe
                const paymentIntent = await stripe.paymentIntents.create({
                    amount: seller.payOnViews / 10, // Stripe processes amounts in smallest currency units
                    currency: 'INR',
                    payment_method_types: ['card'],
                    receipt_email: seller.email,
                    description: `Monthly payout for ${seller.name}`,
                });

                console.log(`Payment of ₹${seller.payOnViews} processed for seller ${seller.name}`);
                
                // Reset payOnViews and update totalPaid
                seller.totalPaid += seller.payOnViews / 10;
                seller.payOnViews = 0;
                await seller.save();
            }
        }
    } catch (error) {
        console.error("Error processing monthly payments:", error.message);
    }
};

// Schedule the job for the last day of each month at midnight
cron.schedule('0 0 1 * *', processMonthlyPayments);

module.exports = {
    addSellerCardDetails,
    getSellerCardDetails,
};
