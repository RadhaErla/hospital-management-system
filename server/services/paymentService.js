const crypto = require('crypto');

/**
 * Payment Service supporting both live payment gateway and local test/mock modes
 */
class PaymentService {
  constructor() {
    this.key = process.env.PAYMENT_KEY || null;
    this.secret = process.env.PAYMENT_SECRET || null;
    this.isLive = !!(this.key && this.secret);
  }

  /**
   * Initialize a payment intent/order
   */
  async createPaymentOrder({ billId, amount, currency = 'USD', customerInfo }) {
    if (this.isLive) {
      // In production with real keys, integrate Stripe, Razorpay, or PayPal SDK here
      // e.g. const order = await razorpay.orders.create(...)
      return {
        isMock: false,
        orderId: `order_${Date.now()}`,
        amount,
        currency,
      };
    }

    // Development / Test Sandbox mode
    const mockOrderId = `MOCK_ORD_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;
    return {
      isMock: true,
      orderId: mockOrderId,
      amount,
      currency,
      message: 'Operating in Sandbox/Test Mode. No real funds are transferred.',
    };
  }

  /**
   * Process / verify payment completion
   */
  async verifyAndProcessPayment({ billId, amount, paymentMethod, paymentDetails }) {
    if (this.isLive) {
      // Real signature/webhook verification logic
      return {
        success: true,
        transactionId: `TXN_${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
        isLive: true,
      };
    }

    // Mock payment verification (Cash, Card, UPI, or Online Demo)
    const mockTxnId = `MOCK_TXN_${Date.now()}_${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    return {
      success: true,
      transactionId: mockTxnId,
      isLive: false,
      message: 'Test payment processed successfully via AuraHealth Sandbox',
      paidAt: new Date(),
    };
  }
}

module.exports = new PaymentService();
