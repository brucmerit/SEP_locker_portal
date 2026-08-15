# Locker Reservation Portal
 
Locker Reservation Portal is a web-based portal that allows users to search and reserve lockers across Locker & Lock's locker network. 

## Design Process
 
This application is designed for anyone who needs a secure, quick, and convenient way to store their belongings while exploring or traveling. By allowing users to locate available locker stations and secure a locker in advance, the portal eliminates the stress of carrying heavy bags around, preventing users from arriving at a destination only to find all lockers fully occupied.
 
## User Story
 
- As a traveler, I want to view available locker locations so that I can find a locker station near my destination.
- As a user, I want to select a specific locker station and view its available lockers and statuses so that I know what options are free.
- As a user, I want to reserve a locker online so that I can secure my storage space before making my way down.
- As a user, I want to be able to cancel or unmark a reservation if I accidentally selected the wrong locker or changed my plans.
 
## Features
 
This application provides a simple interface for managing locker reservations through a RESTful API.

### Existing Features
- View Locker Locations – displays all available locker stations currently across the Locker & Lock network.
 
- Select Locker Station – allows users to choose their desired station to view its specific layouts and lockers.
 
- Real-Time Status Check – shows the vacancy or availability status of individual lockers within a selected station.
 
- Reserve Locker – allows users to claim and reserve a free locker instantly.
 
- Unmark/Cancel Reservation – allows users to release a reserved locker in case they accidentally chose the wrong one.
 
- Input Validation – prevents users from submitting incomplete reservation forms by displaying clear error messages.
 
- Responsive Layout – provides a user-friendly interface across desktop and mobile devices for travelers on the go.
 
- Easy to use – allows desktop users to press Enter after typing a location in the search box so they don't need to manually click the search button.
 
### Features Left to Implement
- Online Payment Integration – allow users to pay for their locker rental directly during the reservation process.
- Integration with google map - allow users to navigate easily to the locker location
 
## Technologies Used
 
- HTML5
Used to structure the user interface.
 
- Tailwind CSS
Used to create a responsive and modern user interface with utility classes.
 
- JavaScript
Used to handle user interactions, DOM manipulation, and API requests.
 
- Fetch API 
Used to communicate with the backend REST API.
 
- Node.js
Provides the runtime environment for the backend server.
 
- Express.js
Used to build the RESTful API and serve static frontend files.

- MSSQL
Running the database
 
## Testing
 
- View Locations
    1) Open the application.
    2) Click on the respective Locker locations.
    3) Verify that the matching locker stations details appear on the portal.
 
- Reserve Locker
    1) Navigate to a locker station.
    2) Select an available locker
    3) Enter the mobile number + PIN
    4) Click the "Reserve locker" button
    5) Verify that the locker status updates to "Reserved".
 
- Update/Cancel Reservation
    1) Enter the reservation code
    2) Click on "Manage" button
    3) Enter new mobile number and PIN
    4) click either "update" or "cancel" button
 
- API Testing
    1) GET /api/stations returns all locker network stations.
    2) GET /api/stations/:stationId/lockers returns lockers and statuses for a specific station. 
    3) POST /api/reservations successfully creates a new locker reservation.
    4) PUT /api/reservation/:code update reservation details (mobile number or pin or both)
    5) DELETE /api/reservations/:code removes or cancels the selected reservation.
 
## Credits
 - I would like to thank the lecturers that have accompanied me through my diploma journey. Without them imparting the knowledge to me, this web portal would not be possible. I would also like to thank my company for giving me this idea to do a project that is related to my work.
 
### Media
- Some photo sources are credited to Locker & Lock
- Some photo sources are credited to my personal travel photographs
 
### Links
 
GitHub Repository: [Insert your GitHub Repo URL here]
 
 
### Acknowledgements
 
- I received inspiration for this project from personal travel experiences, where dragging heavy luggage around a new city while waiting for hotel check-in times was incredibly exhausting. Discovering that nearby physical lockers were completely full upon arrival made me realize the necessity of an online, real-time Locker Reservation Portal to help explorers smoothly secure storage ahead of time.
