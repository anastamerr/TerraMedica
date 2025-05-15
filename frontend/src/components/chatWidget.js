import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating session IDs
import TreatmentCard from './TreatmentCard'; // Keep using the treatment cards
import { 
  Button, 
  Form, 
  Card, 
  Container, 
  InputGroup, 
  Badge
} from 'react-bootstrap';
import './chatWidget.css';

// Chat Icon Component
const ChatIcon = ({ onClick }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32px" height="32px">
    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
);

// Close Icon Component
const CloseIcon = ({ onClick }) => (
  <svg onClick={onClick} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24px" height="24px">
    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
    <path d="M0 0h24v24H0z" fill="none"/>
  </svg>
);

// Send Icon Component
const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
    <path d="M15.964.686a.5.5 0 0 0-.65-.65L.767 5.855H.766l-.452.18a.5.5 0 0 0-.082.887l.41.26.001.002 4.995 3.178 3.178 4.995.002.002.26.41a.5.5 0 0 0 .886-.083l6-15Zm-1.833 1.89L6.637 10.07l-.215-.338a.5.5 0 0 0-.154-.154l-.338-.215 7.494-7.494 1.178-.471-.47 1.178Z"/>
  </svg>
);

// Utility function to parse AI responses into treatment card data
const parseResponseToTreatmentCards = (content) => {
  // Check if the content contains treatment options
  if (!content.includes('TREATMENT/LOCATION:') && 
      !content.includes('LOCATION:') && 
      !content.includes('BENEFITS:')) {
    return { introText: content, treatments: [], closingText: '' };
  }
  
  // First, identify and extract any introduction text before the first treatment
  let introText = '';
  let closingText = '';
  let treatmentContent = content;
  
  // Extract intro text (everything before the first TREATMENT/LOCATION or LOCATION)
  const introMatch = content.match(/^([\s\S]*?)(?=TREATMENT\/LOCATION:|LOCATION:)/);
  if (introMatch && introMatch[1]) {
    introText = introMatch[1].trim();
    treatmentContent = content.substring(introMatch[0].length);
  }
  
  // Extract closing text (typically a question after all treatments)
  const lastTreatmentEndIndex = Math.max(
    treatmentContent.lastIndexOf('APPROXIMATE COST:'),
    treatmentContent.lastIndexOf('COST:')
  );
  
  if (lastTreatmentEndIndex !== -1) {
    // Find the end of this section by looking for the next line break after the cost
    const endOfCostLine = treatmentContent.indexOf('\n', lastTreatmentEndIndex);
    if (endOfCostLine !== -1 && endOfCostLine < treatmentContent.length - 1) {
      closingText = treatmentContent.substring(endOfCostLine).trim();
      treatmentContent = treatmentContent.substring(0, endOfCostLine);
    }
  }
  
  // Split remaining content by treatment markers
  const parts = treatmentContent.split(/(?=TREATMENT\/LOCATION:|LOCATION:)/);
  const treatments = [];
  
  parts.forEach(part => {
    if (!part.trim()) return; // Skip empty parts
    
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
        treatment.name = line.split(':').slice(1).join(':').trim();
        currentField = 'name';
      } else if (line.includes('BENEFITS:')) {
        treatment.benefits = line.split(':').slice(1).join(':').trim();
        currentField = 'benefits';
      } else if (line.includes('SUSTAINABILITY:')) {
        treatment.sustainability = line.split(':').slice(1).join(':').trim();
        currentField = 'sustainability';
      } else if (line.includes('ACCOMMODATION:')) {
        treatment.accommodation = line.split(':').slice(1).join(':').trim();
        currentField = 'accommodation';
      } else if (line.includes('TRANSPORTATION:')) {
        treatment.transportation = line.split(':').slice(1).join(':').trim();
        currentField = 'transportation';
      } else if (line.includes('APPROXIMATE COST:') || line.includes('COST:')) {
        treatment.cost = line.split(':').slice(1).join(':').trim();
        currentField = 'cost';
      } else if (currentField && !line.includes(':')) {
        // This is continuation of the previous field
        treatment[currentField] += ' ' + line.trim();
      }
    });
    
    // Only add treatment if it has a name
    if (treatment.name) {
      treatments.push(treatment);
    }
  });
  
  return { introText, treatments, closingText };
};

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize sessionId
  useEffect(() => {
    let currentSessionId = localStorage.getItem('chatSessionId');
    if (!currentSessionId) {
      currentSessionId = uuidv4();
      localStorage.setItem('chatSessionId', currentSessionId);
    }
    setSessionId(currentSessionId);
  }, []);

  // Scroll to bottom of messages when new messages are added
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      inputRef.current?.focus();
    }
  }, [messages, isOpen]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen && messages.length === 0) {
      // More engaging welcome message with a clear call to action
      setMessages([{ 
        role: 'assistant', 
        content: `Welcome to Heka, your guide to Egypt's Sustainable Medical Tourism! 🌿 

I can help you discover Egypt's unique natural healing environments while minimizing your environmental footprint.

Some ways I can assist:
- Find natural treatments for specific health conditions
- Suggest eco-friendly accommodations near healing sites
- Calculate the carbon footprint of different travel options
- Create personalized medical tourism itineraries

What health condition or wellness goal are you interested in exploring in Egypt?`
      }]);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = { role: 'user', content: inputValue.trim() };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/aichat/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage.content, sessionId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Network response was not ok');
      }

      const data = await response.json();
      const assistantMessage = { role: 'assistant', content: data.answer, sources: data.sources };
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);

    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = { role: 'assistant', content: `Sorry, I encountered an error: ${error.message}` };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Component to render message content with treatment cards if applicable
  const MessageContent = ({ content }) => {
    const { introText, treatments, closingText } = parseResponseToTreatmentCards(content);
    
    if (treatments.length === 0) {
      // This is a regular conversational message
      return <div className="heka-regular-message">{content}</div>;
    }
    
    return (
      <div className="heka-structured-message">
        {introText && <div className="heka-message-intro">{introText}</div>}
        
        {treatments.length > 0 && (
          <div className="heka-treatment-list">
            {treatments.map((treatment, index) => (
              <TreatmentCard key={`treatment-${index}`} treatment={treatment} />
            ))}
          </div>
        )}
        
        {closingText && <div className="heka-message-closing">{closingText}</div>}
      </div>
    );
  };

  return (
    <>
      {!isOpen && (
        <div className="heka-chat-widget-icon" onClick={toggleChat}>
          <ChatIcon />
          <span className="heka-chat-widget-tooltip">Ask Heka about Medical Tourism</span>
        </div>
      )}

      {isOpen && (
        <Card className="heka-chat-widget-window">
          <Card.Header className="heka-chat-widget-header">
            <div className="heka-header-title">
              <h3>Heka - Egyptian Medical Tourism Guide</h3>
              <small>Egypt's natural healing wisdom</small>
            </div>
            <div className="heka-header-controls">
              <Button 
                variant="link" 
                className="heka-chat-widget-minimize-btn" 
                onClick={() => {
                  setIsMinimized(!isMinimized);
                }}
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? 
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 15a.5.5 0 0 0 .5-.5V2.707l3.146 3.147a.5.5 0 0 0 .708-.708l-4-4a.5.5 0 0 0-.708 0l-4 4a.5.5 0 1 0 .708.708L7.5 2.707V14.5a.5.5 0 0 0 .5.5z"/>
                  </svg> 
                  : 
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 1a.5.5 0 0 1 .5.5v11.793l3.146-3.147a.5.5 0 0 1 .708.708l-4 4a.5.5 0 0 1-.708 0l-4-4a.5.5 0 0 1 .708-.708L7.5 13.293V1.5A.5.5 0 0 1 8 1z"/>
                  </svg>
                }
              </Button>
              <Button 
                variant="link" 
                className="heka-chat-widget-close-btn" 
                onClick={toggleChat}
                aria-label="Close chat"
              >
                <CloseIcon />
              </Button>
            </div>
          </Card.Header>
          
          <div className={`heka-chat-widget-messages ${isMinimized ? 'minimized' : ''}`}>
            {messages.map((msg, index) => (
              <div key={index} className={`heka-chat-message ${msg.role}`}>
                <div className="heka-chat-message-bubble">
                  {msg.role === 'assistant' ? (
                    <MessageContent content={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="heka-chat-message-sources">
                      <div className="heka-sources-title">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                          <path d="M1 2.828c.885-.37 2.154-.769 3.388-.893 1.33-.134 2.458.063 3.112.752v9.746c-.935-.53-2.12-.603-3.213-.493-1.18.12-2.37.461-3.287.811V2.828zm7.5-.141c.654-.689 1.782-.886 3.112-.752 1.234.124 2.503.523 3.388.893v9.923c-.918-.35-2.107-.692-3.287-.81-1.094-.111-2.278-.039-3.213.492V2.687zM8 1.783C7.015.936 5.587.81 4.287.94c-1.514.153-3.042.672-3.994 1.105A.5.5 0 0 0 0 2.5v11a.5.5 0 0 0 .707.455c.882-.4 2.303-.881 3.68-1.02 1.409-.142 2.59.087 3.223.877a.5.5 0 0 0 .78 0c.633-.79 1.814-1.019 3.222-.877 1.378.139 2.8.62 3.681 1.02A.5.5 0 0 0 16 13.5v-11a.5.5 0 0 0-.293-.455c-.952-.433-2.48-.952-3.994-1.105C10.413.809 8.985.936 8 1.783z"/>
                        </svg>
                        <strong>Information Sources</strong>
                      </div>
                      <ul className="heka-sources-list">
                        {msg.sources.map((source, idx) => (
                          <li key={idx}>
                            <span className="heka-source-title">{source.title}</span> <span className="heka-source-location">({source.location})</span>
                            <div className="heka-source-badges">
                              {source.sustainability !== 'Information not available' && 
                                <Badge pill bg="success" className="heka-source-badge">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                                    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z"/>
                                  </svg>
                                  {source.sustainability}
                                </Badge>
                              }
                              {source.carbonEmission !== 'Information not available' && 
                                <Badge pill bg="info" className="heka-source-badge">
                                  <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" fill="currentColor" viewBox="0 0 16 16" className="me-1">
                                    <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zM7 6.5C7 7.328 6.552 8 6 8s-1-.672-1-1.5S5.448 5 6 5s1 .672 1 1.5zM4.285 9.567a.5.5 0 0 1 .683.183A3.498 3.498 0 0 0 8 11.5a3.498 3.498 0 0 0 3.032-1.75.5.5 0 1 1 .866.5A4.498 4.498 0 0 1 8 12.5a4.498 4.498 0 0 1-3.898-2.25.5.5 0 0 1 .183-.683zM10 8c-.552 0-1-.672-1-1.5S9.448 5 10 5s1 .672 1 1.5S10.552 8 10 8z"/>
                                  </svg>
                                  CO₂: {source.carbonEmission}
                                </Badge>
                              }
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="heka-chat-message assistant">
                <div className="heka-chat-message-bubble heka-typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <Card.Footer className="heka-chat-widget-input-area p-2">
            <Form onSubmit={handleSendMessage}>
              <InputGroup>
                <Form.Control
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="Ask Heka about natural healing in Egypt..."
                  disabled={isLoading}
                  className="heka-chat-input"
                />
                <Button 
                  type="submit" 
                  variant="primary" 
                  disabled={isLoading}
                  className="heka-send-btn"
                >
                  <SendIcon />
                </Button>
              </InputGroup>
            </Form>
          </Card.Footer>
        </Card>
      )}
    </>
  );
};

export default ChatWidget;