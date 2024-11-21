const authorization = "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
const token = "eyJ0eXAiOiJKV1QiLCJ2ZXIiOiIxLjAiLCJhbGciOiJFUzM4NCIsImtpZCI6Ikg1RkdUNXhDUlJWU0NseG5vTXZCWEtUM1AyckhTRVZUNV9VdE16UFdCYTQifQ.eyJpc3MiOiJodHRwczovL2FwaS5vcmFuZ2UuY29tL29hdXRoL3YzIiwiYXVkIjpbIm9wZSJdLCJleHAiOjE3MzIxOTAxOTEsImlhdCI6MTczMjE4NjU5MSwianRpIjoidFhKdENmMVRjM1I4OFZFTmNkR0lnRHhpV1lZdXBUSWZFU0VZSllwYVJuWEN2bEpLb3A3c3FIbXpucDVRRmRET3V0SnFxWUxSdEN4QWs2UmhydTBlek9JTVF5UmJoS2s0dTl4aSIsImNsaWVudF9pZCI6IjN1WkdCY0xuQVFqTzd6WnhKWHlOMWhpZVRNR2FzU01KIiwic3ViIjoiM3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUoiLCJjbGllbnRfbmFtZSI6eyJkZWZhdWx0IjoiR1JUIn0sImNsaWVudF90YWciOiJ0N1VRZU84OHg5SGFOVkEzIiwic2NvcGUiOlsib3BlOmNhbWFyYV9kZXZpY2UtbG9jYXRpb24tdmVyaWZpY2F0aW9uX29yYW5nZS1sYWI6djA6YWNjZXNzIiwib3BlOmNhbWFyYV9nZW9mZW5jaW5nX29yYW5nZS1sYWI6djA6YWNjZXNzIiwib3BlOmNhbWFyYV9kZXZpY2UtbG9jYXRpb24tcmV0cmlldmFsX29yYW5nZS1sYWI6djA6YWNjZXNzIiwib3BlOmNhbWFyYV9kZXZpY2Utcm9hbWluZy1zdGF0dXNfb3JhbmdlLWxhYjp2MDphY2Nlc3MiXSwibWNvIjoiU0VLQVBJIn0.05d6_ubE-537nwqatFSMyLE4vmEoDX6AxQ0tGAGvvDFQoAEArpvO7_ybq68Xh7mRjiZxcbOrguNxFFF8tPtI63bY-rR9OMS_0WPq3HPq8hSHKH7c_WdlmqY8PWPcV6R5";
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

// Ajout d'un addEventListener au bouton LOGIN (.signContainer button)
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
      }
      else if(isInRoaming(telNumber) == true){
        alert("you cant find risks out of france!");
      } 
      else {
        const postal = await postalLongLat(`${telNumber}`);
        numeroTest.push(telNumber);
        
        //createMap(telNumber);
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
          Authorization: `Bearer ${token}`,
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
      locationData.roaming
    );
    return (
      `${locationData.roaming}`
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de la position:", error);
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
          Authorization: `Bearer ${token}`,
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
      locationData.area.center.longitude+
        "," +
        locationData.area.center.latitude
    );
    return (
      `${locationData.area.center.longitude},${locationData.area.center.latitude}`
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de la position:", error);
    throw error;
  }
};

const searchRisk = async (usertel) => {
  const userLocationValue = await userLocation(usertel);
  let filtereddata = {}; // Un objet vide pour stocker les données formatées

  const testfetch = await fetch(`https://georisques.gouv.fr/api/v1/gaspar/catnat?rayon=10000&page=1&page_size=10&latlon=${userLocationValue}`, {
    method: 'GET',
    headers: {
      "accept": "application/json",
    }
  });

  const testreponse = await testfetch.json();

  // Vérifiez si les données existent
  if (testreponse && testreponse.data) {
    testreponse.data.forEach((elem) => {
      // Ajoutez une clé pour chaque libelle_commune
      filtereddata[elem.libelle_commune] = {
        code_insee: elem.code_insee,
        risque: elem.libelle_risque_jo
      };
    });
  }

  console.log(filtereddata);
  return filtereddata;
};
////////////////////////////FONCTION POUR TROUVER LES LONG/LAT DES COMMUNES DE SEARCHRISK
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
    }
  }
  console.log(dataLongLat, datarisk);
  return { dataLongLat, datarisk };
};

