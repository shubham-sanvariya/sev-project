// src/models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    order: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    paymentId: {
        type: String,
        required: true,
        unique: true
    },
    razorpayPaymentId: String,        // For Razorpay
    razorpayOrderId: String,          // For Razorpay
    razorpaySignature: String,        // For Razorpay signature verification

    // Payment Details
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'INR',
        enum: ['INR', 'USD', 'EUR']
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['COD', 'Credit Card', 'Debit Card', 'UPI', 'NetBanking', 'Wallet', 'EMI']
    },
    paymentGateway: {
        type: String,
        enum: ['Razorpay', 'Stripe', 'PayPal', 'Paytm', 'COD'],
        default: null
    },

    // Status Tracking
    status: {
        type: String,
        required: true,
        enum: [
            'pending',          // Payment initiated but not completed
            'created',          // Payment order created (Razorpay)
            'authorized',       // Payment authorized but not captured
            'captured',         // Payment successfully captured
            'failed',           // Payment failed
            'refunded',         // Payment refunded
            'partially_refunded', // Partial refund
            'disputed',         // Payment disputed
            'cancelled'         // Payment cancelled
        ],
        default: 'pending'
    },

    // Card Details (if applicable, store only last 4 digits)
    cardDetails: {
        last4: String,
        network: {
            type: String,
            enum: ['Visa', 'MasterCard', 'RuPay']
        },
        issuer: String
    },

    // UPI Details
    upiDetails: {
        vpa: String, // Virtual Payment Address
        name: String
    },

    // Refund Details
    refundDetails: {
        refundId: String,
        amount: Number,
        reason: String,
        initiatedAt: Date,
        processedAt: Date,
        status: {
            type: String,
            enum: ['pending', 'processed', 'failed']
        }
    },

    // Timestamps for different stages
    initiatedAt: {
        type: Date,
        default: Date.now
    },
    completedAt: Date,
    failedAt: Date,
    refundedAt: Date,

    // Additional Info
    notes: String,
    metadata: mongoose.Schema.Types.Mixed, // For gateway-specific data

    // Security
    ipAddress: String,
    userAgent: String
}, {
    timestamps: true
});

// Generate payment ID before saving
paymentSchema.pre('save', function(next) {
    if (!this.paymentId) {
        this.paymentId = 'PAY_' + + crypto.randomBytes(8).toString('hex').toUpperCase();
    }
    next();
});

// Indexes for faster queries
paymentSchema.index({ paymentId: 1 });
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });
paymentSchema.index({ razorpayPaymentId: 1 }, { sparse: true });

export default mongoose.model('Payment', paymentSchema);
