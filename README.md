
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
## Contributing

Contributions are always welcome!
