// Create a new file called TreatmentCard.js in your components folder

import React from 'react';
import './TreatmentCard.css'; // Import your CSS file for styling

// Icons - you can replace these with your own or use a library like Font Awesome
const LocationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="3"></circle>
  </svg>
);

const BenefitsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
  </svg>
);
const parseResponseToTreatmentCards = (content) => {
  // Check if the content contains treatment options
  if (!content.includes('TREATMENT/LOCATION:') && !content.includes('BENEFITS:')) {
    return { introText: content, treatments: [] };
  }
  
  // Split by treatment markers
  const parts = content.split(/(?=TREATMENT\/LOCATION:|LOCATION:)/);
  let introText = '';
  const treatments = [];
  
  parts.forEach((part, index) => {
    if (index === 0 && !part.includes('TREATMENT/LOCATION:') && !part.includes('LOCATION:')) {
      // This is the introductory text
      introText = part.trim();
    } else {
      // This is a treatment option
      const lines = part.split('\n').filter(line => line.trim() !== '');
      
      let treatment = {
        name: '',
        benefits: '',
        sustainability: '',
        accommodation: '',
        transportation: '',
        cost: ''
      };
      
      // Extract details
      let currentField = '';
      
      lines.forEach(line => {
        if (line.includes('TREATMENT/LOCATION:') || line.includes('LOCATION:')) {
          treatment.name = line.split(':')[1].trim();
          currentField = 'name';
        } else if (line.includes('BENEFITS:')) {
          treatment.benefits = line.split(':')[1].trim();
          currentField = 'benefits';
        } else if (line.includes('SUSTAINABILITY:')) {
          treatment.sustainability = line.split(':')[1].trim();
          currentField = 'sustainability';
        } else if (line.includes('ACCOMMODATION:')) {
          treatment.accommodation = line.split(':')[1].trim();
          currentField = 'accommodation';
        } else if (line.includes('TRANSPORTATION:')) {
          treatment.transportation = line.split(':')[1].trim();
          currentField = 'transportation';
        } else if (line.includes('APPROXIMATE COST:') || line.includes('COST:')) {
          treatment.cost = line.split(':')[1].trim();
          currentField = 'cost';
        } else if (currentField && !line.includes(':')) {
          // This is continuation of the previous field
          treatment[currentField] += ' ' + line.trim();
        }
      });
      
      treatments.push(treatment);
    }
  });
  
  // Extract any closing text (usually a question)
  let closingText = '';
  if (content.includes('?')) {
    const parts = content.split('?');
    if (parts.length > 1) {
      const lastPart = parts[parts.length - 1];
      if (!lastPart.includes('TREATMENT') && !lastPart.includes('BENEFITS')) {
        closingText = '?' + lastPart;
      }
    }
  }
  
  return { introText, treatments, closingText };
};
const SustainabilityIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v18"></path>
    <path d="M17 8l-5-5-5 5"></path>
    <path d="M8 16l4 4 4-4"></path>
  </svg>
);

const AccommodationIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
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

  return (
    <div className="treatment-card">
      <h3 className="treatment-title">{name}</h3>
      
      <div className="treatment-details">
        {benefits && (
          <div className="detail-item">
            <div className="detail-icon"><BenefitsIcon /></div>
            <div>
              <div className="detail-label">Benefits</div>
              <div className="detail-value">{benefits}</div>
            </div>
          </div>
        )}
        
        {sustainability && (
          <div className="detail-item">
            <div className="detail-icon"><SustainabilityIcon /></div>
            <div>
              <div className="detail-label">Sustainability</div>
              <div className="detail-value">
                {sustainability}
                <span className="eco-badge">Eco-friendly</span>
              </div>
            </div>
          </div>
        )}
        
        {accommodation && (
          <div className="detail-item">
            <div className="detail-icon"><AccommodationIcon /></div>
            <div>
              <div className="detail-label">Accommodation</div>
              <div className="detail-value">{accommodation}</div>
            </div>
          </div>
        )}
        
        {transportation && (
          <div className="detail-item">
            <div className="detail-icon"><TransportationIcon /></div>
            <div>
              <div className="detail-label">Transportation</div>
              <div className="detail-value">{transportation}</div>
            </div>
          </div>
        )}
        
        {cost && (
          <div className="detail-item">
            <div className="detail-icon"><CostIcon /></div>
            <div>
              <div className="detail-label">Cost</div>
              <div className="detail-value">{cost}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentCard;
