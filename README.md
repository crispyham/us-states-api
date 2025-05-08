US States API
This RESTful API provides information about US states, including fun facts, population, capital, and more. It uses Express, MongoDB (via Mongoose), and serves both JSON and HTML responses.

Get all US states data (from JSON file, merged with MongoDB fun facts)
Filter for contiguous or non-contiguous states
Get state details by abbreviation (case-insensitive)
Get, add, update, and delete fun facts for states
Get state capital, nickname, population, and admission date
Friendly error messages and 404 handling

Prerequisites
Node.js (v14 or higher recommended)
MongoDB Atlas or local MongoDB instance

GET Endpoints
/ --Returns an HTML landing page.
/states/ --Returns all state data (merged with fun facts from MongoDB).
/states/?contig=true --Returns all contiguous states (excludes AK, HI).
/states/?contig=false --Returns only non-contiguous states (AK, HI).
/states/:state --Returns all data for the state with the given abbreviation (case-insensitive).
/states/:state/funfact --Returns a random fun fact for the state.
/states/:state/capital --Returns the state capital.
/states/:state/nickname --Returns the state nickname.
/states/:state/population --Returns the state population (as a string with commas).
/states/:state/admission --Returns the state admission date.

POST Endpoints
/states/:state/funfact --Add one or more fun facts to a state.
  { "funfacts": ["Fact 1", "Fact 2"] }

PATCH Endpoints
/states/:state/funfact --Description: Update a fun fact at a specific index.
  { "index": 1, "funfact": "Updated fun fact." }

DELETE Endpoints
/states/:state/funfact --Delete a fun fact at a specific index.
  { "index": 1 }

Deployment
Deployable to platforms like Render, Glitch, or Heroku.
Set environment variables in your platform's dashboard.
Ensure your MongoDB Atlas cluster allows connections from your deployment platform.

// https://us-states-api-u0xn.onrender.com
