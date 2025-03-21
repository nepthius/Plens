'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you can add the logic to send the form data to your backend
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      subject: '',
      message: ''
    });
  };

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>Contact Us</h1>
      <p>Have questions? We're here to help!</p>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
          }}
        >
          <h3>Our Location</h3>
          <p>123 Eco Street, Green City, 10001</p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
          }}
        >
          <h3>Email Us</h3>
          <p>info@plens.eco</p>
        </div>

        <div
          style={{
            border: "1px solid #ccc",
            padding: "15px",
          }}
        >
          <h3>Call Us</h3>
          <p>+1 (555) 123-4567</p>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          padding: "20px",
          marginTop: "30px",
        }}
      >
        <h2>Send us a message</h2>
        <p>Fill out the form below and we'll get back to you.</p>

        <form style={{ marginTop: "20px" }} onSubmit={handleSubmit}>
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginBottom: "15px",
            }}
          >
            <div style={{ width: "50%" }}>
              <label htmlFor="firstName" style={{ display: "block", marginBottom: "5px" }}>
                First name
              </label>
              <input
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ width: "50%" }}>
              <label htmlFor="lastName" style={{ display: "block", marginBottom: "5px" }}>
                Last name
              </label>
              <input
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="email" style={{ display: "block", marginBottom: "5px" }}>
              Email
            </label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="name@example.com"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="subject" style={{ display: "block", marginBottom: "5px" }}>
              Subject
            </label>
            <input
              id="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder="How can we help you?"
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label htmlFor="message" style={{ display: "block", marginBottom: "5px" }}>
              Message
            </label>
            <textarea
              id="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Please provide details..."
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ccc",
                minHeight: "100px",
              }}
            />
          </div>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "10px",
              backgroundColor: "green",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  )
} 