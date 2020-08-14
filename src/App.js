import React, { useState, useEffect, useRef } from 'react';

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

const initialStories = [
  {
    title: 'React',
    url: 'https://reactjs.org/',
    author: 'Jordan Walke',
    num_comments: 3,
    points: 4,
    objectID: 0,
  },
  {
    title: 'Redux',
    url: 'https://redux.js.org/',
    author: 'Dan Abramov, Andrew Clark',
    num_comments: 2,
    points: 5,
    objectID: 1,
  },
];

const getAsyncStories = () => {
  return new Promise(resolve =>
    setTimeout(
      () => resolve({ data: { stories: initialStories } }),
      2000
    )
  )
}

const App = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    getAsyncStories().then((result) => {
      setStories(result.data.stories);
    });
  }, []);
  
  const onDeleteStory = (item) => {
    const newStories = stories.filter((story) => 
      story.objectID !== item.objectID
    );

    setStories(newStories);
  }

  const [searchTerm, setSearchTerm] = useSemiPersistentState('searchTerm', 'React');

  const onSearchChange = (event) => {
    setSearchTerm(event.target.value);
  }

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Hello React</h1>

      <InputWithLabel id='search' value={ searchTerm } isFocused onValueChange={ onSearchChange }>
        <SimpleText text='Search: ' />
      </InputWithLabel>

      <hr />

      <List list={ searchedStories } onRemoveItem={ onDeleteStory }/>
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
