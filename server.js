const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3001; // Ensure this is the port your frontend pages are trying to connect to

// Middleware
app.use(bodyParser.json()); // To parse JSON bodies of incoming requests
app.use(cors()); // To allow requests from your frontend served on a different origin (like file:// or http://127.0.0.1)

// In-memory data storage (Important: Data stored here will reset when the server restarts)
const cart = []; // Stores items added to the cart from the medicine page
const appointments = []; // Stores appointments booked from the home page
const contactMessages = []; // Stores messages sent from the contact us page (for demonstration)

// --- Cart Endpoints (for Medicine Page) ---
app.post('/api/cart/add', (req, res) => {
  const { name, price, image, quantity } = req.body;

  // Basic validation for required fields
  if (!name || price === undefined || quantity === undefined) {
    return res.status(400).json({ error: 'Missing required fields: name, price, or quantity.' });
  }

  const newItem = {
    name: name,
    price: parseFloat(price), // Convert price to a number
    image: image,
    quantity: parseInt(quantity), // Convert quantity to an integer
  };

  // Check if item already exists in the cart and update quantity, otherwise add new item
  const existingItemIndex = cart.findIndex(item => item.name === newItem.name);
  if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += newItem.quantity;
      console.log(`Updated quantity for "${newItem.name}". Current Cart:`, cart);
  } else {
      cart.push(newItem);
      console.log(`Added "${newItem.name}" to cart. Current Cart:`, cart);
  }

  // Send a success response with the current state of the cart
  res.json({ message: 'Item added to cart successfully.', cart: cart });
});

app.get('/api/cart', (req, res) => {
  // Send the current state of the cart
  console.log('Fetching current cart:', cart);
  res.json(cart);
});
// --- End Cart Endpoints ---


// --- Appointment Endpoints (for Home and Reminder Pages) ---
// API endpoint to book a new appointment
app.post('/api/appointments/book', (req, res) => {
  // Expecting request body like: { type: 'Doctor', name: 'Dr Sameer Malhotra', date: 'YYYY-MM-DD', time: 'HH:MM', notes: '' }
  const { type, name, date, time, notes } = req.body;

  // Basic validation for required appointment details
  if (!type || !name || !date || !time) {
    console.error('Appointment booking error: Missing required fields in request body.', req.body);
    return res.status(400).json({ error: 'Missing required appointment details (type, name, date, time).' });
  }

  const newAppointment = {
    id: Date.now(), // Generate a simple unique ID using a timestamp
    type: type, // e.g., 'Doctor', 'Nutritionist', 'Trainer'
    name: name, // Name of the professional
    date: date, // Appointment date (you might want to add date format/validation)
    time: time, // Appointment time (you might want to add time format/validation)
    notes: notes || '', // Optional notes, default to an empty string if not provided
    bookedAt: new Date(), // Timestamp of when the booking was received by the server
  };

  appointments.push(newAppointment); // Add the new appointment to our storage
  console.log('New appointment booked:', newAppointment); // Log the new appointment to the server console

  // Send a success response with the details of the booked appointment
  res.status(201).json({ message: 'Appointment booked successfully.', appointment: newAppointment });
});

// API endpoint to get all appointments
app.get('/api/appointments', (req, res) => {
  // In a real application, you would filter appointments by user, date range, etc.
  // For this example, we return all stored appointments.
  console.log('Fetching all appointments. Current Appointments:', appointments);
  res.json(appointments);
});
// --- End Appointment Endpoints ---


// --- Contact Form Endpoint (for Contact Us Page) ---
// API endpoint to receive contact form submissions
app.post('/api/contact', (req, res) => {
    // Expecting request body like: { fullname: '...', email: '...', countryCode: '...', phone: '...', message: '...' }
    const { fullname, email, countryCode, phone, message } = req.body;

    // Basic validation for required contact fields
    if (!fullname || !email || !phone || !message) {
        console.error('Contact form submission error: Missing required fields in request body.', req.body);
        return res.status(400).json({ error: 'Missing required contact form fields (Full Name, Email, Phone, Message).' });
    }

    const newContactMessage = {
        id: Date.now(), // Simple unique ID
        fullname: fullname,
        email: email,
        countryCode: countryCode,
        phone: phone,
        message: message,
        receivedAt: new Date(), // Timestamp of when the message was received
    };

    contactMessages.push(newContactMessage); // Store the message (for demonstration purposes)
    console.log('New contact message received:', newContactMessage); // Log the message to the server console

    // In a real application, instead of just storing, you would likely:
    // 1. Send an email (e.g., using a service like Nodemailer)
    // 2. Save the message to a database for later review

    // Send a success response back to the frontend
    res.status(200).json({ message: 'Your message has been received successfully. Thank you!' });
});
// --- End Contact Form Endpoint ---


// --- Start the Server ---
app.listen(port, () => {
  console.log(`Backend server listening at http://localhost:${port}`);
});