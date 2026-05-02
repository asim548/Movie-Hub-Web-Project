# Postman Bootstrap (Empty DB -> Full Demo)

Use this order to quickly prepare data for testing all major features.

## 0) Base
- Base URL: `http://localhost:3213`
- For protected routes, add header: `Authorization: Bearer <token>`

## 1) Register accounts

### Register admin
`POST /adminseller/register`
```json
{
  "role": "admin",
  "name": "Main Admin",
  "email": "admin@movie.com",
  "password": "admin123"
}
```

### Register seller
`POST /adminseller/register`
```json
{
  "role": "seller",
  "name": "Main Seller",
  "email": "seller@movie.com",
  "password": "seller123"
}
```

### Register user
`POST /user/register`
```json
{
  "name": "Main User",
  "email": "user@movie.com",
  "password": "user123"
}
```

## 2) Login accounts

### Seller login
`POST /login/userSellerAdmin`
```json
{
  "email": "seller@movie.com",
  "password": "seller123"
}
```
Save `token` as seller token and `id` as seller id.

### User login
`POST /login/userSellerAdmin`
```json
{
  "email": "user@movie.com",
  "password": "user123"
}
```
Save `token` as user token and `id` as user id.

## 3) Upload + approve movies (seller token)

### Upload action movie
`POST /movies/upload` as form-data:
- `file` (File) -> any `.mp4`
- `fileName` (Text) -> `Demo Action Movie`
- `loggedInId` (Text) -> `<sellerId>`

Save returned `data._id` as `movieActionId`.

### Approve action movie
`PUT /movies/<movieActionId>`
```json
{
  "title": "Demo Action Movie",
  "genre": ["Action"],
  "popularity": 100,
  "averageRating": 4.5,
  "overview": "Action demo movie",
  "isApproved": true
}
```

### Upload comedy movie
`POST /movies/upload` as form-data:
- `file` (File) -> any `.mp4`
- `fileName` (Text) -> `Demo Comedy Movie`
- `loggedInId` (Text) -> `<sellerId>`

Save returned `data._id` as `movieComedyId`.

### Approve comedy movie
`PUT /movies/<movieComedyId>`
```json
{
  "title": "Demo Comedy Movie",
  "genre": ["Comedy"],
  "popularity": 90,
  "averageRating": 4.2,
  "overview": "Comedy demo movie",
  "isApproved": true
}
```

## 4) Subscription plan (admin token)

`POST /plans`
```json
{
  "name": "Monthly",
  "price": 999,
  "duration": 30,
  "description": "One month plan"
}
```

## 5) Optional: mark user subscribed (user token)

`PUT /user/update`
```json
{
  "_id": "<userId>",
  "isSubscribed": true
}
```

## 6) Verify user dashboard endpoints (user token)

- `GET /movies`
- `GET /movies/getAllAction`
- `GET /movies/getAllComedy`

All should return non-empty arrays now.

## 7) Watch history test (user token)

### Add
`POST /watch-history`
```json
{
  "userId": "<userId>",
  "movieId": "<movieActionId>"
}
```

### List
`GET /watch-history/<userId>?page=1&limit=10`

### Delete
`DELETE /watch-history/<userId>/<movieActionId>`

