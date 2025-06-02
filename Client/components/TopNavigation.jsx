import React from "react";
import { Flex, Text } from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react";
const TopNavigation = () => {
  return (
    <>
      <Flex justifyContent={"space-between"} alignItems="center" p={4}>
        <Text fontSize="xl" fontWeight="bold">
          My Application
        </Text>
        <Flex alignItems="center">
          <Text fontSize="sm" fontWeight={500} mr={2}>
            Segun Adebayo
          </Text>{" "}
          <Avatar.Root>
            <Avatar.Fallback name="Segun Adebayo" />
            <Avatar.Image src="https://bit.ly/sage-adebayo" />
          </Avatar.Root>
        </Flex>
      </Flex>
    </>
  );
};

export default TopNavigation;
