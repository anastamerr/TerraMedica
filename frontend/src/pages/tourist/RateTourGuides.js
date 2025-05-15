import React, { useState, useEffect } from "react";
import {
  Container,
  Card,
  Button,
  Form,
  Alert,
  Spinner,
  Row,
  Col,
} from "react-bootstrap";
import { Star, StarFill } from "react-bootstrap-icons";
import {jwtDecode} from "jwt-decode";

const TourGuideRating = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeRating, setActiveRating] = useState({});
  const [hoverRating, setHoverRating] = useState({});
  const [reviews, setReviews] = useState({});
  const [submitStatus, setSubmitStatus] = useState({});

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchAttendedBookings();
    } else {
      setError("No authentication token found");
      setLoading(false);
    }
  }, []);

  const fetchAttendedBookings = async () => {
    try {
      const token = localStorage.getItem("token");
      console.log("Token retrieved:", token); // Debug: Confirm token retrieval
      if (!token) {
        throw new Error("No authentication token found");
      }
  
      const userId = getUserIdFromToken(token);
      console.log("User ID from token:", userId); // Debug: Confirm extracted userId
  
      const response = await fetch(
        `http://localhost:5000/api/bookings/user/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (!response.ok) throw new Error("Failed to fetch bookings");
  
      const data = await response.json();
      console.log("Fetched bookings data:", data);
  
      // Your filtering logic here
      const attendedBookings = data.data.filter(
        (booking) =>
          booking.status === "attended" &&
          booking.bookingType === "Itinerary" &&
          !booking.rating
      );
  
      setBookings(attendedBookings);
    } catch (err) {
      console.error("Error fetching bookings:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  const getUserIdFromToken = (token) => {
    try {
      const decodedToken = jwtDecode(token); // Ensure jwtDecode is correctly imported and used
      console.log("Decoded token:", decodedToken); // Debug: check the structure of decoded token
      return decodedToken.id; // Make sure 'id' matches the actual key for userId in your token payload
    } catch (err) {
      console.error("Error decoding token:", err);
      throw new Error("Invalid token");
    }
  };
  

  const handleMouseEnter = (bookingId, rating) => {
    setHoverRating((prev) => ({
      ...prev,
      [bookingId]: rating,
    }));
  };

  const handleMouseLeave = (bookingId) => {
    setHoverRating((prev) => ({
      ...prev,
      [bookingId]: 0,
    }));
  };

  const handleRatingClick = (bookingId, rating) => {
    setActiveRating((prev) => ({
      ...prev,
      [bookingId]: rating,
    }));
  };

  const handleReviewChange = (bookingId, review) => {
    setReviews((prev) => ({
      ...prev,
      [bookingId]: review,
    }));
  };

  const handleSubmitRating = async (bookingId) => {
    try {
      const token = localStorage.getItem("token");
      const rating = activeRating[bookingId];
      const review = reviews[bookingId] || "";

      if (!rating) {
        throw new Error("Please select a rating");
      }

      const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/rating`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating, review }),
      });

      if (!response.ok) throw new Error("Failed to submit rating");

      setSubmitStatus((prev) => ({
        ...prev,
        [bookingId]: {
          success: true,
          message: "Rating submitted successfully!",
        },
      }));

      setBookings((prev) =>
        prev.filter((booking) => booking._id !== bookingId)
      );
    } catch (err) {
      setSubmitStatus((prev) => ({
        ...prev,
        [bookingId]: { success: false, message: err.message },
      }));
    }
  };

  if (loading) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "200px" }}
      >
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!bookings.length) {
    return (
      <Container className="mt-4">
        <Alert variant="info">No unrated attended itineraries found.</Alert>
      </Container>
    );
  }

  const StarRating = ({ bookingId }) => {
    const rating = hoverRating[bookingId] || activeRating[bookingId] || 0;

    return (
      <div className="d-flex gap-1 mb-3">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            onMouseEnter={() => handleMouseEnter(bookingId, star)}
            onMouseLeave={() => handleMouseLeave(bookingId)}
            onClick={() => handleRatingClick(bookingId, star)}
            style={{ cursor: "pointer", fontSize: "1.5rem" }}
          >
            {star <= rating ? (
              <StarFill className="text-warning" />
            ) : (
              <Star className="text-warning" />
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Rate Your Tour Guides</h2>
      <Row>
        {bookings.map((booking) => (
          <Col key={booking._id} xs={12} className="mb-4">
            <Card>
              <Card.Header>
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="mb-0">
                      {booking.itemId.title || "Itinerary"}
                    </h5>
                    <small className="text-muted">
                      {new Date(booking.bookingDate).toLocaleDateString()}
                    </small>
                  </div>
                </div>
              </Card.Header>
              <Card.Body>
                <StarRating bookingId={booking._id} />

                <Form.Group className="mb-3">
                  <Form.Control
                    as="textarea"
                    rows={3}
                    placeholder="Write your review (optional)"
                    value={reviews[booking._id] || ""}
                    onChange={(e) =>
                      handleReviewChange(booking._id, e.target.value)
                    }
                  />
                </Form.Group>

                <Button
                  variant="primary"
                  onClick={() => handleSubmitRating(booking._id)}
                  disabled={!activeRating[booking._id]}
                  className="w-100"
                >
                  Submit Rating
                </Button>

                {submitStatus[booking._id] && (
                  <Alert
                    variant={
                      submitStatus[booking._id].success ? "success" : "danger"
                    }
                    className="mt-3 mb-0"
                  >
                    {submitStatus[booking._id].message}
                  </Alert>
                )}
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default TourGuideRating;
