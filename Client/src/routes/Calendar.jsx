import React, { useState, useEffect } from "react";
import {
  Box,
  Flex,
  SimpleGrid,
  Text,
  Heading,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import "swiper/swiper-bundle.css"; // Core Swiper styles
import "swiper/components/navigation/navigation.min.css"; // Navigation module styles
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO,
} from "date-fns";

SwiperCore.use([Navigation]);

const API_BASE_URL = "http://localhost:5000/api/events"; // Your backend API URL

const Calendar2025 = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null); // For editing
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const yearToShow = 2025;
  const monthsArray = Array.from({ length: 12 }, (_, i) => i); // 0 = Jan, 11 = Dec

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}?startDate=${yearToShow}-01-01&endDate=${yearToShow}-12-31`
      );
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Error fetching events.",
        description: "Could not load events from the server.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDayClick = (date) => {
    setSelectedDate(date);
    setCurrentEvent(null); // Clear any event being edited
    onOpen();
  };

  const handleEditEvent = (event) => {
    setSelectedDate(parseISO(event.start)); // Set the date for the form
    setCurrentEvent({
      ...event,
      start: format(parseISO(event.start), "yyyy-MM-dd'T'HH:mm"),
      end: format(parseISO(event.end), "yyyy-MM-dd'T'HH:mm"),
    });
    onOpen();
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`${API_BASE_URL}/${eventId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete event");
      toast({
        title: "Event deleted.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      fetchEvents(); // Refresh events
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Error deleting event.",
        description: "Could not delete event.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const eventData = {
      title: formData.get("title"),
      description: formData.get("description"),
      start: formData.get("start"),
      end: formData.get("end"),
    };

    try {
      let response;
      if (currentEvent) {
        // Update existing event
        response = await fetch(`${API_BASE_URL}/${currentEvent._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      } else {
        // Create new event
        response = await fetch(API_BASE_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to save event");
      }

      toast({
        title: currentEvent ? "Event updated." : "Event created.",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchEvents(); // Refresh events
    } catch (error) {
      console.error("Error saving event:", error);
      toast({
        title: "Error saving event.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const renderMonth = (monthIndex, year) => {
    const firstDay = startOfMonth(new Date(year, monthIndex));
    const lastDay = endOfMonth(firstDay);
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

    // Pad the beginning with empty cells for days before the 1st
    const startDayOfWeek = getDay(firstDay); // Sunday = 0, Saturday = 6
    const paddedDays = Array(startDayOfWeek).fill(null).concat(daysInMonth);

    return (
      <Box
        key={`${monthIndex}-${year}`}
        p={2}
        border="1px solid #ccc"
        borderRadius="md"
        height="auto"
      >
        <Heading size="sm" mb={2} textAlign="center">
          {format(firstDay, "MMMM yyyy")}
        </Heading>
        <SimpleGrid columns={7} spacing={1}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text key={day} fontWeight="bold" textAlign="center" fontSize="xs">
              {day}
            </Text>
          ))}
          {paddedDays.map((date, index) => {
            if (!date) {
              return (
                <Box key={`empty-${monthIndex}-${index}`} height="80px"></Box>
              ); // Smaller height for month view
            }

            const dateKey = format(date, "yyyy-MM-dd");
            const dailyEvents = events.filter((event) =>
              isSameDay(parseISO(event.start), date)
            );

            return (
              <Flex
                key={dateKey}
                direction="column"
                height="80px" // Smaller height for month view
                border="1px solid lightgray"
                p={1}
                overflowY="auto"
                onClick={() => handleDayClick(date)}
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
              >
                <Text fontWeight="bold" fontSize="sm">
                  {format(date, "d")}
                </Text>
                {dailyEvents.slice(0, 2).map(
                  (
                    event // Show max 2 events
                  ) => (
                    <Text
                      key={event._id}
                      fontSize="xs"
                      color="blue.600"
                      noOfLines={1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditEvent(event);
                      }}
                    >
                      • {event.title}
                    </Text>
                  )
                )}
                {dailyEvents.length > 2 && (
                  <Text fontSize="xs" color="gray.500">
                    + {dailyEvents.length - 2} more
                  </Text>
                )}
              </Flex>
            );
          })}
        </SimpleGrid>
      </Box>
    );
  };

  const chunkedMonths = monthsArray.reduce((acc, _, i, arr) => {
    if (i % 4 === 0) {
      acc.push(arr.slice(i, i + 4));
    }
    return acc;
  }, []);

  const swiperParams = {
    slidesPerView: 1, // Default for smaller screens
    spaceBetween: 20, // Space between slides (groups of 4 months)
    navigation: true,
    breakpoints: {
      // When window width is >= 768px
      768: {
        slidesPerView: 1, // Still 1 slide containing 4 months
        spaceBetween: 30,
      },
    },
  };

  return (
    <Box p={{ base: 4, md: 8 }} maxWidth="1200px" mx="auto">
      <Heading mb={8} textAlign="center" fontSize={{ base: "xl", md: "2xl" }}>
        2025 Calendar Scheduler
      </Heading>
      <Swiper {...swiperParams}>
        {chunkedMonths.map((monthGroup, index) => (
          <SwiperSlide key={index}>
            <Flex
              justifyContent="space-around"
              flexWrap="wrap"
              gap={4} // Gap between the month boxes within a slide
            >
              {monthGroup.map((monthIndex) => (
                <Box
                  key={monthIndex}
                  width={{ base: "100%", sm: "48%", lg: "24%" }} // Responsive widths for months
                  flexShrink={0} // Prevent shrinking
                >
                  {renderMonth(monthIndex, yearToShow)}
                </Box>
              ))}
            </Flex>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Event Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="md">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {currentEvent ? "Edit Event" : "Add New Event"}
          </ModalHeader>
          <ModalCloseButton />
          <form onSubmit={handleSubmitEvent}>
            <ModalBody pb={6}>
              <FormControl isRequired mb={4}>
                <FormLabel>Title</FormLabel>
                <Input
                  name="title"
                  defaultValue={currentEvent?.title || ""}
                  placeholder="Event Title"
                />
              </FormControl>

              <FormControl mt={4} mb={4}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  defaultValue={currentEvent?.description || ""}
                  placeholder="Event Description"
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>Start Time</FormLabel>
                <Input
                  type="datetime-local"
                  name="start"
                  defaultValue={
                    currentEvent?.start ||
                    (selectedDate
                      ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
                      : "")
                  }
                />
              </FormControl>

              <FormControl isRequired mb={4}>
                <FormLabel>End Time</FormLabel>
                <Input
                  type="datetime-local"
                  name="end"
                  defaultValue={
                    currentEvent?.end ||
                    (selectedDate
                      ? format(selectedDate, "yyyy-MM-dd'T'HH:mm")
                      : "")
                  }
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              {currentEvent && (
                <Button
                  colorScheme="red"
                  mr={3}
                  onClick={() => handleDeleteEvent(currentEvent._id)}
                >
                  Delete
                </Button>
              )}
              <Button colorScheme="blue" mr={3} type="submit">
                {currentEvent ? "Update" : "Save"}
              </Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default Calendar2025;
