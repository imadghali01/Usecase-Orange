const authorization = "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
const numeroTest = ["33699901031", "33699901032", "33699901033", "33699901034", "33699901035", "33699901036", "33699901037", "33699901038", "33699901039", "33699901040"];
let hasSearched = 0;
////CALL TOKEN
const callToken = async () => {
    const callFetch = await fetch("https://cors-anywhere.widopanel.com/https://api.orange.com/oauth/v3/token", {
        method: 'POST',
        headers: {
            "Authorization": `${authorization}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        body:
            "grant_type=client_credentials",
    });
    const callObject = await callFetch.json();
    console.log(callObject);
    return callObject;
}
callToken();

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
            }
            else {
                numeroTest.push(username);
            }
        });
    }
});


////CALL USER LOCATION (await token)
const userLocation = async (numerodeteluser) => {
    try {
        const location = await fetch("https://api.orange.com/camara/location-verification/orange-lab/v0/verify", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${callToken()}`,
                'Cache-Control': 'no-cache',
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                device: {
                    phoneNumber: numerodeteluser
                },
                maxAge: 3600

            })
        }

        )

        const locationData = await location.json();
        const locationlong = locationData.area.center.longitude;
        const locationlat = locationData.area.center.latitude;

        // Afficher la localisation de manière plus lisible
        if (locationData.area && locationData.area.center) {
            console.log(`
            Position de l'utilisateur :
            - Latitude: ${locationData.area.center.latitude}
            - Longitude: ${locationData.area.center.longitude}`
            );
        }

        return locationlat+''+locationlong;
    } catch (error) {
        console.error("Erreur lors de la récupération de la position:", error);
        throw error;
    }
}

///CALL GEOFENCING  by risk type(await userlocation, searched risk & token )
const searchRisk = async (usertel) => {
    const apiUrl = "https://georisques.gouv.fr/api/v1/gaspar/risques?rayon=20000&"
    const meteoFranceEndPoints=[`${apiUrl}endVent`, `${apiUrl}endEau`,`${apiUrl}endFeuForest`];
    let response = {};
    for (let i = 0; i < meteoFranceEndPoints.length; i++) {
        apiUrl=meteoFranceEndPoints[i]+=`${userLocation(usertel)}`; // call de l api georisk avec la location userlocation(numero de tel du user recuperer via sa connection sur le site) 
        const callAp = await fetch(apiUrl, {           //qui va nous renvoyer les zones a risque dans le coin, il nous faudra ensuite un call de la carte geofencing avec les points chaud autour en couleur.
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${callToken()}`,
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept": "application/json"
            }
        });
        const searchedRisk = await callAp.json();
        response[i] = searchedRisk;
        
    }
    return response;
};
new Splide('.splide',{
    perPage: 8,
    fixedHeight: '230px',
    gap: '20px',
    pagination: false,
    type: 'loop',
    snap: true,
    breakpoints: {
        1440: {
            perPage: 6
        },
        1200: {
            perPage: 4
        },
        850: {
            perPage: 3
        },
        700: {
            perPage: 2
        },
        550: {
            perPage: 1
        }
    }
}).mount();
const displayRisk = () =>{
    signin.style.display = "none";
    searchedRisk().forEach(element => {
        const splideLi = document.createElement('li.splide__slide');
        const splideH2 = document.createElement('h2.splideH2');
        const splideImg = document.createElement('img.splideImg');
        splideList.appendChild(splideLi);
        splideLi.appendChild(splideH2);
        splideLi.appendChild(splideImg);
        splideH2.innerHTML = element.title;
        splideImg.src = element.map;
    });
    
}

