import React from 'react';
import { Card, Badge, Row, Col } from 'react-bootstrap';
import './TreatmentCard.css'; // We'll still use custom CSS for enhancements

// Icons using SVG for better styling and consistency
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const BenefitsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
    <path d="M9 14l2 2 4-4"></path>
  </svg>
);

const SustainabilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 22a8 8 0 0 1 8-8h12a8 8 0 0 1-8 8z"></path>
    <path d="M5 12V4a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v8"></path>
    <path d="M12 2v10"></path>
  </svg>
);

const AccommodationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
    <polyline points="9 22 9 12 15 12 15 22"></polyline>
  </svg>
);

const TransportationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"></rect>
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
    <circle cx="5.5" cy="18.5" r="2.5"></circle>
    <circle cx="18.5" cy="18.5" r="2.5"></circle>
  </svg>
);

const CostIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const TreatmentCard = ({ treatment }) => {
  const {
    name,
    benefits,
    sustainability,
    accommodation,
    transportation,
    cost
  } = treatment;

  // Determine treatment type for styling (based on name or benefits)
  const getTreatmentType = () => {
    const lowerName = (name + ' ' + benefits).toLowerCase();
    if (lowerName.includes('water') || lowerName.includes('spring') || lowerName.includes('bath')) {
      return 'water';
    } else if (lowerName.includes('desert') || lowerName.includes('sand')) {
      return 'desert';
    } else if (lowerName.includes('herb') || lowerName.includes('plant')) {
      return 'herbal';
    } else if (lowerName.includes('salt') || lowerName.includes('mineral')) {
      return 'salt';
    }
    return 'general';
  };

  const treatmentType = getTreatmentType();
  const typeColors = {
    water: '#4dabf7',
    desert: '#ffc078',
    herbal: '#69db7c',
    salt: '#e599f7',
    general: '#1e7b46'
  };

  return (
    <Card 
      className="heka-treatment-card" 
      style={{ borderLeftColor: typeColors[treatmentType] }}
    >
      <Card.Body>
        <Card.Title className="heka-treatment-title">
          {name}
        </Card.Title>
        
        <div className="heka-treatment-details">
          {benefits && (
            <Row className="mb-2">
              <Col xs="auto" className="heka-detail-icon">
                <BenefitsIcon />
              </Col>
              <Col>
                <div className="heka-detail-label">Benefits</div>
                <div className="heka-detail-value">{benefits}</div>
              </Col>
            </Row>
          )}
          
          {sustainability && (
            <Row className="mb-2">
              <Col xs="auto" className="heka-detail-icon">
                <SustainabilityIcon />
              </Col>
              <Col>
                <div className="heka-detail-label">Sustainability</div>
                <div className="heka-detail-value">
                  {sustainability}
                  <Badge pill bg="success" className="heka-eco-badge">Eco-friendly</Badge>
                </div>
              </Col>
            </Row>
          )}
          
          {accommodation && (
            <Row className="mb-2">
              <Col xs="auto" className="heka-detail-icon">
                <AccommodationIcon />
              </Col>
              <Col>
                <div className="heka-detail-label">Accommodation</div>
                <div className="heka-detail-value">{accommodation}</div>
              </Col>
            </Row>
          )}
          
          {transportation && (
            <Row className="mb-2">
              <Col xs="auto" className="heka-detail-icon">
                <TransportationIcon />
              </Col>
              <Col>
                <div className="heka-detail-label">Transportation</div>
                <div className="heka-detail-value">{transportation}</div>
              </Col>
            </Row>
          )}
          
          {cost && (
            <Row className="mb-2">
              <Col xs="auto" className="heka-detail-icon">
                <CostIcon />
              </Col>
              <Col>
                <div className="heka-detail-label">Cost</div>
                <div className="heka-detail-value">{cost}</div>
              </Col>
            </Row>
          )}
        </div>
      </Card.Body>
    </Card>
  );
};

export default TreatmentCard;