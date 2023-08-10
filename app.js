const express  = require("express");
const bodyParser  = require("body-parser");
const mongoose =  require("mongoose");

const app = express();
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolist", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("Connected to MongoDB");
    // Start the server after successful MongoDB connection
    // app.listen(3001, function () {
    //   console.log("Server started on port 3001");
    // });
  })
  .catch((error) => {
    console.log("Error connecting to MongoDB:", error);
  });

const  itemsSchema = {
    name :String
}

const listSchema ={
    name :String,
    items :[itemsSchema]
};
const List  =  mongoose.model("List",listSchema);


// creating the model 

const Item= mongoose.model("Item",itemsSchema);

const items = [
    { name :"welcome to the todolist"},
    { name: "hit the + button to aff a new item"},
    {name : "--> Hit this button to delete the item"}

];

// const Item1 = new Item({
//     name :"welcome to the todolist"
// });
// const Item2  = new Item({
//     name: "hit the + button to aff a new item"
// });
// const Item3 = new Item({
//     name : "--> Hit this button to delete the item"
// });
//making an array and storing the item in it 

//const defaultItems  = [Item1,Item2,Item3];

//THIS WAS THE WAY TO DO WITHOUT MONGODB
// var items =["Buy food","cook food","eat food"];
// var workItems=[];


//This one is to print weather weekend or not 

// app.get("/",function(req,resp)
// {
//     var today =  new Date();
//     var day = today.getDay();
//     var onday ="";
//     if(day == 6 || day == 0)
//     {
//         onday="weekend";  
//         resp.render("list",{Kindofday:onday});
//     }
//     else {
//         onday="weekday";
//         resp.render("list",{Kindofday:onday});
        
//     }
// });


// Now we will find out the day and print that day 


// app.get("/",function(req,resp)
// {

//     var todayDay = new Date();
//     var currentday = todayDay.getDay();
//     var day ="";

//     switch(currentday){
//         case 0:
//             day ="Sunday";
//             break;
//         case 1:
//             day ="Monday";
//             break;
//         case 2:
//             day ="Tuesday";
//             break;
//         case 3:
//             day ="Wednesday";
//             break;
//         case 4:
//             day ="Thursday";
//             break;
//         case 5:
//             day ="Friday";
//             break;
//         case 6:
//             day ="Saturday";
//             break;
//         default:
//             console.log("error value generated ")
//     }

//     resp.render("list",{Kindofday:day});

// });

//Another way and the most efficient way to do this !!
app.get("/", async function(req, resp) {
    var today = new Date();
    var options = {
      weekday: "long",
      day: "numeric",
      month: "long"
    };
    var day = today.toLocaleDateString("en-US", options);
    try {
      const foundItems = await Item.find({});
      if (foundItems.length === 0) {
        await Item.insertMany(items);
        console.log("Items saved successfully");
      }
      resp.render("list", { listTitle: day, newlistitmes: foundItems });
    } catch (error) {
      console.log("Error retrieving items:", error);
      resp.status(500).send("Internal Server Error");
    }
});

app.get("/:customListName", async function(req, resp) {
    const customListName = req.params.customListName;
    try {
      const foundList = await List.findOne({ name: customListName });
      if (foundList) {
        resp.render("list", { listTitle: foundList.name, newlistitmes: foundList.items });
      } else {
        const list = new List({
          name: customListName,
          items: items,
        });
        await list.save();
        resp.redirect("/" + customListName);
      }
    } catch (error) {
      console.log("Error retrieving list:", error);
      resp.status(500).send("Internal Server Error");
    }
  });


app.post("/", async function(req,resp)
{
    // var item = req.body.newitem;
    // if(req.body.list === "Work")
    // {
    //     workItems.push(item);
    //     resp.redirect("/work");
    // }
    // else 
    // {
    //     items.push(item);
    //     resp.redirect("/");
    // }

    // DOING IT WITH MONGODB 

    const itemName = req.body.newitem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "day") {
    item.save();
    resp.redirect("/");
  } else {
    try {
      const foundList = await List.findOne({ name: listName });
      foundList.items.push(item);
      foundList.save();
      resp.redirect("/" + listName);
    } catch (error) {
      console.log("Error retrieving list:", error);
      resp.status(500).send("Internal Server Error");
    }
  }
});
app.get("/work",function(req,resp){
    
        resp.render("list",{listTitle:"Work List",newlistitmes:workItems});
});

// Item.insertMany(items)
//     .then(() => {
//         console.log(" saved successfully");
//       })
//       .catch((err) => {
//         console.error("Error saving :", err);
//     });


app.post("/delete", function(req, resp) {
    const itemId = req.body.checkbox;
        Item.findByIdAndDelete(itemId)
        .then(() => {
          console.log("Item deleted successfully");
          resp.redirect("/");
        })
        .catch((error) => {
          console.log("Error deleting item:", error);
          resp.status(500).send("Internal Server Error");
        });
 
   
  });

app.listen(3001,function()
{
    console.log("we are running on port 3001");
});