import React, { useState, useEffect } from 'react';

const useSemiPersistentState = (key, initialValue) => {
  const [value, setValue] = useState(localStorage.getItem(key) || initialValue);

  useEffect(() => {
    localStorage.setItem(key, value);
  }, [value, key])

  return [value, setValue];  
}

const App = () => {
  const stories = [
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

      <InputWithLabel id='search' value={ searchTerm } onValueChange={ onSearchChange }>
        <SimpleText text='Search: ' />
      </InputWithLabel>

      <hr />

      <List list={ searchedStories }/>
    </div>
  );
}

const SimpleText = ({ text }) => {
  return (
  <strong>{ text }</strong>
  )
}

const InputWithLabel = ({ id, type = 'text', value, onValueChange, children }) => {
  return (
    <>
      <label htmlFor={ id }>{ children }</label>
      <input id={ id } type={ type } value={ value } onChange={ onValueChange } />
    </>
  );
}

const List = ({ list }) => (
  list.map(item => (
    <Item key={ item.objectID } item={ item } />
  ))
)

const Item = ({ item }) => {
  return (
    <div>
      <span>
        <a href={ item.url }>{ item.title }</a>
      </span>
      <span>{ item.num_comments }</span>
      <span>{ item.author }</span>
      <span>{ item.points }</span>
    </div>
  )
}

export default App;
