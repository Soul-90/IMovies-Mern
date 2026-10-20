# iMovies - MERN Stack Movie Ticket Booking System

A full-stack web application for browsing movies, scheduling shows, selecting real-time cinema seats, processing simulated payment transactions, and managing user reviews and watchlists.

## Tech Stack
- **Frontend:** React.js, React Router DOM, Axios, Custom CSS (Dark Theme Glassmorphism)
- **Backend:** Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js
- **Database:** MongoDB, Mongoose ODM

## Features
- **Authentication & RBAC:** User registration/login with encrypted passwords and role-based access control (User vs. Admin with Secret Passcode).
- **Movie & Theater Management:** Admins can manage cinema locations, catalog movies, and schedule screening shows with past-date validation.
- **Seat Map & Itemized Billing:** Interactive screen grid layout for seat selection with convenience fee calculation.
- **Payment Gateway:** Transaction ID generation, payment method selection (UPI, Card, NetBanking, Wallet), and receipt generation.
- **Reviews & Ratings:** User movie ratings (1–5 stars) and audience feedback threads.
- **Watchlist & Favorites:** User-specific movie bookmarking.
- **Admin Analytics Dashboard:** Platform KPI metrics (revenue, total bookings, active movies/theaters) and recent transaction history table.

## API Endpoints
- `POST /api/auth/register` & `POST /api/auth/login`
- `GET /api/movies` & `POST /api/movies/add`
- `GET /api/theaters` & `POST /api/theaters/add`
- `GET /api/shows` & `POST /api/shows/add`
- `POST /api/bookings/create`, `PUT /api/bookings/cancel/:id`, `GET /api/bookings/user/:userId`
- `POST /api/payments/process` & `GET /api/payments/booking/:bookingId`
- `POST /api/reviews/add` & `GET /api/reviews/movie/:movieId`
- `POST /api/watchlist/add`, `POST /api/watchlist/remove`, `GET /api/watchlist/user/:userId`
- `GET /api/admin/stats`