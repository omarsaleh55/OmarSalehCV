const express = require('express');
const path = require('path');
const nodemailer = require('nodemailer');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3000;

// View engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Security and performance middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));
app.use(compression());

// Static files
app.use(express.static(path.join(__dirname, 'public')));
// Form parsing
app.use(express.urlencoded({ extended: true }));

// Rate limiting
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many contact form submissions, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Load profile data
const profile = require('./src/profile.json');

app.get('/', (req, res) => {
  res.render('pages/home', { profile });
});

app.get('/experience', (req, res) => {
  res.render('pages/experience', { profile });
});

app.get('/projects', (req, res) => {
  res.render('pages/projects', { profile });
});

app.get('/contact', (req, res) => {
  res.render('pages/contact', { profile, form: {}, errors: {}, success: false });
});

// Email configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'omarsaleh55@gmail.com',
    pass: process.env.EMAIL_PASS || 'your-app-password'
  }
});

app.post('/contact', contactLimiter, async (req, res) => {
  const { name, mobile, email, message } = req.body || {};
  const errors = {};
  function isEmpty(v) { return !v || String(v).trim() === ''; }

  if (isEmpty(name)) errors.name = 'Name is required';
  if (isEmpty(mobile)) errors.mobile = 'Mobile is required';
  if (isEmpty(email)) {
    errors.email = 'Email is required';
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = 'Email is invalid';
  }
  if (isEmpty(message)) errors.message = 'Please enter a message';

  const hasErrors = Object.keys(errors).length > 0;
  if (hasErrors) {
    return res.status(400).render('pages/contact', {
      profile,
      form: { name, mobile, email, message },
      errors,
      success: false
    });
  }

  try {
    // Send email notification
    const mailOptions = {
      from: process.env.EMAIL_USER || 'omarsaleh55@gmail.com',
      to: 'omarsaleh55@gmail.com',
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Mobile:</strong> ${mobile}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Sent from your portfolio contact form</em></p>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Contact form email sent successfully');

    return res.render('pages/contact', {
      profile,
      form: {},
      errors: {},
      success: true
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    return res.render('pages/contact', {
      profile,
      form: { name, mobile, email, message },
      errors: { general: 'Failed to send message. Please try again or contact me directly.' },
      success: false
    });
  }
});

// Resume download route
app.get('/resume', (req, res) => {
  const resumePath = path.join(__dirname, 'public', 'resume.pdf');
  res.download(resumePath, 'Omar_Mohamed_Saleh_Resume.pdf');
});

// vCard download route
app.get('/vcard', (req, res) => {
  const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${profile.name}
ORG:Software Engineering Student
TEL:${profile.phone}
EMAIL:${profile.email}
URL:${profile.links.github}
URL:${profile.links.linkedin}
ADR:;;${profile.location};;;
NOTE:Software Engineering student at Galala University/Arizona State University
END:VCARD`;
  
  res.setHeader('Content-Type', 'text/vcard');
  res.setHeader('Content-Disposition', 'attachment; filename="Omar_Mohamed_Saleh.vcf"');
  res.send(vcard);
});

app.use((req, res) => {
  res.status(404).render('pages/404', { profile });
});

app.listen(PORT, () => {
  console.log(`Portfolio running on http://localhost:${PORT}`);
});


