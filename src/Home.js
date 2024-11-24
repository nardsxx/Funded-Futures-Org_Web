import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";
import { FaClipboardList, FaEnvelopeOpenText, FaEnvelope} from "react-icons/fa";
import { FaGraduationCap } from "react-icons/fa6";


const Home = () => {
  const [activeSection, setActiveSection] = useState("");
  const navigate = useNavigate();

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll("section");
      const scrollPos = window.scrollY + 100;

      sections.forEach((section) => {
        if (
          section.offsetTop <= scrollPos &&
          section.offsetTop + section.offsetHeight > scrollPos
        ) {
          setActiveSection(section.getAttribute("id"));
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="home-container">
      <header className="home-navbar">
        <div className="home-logo">Funded Futures</div>
        <nav className="home-nav-links">
          <a
            href="#home"
            className={`home-link ${activeSection === "home-section" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("home-section");
            }}
          >
            Overview
          </a>
          <a
            href="#features"
            className={`home-link ${activeSection === "features-section" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("features-section");
            }}
          >
            Features
          </a>
          <a
            href="#about"
            className={`home-link ${activeSection === "about-section" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("about-section");
            }}
          >
            About
          </a>
          <a
            href="#mobile"
            className={`home-link ${activeSection === "mobile-section" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("mobile-section");
            }}
          >
            Mobile
          </a>
          <a
            href="#our-team"
            className={`home-link ${activeSection === "our-team-section" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("our-team-section");
            }}
          >
            Our Team
          </a>
          <a
            href="#partner-schools"
            className={`home-link ${activeSection === "partner-schools-section" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("partner-schools-section");
            }}
          >
            Partners
          </a>
        </nav>
      </header>

      <section id="home-section" className="home-hero-section">
        <div className="home-hero-text">
          <h1>Build Your Scholarship Page with</h1>
          <h1 className="home-hero-text-title">Funded Futures</h1>
          <p>Empowering organizations to connect students with the right scholarships</p>
          <button className="home-login-button" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
        <div className="home-hero-image">
          <img src="/images/fundedfutureslogo.png" alt="Hero Illustration" />
        </div>
      </section>

      <section id="features-section" className="home-features-section">
        <h2>Key Features</h2>
        <div className="features-container">
          <div className="feature-card">
            <FaGraduationCap className="feature-icon" />
            <h3>Scholarship Program</h3>
            <p>Effortlessly create and manage scholarship programs with customizable fields</p>
          </div>
          <div className="feature-card">
            <FaClipboardList className="feature-icon" />
            <h3>Easy Applicant Review</h3>
            <p>Access and evaluate applicant profiles, download documents, track progress, and approve students</p>
          </div>
          <div className="feature-card">
            <FaEnvelopeOpenText className="feature-icon" />
            <h3>Personalized Engagement</h3>
            <p>Notify directly with applicants and leave remarks to foster trust and transparency</p>
          </div>
        </div>
      </section>

      <section id="about-section" className="home-about-section">
        <h2>About Funded Futures</h2>
        <p className="about-p">Funded Futures is a powerful scholarship finder platform designed to connect organizations with students seeking funding opportunities. Our web app streamlines the scholarship discovery process, making it easier for organizations to offer their scholarships and for students to find the right opportunities</p>
      </section>

      <section id="mobile-section" className="home-mobile-section">
        <h2>Download Mobile Application for Students</h2>
        <p className="mobile-p">
          Stay connected and never miss an opportunity! Download the Funded Futures app to discover scholarships, track applications, and receive updates — all from the convenience of your mobile device
        </p>
        <div className="mobile-content">
            <img
              src="/images/funded-futures-app-qr.png"
              alt="Funded Futures App QR Code"
              className="mobile-qr"
            />
        </div>
      </section>

      <section id="our-team-section" className="home-our-team-section">
        <h2>Developers</h2>
        <div className="team-cards-container">
          <div className="team-card">
            <img src="/images/gekris.jpg" alt="Gekris" className="team-image" />
            <h3>Gekris Tadeo</h3>
            <p>Project Manager</p>
          </div>
          <div className="team-card">
            <img src="/images/ryan.jpg" alt="Ryan" className="team-image" />
            <h3>Ryan Santiago</h3>
            <p>Developer</p>
          </div>
          <div className="team-card">
            <img src="/images/kevin.jpg" alt="Kevin" className="team-image" />
            <h3>Kevin Yu</h3>
            <p>Developer</p>
          </div>
          <div className="team-card">
            <img src="/images/menards.jpg" alt="Menards" className="team-image" />
            <h3>Menardo Dagdag</h3>
            <p>Developer</p>
          </div>
        </div>
      </section>

      <section id="partner-schools-section" className="home-partner-section">
          <h2>Partner Schools</h2>
          <div className="partner-logos">
              <img src="/images/tiplogo.png" alt="School 1" className="partner-logo" />
          </div>
      </section>

      <section id="contact-section" className="home-contact-section">
        <h2>Get In Touch</h2>
        <p>Have some questions to our team? Please feel free to reach us out!</p>
        <a href="https://mail.google.com/mail/?view=cm&fs=1&to=fundedfutures@gmail.com&su=Subject&body=Message" target="_blank" rel="noopener noreferrer">        
        <button className="home-contact-button">
          <FaEnvelope className="home-button-icon" />
          Contact Us
        </button>
        </a>
      </section>

      <footer className="home-footer">
        <p>&copy; 2024 Funded Futures. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
