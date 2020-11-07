import React, { Component } from 'react';
import { mock } from './mock_Files/mock';
import { Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import Header from './components/Header';
import './stylesheets/App.scss';
import {
  faHeart,
  faArrowUp,
  faArrowDown,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class App extends Component {
  constructor() {
    super();
    this.state = {
      assets: {},
      sortColumn: '',
      favorites: JSON.parse(window.localStorage.getItem('favorites')) || {},
      filter: '',
      debounce: '',
    };

    this.onFilter$ = new Subject();
    this.filterAssets = this.filterAssets.bind(this);
  }

  componentDidMount() {
    this.onFilter$.debounceTime(500).subscribe((debounce) => {
      this.setState({ debounce: debounce.toLowerCase() });
    });

    mock
      .bufferTime(200)
      .pipe(filter((items) => items.length))
      .map((items) => {
        let assets = {};
        items.forEach((item) => {
          assets[item.id] = item;
          assets[item.id].lastUpdate = this.formatDate(item.lastUpdate);
        });
        return { ...this.state.assets, ...assets };
      })
      .subscribe((assets) => {
        this.setState({ assets });
      });
  }

  formatMoney(number) {
    return number.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    });
  }

  formatDate(date) {
    let d = new Date(date);
    return (
      d.getMonth() +
      '/' +
      d.getDate() +
      '/' +
      d.getFullYear() +
      ' ' +
      d.getDay() +
      ':' +
      d.getMinutes() +
      ':' +
      d.getSeconds()
    );
  }

  getData() {
    let keys = Object.keys(this.state.assets);

    if (this.state.debounce) {
      keys = this.filterAssetsByInputText(keys);
    }

    if (this.state.sortColumn) {
      keys = this.sortAssetByColumn(keys);
    }

    if (Object.keys(this.state.favorites).length) {
      keys = this.sortAssetsByFavorite(keys);
    }

    return keys.map((key) => this.state.assets[key]);
  }

  filterAssets(value) {
    const filter = value;
    this.setState({ filter });
    this.onFilter$.next(filter);
    this.setState({
      sortColumn: 'id',
    });
  }

  sortColumnSelect(value) {
    return () => {
      this.setState({
        sortColumn: this.state.sortColumn === value ? `-${value}` : value,
      });
    };
  }

  favoritesAction(name) {
    return () => {
      let favorites = this.state.favorites;

      if (favorites[name]) {
        const { [name]: toDel, ...rest } = favorites;
        favorites = rest;
      } else {
        favorites[name] = true;
      }
      this.setState({ favorites });
      window.localStorage.setItem('favorites', JSON.stringify(favorites));
    };
  }

  sortAssetsByFavorite(keys) {
    let fav = [];
    let rest = [];
    keys.forEach((key) => {
      if (this.state.favorites[key]) {
        fav.push(key);
      } else {
        rest.push(key);
      }
    });
    return fav.concat(rest);
  }

  sortAssetByColumn(keys) {
    let sortColumn = this.state.sortColumn;
    const reverse = sortColumn.charAt(0) === '-';

    if (reverse) {
      sortColumn = sortColumn.substr(1);
    }

    return keys.sort((a, b) => {
      if (this.state.assets[a][sortColumn] > this.state.assets[b][sortColumn]) {
        return reverse ? -1 : 1;
      }
      return reverse ? 1 : -1;
    });
  }

  filterAssetsByInputText(keys) {
    return keys.filter((key) =>
      JSON.stringify(this.state.assets[key])
        .toLowerCase()
        .includes(this.state.debounce)
    );
  }

  getArrowForColHead(key) {
    return this.state.sortColumn === key ? (
      <FontAwesomeIcon icon={faArrowUp} />
    ) : this.state.sortColumn === `-${key}` ? (
      <FontAwesomeIcon icon={faArrowDown} />
    ) : null;
  }

  render() {
    return (
      <div className="app">
        <Header
          searchTerm={this.state.filter}
          onSearch={(value) => this.filterAssets(value)}
        ></Header>
        <div className="container">
          <table className="table table-hover table-strip">
            <thead>
              <tr>
                <th>Favorite</th>
                <th onClick={this.sortColumnSelect('id')}>
                  ID {this.getArrowForColHead('id')}
                </th>
                <th onClick={this.sortColumnSelect('assetName')}>
                  Name {this.getArrowForColHead('assetName')}
                </th>
                <th onClick={this.sortColumnSelect('price')}>
                  Price {this.getArrowForColHead('price')}
                </th>
                <th onClick={this.sortColumnSelect('lastUpdate')}>
                  Last Update {this.getArrowForColHead('lastUpdate')}
                </th>
                <th onClick={this.sortColumnSelect('type')}>
                  Type {this.getArrowForColHead('type')}
                </th>
              </tr>
            </thead>
            <tbody>
              {this.getData().map((row) => {
                return (
                  <tr key={row.id}>
                    <td>
                      <FontAwesomeIcon
                        onClick={this.favoritesAction(row.id)}
                        icon={faHeart}
                        className={
                          this.state.favorites[row.id]
                            ? 'redHeart'
                            : 'greyHeart'
                        }
                      />
                    </td>
                    <td>{row.id}</td>
                    <td>{row.assetName}</td>
                    <td>{row.price}</td>
                    <td>{row.lastUpdate}</td>
                    <td>{row.type}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default App;
