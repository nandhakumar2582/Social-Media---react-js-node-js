//import "./search.scss"
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { makeRequest } from '../../axios';

const Search = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const navigate = useNavigate()
  const searchTerm = queryParams.get('q');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setIsError(false);

      try {
        if (searchTerm) {
          const response = await makeRequest.get(`/search?q=${searchTerm}`);
          console.log(response.data);
          setSearchResults(response.data);
          console.log(searchResults);
        }
      } catch (error) {
        console.error('Error fetching search results:', error);
        setIsError(true);
      }

      setIsLoading(false);
    };

    fetchData();
  }, [searchTerm]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching search results</div>;
 

  return (
    <div>
      {searchResults.length > 0 ? (
        <>
          <h2>Search Results for "{searchTerm}"</h2>
          <div>
            {searchResults.map((result) => (
              <div key={result.id} onClick={()=>navigate(`/profile/${result.id}`)} className="user-container">
                <img src={result.profilePic?result.profilePic:"./images/default_profilePic.jpg"} alt="" />
                <div className="name-container">
                  <h3>{result.name}</h3>
                  <p>@{result.username}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      ): "No Data Found"}
    </div>
  );
};

export default Search;

