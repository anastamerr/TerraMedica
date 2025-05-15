import React from "react";
import bgImage from "../assets/images/bg_3.jpg";

const Footer = () => {
    return (
        <footer
            className="ftco-footer bg-bottom ftco-no-pt"
            style={{ backgroundImage: `url(${bgImage})` }}
        >
            <div className="container">
                <div className="row mb-5">
                    <div className="col-md pt-5">
                        <div className="ftco-footer-widget pt-md-5 mb-4">
                            <h2 className="ftco-heading-2">About</h2>
                            <p>
                                Your health and comfort are our top priorities. From the moment you arrive in Egypt, we ensure every step of your journey—medical care, travel, and leisure—is expertly managed. Explore the wonders of Egypt with peace of mind, knowing you are supported by trusted healthcare providers and dedicated coordinators at every stage.
                            </p>
                            <ul className="ftco-footer-social list-unstyled float-md-left float-lft">
                                <li className="ftco-animate">
                                    <a href="#">
                                        <span className="fa fa-twitter"></span>
                                    </a>
                                </li>
                                <li className="ftco-animate">
                                    <a href="#">
                                        <span className="fa fa-facebook"></span>
                                    </a>
                                </li>
                                <li className="ftco-animate">
                                    <a href="#">
                                        <span className="fa fa-instagram"></span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md pt-5 border-left">
                        <div className="ftco-footer-widget pt-md-5 mb-4 ml-md-5">
                            <h2 className="ftco-heading-2">Information</h2>
                            <ul className="list-unstyled">
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Online Enquiry
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        General Enquiries
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Booking Conditions
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Privacy and Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Refund Policy
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Call Us
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md pt-5 border-left">
                        <div className="ftco-footer-widget pt-md-5 mb-4">
                            <h2 className="ftco-heading-2">Experience</h2>
                            <ul className="list-unstyled">
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Adventure
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Hotel and Restaurant
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Beach
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Nature
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Camping
                                    </a>
                                </li>
                                <li>
                                    <a href="#" className="py-2 d-block">
                                        Party
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col-md pt-5 border-left">
                        <div className="ftco-footer-widget pt-md-5 mb-4">
                            <h2 className="ftco-heading-2">Have a Questions?</h2>
                            <div className="block-23 mb-3">
                                <ul>
                                    <li>
                                        <span className="icon fa fa-map-marker"></span>
                                        <span className="text">
                                            153 Ramses St. Abbasiya, Cairo, Egypt
                                        </span>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <span className="icon fa fa-phone"></span>
                                            <span className="text">+20 102 3929 210</span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#">
                                            <span className="icon fa fa-paper-plane"></span>
                                            <span className="text">info@terramedica.com</span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12 text-center">
                        <p>
                            Copyright &copy; {new Date().getFullYear()} All rights reserved |
                            This template is made with{" "}
                            <i className="fa fa-heart" aria-hidden="true"></i> by{" "}
                            <a href="https://colorlib.com" target="_blank" rel="noreferrer">
                                Colorlib
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
