import React from "react";
import { Link } from "react-router-dom";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaTwitter } from "react-icons/fa";

export default function Footer() {
  const linkToPath = {
    // Services
    Electricians: "/services?category=electrician",
    Plumbers: "/services?category=plumber",
    Carpenters: "/services?category=carpenter",
    Painters: "/services?category=painter",
    Technicians: "/services?category=technician",
    Cleaners: "/services?category=cleaner",
    Gardeners: "/services?category=gardener",

    // Support
    "Emergency Help": "/emergency",
    "Booking Guide": "/services",
    "Payment Options": "/services",
    FAQs: "/about",

    // Company
    "About Us": "/about",
    Careers: "/about",
    Blog: "/about",
    Contact: "/about",
    "Privacy Policy": "/about",

    // For Clients
    "How it Works": "/register",
    Pricing: "/services",
    Testimonials: "/about",
    "Safety Tips": "/about",

    // For Workers
    "Sign Up": "/register",
    Guidelines: "/about",
    "Worker Dashboard": "/worker",

    // Bottom bar
    "Terms of Use": "/about",
  };

  const footerData = [
    {
      title: "Services",
      links: ["Electricians", "Plumbers", "Carpenters", "Painters", "Technicians", "Cleaners", "Gardeners"],
    },
    {
      title: "Support",
      links: ["Emergency Help", "Booking Guide", "Payment Options", "FAQs"],
    },
    {
      title: "Company",
      links: ["About Us", "Careers", "Blog", "Contact", "Privacy Policy"],
    },
    {
      title: "For Clients",
      links: ["How it Works", "Pricing", "Testimonials", "Safety Tips"],
    },
    {
      title: "For Workers",
      links: ["Sign Up", "Guidelines", "Worker Dashboard", "Support"],
    },
    {
      title: "Contact Us",
      links: [
        "Email: info@skilllink.com",
        "Phone: +92 300 1234567",
        "Address: Abbottabad, Pakistan",
      ],
    },
  ];

  const isContactLine = (text) =>
    text.includes("Email:") || text.includes("Phone:") || text.includes("Address:");

  return (
    <footer
      className="py-5"
      style={{
        background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 70%)",
        borderTop: "1px solid #bfdbfe",
        color: "#475569",
      }}
    >
      <div className="container">
        <div className="row g-4">
          {footerData.map((col, i) => (
            <div key={i} className="col-6 col-md-4 col-lg-2">
              <h6 className="fw-bold mb-3" style={{ color: "#1e3a8a" }}>
                {col.title}
              </h6>

              <ul className="list-unstyled m-0">
                {col.links.map((text, j) => {
                  if (isContactLine(text)) {
                    return (
                      <li key={j} className="mb-2">
                        <span style={{ color: "#64748b" }}>{text}</span>
                      </li>
                    );
                  }

                  const to = linkToPath[text] || "/";

                  return (
                    <li key={j} className="mb-2">
                      <Link to={to} className="footer-link text-decoration-none">
                        {text}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <hr className="my-4" style={{ borderColor: "#bfdbfe" }} />

        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="mb-0" style={{ color: "#64748b" }}>
            &copy; 2025 Skill Link. All rights reserved.
          </p>

          <div className="d-flex align-items-center flex-wrap gap-3">
            <Link to="/about" className="footer-link text-decoration-none">
              Privacy Policy
            </Link>
            <Link to="/about" className="footer-link text-decoration-none">
              Terms of Use
            </Link>
            <Link to="/about" className="footer-link text-decoration-none">
              Contact
            </Link>

            <div className="d-flex align-items-center ms-md-3 gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="social-link">
                <FaFacebookF />
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="social-link">
                <FaInstagram />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="social-link">
                <FaLinkedinIn />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="social-link">
                <FaTwitter />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ small clean footer CSS */}
      <style>{`
        .footer-link {
          color: #475569;
          transition: 0.2s ease;
        }
        .footer-link:hover {
          color: #2563eb;
        }
        .social-link {
          color: #475569;
          font-size: 1.05rem;
          transition: 0.2s ease;
        }
        .social-link:hover {
          color: #2563eb;
          transform: translateY(-1px);
        }
      `}</style>
    </footer>
  );
}
