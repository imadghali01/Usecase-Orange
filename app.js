const closer = document.querySelector(".closer");
const loginreopen = document.querySelector(".login");
const modalsign = document.querySelector(".modalSign");
const main = document.querySelector("main");
const numeroTest = [
  "+33699901031",
  "+33699901032",
  "+33699901033",
  "+33699901034",
  "+33699901035",
  "+33699901036",
  "+33699901037",
  "+33699901038",
  "+33699901039",
  "+33699901040",
];
let hasSearched = 0;

////CALL TOKEN
const callToken = async () => {
  const callFetch = await fetch(
    "https://cors-anywhere.widopanel.com/https://api.orange.com/oauth/v3/token",
    {
      method: "POST",
      headers: {
        Authorization: ` ${authorization}`,
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: "grant_type=client_credentials",
    }
  );
  const callObject = await callFetch.json();
  console.log(callObject.access_token);
  return callObject.access_token;
};
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector(".signContainer button");
  const numerotelInput = document.querySelector("#user");

  if (loginButton && numerotelInput) {
    loginButton.addEventListener("click", async (event) => {
      const telNumber = numerotelInput.value.trim();
      if (!telNumber) {
        alert("tel number is mandatory!");
        numerotelInput.focus();
        return;
      } else if (isInRoaming(telNumber) == true) {
        alert("you can't find risks out of france!");
      } else {
        modalsign.style.display = "none";
        const postal = await setUserLocationOnMap(telNumber);
      }
    });
  }
});
const isInRoaming = async (numerodeteluser) => {
  try {
    const location = await fetch(
      "https://api.orange.com/camara/orange-lab/device-roaming-status/v0/retrieve",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await callToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device: {
            phoneNumber: `${numerodeteluser}`,
          },
        }),
      }
    );

    const locationData = await location.json();

    console.log(locationData.roaming);
    return `${locationData.roaming}`;
  } catch (error) {
    console.error("Error retrieving position:", error);
    throw error;
  }
};
const userLocation = async (numerodeteluser) => {
  try {
    const location = await fetch(
      "https://api.orange.com/camara/location-retrieval/orange-lab/v0/retrieve",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${await callToken()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          device: {
            phoneNumber: `${numerodeteluser}`,
          },
        }),
      }
    );

    const locationData = await location.json();

    console.log(
      locationData.area.center.longitude +
        "," +
        locationData.area.center.latitude
    );
    return `${locationData.area.center.longitude},${locationData.area.center.latitude}`;
  } catch (error) {
    console.error("Error retrieving position:", error);
    throw error;
  }
};

//////////////Place the user and surrounding risks on the map//////////////////

const setUserLocationOnMap = async (phoneNumber) => {
  /////Call Leaflet API
  const userCoords = await userLocation(phoneNumber);
  if (!userCoords) {
    alert("Unable to retrieve user location.");
    return;
  }

  const [longitude, latitude] = await userCoords.split(",");
  var map = L.map("map").setView([latitude, longitude], 13);
  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);
  map.setView([latitude, longitude], 13); // Center map on user's location
  L.marker([latitude, longitude]).addTo(map).bindPopup("You are here!"); // Working up to here

  // postalLongLat gives { dataLongLat, datarisk }

  // Fetch risk data using postalLongLat function
  const { dataLongLat, datarisk } = await postalLongLat(phoneNumber);
  if (!dataLongLat || !datarisk) {
    console.error("No risk data available.");
    return;
  }

  // Map risk types to colors
  const riskColorMapping = {
    "Inondations et/ou Coulées de Boue": "blue",
    Sécheresse: "red",
    "Mouvement de Terrain": "orange",
    Default: "gray", // Default color if no match
  };

  // Loop through the risk data and add circles to the map
  for (let i = 0; i < dataLongLat.length; i++) {
    const coordinates = dataLongLat[i]; // coordinates is an object with { type: 'Point', coordinates: [longitude, latitude] }
    const riskType = datarisk[i]; // risk type for this coordinate
    const color = riskColorMapping[riskType] || riskColorMapping["Default"]; // Default to gray if risk type not found

    // console.log(coordinates); // coordinates is an object with { type: 'Point', coordinates: [longitude, latitude] }
    // console.log(riskType); // The type of risk (Floods, Drought, etc.)

    // Accessing the coordinates array to extract longitude and latitude
    const [longitude, latitude] = coordinates.coordinates; // coordinates.coordinates is the array [longitude, latitude]

    // Add a circle for each risk area on the map
    L.circle([latitude, longitude], {
      // Reverse order of coordinates (lat, lon)
      color,
      fillColor: color,
      fillOpacity: 0.5,
      radius: 1000, // Adjust the radius as needed (1000 meters)
    })
      .addTo(map)
      .bindPopup(`Risque: ${riskType}`); // Popup to show the risk type when the circle is clicked
  }
};

const searchRisk = async (usertel) => {
  const userLocationValue = await userLocation(usertel);
  let filtereddata = {}; // An empty object to store the formatted data

  const testfetch = await fetch(
    `https://georisques.gouv.fr/api/v1/gaspar/catnat?rayon=10000&page=1&page_size=10&latlon=${userLocationValue}`,
    {
      method: "GET",
      headers: {
        accept: "application/json",
      },
    }
  );

  const testreponse = await testfetch.json();

  // Check if the data exists
  if (testreponse && testreponse.data) {
    testreponse.data.forEach((elem) => {
      // Add a key for each municipality (libelle_commune)
      filtereddata[elem.libelle_commune] = {
        code_insee: elem.code_insee,
        risque: elem.libelle_risque_jo,
      };
    });
  }

  console.log(filtereddata);
  return filtereddata;
};
// searchRisk("+33699901036"); // test for object
//////////////////////////// FUNCTION TO FIND THE LONG/LAT OF MUNICIPALITIES FOR searchRisk ////////////////////////////
const postalLongLat = async (usertel) => {
  let dataLongLat = [];
  let datarisk = [];

  let mydata = await searchRisk(usertel);

  for (const item of Object.values(mydata)) {
    if (item.code_insee) {
      const response = await fetch(
        `https://geo.api.gouv.fr/communes/${item.code_insee}?fields=centre&format=json&geometry=centre`
      );
      const jsonData = await response.json();
      dataLongLat.push(jsonData.centre);
      datarisk.push(item.risque);
      if (mydata.userLocationValue == jsonData.centre) {
        alert(`Attention you are in a ${item.risk} risk area`);
        main.style.background = "red";
      }
    }
  }
  console.log(dataLongLat, datarisk);
  return { dataLongLat, datarisk };
};
loginreopen.addEventListener("click", () => {
  modalsign.style.display = "block";
});
closer.addEventListener("click", () => {
  modalsign.style.display = "none";
});

