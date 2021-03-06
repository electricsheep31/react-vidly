import React, { Component } from "react";
import { getMovies } from "../services/fakeMovieService";
import { getGenres } from "../services/fakeGenreService";
import Pagination from "./pagination";
import ListGroup from "../common/listGroup";
import { paginate } from "../utils/paginate";
import MoviesTable from "./moviesTable";
import { NavLink } from "react-router-dom";
import Search from "../common/search";
import _ from "lodash";

class Movies extends Component {
  state = {
    movies: [],
    genres: [],
    currentPage: 1,
    itemsPerPage: 5,
    currentGenre: null,
    sortColumn: { path: "title", order: "asc" },
    searchField: "",
  };

  //in an application where backend services are consumed, the best place to initialize genres and movies
  //are in the componentDidMount lifecycle hook because it can take time before data is loaded and
  //a runtime error can occur because some state properties can be undefined

  componentDidMount() {
    console.log("component did mount");
    const genres = [{ _id: "", name: "All Genres" }, ...getGenres()];
    this.setState({
      movies: getMovies(),
      genres: genres,
    });
  }

  handleDelete = (movie) => {
    const movies = this.state.movies.filter((m) => m._id !== movie._id);
    this.setState({ movies: movies });
  };

  handlePageClick = (page) => {
    this.setState({
      currentPage: page,
    });
  };

  handleLike = (movie) => {
    const movies = [...this.state.movies];
    const index = movies.indexOf(movie);
    movies[index] = { ...movie };
    movies[index] = { ...movies[index] };

    //either syntax is fine, the goal is never mutate the state directly because movies[index]
    //initially references the object in the state. movies[index] needs to be instantiated with
    //a clone of either the parsed movie object or the movie object at index using the spread
    //operator. to see the direct state mutation, do:
    //console.log(this.state.movies[index]);

    movies[index].liked = !movies[index].liked;
    // movies[index].liked = movie.liked ? false : true;

    this.setState({
      movies: movies,
    });
  };

  handleGenreClick = (genre) => {
    this.setState({
      currentGenre: genre,
      currentPage: 1,
      searchField: "",
    });
  };

  handleSort = (sortColumn) => {
    this.setState({ sortColumn });
  };

  handleSearch = ({ currentTarget: input }) => {
    console.log(input.value);
    this.setState({
      searchField: input.value,
      currentGenre: null,
      currentPage: 1,
    });
  };

  getPagedData = () => {
    const {
      movies: allMovies,
      itemsPerPage,
      currentPage,
      currentGenre,
      sortColumn,
      searchField,
    } = this.state;

    let filtered = allMovies;

    if (searchField !== "") {
      // filtered = allMovies.filter(
      //   (movie) => movie.title.toLowerCase().indexOf(searchField) > -1
      // );

      //startsWith() is more appropriate when searching titles as opposed to indexOf()
      filtered = allMovies.filter((movie) =>
        movie.title.toLowerCase().startsWith(searchField.toLowerCase())
      );
    } else if (currentGenre && currentGenre._id) {
      filtered = allMovies.filter((m) => m.genre._id === currentGenre._id);
    }

    const sorted = _.orderBy(filtered, [sortColumn.path], [sortColumn.order]);
    const filteredMovies = paginate(sorted, currentPage, itemsPerPage);

    return { totalCount: filtered.length, data: filteredMovies };
  };

  render() {
    const {
      itemsPerPage,
      currentPage,
      genres,
      currentGenre,
      sortColumn,
    } = this.state;

    const { totalCount, data: movies } = this.getPagedData();

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-3">
            <ListGroup
              items={genres}
              currentSelection={currentGenre}
              onSelectChange={this.handleGenreClick}
            />
          </div>
          <div className="col">
            <NavLink to="/movies/new" className="btn btn-primary new-movie">
              New Movie
            </NavLink>
            {totalCount === 0 && <p>There are no movies in the database</p>}
            {totalCount > 0 && (
              <p>Showing {totalCount} movies in the database.</p>
            )}

            <Search
              name="search"
              value={this.state.searchField}
              onChange={this.handleSearch}
            />

            <MoviesTable
              movies={movies}
              onDelete={this.handleDelete}
              onLikeToggle={this.handleLike}
              onSort={this.handleSort}
              sortColumn={sortColumn}
            />
            <Pagination
              itemsCount={totalCount}
              itemsPerPage={itemsPerPage}
              onPageChange={this.handlePageClick}
              currentPage={currentPage}
            />
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Movies;
