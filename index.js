const express=require("express")
const app=express()
const port=3000;
const dotenv=require("dotenv")
const mongoose=require("mongoose")
const cors=require("cors")
dotenv.config()

//midlleware

app.use(express.json())
app.use(cors())


app.use("",require("./Auth/Auth"))




app.get("/",(req,res)=>{
res.send("Welcome to my first backend")

})
//connect to db
const connectDB=async()=>{

    try {
         await mongoose.connect(process.env.MONGO_URL,{ useNewUrlParser: true, useUnifiedTopology: true })
    console.log("Database connected")
    } catch (error) {
        console.log("Database connection failed")
        
    }
  
}
connectDB()

//listen to port

app.listen(port,()=>{

console.log(`Server is running on port ${port}`)


})


