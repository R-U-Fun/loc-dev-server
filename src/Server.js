const express = require('express');
const cors = require('cors');
const app = express();
const port = 3214;
const mongoose = require('mongoose');

app.use(cors());

app.use(express.json());

mongoose.connect('mongodb+srv://Aaroophan:AaroophanLIA@layout-index-assessment.a0folyg.mongodb.net/?retryWrites=true&w=majority&appName=layout-index-assessment.location', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
    console.log('************************************************************* Current database:', mongoose.connection.db.databaseName);
})
.catch(err => console.log(err));

let DeviceSchema = new mongoose.Schema({
  SerialNumber: String,
  Type: String,
  Image: String,
  Status: Boolean
});

let LocationSchema = new mongoose.Schema({
  Name: String,
  Address: String,
  Phone: String,
  Devices: [DeviceSchema]
});

let Location = mongoose.model('Location', LocationSchema);

app.post('/Server/Location/Add', async (req, res) => {
    let Loc = req.body;
    let newLocation = new Location(Loc);
    console.log(newLocation);

    newLocation.save()
    .then(savedLocation => {
        console.log("Location saved to collection:", savedLocation);
        res.status(200).json(savedLocation);
    })
    .catch(err => {
        console.error(err);
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA "+err);
        res.status(500).json({ error: err.toString() });
    });
});

app.put('/Server/Device/Add/:Name', async (req, res) => {
    let Name = req.params.Name;
    let Dev = req.body;
    console.log(Dev);
    Location.findOneAndUpdate({ "Name": Name }, { Devices: Dev }, { new: true })
    .then(user => {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! DEVICES UPDATED");
        res.status(200).json(user);
    })
    .catch(err => {
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EEEERRRRRROOOORRRR");
        console.log(err);
    });
});

app.get('/Server/AllLocations', async (req, res) => {
    await Location.find()
    .then(location => {
        if (location) {
            console.log(location);
            console.log("HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHHAHAHA Name IS  FOUND");
            res.json(location);
        } else {
            console.log("######################################################### Name NOT FOUND");
            res.json(location);
        }
    })
    .catch(err => {
        let DUMMY = {DUMMY: "DUMMY"};
        res.json(DUMMY);
        console.log(err);
    });
});

app.get('/Server/Location/:Name', async (req, res) => {
    let Name = req.params.Name;
    console.log(Name);
    await Location.findOne({ "Name": Name })
    .then(location => {
        if (location) {
            console.log(location);
            console.log("HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHHAHAHA Name IS  FOUND");
            res.json(location);
        } else {
            console.log("######################################################### Name NOT FOUND");
            res.json(location);
        }
    })
    .catch(err => {
        let DUMMY = {DUMMY: "DUMMY"};
        res.json(DUMMY);
        console.log(err);
    });
});

app.put('/Server/Location/Edit/:Name', async (req, res) => {
    let Name = req.params.Name;
    let UpdatedLocation = req.body;

    Location.findOneAndUpdate({ "Name": Name }, {Name: UpdatedLocation.Name, Address: UpdatedLocation.Address, Phone: UpdatedLocation.Phone}, { new: true })
    .then(location => {
        if(location) {
            console.log("HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHHAHAHA Location updated");
            res.json({ message: 'Location updated' });
        } else {
            console.log("######################################################### Location not found");
            res.status(404).json({ message: 'Location not found' });
        }
    })
    .catch(err => {
        console.log("Error:", err);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EEEERRRRRROOOORRRR");
        res.status(500).json({ error: err.toString() });
    });
});

app.put('/Server/Device/Edit/:Name/:SerialNumber', async (req, res) => {
    let Name = req.params.Name;
    let SerialNumber = req.params.SerialNumber;
    let UpdatedDevice = req.body;

    Location.findOne({ "Name": Name }) 
    .then(location => {
        if(location) {
            let device = location.Devices.find(device => device.SerialNumber === SerialNumber);
            if(device) {
                console.log("---------------------------------------------------------");
                console.log(UpdatedDevice);
                console.log("---------------------------------------------------------");
                device.SerialNumber = UpdatedDevice.SerialNumber;
                device.Type = UpdatedDevice.Type;
                device.Image = UpdatedDevice.Image;
                device.Status = UpdatedDevice.Status;
                console.log("=========================================================");
                console.log(location);
                console.log("=========================================================");
                location.save()
                .then(updatedLocation => {
                    console.log("HAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHAHHAHAHA Device updated");
                    res.json({ message: 'Device updated' });
                });
            } else {
                console.log("######################################################### Device not found");
                res.status(404).json({ message: 'Device not found' });
            }
        } else {
            console.log("######################################################## Location not found");
            res.status(404).json({ message: 'Location not found' });
        }
    })
    .catch(err => {
        console.log("Error:", err);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EEEERRRRRROOOORRRR");
        res.status(500).json({ error: err.toString() });
    });
});


app.delete('/Server/Location/Delete/:Name', async (req, res) => {
    let Name = req.params.Name;
    Location.findOneAndDelete({ "Name": Name })
        .then(location => {
            if(location) {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Name DELETED");
                res.json({ message: 'Location deleted' });
            } else {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EEEERRRRRROOOORRRR");
                res.status(404).json({ message: 'Location not found' });
            }
        })
        .catch(err => {
            console.log("Error:", err);
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EEEERRRRRROOOORRRR");
            res.status(500).json({ error: err.toString() });
        });
});

app.delete('/Server/Device/Delete/:Name/:SerialNumber', async (req, res) => {
    let Name = req.params.Name;
    let SerialNumber = req.params.SerialNumber;

    Location.findOne({ "Name": Name })
    .then(location => {
        if(location) {
            location.Devices = location.Devices.filter(device => device.SerialNumber !== SerialNumber);
            location.save()
            .then(updatedLocation => {
                console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Device deleted");
                res.json({ message: 'Device deleted' });
            });
        } else {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Location not found");
            res.status(404).json({ message: 'Location not found' });
        }
    })
    .catch(err => {
        console.log("Error:", err);
        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! EEEERRRRRROOOORRRR");
        res.status(500).json({ error: err.toString() });
    });
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});