// chatWidget.js - Complete implementation with all improvements
import React, { useState, useEffect, useRef } from 'react';
import { v4 as uuidv4 } from 'uuid'; // For generating session IDs
import TreatmentCard from './TreatmentCard'; // Import the new component
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

// Utility function to parse AI responses into treatment card data
const parseResponseToTreatmentCards = (content) => {
  // Check if the content contains treatment options
  if (!content.includes('TREATMENT/LOCATION:') && 
      !content.includes('LOCATION:') && 
      !content.includes('BENEFITS:')) {
    return { introText: content, treatments: [], closingText: '' };
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

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
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
        content: `Welcome to Egypt's Sustainable Medical Tourism Assistant! 🌿 

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
      return <p>{content}</p>;
    }
    
    return (
      <>
        {introText && <p>{introText}</p>}
        
        {treatments.map((treatment, index) => (
          <TreatmentCard key={`treatment-${index}`} treatment={treatment} />
        ))}
        
        {closingText && <p>{closingText}</p>}
      </>
    );
  };

  return (
    <>
      {!isOpen && (
        <div className="chat-widget-icon" onClick={toggleChat}>
          <ChatIcon />
          <span className="chat-widget-tooltip">Medical Tourism Assistance</span>
        </div>
      )}

      {isOpen && (
        <div className="chat-widget-window">
          <div className="chat-widget-header">
            <h3>Egyptian Sustainable Medical Tourism</h3>
            <button onClick={toggleChat} className="chat-widget-close-btn">
              <CloseIcon />
            </button>
          </div>
          <div className="chat-widget-messages">
            {messages.map((msg, index) => (
              <div key={index} className={`chat-message ${msg.role}`}>
                <div className="chat-message-bubble">
                  {msg.role === 'assistant' ? (
                    <MessageContent content={msg.content} />
                  ) : (
                    <p>{msg.content}</p>
                  )}
                  
                  {msg.role === 'assistant' && msg.sources && msg.sources.length > 0 && (
                    <div className="chat-message-sources">
                      <strong>Sources:</strong>
                      <ul>
                        {msg.sources.map((source, idx) => (
                          <li key={idx}>
                            {source.title} ({source.location})
                            {source.sustainability !== 'Information not available' && ` - Sustain.: ${source.sustainability}`}
                            {source.carbonEmission !== 'Information not available' && ` - Carbon: ${source.carbonEmission}`}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="chat-message assistant">
                <div className="chat-message-bubble typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <form className="chat-widget-input-area" onSubmit={handleSendMessage}>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              placeholder="Ask about Egyptian medical tourism..."
              disabled={isLoading}
            />
            <button type="submit" disabled={isLoading}>
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
