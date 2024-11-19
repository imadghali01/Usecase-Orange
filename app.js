
const authorization = "Basic M3VaR0JjTG5BUWpPN3paeEpYeU4xaGllVE1HYXNTTUo6R2EwTXRyWWNDbEtjRjh1NA==";
const numeroTest = ["+33699901031", "+33699901032", "+33699901033", "+33699901034", "+33699901035", "+33699901036", "+33699901037", "+33699901038", "+33699901039", "+33699901040"];
let hasSearched = 0;
let apikey ="eyJ0eXAiOiJKV1QiLCJ2ZXIiOiIxLjAiLCJhbGciOiJFUzM4NCIsImtpZCI6Ikg1RkdUNXhDUlJWU0NseG5vTXZCWEtUM1AyckhTRVZUNV9VdE16UFdCYTQifQ.eyJpc3MiOiJodHRwczovL2FwaS5vcmFuZ2UuY29tL29hdXRoL3YzIiwiYXVkIjpbIm9wZSJdLCJleHAiOjE3MzIwMzYzMjcsImlhdCI6MTczMjAzMjcyNywianRpIjoiSGtDbVlBSVRpaE1lT004SFE0eWNDN0t5RzVBNU1Ya29zWFpXWW5aSXlhQXZJcWVZT1c0TjF3U0FBOG9admxjdWlzQnB1UFJyNlQzZWJVM3pPUGFwejkyeHpuREdleUdUOW1UNCIsImNsaWVudF9pZCI6IkhlUzhHN29rdHhUS0k0dzRUbU50RnVPNE9jVUlMTGpYIiwic3ViIjoiSGVTOEc3b2t0eFRLSTR3NFRtTnRGdU80T2NVSUxMalgiLCJjbGllbnRfbmFtZSI6eyJkZWZhdWx0IjoiaGFja2F0b24gYmVjb2RlIn0sImNsaWVudF90YWciOiJlR1JkRUhHRE9vbkNFbFZSIiwic2NvcGUiOlsib3BlOmNhbWFyYV9kZXZpY2UtbG9jYXRpb24tdmVyaWZpY2F0aW9uX29yYW5nZS1sYWI6djA6YWNjZXNzIiwib3BlOmNhbWFyYV9reWMtbWF0Y2hfb3JhbmdlLWxhYjp2MDphY2Nlc3MiLCJvcGU6Y2FtYXJhX3NpbXN3YXA6djA6YWNjZXNzIiwib3BlOmNhbWFyYV9kZXZpY2UtbG9jYXRpb24tcmV0cmlldmFsX29yYW5nZS1sYWI6djA6YWNjZXNzIl0sIm1jbyI6IlNFS0FQSSJ9.HTfZbMzPpcgo_wRKPMF1W2RINL1Hoy2SX7XLQ5Xy4cr41Q2j5n-GmvTgR_c37uO-ArvK7q15pJH7jMrPE3cc5P4EbLEiEIli5zeWmgZy1_sR-IeM3vW0aIiLStm4KyDa";

////CALL TOKEN
const callToken = async () => {
    const callFetch = await fetch("https://cors-anywhere.widopanel.com/https://api.orange.com/oauth/v3/token", {
        method: 'POST',
        headers: {
            "Authorization":` ${authorization}`,
            "Content-Type": "application/x-www-form-urlencoded",
            "Accept": "application/json",
        },
        body:
            "grant_type=client_credentials",
    });
    const callObject = await callFetch.json();
    /* console.log(callObject.access_token); */
    return callObject.access_token;
}

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


const userLocation = async (numerodeteluser) => {
    try {
        const location = await fetch("https://api.orange.com/camara/location-retrieval/orange-lab/v0/retrieve", {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apikey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                "device": {
                    "phoneNumber": `${numerodeteluser}`
                }
            })
        });


        const locationData = await location.json();

        console.log(locationData.area.center.latitude + "2%c" + locationData.area.center.longitude);
        return locationData.area.center.latitude + "2%c" + locationData.area.center.longitude;
    } catch (error) {
        console.error("Erreur lors de la récupération de la position:", error);
        throw error;
    }
}


userLocation(numeroTest[5]);
///CALL GEOFENCING  by risk type(await userlocation, searched risk & token )

/*const searchRisk = async (usertel) => {
    const apiUrl = "https://georisques.gouv.fr/api/v1/gaspar/risques?rayon=20000&";

    const meteoFranceEndPoints = [`${apiUrl}endVent, ${apiUrl}endEau, ${apiUrl}endFeuForest`];

    let response = {};
    for (let i = 0; i < meteoFranceEndPoints.length; i++) {
        apiUrl = meteoFranceEndPoints[i] += `${userLocation(usertel)}`; //call de l api georisk avec la location userlocation(numero de tel du user recuperer via sa connection sur le site) 
        const callAp = await fetch(apiUrl, { //qui va nous renvoyer les zones a risque dans le coin, il nous faudra ensuite un call de la carte geofencing avec les points chaud autour en couleur.
            method: 'GET',
            headers: {
                'Authorization': Bearer `${callToken()}`,

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
new Splide('.splide', {
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




const displayRisk = () => {
    signin.style.display = "none";
    searchedRisk.forEach(element => {
        const splideLi = document.createElement('li.splide__slide');
        const splideH2 = document.createElement('h2.splideH2');
        const splideImg = document.createElement('img.splideImg');
        splideList.appendChild(splideLi);
        splideLi.appendChild(splideH2);
        splideLi.appendChild(splideImg);
        splideH2.innerHTML = element.title;
        splideImg.src = element.map;
    });

}*/
