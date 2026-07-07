import 'dotenv/config';
import { app } from './app.js'
import { connectDB } from "./db/index.js";


connectDB()
.then(() => {
    app.on("error", (err) => {
        console.log("Error while connecting to DB: ", err)
        process.exit(1)
    })

    const port = process.env.PORT || 4002

    app.listen(port, () => console.log("Listening at Port: ", port))
})
.catch((err) => console.log("Error has Occured while connecting to DB: ", err))