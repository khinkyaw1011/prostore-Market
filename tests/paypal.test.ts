
import { generateAccessToken, paypal } from '../lib/paypal';
import { test, expect, jest } from '@jest/globals';


// Test to generate access token from PayPal
test('generates a token from PayPal', async () => {
  const tokenResponse = await generateAccessToken();
  console.log(tokenResponse);

  expect(typeof tokenResponse).toBe('string');
  expect(tokenResponse.length).toBeGreaterThan(0);
});

// Test to create a PayPal order
test('creates a PayPal order', async () => {
  const price = 10.0;

  const orderResponse = await paypal.createOrder(price);
  console.log(orderResponse);

  // Ensure the order response contains the expected fields
  expect(orderResponse).toHaveProperty('id');
  expect(orderResponse).toHaveProperty('status');
  expect(orderResponse.status).toBe('CREATED');
});

// Test to capture payment with a mock order
test('simulates capturing a payment from an order', async () => {
  const orderId = '100';

  // Mock the capturePayment function to return a successful response
  const mockCapturePayment = jest
    .spyOn(paypal, 'capturePayment')
    .mockResolvedValue({
      status: 'COMPLETED',
    });

  const captureResponse = await paypal.capturePayment(orderId);

  expect(captureResponse).toHaveProperty('status', 'COMPLETED');

  // Clean up the mock
  mockCapturePayment.mockRestore();
});
