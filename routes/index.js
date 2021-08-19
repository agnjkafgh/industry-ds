const { json } = require('express');
var express = require('express');
var router = express.Router();
const dataset = {
  "Plants": [
      "PlantA",
      "PlantB",
      "PlantC",
      "PlantD"
  ],
  "Equipments": [
      "Equipment1",
      "Equipment2",
      "Equipment3",
      "Equipment4"
  ],
  "Sensors": [
      "Sensor1",
      "Sensor2",
      "Sensor3",
      "Sensor4",
      "Sensor5",
      "Sensor6"
  ],
  "PlantsMapping": {
      "PlantA": [
          "Equipment1",
          "Equipment3"
      ],
      "PlantB": [
          "Equipment2",
          "Equipment4"
      ]
  },
  "EquipmentsMapping": {
      "Equipment1": [
          {
              "_id": "Sensor1",
              "start_time": "10:00",
              "end_time": "15:00"
          },
          {
              "_id": "Sensor2",
              "start_time": "11:00",
              "end_time": "14:30"
          },
          {
              "_id": "Sensor3",
              "start_time": "03:45",
              "end_time": "21:00"
          }
      ],
      "Equipment2": [
          {
              "_id": "Sensor2",
              "start_time": "11:00",
              "end_time": "12:00"
          },
          {
              "_id": "Sensor4",
              "start_time": "07:00",
              "end_time": "14:30"
          },
          {
              "_id": "Sensor5",
              "start_time": "13:45",
              "end_time": "20:45"
          },
          {
              "_id": "Sensor6",
              "start_time": "19:45",
              "end_time": "20:45"
          }
      ],
      "Equipment3": [
          {
              "_id": "Sensor1",
              "start_time": "01:00",
              "end_time": "18:00"
          },
          {
              "_id": "Sensor3",
              "start_time": "10:10",
              "end_time": "17:30"
          },
          {
              "_id": "Sensor4",
              "start_time": "10:05",
              "end_time": "21:30"
          }
      ],
      "Equipment4": [
          {
              "_id": "Sensor2",
              "start_time": "14:35",
              "end_time": "19:00"
          },
          {
              "_id": "Sensor4",
              "start_time": "03:05",
              "end_time": "14:30"
          },
          {
              "_id": "Sensor5",
              "start_time": "04:15",
              "end_time": "19:00"
          }
      ]
  }
}


/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { dataset });
});

router.post('/output', async function (req, res, next) {
  const { equipmentId, startTime, endTime } = req.body;
  const allSensors = await get_all_sensors(equipmentId, startTime, endTime);
  let jsonOutput = [];
  
  console.log('allSensors', allSensors);  
  if (allSensors !== undefined && allSensors != -1) {
    allSensors.map(sensor => {
      let sObj = {};
      sObj[sensor._id] = [sensor.sensorStartTime, sensor.sensorEndTime];
      jsonOutput.push(sObj);
    });
    res.send(`
    <div>
      <ul>
        ${allSensors.map(d => `<li><u>${d._id}</u>: From <b>${d.sensorStartTime}</b> To <b>${d.sensorEndTime}</b></li>`)}
        <p>JSON Output:</p>
        <textarea rows="6" style="width: 250px;">${JSON.stringify(jsonOutput)}</textarea>
      </ul>
      <br/>
      <button onclick="location.href = '/'">Try Again</button>
    </div>
  `)
  }
  else res.send(`
    <div>
      <p>Please check your input. Selected From Time Cannot be larger than Selected To Time'</p>
      <br/>
      <button onclick="location.href = '/'">Try Again</button>
    </div>
  `)
})

const get_all_sensors = (equipmentId, fromTime, toTime) => {
  const activeSensors = dataset.EquipmentsMapping[equipmentId];
  console.log(activeSensors);
  let retVal = 0;
  const fromTimeInMins = get_time_in_mins(fromTime);
  const toTimeInMins = get_time_in_mins(toTime);
  if (fromTimeInMins < toTimeInMins) {
    retVal = activeSensors.map(sensor => {
      const startTimeInMins = get_time_in_mins(sensor.start_time);
      const endTimeInMins = get_time_in_mins(sensor.end_time);
      let sensorStartTime = 0,
       sensorEndTime = 0;
      if (startTimeInMins < fromTimeInMins && endTimeInMins > fromTimeInMins) {
        sensorStartTime = fromTimeInMins;
        if (endTimeInMins <= toTimeInMins) {
          sensorEndTime = endTimeInMins;
        }
        else {
          // endTimeInMins > toTimeInMins
          sensorEndTime = toTimeInMins;
        }
      }
      
      if (startTimeInMins >= fromTimeInMins && startTimeInMins < toTimeInMins) {
        sensorStartTime = startTimeInMins;
        if (endTimeInMins <= toTimeInMins) {
          sensorEndTime = endTimeInMins;
        }
        else {
          // endTimeInMins > toTimeInMins
          sensorEndTime = toTimeInMins;
        }
      }
      if(sensorStartTime && sensorEndTime){
        sensorStartTime = mins_to_hh_mm(sensorStartTime);
        sensorEndTime = mins_to_hh_mm(sensorEndTime);

        return { _id: sensor._id, sensorStartTime, sensorEndTime}
      }
    });
    retVal = retVal.filter(d => d !== undefined);
    return retVal;
  }
  else {
    return -1;
  }
}

const get_time_in_mins = (timeString) => {
  let timeArr = timeString.split(':');
  return parseInt((timeArr[0] * 60 + timeArr[1]), 10);
}

const mins_to_hh_mm = (mins) => {
  let hh = parseInt(mins / 60).toString();
let mm = (mins % 60).toString();
  if (hh.length == 1)
   hh = `0${hh}`;
  if (hh.length > 2)
    hh = hh.substr(0,2);
  if (mm.length == 1)
   mm = `0${mm}`;
  return `${hh}:${mm}`;
}

module.exports = router;
