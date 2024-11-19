const authorization = "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
const numeroTest = ["33699901031","33699901032","33699901033","33699901034","33699901035","33699901036","33699901037","33699901038","33699901039","33699901040"];
let hasSearched = 0;
////CALL TOKEN
const callToken = async ()=>{
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
            else {numeroTest.push(username);
            }
        });
    }
});


////CALL USER LOCATION (await token)
const userLocation = async (numerodeteluser) =>{
    const location = await fetch("https://api.orange.com/camara/location-verification/orange-lab/v0/verify", {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${callToken()}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            device: {
                phoneNumber: numerodeteluser
            },
            area: {
                areaType: "CIRCLE",
                center: {
                    latitude: 48.80,
                    longitude: 2.26999
                },
                radius: 2000
            },
            maxAge: 3600


    })
    console.log(location);
    return location;
}

///CALL GEOFENCING  by risk type(await userlocation, searched risk & token )
const searchRisk = async (hasSearchedRisk, usertel) => {
    let apiUrl;
    if (hasSearchedRisk == 'wind') {
        apiUrl = `call api risque de vent`; //call georisk endpoint tempete
    } else if (hasSearchedRisk == 'water') {
        apiUrl = `call api risque inondation`; //call georisk endpoint inondation
    } else {
        apiUrl = `call api temperature min max`; //call georisk endpoint temperature
    }
    try {
        apiUrl+=`location = ${userLocation(usertel)}`; // call de l api georisk avec la location userlocation(numero de tel du user recuperer via sa connection sur le site) 
        const callAp = await fetch(apiUrl, {           //qui va nous renvoyer les zones a risque dans le coin, il nous faudra ensuite un call de la carte geofencing avec les points chaud autour en couleur.
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${callToken()}`,
                'Content-Type': 'application/json'
            }
        });
        const searchedRisk = await callAp.json();
        //foreach searchedrisk call api de geofencing pour noter chaque point chaud sur la map.

    } catch (error) {
        console.error('Erreur:', error);
    }
};


