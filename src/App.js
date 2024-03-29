import React, { useState, useEffect, useRef, useReducer, useCallback } from 'react';
import axios from 'axios';

const API_ENDPOINT = 'https://hn.algolia.com/api/v1/search?query=';

/*
Custom hook with effect

Parameters:
  key: used to identify the value in localStorage
  initialValue: the initial value

Returns:
  state variable and its updater
*/
const useSemiPersistentState = (key, initialValue) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialValue);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key])

  return [value, setValue];
}

const storiesReducer = (state, action) => {
  switch (action.type) {
    case 'STORIES_FETCH_INIT':
      return {
        ...state,
        isLoading: true,
        isError: false
      };
    case 'STORIES_FETCH_SUCCESS':
      return {
        ...state,
        data: action.payload,
        isLoading: false,
        isError: false,
      };
    case 'STORIES_FETCH_FAILURE':
      return {
        ...state,
        isLoading: false,
        isError: true
      };
    case 'DELETE_STORY':
      return {
        ...state,
        data: state.data.filter(
          story => action.payload.objectID !== story.objectID
        )
      }
    default:
      throw new Error();
  }
};

const App = () => {
  const [stories, dispatchStories] = useReducer(
    storiesReducer,
    { data: [], isLoading: false, isError: false }
  );

  const [searchTerm, setSearchTerm] = useSemiPersistentState('searchTerm', 'React');

  const [url, setUrl] = useState(`${API_ENDPOINT}${searchTerm}`);

  const handleFetchStories = useCallback(
    () => {
      dispatchStories({ type: 'STORIES_FETCH_INIT' });

      axios.get(url) // fetch popular tech stories for a certain query using axios
        .then((result) => {
          dispatchStories({
            type: 'STORIES_FETCH_SUCCESS',
            payload: result.data.hits
          });
        })
        .catch(() => 
          dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
        );
    },
    [url]
  )
  
  useEffect(() => {
    handleFetchStories();
  }, [handleFetchStories]);
  
  const onDeleteStory = (item) => {
    dispatchStories({
      type: 'DELETE_STORY',
      payload: item,
    });
  }

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setUrl(`${API_ENDPOINT}${searchTerm}`);
  }

  return (
    <div>
      <h1>Hello React</h1>

      <SearchForm searchTerm={ searchTerm } onSearchChange={ handleSearchChange } onSearchSubmit={ handleSearchSubmit } />

      <hr />
      { stories.isError && <p>Error in loading data!</p> }
      { stories.isLoading ? <p>Loading...</p> : <List list={ stories.data } onRemoveItem={ onDeleteStory }/> }
    </div>
  );
}

const SimpleText = ({ text }) => {
  return (
  <strong>{ text }</strong>
  )
}

const InputWithLabel = ({ id, type = 'text', value, isFocused, onValueChange, children }) => {
  /* (A) First, create a ref with React’s useRef hook. This ref object is a persistent value which stays intact over the lifetime of a React component.
  It comes with a property called current, which, in contrast to the ref object, can be changed. */
  const inputRef = useRef();

  /* (C) Third, opt into React’s lifecycle with React’s useEffect Hook, performing the focus on the input field when the component renders
  (or its dependencies change). */
  useEffect(() => {
    if (isFocused && inputRef.current)
      /* (D) And fourth, since the ref is passed to the input field’s ref attribute, its current property gives access to the element. Execute its focus
      programmatically as a side-effect, but only if isFocused is set and the current property is existent. */
      inputRef.current.focus();
  }, [isFocused])

  return (
    <>
      <label htmlFor={ id }>{ children }</label>
      {/* (B) Second, the ref is passed to the input field’s JSX-reserved ref attribute and the element instance is assigned to the changeable current property. */}
      <input ref={ inputRef } id={ id } type={ type } value={ value } onChange={ onValueChange } />
    </>
  );
}

const SearchForm = ({ searchTerm, onSearchChange, onSearchSubmit }) => (
  <form onSubmit={ onSearchSubmit }>
    <InputWithLabel id='search' value={ searchTerm } isFocused onValueChange={ onSearchChange }>
      <SimpleText text='Search: ' />
    </InputWithLabel>

    <button type="submit" disabled={ !searchTerm }>
      Submit
    </button>
  </form>
)

const List = ({ list, onRemoveItem }) => (
  list.map(item => (
    <Item key={ item.objectID } item={ item } onRemoveItem={ onRemoveItem } />
  ))
)

const Item = ({ item, onRemoveItem }) => {
  // const handleRemoveItem = () => {
  //   onRemoveItem(item);
  // }

  return (
    <div>
      <span>
        <a href={ item.url }>{ item.title }</a>
      </span>
      <span>{ item.num_comments }</span>
      <span>{ item.author }</span>
      <span>{ item.points }</span>
      <span>
        <button type="button" onClick={() => onRemoveItem(item)}>
          Dismiss
        </button>
      </span>
    </div>
  )
}

export default App;
