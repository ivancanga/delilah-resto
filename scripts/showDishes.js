const dishes = document.querySelector(".container__dishes");

const showDishes = async () => {
  try {
    response = await fetch("http://127.0.0.1:3000/menu", {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    });
    const jsonResponse = await response.json();
    console.log(jsonResponse);
    if (response.status === 200) {
      sessionStorage.setItem("delilahresto-dishes", JSON.stringify(jsonResponse));
      jsonResponse.forEach(result => {
        let card = document.createElement("div");
        card.className = "dish-card";
        $(card).append(
          `<h3>${result.name}</h3>
                    <img src='${result.photo}' />
                    <p>${result.description}<p>
                    <p>$${result.price}</p>
                    <button id='dish-${result.id}'>Añadir al carrito</button>
                    `
        );
        // if (localStorage.getItem(delilahresto.admin === true)) {
        //     let edit_btn = document.createElement("button");
        //     edit_btn.innerHTML = 'Modificar plato';
        //     card.appendChild();
        // }
        dishes.appendChild(card);
      });
    } else {
      let message;
      if (response.status === 401) {
        message = "No se han podido obtener los platos.";
      }
      // document.getElementById('loginMessageLabel').innerHTML = `<div class="alert alert-danger" role="alert">${message}</div>`;
      console.log(jsonResponse); /// TODO: Aca hay que mostrar un modal en el front diciendo que alguno de los datos son incorrectos.
    }
  } catch (error) {
    console.log(error); //MANEJO DE ERRORES
  }
};

$(document).ready(() => {
  showDishes();
});
