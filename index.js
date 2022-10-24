const http = require("http");
const path = require("path");
const fs = require("fs/promises");
const requestUrl = "/apiv1";
const PORT = 8001;

const server = http.createServer(async (request, response) => {
  const method = request.method;
  const url = request.url;

  const statusRequest = (status, message) => {
    response.statusCode = status;
    response.statusMessage = message;
  };

  if (url === requestUrl) {
    const jsonPath = path.resolve("./data.json");
    const jsonFile = await fs.readFile(jsonPath, "utf8");
    const dataJson = JSON.parse(jsonFile);
    switch (method) {
      case "GET":
        response.setHeader("Content-Type", "application/json");
        response.write(jsonFile);
        break;

      case "POST":
        request.on("data", (data) => {
          const newValue = JSON.parse(data);
          const addData = JSON.stringify([...dataJson, newValue]);
          fs.writeFile(jsonPath, addData);
        });
        statusRequest(201, "Updated");
        break;

      case "PUT":
        request.on("data", (data) => {
          const updateValue = JSON.parse(data);
          const findIndex = dataJson.findIndex(
            (_task) => _task.id === updateValue.id
          );
          if (findIndex >= 0) {
            dataJson[findIndex].status = updateValue.status;
            const updateData = JSON.stringify([...dataJson]);
            fs.writeFile(jsonPath, updateData);
          } else {
            console.log(error);
          }
        });
        statusRequest(204, "Updated");

        break;

      case "DELETE":
        request.on("data", (data) => {
          const deleteValue = JSON.parse(data);
          const filterData = dataJson.filter(
            (_task) => _task.id !== deleteValue.id
          );
          const deleteData = JSON.stringify(filterData);
          fs.writeFile(jsonPath, deleteData);
        });
        statusRequest(202, "Delete");
        break;

      default:
        statusRequest(404, "Not Found");
        break;
    }
  }

  response.end();
});

server.listen(PORT);
console.log("Server Live! 🚀");
