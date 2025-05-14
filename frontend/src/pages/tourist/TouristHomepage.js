import React from "react";
import { Link } from "react-router-dom";
import { Container, Row, Col, Card } from "react-bootstrap";
import {
  FaPlane,
  FaHotel,
  FaCar,
  FaMap,
  FaShoppingBag,
  FaExclamationCircle,
  FaUser,
  FaStar,
  FaComments,
  FaInfo,
  FaLock,
} from "react-icons/fa";
import "./assets/css/animate.css";
import "./assets/css/owl.carousel.min.css";
import "./assets/css/owl.theme.default.min.css";
import "./assets/css/magnific-popup.css";
import "./assets/css/bootstrap-datepicker.css";
import "./assets/css/jquery.timepicker.css";
import "./assets/css/flaticon.css";
import "./assets/css/bootstrap/bootstrap-grid.css";
import "./assets/css/bootstrap/bootstrap-reboot.css";
import "./assets/css/bootstrap.min.css"; // Bootstrap should come last among its files
import "./assets/css/style.css"; // Custom styles should be last



import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import SearchSection from "./components/SearchSection";
import ServicesSection from "./components/ServicesSection";
import SelectDestination from "./components/SelectDestination";
import TourDestinations from "./components/TourDestniations";
import AboutSection from "./components/AboutSection";
import AboutUsSection from "./components/AboutUsSection";
import TestimonialSection from "./components/TestimonialSection";
import BlogSection from "./components/BlogSection";
import IntroSection from "./components/IntroSection";
import Footer from "./components/Footer";
import VacationGuide from "../../components/VacationGuide";

const TouristHomePage = () => {
  const username =
    JSON.parse(localStorage.getItem("user"))?.username || "Tourist";

  const menuItems = [
    {
      to: "/tourist/view-events",
      label: "View Events",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/my-profile",
      label: "My Profile",
      icon: <FaUser />,
      variant: "primary",
    },
    {
      to: "/tourist/book-flight",
      label: "Book a Flight",
      icon: <FaPlane />,
      variant: "primary",
    },
    {
      to: "/tourist/book-hotel",
      label: "Book a Hotel",
      icon: <FaHotel />,
      variant: "primary",
    },
    {
      to: "/tourist/book-transportation",
      label: "Book Transportation",
      icon: <FaCar />,
      variant: "primary",
    },
    {
      to: "/tourist/itinerary-filter",
      label: "Itinerary Filter",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/filtered-activities",
      label: "Filtered Activities",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/products",
      label: "View Products",
      icon: <FaShoppingBag />,
      variant: "primary",
    },
    {
      to: "/tourist/view-bookings",
      label: "View Bookings",
      icon: <FaMap />,
      variant: "primary",
    },
    {
      to: "/tourist/change-password",
      label: "Change My Password",
      icon: <FaLock />,
      variant: "primary",
    },
    {
      to: "/tourist/about",  // Add this new item
      label: "About Us",
      icon: <FaInfo />,
      variant: "primary",
    },
    {
      to: "/tourist/complaints",
      label: "File a Complaint",
      icon: <FaExclamationCircle />,
      variant: "danger",
    },
    {
      to: "/tourist/my-complaints",
      label: "My Complaints",
      icon: <FaExclamationCircle />,
      variant: "primary",
    },
  ];

  // Group menu items by category
  const menuCategories = {
    "Main Services": menuItems.slice(0, 10),
    Support: menuItems.slice(10),
  };

  return (
    <>
    <Navbar/>
   <HeroSection username={username}/>
   <SearchSection/>
   <ServicesSection/>
   {/* <SelectDestination/> */}
   <TourDestinations/>
   <AboutSection/>
   <AboutUsSection/>
   <TestimonialSection/>
   {/* <BlogSection/> */}
   <IntroSection/>
   <VacationGuide />
   <Footer/>
    {/* <Container className="py-5">
      <Card className="shadow-sm">
        <Card.Body>
          <div className="text-center mb-4">
            <h1 className="mb-3">Welcome to the Tourist Homepage</h1>
            <p className="text-muted">Welcome back, {username}!</p>
          </div>

          {Object.entries(menuCategories).map(([category, items]) => (
            <div
              key={category}
              className="mb-4"
            >
              <h3 className="mb-3 text-primary border-bottom pb-2">
                {category}
              </h3>
              <Row className="g-4 justify-content-center">
                {items.map((item, index) => (
                  <Col
                    xs={12}
                    sm={6}
                    md={4}
                    key={index}
                  >
                    <Link
                      to={item.to}
                      className={`btn btn-${item.variant} w-100 d-flex align-items-center justify-content-center gap-2 p-3`}
                      style={{
                        transition: "all 0.3s ease",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 8px rgba(0,0,0,0.2)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 2px 4px rgba(0,0,0,0.1)";
                      }}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                    </Link>
                  </Col>
                ))}
              </Row>
            </div>
          ))}
        </Card.Body>
      </Card>
    </Container> */}
    </>
  );
};

export default TouristHomePage;
