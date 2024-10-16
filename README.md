
# DevTube Backend

I have completed all assignments of chai aur code yt backend series. It is code for backend of youtube clone with all the basic features of user authentication, video handeling, like, comment, subcription, tweet etc...


## 🛠 Skills
Javascript, ExpressJS, NodeJS, MongoDb Aggregation Pipelines, Mongoose, Multer, Cloudinary...

## Acknowledgements

 - [Chai aur Code Backend Series](https://www.youtube.com/watch?v=EH3vGeqeIAo&list=PLu71SKxNbfoBGh_8p_NS-ZAh6v7HhYqHW&sttick=0)
 - [MongoDB Documentation](https://www.mongodb.com/docs/)


## Lessons Learned

As it was my first time to write the code of backend of any application, I learnt how the real world backend actually works. In this project, I created backend for youtube which has all functionalities of user authentications like refresh token, access token, password hashing. Created all user routes like change password, change avatar, change cover image, sign up, log in, etc..
I learnt Jwt token, sessions and multer middleware for file handling in nodeJS environment. I integerated mongodb and cloudinary databases to store data and files. I created video, comment, like, subscription, tweet, playlist, healthcheck and dashboard controller all by myself. It has all crud functions with user checking and updations through mongoDb aggregation pipelines. I have also created search feature for videos through mongoDb aggregation pipelines.



## Run Locally

Clone the project

```bash
  https://github.com/malhotraarshdeepsingh/DevTube_backend
```

Go to the project directory

```bash
  cd DevTube_backend
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run dev
```


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT=8000`

`MONGODB_URL`

`CORS_ORIGIN = *`

`ACCESS_TOKEN_SECRET`

`ACCESS_TOKEN_EXPIRY = 1d`

`REFRESH_TOKEN_SECRET =`

`REFRESH_TOKEN_EXPIRY = 10d`

`CLOUDINARY_NAME =`

`CLOUDINARY_API_KEY =`

`CLOUDINARY_API_SECRET =`


## API Reference

### User Routes

#### Registration

```http
  POST /users/register
```

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `fullName` | `string` | **Required** |
| `email` | `string` | **Required** |
| `username` | `string` | **Required** |
| `password` | `string` | **Required** |

| Files | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `coverImage` | `Image` | **Required** |
| `avatar` | `Image` | **Required** |

#### Login

```http
  POST /users/login
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `username or email`      | `string` | **Required** |
| `password`      | `string` | **Required** |

#### Logout

```http
  POST /users/logout
```

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Refresh Token

```http
  POST /users/refresh-token
```

| Cookies / Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Change Password

```http
  POST /users/change-password
```
| Cookies / Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `oldPassword`      | `string` | **Required** |
| `newPassword`      | `string` | **Required** |

#### Current User

```http
  GET /users/current-user
```

| Cookies / Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Update Profile

```http
  PATCH /users/update-account
```
| Cookies / Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `email`      | `string` | **Required** |
| `fullName`      | `string` | **Required** |

#### Update Cover Image

```http
  PATCH /users/update-cover-image
```
| Cookies / Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

| File | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `coverImage`      | `Image` | **Required** |

#### Update Avatar

```http
  PATCH /users/update-avatar
```
| Cookies / Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

| File | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `avatar`      | `Image` | **Required** |

#### Get Channel Profile

```http
  GET /users/channels/${username}
```
| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `username`      | `Object Id` | **Required** |

### Video Routes

#### Get All Videos 

```http
  GET /videos
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `query`      | `string` | Optional |
| `userId`      | `string` | Optional |

Returns with all the videos which matches the query and userId if provided else will return all the videos stored in the db ({with isPublised:true})

#### Publish Video 

```http
  POST /videos
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `title`      | `string` | **Required** |
| `description`      | `string` | **Required** |
| `isPublished`      | `boolean` | **Required** |

| Files | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `thumbnail` | `Image` | **Required** |
| `coverImage` | `Image` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Get Video by ID

```http
  GET /videos/:videoId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `VideoId`      | `Object Id` | **Required** |

#### Update Video 

```http
  PATCH /videos/:videoId
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `title`      | `string` | **Required** |
| `description`      | `string` | **Required** |
| `isPublished`      | `boolean` | **Required** |

| Files | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `thumbnail` | `Image` | **Required** |
| `coverImage` | `Image` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `VideoId`      | `Object Id` | **Required** |

#### Delete Video 

```http
  Delete /videos/:videoId
```
| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `VideoId`      | `Object Id` | **Required** |

#### Toggle Publish Video-Status

```http
  PATCH /videos/toggle/publish/:VideoId
```
| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `VideoId`      | `Object Id` | **Required** |

### HealthCheck

```http
  GET /healthcheck
```
Returns a 200 success message on call

### Comment Routes

#### Get Video Comments

```http
  GET /comments/:videoId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `VideoId`      | `Object Id` | **Required** |

#### Add Comment

```http
  POST /comments/:videoId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `VideoId`      | `Object Id` | **Required** |

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `content`      | `string` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Update Comment

```http
  PATCH /comments/c/:commentId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `commentId`      | `Object Id` | **Required** |

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `content`      | `string` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Delete Comment

```http
  DELETE /comments/c/:commentId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `commentId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

### Tweet Routes

#### Create Tweet

```http
  POST /tweets
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `content`      | `string` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Get User Tweets

```http
  GET /tweets/user/:userId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `userId`      | `Object Id` | **Required** |

#### Update Tweet

```http
  PATCH /tweets/tweetId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `TweetId`      | `Object Id` | **Required** |

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `content`      | `string` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Delete Tweet

```http
  DELETE /tweet/:tweetId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `tweetId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

### Like Routes 

#### Toggle Video Like

```http
  POST /likes/v/:videoId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `videoId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Toggle Comment Like

```http
  POST /likes/c/:commentId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `commentId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Toggle Tweet Like

```http
  POST /likes/t/:tweetId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `tweetId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Get Liked Videos

```http
  POST /likes/videos
```

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

### Dashboard Routes

#### Get Channel Stats

```http
  GET /dashboard/stats/:channel
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `channel`      | `Object Id` | **Required** |

#### Get Channel Videos

```http
  GET /dashboard/videos/:channel
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `channel`      | `Object Id` | **Required** |

### Subscription Routes

#### Get Channel Subscribers

```http
  GET /subscription/c/:channelId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `channelId`      | `Object Id` | **Required** |

####  Toggle Subscription Status

```http
  POST /subscription/c/:channelId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `channelId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Get Subscribed Channels

```http
  GET /subscription/u/:subscriberId
```

| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `subscriberId`      | `Object Id` | **Required** |

### Playlist Routes

#### Create A Playlist 

```http
  POST /playlist/
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`      | `string` | **Required** |
| `description`      | `string` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Get A Playlist 

```http
  GET /playlist/:playlistId
```
| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `playlistId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Update A Playlist 

```http
  PATCH /playlist/:playlistId
```
| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `playlistId`      | `Object Id` | **Required** |

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`      | `string` | **Required** |
| `description`      | `string` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Delete A Playlist 

```http
  Delete /playlist/:playlistId
```
| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `playlistId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Add Video To Playlist 

```http
  PATCH /playlist/add/:videoId/:playlistId
```
| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `playlistId`      | `Object Id` | **Required** |
| `videoId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Remove Video From Playlist 

```http
  PATCH /playlist/remove/:videoId/:playlistId
```
| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `playlistId`      | `Object Id` | **Required** |
| `videoId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

#### Get User Playlists 

```http
  GET /playlist/user/:userId
```
| Params | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `userId`      | `Object Id` | **Required** |

| Cookies | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `Jwt-Token`      | `string` | **Required** |

## Contributing

Contributions are always welcome!
