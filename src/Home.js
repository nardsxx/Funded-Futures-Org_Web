import React, { useEffect, useState } from "react";
import "./Home.css";
import { useNavigate } from "react-router-dom";

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
            href="#partner-schools"
            className={`home-link ${activeSection === "partner-schools-section" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("partner-schools-section");
            }}
          >
            Partner Schools
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
            href="#faq"
            className={`home-link ${activeSection === "faq-section" ? "active" : ""}`}
            onClick={(e) => {
              e.preventDefault();
              scrollToSection("faq-section");
            }}
          >
            FAQ
          </a>
        </nav>
      </header>

      <section id="home-section" className="home-hero-section">
        <div className="home-hero-text">
          <h1>Build Your Scholarship Page with Funded Futures</h1>
          <p>We are a team of talented developers connecting students to the right scholarships.</p>
          <button className="home-login-button" onClick={() => navigate('/login')}>
            Get Started
          </button>
        </div>
        <div className="home-hero-image">
          <img src="/fundedfutureslogo.png" alt="Hero Illustration" />
        </div>
      </section>

      <section id="about-section" className="home-about-section">
        <h2>About</h2>
        <p>FundedFutures is an application that will connect students to scholarship grantors easier and more efficiently. Unlike manual processing of requirements, students would be able to submit and comply with the requirements of the scholarship program that the student desires to apply to.</p>
      </section>

      <section id="features-section" className="home-features-section">
        <h2>Features</h2>
        <p>Discover personalized scholarship matching, application tracking, and more.</p>
      </section>

      <section id="partner-schools-section" className="home-faq-section">
        <h2>Partner Schools</h2>
        <p>Find answers to common questions about scholarships and applications.</p>
      </section>

      <section id="our-team-section" className="home-our-team-section">
        <h2>Our Team</h2>
        <p>Meet our team of developers</p>
        <div className="team-cards-container">
          <div className="team-card">
            <img src="./gekris.jpg" alt="Member 1" className="team-image" />
            <h3>Gekris Tadeo</h3>
            <p>Project Manager</p>
          </div>
          <div className="team-card">
            <img src="./ryan.jpg" alt="Member 2" className="team-image" />
            <h3>Ryan Santiago</h3>
            <p>Developer</p>
          </div>
          <div className="team-card">
            <img src="./kevin.jpg" alt="Member 3" className="team-image" />
            <h3>Kevin Yu</h3>
            <p>Developer</p>
          </div>
          <div className="team-card">
            <img src="./menards.jpg" alt="Member 4" className="team-image" />
            <h3>Menardo Dagdag</h3>
            <p>Developer</p>
          </div>
        </div>
      </section>

      <section id="faq-section" className="home-faq-section">
        <h2>FAQ</h2>
        <p>Find answers to common questions about scholarships and applications.</p>
      </section>

      <footer className="home-footer">
        <p>&copy; 2024 Funded Futures. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
