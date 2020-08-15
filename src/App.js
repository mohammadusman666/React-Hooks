import React, { useState, useEffect, useRef, useReducer } from 'react';

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
        data: state.filter(
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

  useEffect(() => {
    if (!searchTerm) return;

    dispatchStories({ type: 'STORIES_FETCH_INIT' });

    fetch(`${API_ENDPOINT}${searchTerm}`) // fetch popular tech stories for a certain query
      .then(response => response.json()) // For the fetch API, the response needs to be translated into JSON
      .then((result) => {
        dispatchStories({
          type: 'STORIES_FETCH_SUCCESS',
          payload: result.hits
        });
      })
      .catch(() => 
        dispatchStories({ type: 'STORIES_FETCH_FAILURE' })
      );
  }, [searchTerm]);
  
  const onDeleteStory = (item) => {
    dispatchStories({
      type: 'DELETE_STORY',
      payload: item,
    });
  }

  const onSearchChange = (event) => {
    setSearchTerm(event.target.value);
  }

  // const searchedStories = stories.data.filter((story) =>
  //   story.title.toLowerCase().includes(searchTerm.toLowerCase())
  // );

  return (
    <div>
      <h1>Hello React</h1>

      <InputWithLabel id='search' value={ searchTerm } isFocused onValueChange={ onSearchChange }>
        <SimpleText text='Search: ' />
      </InputWithLabel>

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
