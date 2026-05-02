const { User } = require('../adminSellerUser/AdminSellerUser');
const CustomerSubscription = require('./CustomerSubscription');
const SubscriptionPlan = require('./SubscriptionPlan');
const sendMail = require('../notification/EmailNotifications');
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = stripeSecretKey ? require('stripe')(stripeSecretKey) : null;
const cron = require('node-cron');

const payment = async (req, res) => {
    const userId = req.body.userId;

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).send({ error: "User not found." });
        }
        console.log(user.isSubscribed);

        if (user.isSubscribed === true) {
            return res.status(400).send("User is already subscribed.");
        }

        console.log("HELLO");

        if (Number(req.body.amount) < 0) {
            return res.status(400).send({ error: "Amount cannot be negative." });
        }

        // Free plan support: no Stripe card details required.
        if (Number(req.body.amount) === 0) {
            await addOrUpdateSubscriptionForUser(req.body.userId, req.body.subscriptionPlanId, "FREE_PLAN");
            await sendMail(
                user.email,
                "MovieHub subscription activated",
                "Your subscription has been activated successfully."
            );
            return res.status(200).send({
                status: "succeeded",
                paymentId: "FREE_PLAN",
                message: "Free plan activated successfully.",
            });
        }

        if (!stripe) {
            return res.status(500).send({ error: "Stripe is not configured on the server." });
        }

        if (!req.body.stripeToken) {
            return res.status(400).send({ error: "Card payment method is required." });
        }

        // Convert rupees to paise for Stripe INR payments.
        const amountInPaise = Math.round(Number(req.body.amount) * 100);
        if (!Number.isFinite(amountInPaise) || amountInPaise <= 0) {
            return res.status(400).send({ error: "Invalid payment amount." });
        }

        // Create a PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInPaise,
            currency: 'INR',
            payment_method: req.body.stripeToken,
            payment_method_types: ['card'],
            confirm: true,
            receipt_email: req.body.stripeEmail || user.email,
            return_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/user/subscription`,
        });

        console.log("PaymentIntent created:", paymentIntent);

        // Update subscription status
        await addOrUpdateSubscriptionForUser(req.body.userId, req.body.subscriptionPlanId, paymentIntent.id);
        await sendMail(
            user.email,
            "MovieHub payment successful",
            `Your payment was successful. Payment ID: ${paymentIntent.id}. Subscription is now active.`
        );

        return res.send(paymentIntent);
    } catch (error) {
        console.error("Payment error:", error.message);
        return res.status(500).send({ error: error.message });
    }
};






// Add or Update Subscription for a User
const addOrUpdateSubscriptionForUser = async (userId, planId, paymentId) => {
    try {
       

        const plan = await SubscriptionPlan.findById(planId);
        if (!plan) throw new Error('Invalid subscription plan');

        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + plan.duration);

        let subscription = new CustomerSubscription({
                userId,
                planId,
                startDate,
                endDate,
                paymentId,
                status: 'Active',
            });

        const user = await User.findById(userId);
        user.isSubscribed = true;

        const updatedUser = await user.save();

        console.log(updatedUser)
        
        await subscription.save();
        console.log('Subscription updated/created successfully!');
    } catch (error) {
        console.error('Error updating/creating subscription:', error.message);
        throw new Error(error.message);
    }
};

// Get all subscriptions for a user
const getAllSubscriptionsForUser = async (req, res) => {
    try {
        const { userId } = req.params;
        const subscriptions = await CustomerSubscription.find({ userId }).populate('planId');

        res.status(200).json(subscriptions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// const unSubscribeForUser = async (req, res) => {
//     const userId = req.body.userId;
//     const id = req.body.id;
//     const subscriptions = await CustomerSubscription.find({ _id:id, userId });
// }

const checkSubscriptions = async () => {
    try {
        console.log("Running daily subscription check...");

        const now = new Date();

        // Find subscriptions that are active and have expired
        const expiredSubscriptions = await CustomerSubscription.find({
            status: 'Active',
            endDate: { $lt: now },
        });

        // Iterate over expired subscriptions
        for (const subscription of expiredSubscriptions) {
            // Update the subscription's status to 'Expired'
            subscription.status = 'Expired';
            await subscription.save();

            // Find the associated user and update `isSubscribed` to false
            const user = await User.findById(subscription.userId);
            if (user) {
                user.isSubscribed = false;
                await user.save();
                console.log(`Updated user ${user._id}'s subscription status.`);
            }
        }

        console.log("Daily subscription check completed.");
    } catch (error) {
        console.error("Error during subscription check:", error.message);
    }
};

cron.schedule('0 0 * * *', () => {
    checkSubscriptions();
});

module.exports = {
    addOrUpdateSubscriptionForUser,
    getAllSubscriptionsForUser,
    payment
};
