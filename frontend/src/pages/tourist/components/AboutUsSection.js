import React from "react";
import aboutImage from "../assets/images/about-1.jpg";

const AboutUsSection = () => {
    return (
        <section className="ftco-section ftco-about ftco-no-pt img">
            <div className="container">
                <div className="row d-flex">
                    <div className="col-md-12 about-intro">
                        <div className="row">
                            <div className="col-md-6 d-flex align-items-stretch">
                                <div
                                    className="img d-flex w-100 align-items-center justify-content-center"
                                    style={{
                                        backgroundImage: `url(${aboutImage})`,
                                    }}
                                ></div>
                            </div>
                            <div className="col-md-6 pl-md-5 py-5">
                                <div className="row justify-content-start pb-3">
                                    <div className="col-md-12 heading-section ftco-animate">
                                        <span className="subheading">About Us</span>
                                        <h2 className="mb-4">Make Your Healthcare Journey Memorable and Safe With Us</h2>
                                        <p>
                                            Your health and comfort are our top priorities. From the moment you arrive in Egypt, we ensure every step of your journey—medical care, travel, and leisure—is expertly managed. Explore the wonders of Egypt with peace of mind, knowing you are supported by trusted healthcare providers and dedicated coordinators at every stage.
                                        </p>
                                        <p>
                                            <a href="/tourist/itinerary-filter" className="btn btn-primary">
                                                View Itineraries
                                            </a>
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

export default AboutUsSection;
