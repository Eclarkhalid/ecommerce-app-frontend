// Import necessary modules and models
import { mongooseConnect } from "@/lib/mongoose";
import { Order } from "@/models/Order";
import { Product } from "@/models/Product";
const stripe = require('stripe')(process.env.STRIPE_KEY);

// Define the default function for handling requests
export default async function handler(req, res) {
  // Check if the request method is not POST
  if (req.method !== 'POST') {
    res.json('Should be a post request'); // Respond with a message indicating the request should be POST
    return;
  }

  // Destructure data from the request body
  const { email, name, address, city, state, zip, cartProducts } = req.body;

  // Connect to MongoDB using Mongoose
  await mongooseConnect();

  // Extract unique product IDs from the cart products
  const productIds = cartProducts;
  const uniqueIds = [...new Set(productIds)];

  // Retrieve information about products from the database using their IDs
  const productsInfo = await Product.find({ _id: uniqueIds });

  // Initialize an array to store line items for the Stripe session
  let line_items = [];

  // Loop through each unique product ID
  for (const productId of uniqueIds) {
    // Find product information based on its ID
    const productInfo = productsInfo.find(p => p._id.toString() === productId);

    // Calculate the quantity of the product in the cart
    const quantity = productIds.filter(id => id === productId)?.length || 0;

    // If the quantity is greater than 0 and productInfo exists
    if (quantity > 0 && productInfo) {
      // Push line item information to the line_items array
      line_items.push({
        quantity,
        price_data: {
          currency: 'KES',
          product_data: { name: productInfo.title },
          unit_amount: quantity * productInfo.price * 100,
        },
      });
    }
  }

  // Create a new order document in the database
  const orderDoc = await Order.create({
    line_items,
    email,
    name,
    address,
    city,
    state,
    zip,
    paid: false,
  });

  // Create a new Stripe checkout session
  const session = await stripe.checkout.sessions.create({
    line_items,
    mode: 'payment',
    customer_email: email,
    success_url: process.env.SUCCESS_URL + '/cart?success=1',
    cancel_url: process.env.SUCCESS_URL + '/cart?canceled=1',
    metadata: { orderId: orderDoc._id.toString(), test: 'ok' },
  });

  // Respond with the URL generated for the Stripe checkout session
  res.json({
    url: session.url,
  });
}
