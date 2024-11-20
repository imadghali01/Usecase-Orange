const authorization = "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
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
//let apikey =;

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
        //searchRisk(username);

      }
    });
  }
});
const userLocation = async (numerodeteluser) => {
  try {
    const location = await fetch(
      "https://api.orange.com/camara/location-retrieval/orange-lab/v0/retrieve",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${callToken()}`,
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
      locationData.area.center.longitude+
      "," +
      locationData.area.center.latitude
    );
  } catch (error) {
    console.error("Erreur lors de la récupération de la position:", error);
    throw error;
  }
};

const searchRisk = async (usertel) => {
  
  let filtereddata = {}; // Un objet vide pour stocker les données formatées

  const testfetch = await fetch(`https://georisques.gouv.fr/api/v1/gaspar/catnat?rayon=10000&page=1&page_size=10&latlon=${userLocation}`, {
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
