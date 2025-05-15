import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Nav,
  Modal,
  Spinner,
  Image,
} from "react-bootstrap";
import axios from "axios";
import {Link} from "react-router-dom";

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState("tourist");
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerData, setRegisterData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    // Tourist fields
    mobileNumber: "",
    nationality: "",
    dob: "",
    jobStatus: "student",
    jobTitle: "",
    // Advertiser fields
    companyName: "",
    companyDescription: "",
    website: "",
    hotline: "",
    // Tour guide fields
    yearsOfExperience: "",
  });

  // New state for tour guide file uploads
  const [tourGuideFiles, setTourGuideFiles] = useState({
    identificationDocument: null,
    certificate: null,
  });
  // Add near other state declarations
  const [sellerFiles, setSellerFiles] = useState({
    businessLicense: null,
    identificationDocument: null,
  });
  // Add near other state declarations
  const [advertiserFiles, setAdvertiserFiles] = useState({
    businessLicense: null,
    identificationDocument: null,
  });

  const [filePreviews, setFilePreviews] = useState({
    identificationDocument: null,
    certificate: null,
  });

  const roles = [
    { value: "tourist", label: "Tourist", endpoint: "tourist" },
    { value: "admin", label: "Admin", endpoint: "admin" },
    { value: "advertiser", label: "Advertiser", endpoint: "advertiser" },
    { value: "seller", label: "Seller", endpoint: "seller" },
    { value: "tourguide", label: "Tour Guide", endpoint: "tourguide" },
    {
      value: "governor",
      label: "Tourism Governor",
      // Fix: Update endpoint to match server route name
      endpoint: "toursimGovernor",
    },
  ];
  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;

    if (fileList && fileList[0]) {
      // Allow both images and PDFs for seller and advertiser files
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
      ];

      if (selectedRole === "seller") {
        if (!allowedTypes.includes(fileList[0].type)) {
          setError(`Please upload an image or PDF file for ${name}`);
          return;
        }
        // Update seller files
        setSellerFiles((prev) => ({
          ...prev,
          [name]: fileList[0],
        }));
      } else if (selectedRole === "tourguide") {
        // Tour guide only accepts images
        if (!fileList[0].type.startsWith("image/")) {
          setError(
            `Please upload an image file for ${
              name === "identificationDocument" ? "ID" : "Certificate"
            }`
          );
          return;
        }
        // Update tour guide files
        setTourGuideFiles((prev) => ({
          ...prev,
          [name]: fileList[0],
        }));
      } else if (selectedRole === "advertiser") {
        if (!allowedTypes.includes(fileList[0].type)) {
          setError(`Please upload an image or PDF file for ${name}`);
          return;
        }
        // Update advertiser files
        setAdvertiserFiles((prev) => ({
          ...prev,
          [name]: fileList[0],
        }));
      }

      // Create preview for images only
      if (fileList[0].type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreviews((prev) => ({
            ...prev,
            [name]: reader.result,
          }));
        };
        reader.readAsDataURL(fileList[0]);
      } else {
        // For PDFs, remove the preview
        setFilePreviews((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    }
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setShowRoleModal(false);
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
  
    try {
      const role = roles.find((r) => r.value === selectedRole);
      const endpoint = role.value === "governor" ? "toursimGovernor" : role.endpoint;
  
      // Create the login payload
      const loginPayload = {
        username: loginData.username, // Send the username/email as-is
        password: loginData.password
      };
  
      // Remove the previous conditional logic and let the backend handle the validation
  
      const response = await axios.post(
        `http://localhost:5000/api/${endpoint}/login`,
        loginPayload
      );
  
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        const userData = response.data.governor || response.data[role.value];
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("userRole", role.value);
        navigate(`/${role.value}`);
      }
    } catch (err) {
      console.error("Login error details:", {
        status: err.response?.status,
        statusText: err.response?.statusText,
        data: err.response?.data,
        error: err.message,
      });
  
      const errorMessage =
        err.response?.data?.message ||
        "Login failed. Please check your credentials.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  const handleRegister = async (e) => {
    e.preventDefault();
    if (registerData.password !== registerData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const role = roles.find((r) => r.value === selectedRole);
      const registrationData = { ...registerData };
      delete registrationData.confirmPassword;

      // Add validation for tourist registration
      if (selectedRole === "tourist" && registerData.dob) {
        const today = new Date();
        const birthDate = new Date(registerData.dob);
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 18) {
          throw new Error("You must be 18 or older to register");
        }
      }

      // Handle tour guide registration with files
      if (selectedRole === "tourguide") {
        if (
          !tourGuideFiles.identificationDocument ||
          !tourGuideFiles.certificate
        ) {
          throw new Error(
            "Both ID document and certificate images are required"
          );
        }

        const formDataToSend = new FormData();

        // Append text data
        Object.keys(registrationData).forEach((key) => {
          formDataToSend.append(key, registrationData[key]);
        });

        // Append files
        Object.keys(tourGuideFiles).forEach((key) => {
          if (tourGuideFiles[key]) {
            formDataToSend.append(key, tourGuideFiles[key]);
          }
        });

        const response = await axios.post(
          `http://localhost:5000/api/${role.endpoint}/register`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(response.data[role.value])
          );
          localStorage.setItem("userRole", role.value);
          navigate(`/${role.value}`);
        }
      }
      // Handle seller registration with files
      else if (selectedRole === "seller") {
        if (
          !sellerFiles.businessLicense ||
          !sellerFiles.identificationDocument
        ) {
          throw new Error(
            "Both business license and identification document are required"
          );
        }

        const formDataToSend = new FormData();

        // Append text data
        Object.keys(registrationData).forEach((key) => {
          if (registrationData[key]) {
            formDataToSend.append(key, registrationData[key]);
          }
        });

        // Append files
        Object.keys(sellerFiles).forEach((key) => {
          if (sellerFiles[key]) {
            formDataToSend.append(key, sellerFiles[key]);
          }
        });

        const response = await axios.post(
          `http://localhost:5000/api/${role.endpoint}/register`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(response.data[role.value])
          );
          localStorage.setItem("userRole", role.value);
          navigate(`/${role.value}`);
        }
      }
      // Handle advertiser registration with files
      else if (selectedRole === "advertiser") {
        if (
          !advertiserFiles.businessLicense ||
          !advertiserFiles.identificationDocument
        ) {
          throw new Error(
            "Both business license and identification document are required"
          );
        }

        const formDataToSend = new FormData();

        // Append text data
        Object.keys(registrationData).forEach((key) => {
          if (registrationData[key]) {
            formDataToSend.append(key, registrationData[key]);
          }
        });

        // Append files
        Object.keys(advertiserFiles).forEach((key) => {
          if (advertiserFiles[key]) {
            formDataToSend.append(key, advertiserFiles[key]);
          }
        });

        const response = await axios.post(
          `http://localhost:5000/api/${role.endpoint}/register`,
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(response.data[role.value])
          );
          localStorage.setItem("userRole", role.value);
          navigate(`/${role.value}`);
        }
      }
      // Regular registration for other roles
      else {
        const response = await axios.post(
          `http://localhost:5000/api/${role.endpoint}/register`,
          registrationData
        );

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem(
            "user",
            JSON.stringify(response.data[role.value])
          );
          localStorage.setItem("userRole", role.value);
          navigate(`/${role.value}`);
        }
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderRoleSpecificFields = () => {
    switch (selectedRole) {
      case "seller":
        return (
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Name</Form.Label>
                <Form.Control
                  type="text"
                  name="name"
                  value={registerData.name}
                  onChange={handleRegisterChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={registerData.description}
                  onChange={handleRegisterChange}
                  rows={3}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Mobile Number*</Form.Label>
                <Form.Control
                  type="tel"
                  name="mobileNumber"
                  value={registerData.mobileNumber}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>

              <Card className="mb-3">
                <Card.Header className="bg-light">
                  Required Documents
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-4">
                    <Form.Label>Business License (Image or PDF)*</Form.Label>
                    <Form.Control
                      type="file"
                      name="businessLicense"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {filePreviews.businessLicense && (
                      <div className="mt-2">
                        <Image
                          src={filePreviews.businessLicense}
                          alt="Business License Preview"
                          thumbnail
                          style={{ maxWidth: "200px" }}
                        />
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      Identification Document (Image or PDF)*
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="identificationDocument"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {filePreviews.identificationDocument && (
                      <div className="mt-2">
                        <Image
                          src={filePreviews.identificationDocument}
                          alt="ID Preview"
                          thumbnail
                          style={{ maxWidth: "200px" }}
                        />
                      </div>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );
      case "tourist":
        return (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Mobile Number</Form.Label>
              <Form.Control
                type="text"
                name="mobileNumber"
                value={registerData.mobileNumber}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Nationality</Form.Label>
              <Form.Control
                type="text"
                name="nationality"
                value={registerData.nationality}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Date of Birth</Form.Label>
              <Form.Control
                type="date"
                name="dob"
                value={registerData.dob}
                onChange={handleRegisterChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Job Status</Form.Label>
              <Form.Select
                name="jobStatus"
                value={registerData.jobStatus}
                onChange={handleRegisterChange}
                required
              >
                <option value="student">Student</option>
                <option value="job">Employed</option>
              </Form.Select>
            </Form.Group>
            {registerData.jobStatus === "job" && (
              <Form.Group className="mb-3">
                <Form.Label>Job Title</Form.Label>
                <Form.Control
                  type="text"
                  name="jobTitle"
                  value={registerData.jobTitle}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
            )}
          </>
        );

      case "advertiser":
        return (
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="companyName"
                  value={registerData.companyName}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Company Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="companyDescription"
                  value={registerData.companyDescription}
                  onChange={handleRegisterChange}
                  rows={3}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Website</Form.Label>
                <Form.Control
                  type="url"
                  name="website"
                  value={registerData.website}
                  onChange={handleRegisterChange}
                  placeholder="https://example.com"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Hotline</Form.Label>
                <Form.Control
                  type="tel"
                  name="hotline"
                  value={registerData.hotline}
                  onChange={handleRegisterChange}
                  placeholder="+1234567890"
                />
              </Form.Group>

              <Card className="mb-3">
                <Card.Header className="bg-light">
                  Required Documents
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-4">
                    <Form.Label>Business License (Image or PDF)*</Form.Label>
                    <Form.Control
                      type="file"
                      name="businessLicense"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {filePreviews.businessLicense && (
                      <div className="mt-2">
                        <Image
                          src={filePreviews.businessLicense}
                          alt="Business License Preview"
                          thumbnail
                          style={{ maxWidth: "200px" }}
                        />
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>
                      Identification Document (Image or PDF)*
                    </Form.Label>
                    <Form.Control
                      type="file"
                      name="identificationDocument"
                      onChange={handleFileChange}
                      accept=".pdf,.jpg,.jpeg,.png"
                      required
                    />
                    {filePreviews.identificationDocument && (
                      <div className="mt-2">
                        <Image
                          src={filePreviews.identificationDocument}
                          alt="ID Preview"
                          thumbnail
                          style={{ maxWidth: "200px" }}
                        />
                      </div>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );
      case "tourguide":
        return (
          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Mobile Number</Form.Label>
                <Form.Control
                  type="text"
                  name="mobileNumber"
                  value={registerData.mobileNumber}
                  onChange={handleRegisterChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Years of Experience</Form.Label>
                <Form.Control
                  type="number"
                  name="yearsOfExperience"
                  value={registerData.yearsOfExperience}
                  onChange={handleRegisterChange}
                  min="0"
                  required
                />
              </Form.Group>

              <Card className="mb-3">
                <Card.Header className="bg-light">
                  Required Documents
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-4">
                    <Form.Label>ID Document (Image only)</Form.Label>
                    <Form.Control
                      type="file"
                      name="identificationDocument"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                    />
                    {filePreviews.identificationDocument && (
                      <div className="mt-2">
                        <Image
                          src={filePreviews.identificationDocument}
                          alt="ID Preview"
                          thumbnail
                          style={{ maxWidth: "200px" }}
                        />
                      </div>
                    )}
                  </Form.Group>

                  <Form.Group className="mb-4">
                    <Form.Label>Certificate (Image only)</Form.Label>
                    <Form.Control
                      type="file"
                      name="certificate"
                      onChange={handleFileChange}
                      accept="image/*"
                      required
                    />
                    {filePreviews.certificate && (
                      <div className="mt-2">
                        <Image
                          src={filePreviews.certificate}
                          alt="Certificate Preview"
                          thumbnail
                          style={{ maxWidth: "200px" }}
                        />
                      </div>
                    )}
                  </Form.Group>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        );

      default:
        return null;
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">Welcome</h2>
                <Button
                  variant="outline-secondary"
                  size="sm"
                  onClick={() => setShowRoleModal(true)}
                >
                  Role: {roles.find((r) => r.value === selectedRole)?.label}
                </Button>
              </div>

              {error && <Alert variant="danger">{error}</Alert>}

              <Nav variant="tabs" className="mb-3">
                <Nav.Item>
                  <Nav.Link
                    onClick={() => setActiveTab("login")}
                    active={activeTab === "login"}
                  >
                    Login
                  </Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link
                    onClick={() => setActiveTab("register")}
                    active={activeTab === "register"}
                  >
                    Register
                  </Nav.Link>
                </Nav.Item>
              </Nav>
              {activeTab === "login" ? (
  <Form onSubmit={handleLogin}>
    <Form.Group className="mb-3">
  <Form.Label>Username or Email</Form.Label>
  <Form.Control
    type="text"
    name="username"
    placeholder="Enter username or email"
    value={loginData.username}
    onChange={handleLoginChange}
    required
  />
</Form.Group>

    <Form.Group className="mb-3">
      <Form.Label>Password</Form.Label>
      <Form.Control
        type="password"
        name="password"
        value={loginData.password}
        onChange={handleLoginChange}
        required
      />
      <div className="d-flex justify-content-end mt-2">
        <Link 
          to={`/${selectedRole}/forgot-password`} 
          className="text-primary text-decoration-none"
        >
          Forgot Password?
        </Link>
      </div>
    </Form.Group>

    <Button
      variant="primary"
      type="submit"
      className="w-100"
      disabled={loading}
    >
      {loading ? (
        <>
          <Spinner
            as="span"
            animation="border"
            size="sm"
            role="status"
            aria-hidden="true"
            className="me-2"
          />
          Logging in...
        </>
      ) : (
        "Login"
      )}
    </Button>
  </Form>
) : (
                <Form onSubmit={handleRegister}>
                  <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control
                      type="text"
                      name="username"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="confirmPassword"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                  </Form.Group>

                  {renderRoleSpecificFields()}

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Spinner
                          as="span"
                          animation="border"
                          size="sm"
                          role="status"
                          aria-hidden="true"
                          className="me-2"
                        />
                        Registering...
                      </>
                    ) : (
                      "Register"
                    )}
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Role Selection Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Role</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-grid gap-2">
            {roles.map((role) => (
              <Button
                key={role.value}
                variant={
                  selectedRole === role.value ? "primary" : "outline-primary"
                }
                onClick={() => handleRoleSelect(role.value)}
                className="text-start"
              >
                {role.label}
              </Button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default AuthPage;
