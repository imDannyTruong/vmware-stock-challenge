import PropTypes from 'prop-types';
import React, { useState } from 'react';
import '../stylesheets/Header.scss';

const Header = ({ searchTerm, onSearch }) => {
  const [value, setValue] = useState(0);

  const search = (event) => {
    if (event.type === 'click') {
      searchTerm = value;
      onSearch(searchTerm);
    } else if (event.keyCode === 13) {
      searchTerm = value;
      onSearch(searchTerm);
    } else if (
      (event.keyCode === 8 || event.keyCode === 46) &&
      value.length == 0
    ) {
      searchTerm = value;
      onSearch(searchTerm);
    }
  };

  return (
    <header className="header">
      <div className="text-container">
        <input
          className="search-input"
          type="text"
          onChange={(e) => setValue(e.target.value)}
          onKeyUp={search}
          placeholder="Search stocks here..."
        />
        <button
          className="search-btn search-btn-white search-btn-animated mx-auto"
          onClick={search}
        >
          Search
        </button>
        <h4 className="pt-2">Can filter by selecting table header</h4>
      </div>
    </header>
  );
};

export default Header;
