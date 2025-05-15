import React, { useState } from "react";
import { 
  Container, 
  Form, 
  Button, 
  Alert, 
  Card,
  Row,
  Col,
  Spinner 
} from "react-bootstrap";
import { 
  FaCar, 
  FaUsers, 
  FaDollarSign,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaList,
  FaCheckSquare,
  FaChevronRight,
  FaTimes,
  FaPlus,
  FaArrowLeft,
  FaLeaf, 
  FaStar, 
  FaRegStar, 
  FaExclamationTriangle, 
  FaInfoCircle
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import AdvertiserNavbar from './AdvertiserNavbar';

const CreateTransportationListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    vehicleType: "",
    model: "",
    capacity: "",
    price: "",
    availabilityStart: "",
    availabilityEnd: "",
    pickupLocation: "",
    dropoffLocation: "",
    description: "",
    features: [],
    fuelType: "",
    sustainabilityRating: 3,
    ecoFriendlyFeatures: [],
    carbon: null
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [estimatedEmissions, setEstimatedEmissions] = useState(null);
  const [carbonSavings, setCarbonSavings] = useState(null);
  const [autoRating, setAutoRating] = useState(null);

  const vehicleTypes = ["Car", "Van", "Bus", "Minibus", "Limousine"];
  const fuelTypes = ["Gasoline", "Diesel", "Electric", "Hybrid", "Hydrogen", "Natural Gas"];

  const features = [
    "Air Conditioning",
    "WiFi",
    "GPS",
    "Entertainment System",
    "Luggage Space",
    "Wheelchair Accessible",
    "Child Seats Available",
    "Driver Included",
  ];

  const calculateSustainability = (vehicleType, fuelType) => {
    if (!vehicleType || !fuelType) return;
    
    const baseEmissions = {
      Car: 120,
      Van: 180,
      Bus: 70,
      Minibus: 90,
      Limousine: 250
    };
    
    const fuelFactors = {
      Gasoline: 1.0,
      Diesel: 0.9,
      Electric: 0.2,
      Hybrid: 0.6,
      Hydrogen: 0.3,
      "Natural Gas": 0.7
    };
    
    const baseEmission = baseEmissions[vehicleType] || 150;
    const emissionFactor = fuelFactors[fuelType] || 1.0;
    const calculatedEmissions = Math.round(baseEmission * emissionFactor);
    
    const standardEmissions = baseEmission;
    const savings = standardEmissions - calculatedEmissions;
    
    let rating = 3;
    if (emissionFactor <= 0.3) rating = 5;
    else if (emissionFactor <= 0.6) rating = 4;
    else if (emissionFactor <= 0.8) rating = 3;
    else if (emissionFactor <= 0.9) rating = 2;
    else rating = 1;
    
    setEstimatedEmissions(calculatedEmissions);
    setCarbonSavings(savings);
    setAutoRating(rating);
    
    setFormData(prev => ({
      ...prev,
      carbon: calculatedEmissions,
      sustainabilityRating: rating,
      ecoFriendlyFeatures: getFeaturesForFuelType(fuelType)
    }));
  };

  const getFeaturesForFuelType = (fuelType) => {
    const baseFeatures = [];
    
    switch(fuelType) {
      case "Electric":
        return [...baseFeatures, "Zero Emissions", "Energy Recovery Braking"];
      case "Hybrid":
        return [...baseFeatures, "Regenerative Braking", "Auto Start-Stop"];
      case "Hydrogen":
        return [...baseFeatures, "Water Vapor Emissions", "Fast Refueling"];
      case "Natural Gas":
        return [...baseFeatures, "Lower CO2", "Reduced NOx"];
      default:
        return baseFeatures;
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type } = e.target;
    
    if (type === "number") {
      setFormData((prev) => ({
        ...prev,
        [name]: value === "" ? "" : parseFloat(value),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
    
    if (name === "vehicleType" || name === "fuelType") {
      const updatedFormData = {
        ...formData,
        [name]: value
      };
      calculateSustainability(
        name === "vehicleType" ? value : formData.vehicleType,
        name === "fuelType" ? value : formData.fuelType
      );
    }
  };

  const handleFeaturesChange = (feature) => {
    setFormData((prev) => {
      const updatedFeatures = prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature];
      return { ...prev, features: updatedFeatures };
    });
  };

  const validateForm = () => {
    if (!formData.vehicleType) return "Vehicle type is required";
    if (!formData.model) return "Model is required";
    if (!formData.capacity || formData.capacity <= 0)
      return "Valid capacity is required";
    if (!formData.price || formData.price <= 0)
      return "Valid price is required";
    if (!formData.availabilityStart) return "Start date is required";
    if (!formData.availabilityEnd) return "End date is required";
    if (
      new Date(formData.availabilityEnd) <= new Date(formData.availabilityStart)
    ) {
      return "End date must be after start date";
    }
    if (!formData.pickupLocation) return "Pickup location is required";
    if (!formData.dropoffLocation) return "Dropoff location is required";
    if (!formData.description) return "Description is required";
    return null;
  };
  const heroStyle = {
    backgroundImage: 'url("/images/bg_1.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    position: 'relative',
    padding: '8rem 0 4rem 0',
    marginBottom: '2rem'
  };

  const overlayStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      const decoded = jwtDecode(token);

      const response = await axios.post(
        "https://terramedica-backend-306ad1b57632.herokuapp.com/api/transportation",
        {
          ...formData,
          advertiserId: decoded._id,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setSuccess("Transportation listing created successfully!");
      setFormData({
        vehicleType: "",
        model: "",
        capacity: "",
        price: "",
        availabilityStart: "",
        availabilityEnd: "",
        pickupLocation: "",
        dropoffLocation: "",
        description: "",
        features: [],
        fuelType: "",
        sustainabilityRating: 3,
        ecoFriendlyFeatures: [],
        carbon: null
      });

      setTimeout(() => {
        navigate("/advertiser/transportation");
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create listing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AdvertiserNavbar />
      <div className="create-transportation">
        <div style={heroStyle}>
          <div style={overlayStyle}></div>
          <Container style={{ position: 'relative', zIndex: 2 }}>
            <div className="text-center text-white">
              <p className="mb-4">
                <span className="me-2">
                  <Link to="/advertiser" className="text-white text-decoration-none">
                    Home <FaChevronRight className="small mx-2" />
                  </Link>
                </span>
                <span>
                  Create Transportation <FaChevronRight className="small" />
                </span>
              </p>
              <h1 className="display-4 mb-0">Create Transportation Listing</h1>
            </div>
          </Container>
        </div>

        <Container className="py-5">
          <Card className="shadow-sm border-0 rounded-3">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center mb-4">
                <div 
                  className="icon-circle me-3"
                  style={{
                    backgroundColor: '#1089ff',
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                  }}
                >
                  <FaCar size={24} />
                </div>
                <h3 className="mb-0">Vehicle Details</h3>
              </div>

              {error && (
                <Alert variant="danger" className="mb-4">
                  {error}
                </Alert>
              )}

              {success && (
                <Alert variant="success" className="mb-4">
                  {success}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="g-4">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaCar className="me-2" />
                        Vehicle Type
                      </Form.Label>
                      <Form.Select
                        name="vehicleType"
                        value={formData.vehicleType}
                        onChange={handleInputChange}
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      >
                        <option value="">Select vehicle type</option>
                        {vehicleTypes.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaLeaf className="me-2 text-success" />
                        Fuel Type
                      </Form.Label>
                      <Form.Select
                        name="fuelType"
                        value={formData.fuelType || ""}
                        onChange={handleInputChange}
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      >
                        <option value="">Select fuel type</option>
                        <option value="Gasoline">Gasoline</option>
                        <option value="Diesel">Diesel</option>
                        <option value="Electric">Electric</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="Hydrogen">Hydrogen</option>
                        <option value="Natural Gas">Natural Gas</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaList className="me-2" />
                        Model
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="model"
                        value={formData.model}
                        onChange={handleInputChange}
                        placeholder="e.g., Toyota Hiace 2022"
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaUsers className="me-2" />
                        Capacity (number of passengers)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="capacity"
                        value={formData.capacity}
                        onChange={handleInputChange}
                        placeholder="Enter passenger capacity"
                        required
                        min="1"
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaDollarSign className="me-2" />
                        Price per day (USD)
                      </Form.Label>
                      <Form.Control
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="Enter daily rate"
                        required
                        min="0"
                        step="0.01"
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaCalendarAlt className="me-2" />
                        Availability Start
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="availabilityStart"
                        value={formData.availabilityStart}
                        onChange={handleInputChange}
                        required
                        min={new Date().toISOString().split("T")[0]}
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaCalendarAlt className="me-2" />
                        Availability End
                      </Form.Label>
                      <Form.Control
                        type="date"
                        name="availabilityEnd"
                        value={formData.availabilityEnd}
                        onChange={handleInputChange}
                        required
                        min={formData.availabilityStart}
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaMapMarkerAlt className="me-2" />
                        Pickup Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="pickupLocation"
                        value={formData.pickupLocation}
                        onChange={handleInputChange}
                        placeholder="Enter pickup location"
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaMapMarkerAlt className="me-2" />
                        Dropoff Location
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="dropoffLocation"
                        value={formData.dropoffLocation}
                        onChange={handleInputChange}
                        placeholder="Enter dropoff location"
                        required
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold">Description</Form.Label>
                      <Form.Control
                        as="textarea"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter vehicle description and terms"
                        required
                        rows={3}
                        style={{
                          border: '2px solid #eee',
                          borderRadius: '15px'
                        }}
                      />
                    </Form.Group>
                  </Col>
                        
                  <Col md={12}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaCheckSquare className="me-2" />
                        Features
                      </Form.Label>
                      <div className="d-flex flex-wrap gap-3">
                        {features.map((feature) => (
                          <Form.Check
                            key={feature}
                            type="checkbox"
                            label={feature}
                            checked={formData.features.includes(feature)}
                            onChange={() => handleFeaturesChange(feature)}
                            className="user-select-none"
                          />
                        ))}
                      </div>
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaLeaf className="me-2" />
                        Estimated Emissions (g CO2/km)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={estimatedEmissions || "N/A"}
                        readOnly
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="fw-bold">
                        <FaStar className="me-2" />
                        Sustainability Rating
                      </Form.Label>
                      <Form.Control
                        type="text"
                        value={autoRating || "N/A"}
                        readOnly
                        className="rounded-pill"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: '2px solid #eee'
                        }}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <div className="d-flex gap-3 mt-4">
                  <Button
                    variant="light"
                    onClick={() => navigate("/advertiser/transportation")}
                    className="rounded-pill px-4"
                  >
                    <FaArrowLeft className="me-2" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-pill px-4"
                    style={{
                      backgroundColor: '#1089ff',
                      border: 'none'
                    }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          className="me-2"
                        />
                        Creating...
                      </>
                    ) : (
                      <>
                        <FaPlus className="me-2" />
                        Create Listing
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>
    </>
  );
};

export default CreateTransportationListing;