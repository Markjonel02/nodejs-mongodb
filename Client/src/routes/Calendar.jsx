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
  IconButton,
} from "@chakra-ui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";

import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  parseISO,
} from "date-fns";

const API_BASE_URL = "http://localhost:5000/api/events"; // Your backend API URL

const Calendar2025 = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const yearToShow = 2025;
  const monthsArray = Array.from({ length: 12 }, (_, i) => i); // 0 = Jan, 11 = Dec

  // --- Manual Slider State ---
  const [currentSlide, setCurrentSlide] = useState(0); // 0 for Jan-Apr, 1 for May-Aug, 2 for Sep-Dec
  const totalSlides = Math.ceil(monthsArray.length / 4); // Total number of 4-month chunks (3 for 12 months)

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
    setCurrentEvent(null);
    onOpen();
  };

  const handleEditEvent = (event) => {
    setSelectedDate(parseISO(event.start));
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
      fetchEvents();
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
        response = await fetch(`${API_BASE_URL}/${currentEvent._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        });
      } else {
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
      fetchEvents();
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

    const startDayOfWeek = getDay(firstDay);
    const paddedDays = Array(startDayOfWeek).fill(null).concat(daysInMonth);

    return (
      <Box
        key={`${monthIndex}-${year}`}
        p={1}
        border="1px solid #ccc"
        borderRadius="md"
        minHeight="300px"
        flexShrink={0}
        flexGrow={1}
      >
        <Heading size="xs" mb={1} textAlign="center">
          {format(firstDay, "MMMM")}
        </Heading>
        <SimpleGrid columns={7} spacing={0.5}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <Text
              key={day}
              fontWeight="bold"
              textAlign="center"
              fontSize="xx-small"
            >
              {day}
            </Text>
          ))}
          {paddedDays.map((date, index) => {
            if (!date) {
              return (
                <Box key={`empty-${monthIndex}-${index}`} height="50px"></Box>
              );
            }

            const dateKey = format(date, "yyyy-MM-dd");
            const dailyEvents = events.filter((event) =>
              isSameDay(parseISO(event.start), date)
            );

            return (
              <Flex
                key={dateKey}
                direction="column"
                height="50px"
                border="1px solid lightgray"
                p={0.5}
                overflowY="hidden"
                onClick={() => handleDayClick(date)}
                cursor="pointer"
                _hover={{ bg: "gray.50" }}
              >
                <Text fontWeight="bold" fontSize="xx-small">
                  {format(date, "d")}
                </Text>
                {dailyEvents.slice(0, 1).map((event) => (
                  <Text
                    key={event._id}
                    fontSize="xx-small"
                    color="blue.600"
                    noOfLines={1}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditEvent(event);
                    }}
                  >
                    • {event.title}
                  </Text>
                ))}
                {dailyEvents.length > 1 && (
                  <Text fontSize="xx-small" color="gray.500">
                    +{dailyEvents.length - 1} more
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

  const currentMonthGroup = chunkedMonths[currentSlide];

  const goToNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const goToPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <Box p={{ base: 2, md: 4 }} maxWidth="1200px" mx="auto">
      <Heading mb={4} textAlign="center" fontSize={{ base: "lg", md: "xl" }}>
        2025 Calendar Scheduler
      </Heading>

      <Flex alignItems="center" justifyContent="center" mb={4}>
        <IconButton
          icon={<ChevronLeftIcon w={6} h={6} />}
          onClick={goToPrevSlide}
          aria-label="Previous months"
          mr={2}
          isDisabled={currentSlide === 0}
        />

        <Box width="100%" overflow="hidden" position="relative">
          <Flex
            justifyContent="space-around"
            flexWrap="nowrap"
            gap={2}
            minHeight="350px"
            maxHeight="350px"
            transition="transform 0.3s ease-in-out"
            transform={`translateX(-${currentSlide * 100}%)`}
          >
            {chunkedMonths.map((group, groupIndex) => (
              <Flex
                key={`group-${groupIndex}`}
                width="100%"
                justifyContent="space-around"
                flexShrink={0}
                gap={2}
                px={{ base: 1, md: 2 }}
              >
                {group.map((monthIndex) => (
                  <Box
                    key={monthIndex}
                    width={{ base: "100%", sm: "48%", lg: "24%" }}
                    flexShrink={0}
                    flexBasis={{ base: "100%", sm: "48%", lg: "24%" }}
                  >
                    {renderMonth(monthIndex, yearToShow)}
                  </Box>
                ))}
              </Flex>
            ))}
          </Flex>
        </Box>

        <IconButton
          icon={<ChevronRightIcon w={6} h={6} />}
          onClick={goToNextSlide}
          aria-label="Next months"
          ml={2}
          isDisabled={currentSlide === totalSlides - 1}
        />
      </Flex>

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
