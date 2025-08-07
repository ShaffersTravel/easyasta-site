document.addEventListener('DOMContentLoaded', function () {
  // List of countries in the Visa Waiver Program. These values populate the nationality dropdown.
  const countries = [
    'Andorra', 'Australia', 'Belgium', 'Brunei', 'Chile', 'Croatia', 'Czech Republic', 'Denmark', 'Estonia', 'Finland',
    'France', 'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Israel', 'Italy', 'Japan', 'Latvia',
    'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta', 'Monaco', 'Netherlands', 'New Zealand', 'Norway', 'Poland', 'Portugal',
    'San Marino', 'Singapore', 'Slovakia', 'Slovenia', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan', 'United Kingdom'
  ];

  // Populate nationality select options
  const nationalitySelect = document.getElementById('nationality');
  if (nationalitySelect) {
    countries.forEach(country => {
      const option = document.createElement('option');
      option.value = country;
      option.textContent = country;
      nationalitySelect.appendChild(option);
    });
  }

  const applicationForm = document.getElementById('applicationForm');
  const applicationResult = document.getElementById('applicationResult');
  applicationForm?.addEventListener('submit', async function (e) {
    e.preventDefault();
    // Retrieve form values
    const name = document.getElementById('fullName').value.trim();
    const nationality = document.getElementById('nationality').value;
    const passport = document.getElementById('passport').value.trim();
    const dob = document.getElementById('dob').value;
    const email = document.getElementById('email').value.trim();

    if (!name || !nationality || !passport || !dob || !email) {
      applicationResult.textContent = 'Please complete all fields.';
      applicationResult.style.color = '#e63946';
      return;
    }

    // Generate a unique reference number
    const ref = 'ASTA-' + Date.now().toString(36).toUpperCase();
    // Save current application locally (this is a placeholder for your backend database)
    const applications = JSON.parse(localStorage.getItem('easyAstaApplications') || '{}');
    applications[ref] = { name, nationality, passport, dob, email, status: 'Submitted' };
    localStorage.setItem('easyAstaApplications', JSON.stringify(applications));

    // Build application data to send to backend for payment session creation
    const applicationData = {
      name,
      nationality,
      passport,
      dob,
      email,
      reference: ref
    };

    try {
      await initiatePayment(applicationData);
    } catch (err) {
      console.error(err);
      applicationResult.textContent = 'An error occurred while initiating payment. Please try again later.';
      applicationResult.style.color = '#e63946';
    }
  });

  const statusForm = document.getElementById('statusForm');
  const statusResult = document.getElementById('statusResult');
  statusForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const ref = document.getElementById('refNumber').value.trim();
    if (!ref) {
      statusResult.textContent = 'Please enter your reference number.';
      statusResult.style.color = '#e63946';
      return;
    }
    const applications = JSON.parse(localStorage.getItem('easyAstaApplications') || '{}');
    if (applications[ref]) {
      statusResult.innerHTML = `Application Status for <strong>${ref}</strong>: <em>${applications[ref].status}</em>.`;
      statusResult.style.color = '#005fa3';
    } else {
      statusResult.textContent = 'Reference number not found. Please check your number and try again.';
      statusResult.style.color = '#e63946';
    }
  });

  const contactForm = document.getElementById('contactForm');
  const contactResult = document.getElementById('contactResult');
  contactForm?.addEventListener('submit', function (e) {
    e.preventDefault();
    const contactName = document.getElementById('contactName').value.trim();
    const contactEmail = document.getElementById('contactEmail').value.trim();
    const contactMessage = document.getElementById('contactMessage').value.trim();
    if (!contactName || !contactEmail || !contactMessage) {
      contactResult.textContent = 'Please fill in all contact fields.';
      contactResult.style.color = '#e63946';
      return;
    }
    // Simulate sending message
    contactResult.textContent = 'Thank you for contacting us! We will get back to you soon.';
    contactResult.style.color = '#005fa3';
    // Reset contact form
    contactForm.reset();
  });
});

/**
 * Initiates a Stripe Checkout payment session.
 * Sends application data to a backend endpoint that creates a Checkout Session.
 * After receiving the session ID, redirects the user to Stripe's hosted checkout page.
 *
 * NOTE: You must implement the '/create-checkout-session' endpoint on your server.
 * It should create a Stripe Checkout Session with the correct price (ESTA fee plus service fee)
 * and return an object with a `sessionId` property. Additionally, configure Stripe to email
 * receipts to customers for successful payments.
 *
 * Replace the placeholder public key below with your actual Stripe publishable key.
 */
async function initiatePayment(applicationData) {
  // Send application details to your backend API to create a Checkout Session
  const response = await fetch('/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ application: applicationData })
  });
  if (!response.ok) {
    throw new Error('Failed to create checkout session');
  }
  const result = await response.json();
  const { sessionId } = result;
  // Initialise Stripe using your public key
  const stripe = Stripe('pk_test_REPLACE_WITH_YOUR_PUBLIC_KEY');
  // Redirect to Stripe's hosted checkout page
  const { error } = await stripe.redirectToCheckout({ sessionId });
  if (error) {
    throw error;
  }
}
