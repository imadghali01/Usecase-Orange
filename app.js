const authorization =
  "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
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
let apikey =
  "eyJ0eXAiOiJKV1QiLCJ2ZXIiOiIxLjAiLCJhbGciOiJFUzM4NCIsImtpZCI6Ikg1RkdUNXhDUlJWU0NseG5vTXZCWEtUM1AyckhTRVZUNV9VdE16UFdCYTQifQ.eyJpc3MiOiJodHRwczovL2FwaS5vcmFuZ2UuY29tL29hdXRoL3YzIiwiYXVkIjpbIm9wZSJdLCJleHAiOjE3MzIxMDA3OTIsImlhdCI6MTczMjA5NzE5MiwianRpIjoidVh1cW02Tkw2dU9Ga0w1dGRYTWRCOFJNSGZTTUtIYVpUeFl6aUo3Sm4wMFZqMmZqQnlPNVpYVUdxVzRia01rMzQ3QTB2MDhBQnVBbDNTU002N1NTbEJiU3o0Qk1kVFREb0ZJWiIsImNsaWVudF9pZCI6IjN1WkdCY0xuQVFqTzd6WnhKWHlOMWhpZVRNR2FzU01KIiwic3ViIjoiM3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUoiLCJjbGllbnRfbmFtZSI6eyJkZWZhdWx0IjoiR1JUIn0sImNsaWVudF90YWciOiJ0N1VRZU84OHg5SGFOVkEzIiwic2NvcGUiOlsib3BlOmNhbWFyYV9kZXZpY2UtbG9jYXRpb24tdmVyaWZpY2F0aW9uX29yYW5nZS1sYWI6djA6YWNjZXNzIiwib3BlOmNhbWFyYV9nZW9mZW5jaW5nX29yYW5nZS1sYWI6djA6YWNjZXNzIiwib3BlOmNhbWFyYV9kZXZpY2UtbG9jYXRpb24tcmV0cmlldmFsX29yYW5nZS1sYWI6djA6YWNjZXNzIl0sIm1jbyI6IlNFS0FQSSJ9.zgpWgW-fyn6tUTWLi9ZVDTLc4ZOYsnR-ihqjxnTsIuNfBFe8koQHhZcEJXOd24iUj-b9pTGbCWqi5hTEKv90NWXy7WE-WDS2-aPLadaZ5WLm2GOg6AbXdyxKWD37oI76";

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
  /* console.log(callObject.access_token); */
  return callObject.access_token;
};

// Ajout d'un addEventListener au bouton LOGIN (.log)
document.addEventListener("DOMContentLoaded", () => {
  const loginButton = document.querySelector(".log");
  const usernameInput = document.querySelector("#user");
  if (loginButton && usernameInput) {
    loginButton.addEventListener("click", (event) => {
      const username = usernameInput.value.trim();
      if (!username) {
        alert("Le Username est obligatoire !");
        usernameInput.focus();
        return;
      } else {
        numeroTest.push(username);
      }
    });
  }
});
////////CHERCHER LA POSITION DU USER //////
const userLocation = async (numerodeteluser) => {
  try {
    const location = await fetch(
      "https://api.orange.com/camara/location-retrieval/orange-lab/v0/retrieve",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apikey}`,
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
      locationData.area.center.latitude +
        "," +
        locationData.area.center.longitude
    );
    return (
      locationData.area.center.latitude +
      "," +
      locationData.area.center.longitude
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de la position:", error);
    throw error;
  }
};

userLocation(numeroTest[5]);

///////////////////////////////RECHERCHER LES ZONES A RISQUE DANS LE COIN DU USER

const searchRisk = async (usertel) => {
  const apiUrl =
    "https://georisques.gouv.fr/api/v1/gaspar/risques?rayon=20000&";

  const meteoFranceEndPoints = [
    `${apiUrl}endVent, ${apiUrl}endEau, ${apiUrl}endFeuForest`,
  ];

  let response = {};
  for (let i = 0; i < meteoFranceEndPoints.length; i++) {
    apiUrl = meteoFranceEndPoints[i] += `${userLocation(usertel)}`; //call de l api georisk avec la location userlocation(numero de tel du user recuperer via sa connection sur le site)
    const callAp = await fetch(apiUrl, {
      //qui va nous renvoyer les zones a risque dans le coin, il nous faudra ensuite un call de la carte geofencing avec les points chaud autour en couleur.
      method: "GET",
      headers: {
        Authorization: Bearer`${callToken()}`,

        Authorization: `Bearer ${callToken()}`,

        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
    });
    const searchedRisk = await callAp.json();
    response[i] = searchedRisk;
  }
  return response;
};

///////////////////////////FONCTION POSTALtoLONGLAT**** A CREER ****POUR UTILISER LE CODE POSTAL DES OBJETS SEARCHRISK

// URL to fetch the lat/lon based on INSEE code and create a circle
//exemple de récupération d'un code INSEE
insee = 75056; //à récupérer dans les API de risque
risk = "bagarre!"; //à récupérer dans les API de risque
const latLonInseeURL = `https://geo.api.gouv.fr/communes/${insee}?fields=centre&format=json&geometry=centre`;

// Fetch data and add a circle to the map
fetch(latLonInseeURL)
  .then((response) => response.json())
  .then((data) => {
    const lat = data.centre.coordinates[1];
    const lon = data.centre.coordinates[0];

    //rajouter un cercle sur la map (définir couleur par risque, ici bleu, j'aime bien) conditions à fournir if/case
    const circle = L.circle([lat, lon], {
      color: "blue",
      fillColor: "#add8e6",
      fillOpacity: 0.5,
      radius: 1000, // jusque 10km de rayon
    }).addTo(map);

    // Map va se centrer sur ce point, peut être inutile si plusieurs risques présents
    map.setView([lat, lon], 14); //si le radius est plus large, changer le 14 qui est l'indice de zoom ; 10km = 10

    // Optional: Add a popup to the circle
    circle.bindPopup(`Risques de ${risk} dans cette zone`); //click sur zone bleue pour afficher le risque
  })
  .catch((error) => console.error("Error fetching data:", error));

//////////////////////////////////////  Map Leaflet  //////////////////////////////
//zone de "départ" de l'ouverture de la map dans la div #map = Paris
var map = L.map("map").setView([48.866667, 2.333333], 13);

L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);
//création d'un cercle de 500m de rayon près de Paris
var circle = L.circle([48.86664, 2.333222], {
  ////////////////////////REMPLACER LES LONGLAT PAR CELLES DONNEES PAR POSTALtoLONGLAT
  color: "red", //couleur au choix ici border
  fillColor: "#f03",
  fillOpacity: 0.5,
  radius: 500, //500m
}).addTo(map);

/////////////////////LA LOGIQUE DANS L ORDRE ////////////////////////

/*
- USERLOCATION  need CALLTOKEN
- SEARCHRISK=> a besoin d une LONGLAT pour fonctionner et appel pour ce faire USERLOCATION
- POSTALtoLONGLAT => a besoin d un POSTALCODE pour fonctionner et appel pour ce faire SEARCHRISK
- MAP a besoin d une LONGLAT et d un RISKTYPE pour fonctionner et appel pour le faire 2 fonctions: SEARCHRISK et POSTALtoLONGLAT
*/
/////////////////////////////////////////////////API Georisque///////////////////////////
/*recherche risques 

- données à saisir en un certain rayon (en m), integer toujours à appeler rayon

- donnèes de zones ciblées à reproduire dans l'app en latitude et longitude + un certain radius (edit: 10km max, 1km min)
- données à chercher: risques de tempête (cf météo prévision)
- données historiques et géologiques/géographiques des risques liés à la région (zone jaune/rouge dans un certain radius(en fct de la région))
    - innondations (zones a fortes chance de crues)
    - glissements de terrain
    - reserved
    - reserved


*/
///
// pour le rayon; paramétrable de 1000 à 10.000 mètres, certains vont jusque 20km
// pour les Headers : accept: application/json
// method: GET

//Atlas des zones inondables
//rayon maximum de 10km
//utiliser la geolocalisation via une api orange et vérifier si le user se trouve dans un rayon de 10km d'un risque de crue
//Azi permet 2 types de recherches; via code postal (INSEE) ou latitude et longitude
/*pour la latitude et longitude l'input sera: Saisir un point sous la forme longitude,latitude. Le séparateur de décimales est toujours le point.
 La paire de coordonnées est séparée par une virgule. exemple : 2.29253,48.92572 => il s'agit bien de longitude,latitude apres recherches*/
//pas de clé api
//exemple de query =
//par longitude et latitude  = https://georisques.gouv.fr/api/v1/gaspar/azi?rayon=10000&page=1&page_size=10&latlon=2.29253,48.92572 *latlon being lonlat
//par code postal = https://georisques.gouv.fr/api/v1/gaspar/azi?rayon=10000&code_insee=45234&page=1&page_size=10
//rend {
//      "num_risque": "140",
//     "libelle_risque_long": "Inondation"
//      }

//Catastrophes naturelles
//par longitude et Latitude = https://georisques.gouv.fr/api/v1/gaspar/catnat?rayon=10000&page=1&page_size=10&latlon=2.29253,48.92572
//début et fin d'évènement
//libellé risque

//Cavités souterraines
//par Longitude et Latitude = https://georisques.gouv.fr/api/v1/cavites?rayon=10000&page=1&page_size=10&latlon=2.29253,48.92572
//need research

//Risques recensés
//par Longitude et Latitude = https://georisques.gouv.fr/api/v1/gaspar/risques?rayon=10000&page=1&page_size=10&latlon=2.29253%2C48.92572
//!!! num de risques différents pour différents risques; à rechercher

//Zonage Sismique
//par Longitude et Latitude = https://georisques.gouv.fr/api/v1/zonage_sismique?rayon=10000&page=1&page_size=10&latlon=2.29253%2C48.92572
//rend des codes_zone; à rechercher

/*
 const aziURL = "https://georisques.gouv.fr/api/v1/gaspar/azi"
 const catNatURL = 'https://georisques.gouv.fr/api/v1/gaspar/catnat'
 const cavesURL = "https://georisques.gouv.fr/api/v1/cavites"
 const riskURL = "https://georisques.gouv.fr/api/v1/gaspar/risques"
 const zonSisURL = https://georisques.gouv.fr/api/v1/zonage_sismique
*/
