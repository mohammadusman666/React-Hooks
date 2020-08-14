import React, { useState, useEffect } from 'react';

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

  const [searchTerm, setSearchTerm] = useState(localStorage.getItem('searchTerm') || 'React');

  useEffect(() => {
    localStorage.setItem('searchTerm', searchTerm);
  }, [searchTerm])

  const onSearchChange = (event) => {
    setSearchTerm(event.target.value);
  }

  const searchedStories = stories.filter((story) =>
    story.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>Hello React</h1>

      <Search searchTerm={ searchTerm } onSearchChange={ onSearchChange }/>

      <hr />

      <List list={ searchedStories }/>
    </div>
  );
}

const Search = ({ searchTerm, onSearchChange }) => {
  return (
    <div>
      <label htmlFor="search">Search: </label>
      <input id="search" type="text" value={ searchTerm } onChange={ onSearchChange } />
    </div>
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
