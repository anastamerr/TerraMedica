import React from "react";
import service1 from "../assets/images/services-1.jpg"
import service2 from "../assets/images/services-2.jpg"
import service3 from "../assets/images/services-3.jpg"
import service4 from "../assets/images/services-4.jpg"
const ServicesSection = () => {
    return (
        <section className="ftco-section services-section">
            <div className="container">
                <div className="row d-flex">
                    {/* Text Content Section */}
                    <div className="col-md-6 order-md-last heading-section pl-md-5 ftco-animate d-flex align-items-center">
                        <div className="w-100">
                            <span className="subheading">Welcome to TerraMedica</span>
                            <h2 className="mb-4">It’s Time to Begin Your Journey to Wellness</h2>
                            <p>
                                Welcome to Egypt, where ancient wonders meet modern healthcare. From the banks of the Nile to the heart of Cairo, world-class hospitals and specialized clinics await you.
                            </p>
                            <p>
                                Here, every treatment is paired with unforgettable cultural experiences—whether you’re recovering by the Red Sea or exploring the pyramids after your procedure. Let us guide you through a seamless journey where your health and comfort come first.
                            </p>
                            <p>
                                <a href="/tourist/view-events" className="btn btn-primary py-3 px-4">
                                    View Events
                                </a>
                            </p>
                        </div>
                    </div>

                    {/* Services Section */}
                    <div className="col-md-6">
                        <div className="row">
                            {/* Service 1 */}
                            <div className="col-md-12 col-lg-6 d-flex align-self-stretch ftco-animate">
                                <div
                                    className="services services-1 color-1 d-block img"
                                    style={{
                                        backgroundImage: `url(${service1})`,
                                    }}
                                >
                                    <div className="icon d-flex align-items-center justify-content-center">
                                        <span className="flaticon-paragliding"></span>
                                    </div>
                                    <div className="media-body">
                                        <h3 className="heading mb-3">Activities</h3>
                                        <p>
                                            Enhance your healing journey with tailored cultural, historical, and leisure activities across Egypt—from Nile cruises to Red Sea relaxation.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service 2 */}
                            <div className="col-md-12 col-lg-6 d-flex align-self-stretch ftco-animate">
                                <div
                                    className="services services-1 color-2 d-block img"
                                    style={{
                                        backgroundImage: `url(${service2})`,
                                    }}
                                >
                                    <div className="icon d-flex align-items-center justify-content-center">
                                        <span className="flaticon-route"></span>
                                    </div>
                                    <div className="media-body">
                                        <h3 className="heading mb-3">Travel Arrangements</h3>
                                        <p>
                                            We handle all your travel needs, including flights, airport transfers, and local transportation—so you can focus on your health and peace of mind.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service 3 */}
                            <div className="col-md-12 col-lg-6 d-flex align-self-stretch ftco-animate">
                                <div
                                    className="services services-1 color-3 d-block img"
                                    style={{
                                        backgroundImage: `url(${service3})`,
                                    }}
                                >
                                    <div className="icon d-flex align-items-center justify-content-center">
                                        <span className="flaticon-tour-guide"></span>
                                    </div>
                                    <div className="media-body">
                                        <h3 className="heading mb-3">Private Guide</h3>
                                        <p>
                                            Explore Egypt safely and comfortably with dedicated multilingual guides who assist you with sightseeing, translation, and local support.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Service 4 */}
                            <div className="col-md-12 col-lg-6 d-flex align-self-stretch ftco-animate">
                                <div
                                    className="services services-1 color-4 d-block img"
                                    style={{
                                        backgroundImage: `url(${service4})`,
                                    }}
                                >
                                    <div className="icon d-flex align-items-center justify-content-center">
                                        <span className="flaticon-map"></span>
                                    </div>
                                    <div className="media-body">
                                        <h3 className="heading mb-3">Location Manager</h3>
                                        <p>
                                            Our on-ground coordinators ensure your entire experience—medical and touristic—is smooth, organized, and worry-free from arrival to departure.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
