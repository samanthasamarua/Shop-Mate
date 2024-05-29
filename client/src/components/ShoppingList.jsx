import { Link as ReactRouterLink } from 'react-router-dom'
import { Link as ChakraLink } from '@chakra-ui/react'

import { Fade, ScaleFade, Slide, SlideFade, Collapse, useDisclosure } from '@chakra-ui/react'

import { Box, Container, SimpleGrid, Image, Text, Button, Flex, Stack } from '@chakra-ui/react';
import ShareListButton from './ShareListButton';
import { useMutation, useQuery } from '@apollo/client';

import { DELETE_LIST, DUPLICATE_LIST } from '../utils/mutations';
import { GET_LISTS_BY_ME, GET_USERNAME_BY_EMAIL } from '../utils/queries';

export default function ShoppingList({lists}) {
  if (!lists.length) {
    return <h3>No shopping list Yet</h3>;
  };

  // Toggle for Share button
  const { getDisclosureProps, getButtonProps } = useDisclosure()
  const buttonProps = getButtonProps()
  const disclosureProps = getDisclosureProps()

  const [deleteList] = useMutation
    (DELETE_LIST, {
      refetchQueries: [{ query: GET_LISTS_BY_ME }]
    });

  const [duplicateList] = useMutation
    (DUPLICATE_LIST, {
      refetchQueries: [{ query: GET_LISTS_BY_ME }]
    });

  
  // SHare List
  const searchUserByEmail = async (event) => {
    console.log(event.target[0].value);
    const { data } = await useQuery(GET_USERNAME_BY_EMAIL, 
      { variables: { email: event.target[0].value } });

    console.log(data);
    const searchResult = data?.userByEmail.username || null;
  };
  
  // Duplicate List
  const handleDuplicateList = async (listId) => {
    // console.log(list);
    try {
      const { data } = await duplicateList({
        variables: { listId },
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteList = async (listId) => {
    // console.log(list);
    try {
      const { data } = await deleteList({
        variables: { listId },
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mt={4}>
      {lists &&
        lists.map((list) => (
          <Box bg="gray.50" p={4} borderRadius="md" textAlign="center" key={list._id}>
            <ChakraLink as={ReactRouterLink} to={`/lists/${list._id}`}>
              Name: {list.name}.
            </ChakraLink>
            <h4>Created by: {list.owner}</h4>
            <h4>Description: {list.description}</h4>
            <Stack direction='row' spacing={4} align='start' justify ='center'>
              <ShareListButton onClickSearch={searchUserByEmail} />
              <Button 
                colorScheme="teal" 
                size="sm"
                onClick={() => handleDuplicateList(list._id)}
              >
                Duplicate
              </Button>
              <Button 
                colorScheme="red" 
                size="sm"
                onClick={() => handleDeleteList(list._id)}
              >
                Delete
              </Button>
            </Stack>
          </Box>
        ))}
    </SimpleGrid>
  );
}