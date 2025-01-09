import { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import dp from "../assets/dp.png";

// Styled components for chat bubbles and timestamps
const ChatBubble = styled(Paper)(({ theme, isCurrentUser }) => ({
  maxWidth: "80%",
  wordWrap: "break-word",
  padding: theme.spacing(1.5),
  margin: theme.spacing(0.8, 0),
  borderRadius: "15px",
  backgroundColor: isCurrentUser ? "#DCF8C6" : "#FFFFFF",
  alignSelf: isCurrentUser ? "flex-end" : "flex-start",
}));

const Timestamp = styled(Typography)(({ theme }) => ({
  fontSize: "10px",
  color: theme.palette.text.secondary,
  textAlign: "right",
}));

function ChatDisplay({ currentUser, users }) {
  const [messages, setMessages] = useState([]); // Messages array
  const [loading, setLoading] = useState(false); // Loading state
  const [hasMoreMessages, setHasMoreMessages] = useState(true); // Whether there are more messages to load
  const [selectedUser, setSelectedUser] = useState(currentUser); // Selected user for chat
  const [anchorEl, setAnchorEl] = useState(null); // Anchor element for user menu

  const scrollRef = useRef(null); // Reference for the scrollable container
  const isAtBottomRef = useRef(true); // Track if user is at the bottom of the chat

  /**
   * Fetch initial messages from backend on component mount or when selected user changes
   */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `http://localhost:5000/api/chats?user=${selectedUser}&page=1&limit=20`
        );
        setMessages(response.data.reverse()); // Set messages in correct order
      } catch (error) {
        console.error(
          "Error fetching messages:",
          error.response || error.message
        );
      } finally {
        setLoading(false);
        scrollToBottom(); // Scroll to bottom after loading messages
      }
    };

    fetchMessages();
  }, [selectedUser]);

  /**
   * Fetch older messages when scrolling to the top
   */
  const fetchOlderMessages = async () => {
    if (!hasMoreMessages || loading) return;

    const previousScrollHeight = scrollRef.current.scrollHeight; // Save current scroll height

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/chats?user=${selectedUser}&page=${Math.ceil(
          messages.length / 20 + 1
        )}&limit=20`
      );
      if (response.data.length === 0) {
        setHasMoreMessages(false); // No more older messages to load
      } else {
        setMessages((prev) => [...response.data.reverse(), ...prev]); // Prepend older messages

        // Adjust scroll position after loading older messages
        setTimeout(() => {
          if (scrollRef.current) {
            scrollRef.current.scrollTop =
              scrollRef.current.scrollHeight - previousScrollHeight;
          }
        }, 0);
      }
    } catch (error) {
      console.error("Error fetching older messages:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle scrolling behavior
   */
  const handleScroll = () => {
    if (!scrollRef.current || loading || !hasMoreMessages) return;

    // Check if user scrolled near the top of the container
    if (scrollRef.current.scrollTop <= 5) {
      fetchOlderMessages();
    }

    // Update whether user is at the bottom of the chat
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    isAtBottomRef.current = scrollTop + clientHeight >= scrollHeight - 5;
  };

  /**
   * Scroll to the bottom of the chat container
   */
  const scrollToBottom = () => {
    if (scrollRef.current && isAtBottomRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  /**
   * Automatically scroll to bottom when new messages are added
   */
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  /**
   * Handle opening and closing of user menu
   */
  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);

  const handleMenuClose = () => setAnchorEl(null);

  /**
   * Handle switching between users in the chat menu
   */
  const handleUserSelect = async (user) => {
    setSelectedUser(user);
    handleMenuClose();
    setMessages([]); // Clear current messages

    try {
      setLoading(true);
      const response = await axios.get(
        `http://localhost:5000/api/chats?user=${user}&page=1&limit=20`
      );
      setMessages(response.data.reverse()); // Fetch new user's messages in correct order
      setHasMoreMessages(true); // Reset older message loading for new user
    } catch (error) {
      console.error("Error fetching user messages:", error);
    } finally {
      setLoading(false);
      scrollToBottom();
    }
  };

  /**
   * Format ISO date into a readable time format (hh:mm)
   */
  const formatTime = (isoDate) =>
    new Date(isoDate).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Box
      sx={{
        width: "100vw", // Full viewport width
        height: "100vh", // Full viewport height
        display: "flex", // Use flexbox for centering
        justifyContent: "center", // Center horizontally
        alignItems: "center", // Center vertically
        backgroundColor: "#FFFFF", // Background color for the entire screen
        flexDirection: "column",
      }}
    >
      {/* Chat Container */}
      <Box
        sx={{
          width: "100%",
          maxWidth: "420px", // Limit max width for smaller screens
          height: "100vh", // Full height of the viewport
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#FFFFFF", // Background color for the chat box
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Add a subtle shadow for better UI
          borderRadius: "15px", // Rounded corners for a modern look
          overflow: "hidden",
          marginTop: "3px", // Prevent content overflow
        }}
      >
        {/* Top Bar */}
        <AppBar position="static" sx={{ backgroundColor: "#075E54" }}>
          <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
            {/* Show selected user's name */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <Avatar src={dp} alt="Profile" sx={{ marginRight: "10px" }} />
              <Typography variant="h6">Sanket❤️</Typography>
            </Box>
          </Toolbar>
        </AppBar>

        {/* User Menu */}

        {/* Chat Container */}
        <Box
          ref={scrollRef}
          onScroll={handleScroll}
          sx={{
            flexGrow: 1,
            overflowY: "auto", // Allow scrolling if there are many messages
            display: "flex",
            flexDirection: "column", // Show newest last at the bottom naturally
            paddingBottom: "16px",
            paddingTop: "8px",
            backgroundColor: "#ECE5DD",
            padding: "10px",
          }}
        >
          {/* Loading Indicator */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", p: "16px" }}>
              <CircularProgress size={20} />
            </Box>
          )}

          {/* Render Messages */}
          {messages.map((msg, index) => (
            <ChatBubble key={index} isCurrentUser={msg.sender === currentUser}>
              {/* Show sender's name only for received messages */}
              {msg.sender !== currentUser && (
                <Typography variant="caption" sx={{ fontWeight: "bold" }}>
                  {msg.sender}
                </Typography>
              )}
              <Typography variant="body1">{msg.message}</Typography>
              <Timestamp variant="caption">{formatTime(msg.date)}</Timestamp>
            </ChatBubble>
          ))}
        </Box>
      </Box>
    </Box>
  );
}

export default ChatDisplay;
