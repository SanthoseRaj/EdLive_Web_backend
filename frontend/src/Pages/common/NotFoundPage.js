import React from 'react';
import { Box, Heading, Text, Button, VStack } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minH="70vh"
      px={4}
    >
      <VStack spacing={6} textAlign="center">
        <Heading size="2xl" color="gray.600">
          404
        </Heading>
        <Heading size="lg" color="gray.500">
          Page Not Found
        </Heading>
        <Text fontSize="lg" color="gray.500" maxW="md">
          The page you're looking for doesn't exist or you don't have permission to access it.
        </Text>
        <Button
          colorScheme="blue"
          onClick={() => navigate('/')}
          size="lg"
        >
          Go Home
        </Button>
      </VStack>
    </Box>
  );
};

export default NotFoundPage;