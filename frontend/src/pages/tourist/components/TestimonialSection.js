import React from "react";
import bgImage from "../assets/images/bg_1.jpg";
import person1 from "../assets/images/person_1.jpg";
import person2 from "../assets/images/person_2.jpg";
import person3 from "../assets/images/person_3.jpg";
import { Container, Row, Col, Card, Carousel } from "react-bootstrap";
import { Link } from 'react-router-dom';
import { FaPlaneDeparture, FaCar, FaStar } from 'react-icons/fa';

const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1
};
const testimonials = [
    {
        name: "Emily Johnson",
        role: "Adventure Tourist",
        content: "Our medical trip became a complete adventure. Their attention to both healthcare and leisure made every moment meaningful. Highly recommend their all-in-one medical travel services.",
        image: `${person1}`,
        rating: 5
    },
    {
        name: "David Chen",
        role: "Business Traveler",
        content: "As a business traveler seeking specialized treatment, I appreciated their professionalism. From hospital coordination to hotel booking, every detail was managed with care.",
        image: `${person2}`,
        rating: 5
    },
    {
        name: "Sarah Williams",
        role: "Solo Explorer",
        content: "Traveling alone for medical care felt risky, but their expert team made me feel secure every step of the way. I discovered not just healthcare, but the real heart of Egypt.",
        image: `${person3}`,
        rating: 5
    },
    {
        name: "James Anderson",
        role: "Family Vacationer",
        content: "Planning medical treatment abroad for a family of five seemed impossible, but they made it seamless. The clinics, recovery accommodations, and family-friendly activities were perfect. We’ll definitely trust them again for future healthcare journeys.",
        image: `${person1}`,
        rating: 5
    },
    {
        name: "Maria Garcia",
        role: "Cultural Tourist",
        content: "Their knowledge of Egypt’s culture and history turned my recovery period into an unforgettable journey. From guided tours to relaxation activities, everything exceeded my expectations.",
        image: `${person2}`,
        rating: 5
    }
];

const TestimonialSection = () => {
    return (
        <section
            className="py-5"
            style={{
                backgroundImage: `url("${bgImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                position: 'relative',
            }}
        >
            <div style={overlayStyle}></div>
            <Container className="position-relative" style={{ zIndex: 2 }}>
                <div className="text-center text-white mb-5">
                    <span className="h6 text-uppercase">Testimonial</span>
                    <h2 className="mb-4">Tourist Feedback</h2>
                </div>
                <Carousel
                    interval={5000}
                    indicators={false}
                    controls={true}
                >
                    {testimonials.map((testimonial, index) => (
                        <Carousel.Item key={index}>
                            <div className="bg-white p-4 mx-auto" style={{ maxWidth: '800px', borderRadius: '5px' }}>
                                <div className="text-center">
                                    <div className="mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <FaStar key={i} className="text-warning mx-1" />
                                        ))}
                                    </div>
                                    <p className="mb-4">{testimonial.content}</p>
                                    <div className="d-flex align-items-center justify-content-center">
                                        <div
                                            style={{
                                                width: '60px',
                                                height: '60px',
                                                backgroundImage: `url(${testimonial.image})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                borderRadius: '50%',
                                                marginRight: '15px'
                                            }}
                                        ></div>
                                        <div className="text-start">
                                            <h5 className="mb-0">{testimonial.name}</h5>
                                            <small className="text-muted">{testimonial.role}</small>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Carousel.Item>
                    ))}
                </Carousel>
            </Container>
        </section>
    );
};

export default TestimonialSection;
