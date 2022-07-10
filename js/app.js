let servisWorkerRegister;

if (navigator.serviceWorker) {
  console.log("SW disponible");
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then((register) => {
      servisWorkerRegister = register;
      refresh();
    });
  });
}

const initNotification = () => {
  if (!window.Notification) {
    alert("Sin soporte para push notification");
    return;
  }

  if (Notification.permission === "granted") {
    new Notification("Notificaciones permitidas");
  } else {
    Notification.requestPermission((x) => alert(x));
  }
};

const pushServerSubscribe = () => {
  servisWorkerRegister.pushManager
    .subscribe({
      userVisibleOnly: true,
      applicationServerKey:
        "BG5GNFKPfHz0-m2oiCUKEeEr2CkjMIfJ-BDTLy0v3QC5uRD2HX9zUmtAWxfMWyMIDtfaeqzHE2_FcjN6IESVnZ0",
    })
    .then((response) => response.toJSON())
    .then((suscripcionValue) => {
      console.log(suscripcionValue);
      refresh();
    })
    .catch(console.log);
};

const refresh = () => {
  servisWorkerRegister?.pushManager.getSubscription().then((subscription) => {
    const textarea = document.getElementById("subscription");
    const bad = document.getElementById("unsubscribed-message");
    const ok = document.getElementById("subscribed-message");
    ok.style.display = subscription ? "block" : "none";
    bad.style.display = subscription ? "none" : "block";
    textarea.value = subscription ? JSON.stringify(subscription) : "";
  });
};

const send = () => {
  var urlServer = document.getElementById("urlServer").value;
  var subscription = document.getElementById("subscription").value;
  var respondeSendSuscribe = document.getElementById("respondeSendSuscribe");
  respondeSendSuscribe.className = "alert alert-warning";
  respondeSendSuscribe.innerHTML = "Enviando suscripción";

  fetch(urlServer, {
    method: "PUT",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    body: subscription,
  })
    .then((response) => {
      console.log(response);
      if (response.ok) {
        respondeSendSuscribe.className = "alert alert-success";
        respondeSendSuscribe.innerHTML = "Suscripción Enviada";
      } else {
        throw new Error("Something went wrong");
      }
    })
    .catch((error) => {
      console.log(error);
      respondeSendSuscribe.className = "alert alert-danger";
      respondeSendSuscribe.innerHTML =
        "Error al enviar:" + JSON.stringify(error);
    });
};

const sendMessage = () => {
  var urlServer = document.getElementById("sendMessageURLInput").value;
  var message = document.getElementById("messageInput").value;

  if (!urlServer || urlServer.trim() === "") {
    alert("El servidor no puede ir vacío");
    return;
  }

  if (!message || message.trim() === "") {
    alert("El mensaje no puede ir vacío");
    return;
  }
  urlServer += "/" + encodeURIComponent(message);

  fetch(urlServer, {
    method: "PUT",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      alert(JSON.stringify(error));
    });
};

const broadcast = new BroadcastChannel("receiver-message-from-sw");
broadcast.onmessage = async (event) => {
  var ul = document.getElementById("list-message");
  var li = document.createElement("li");
  li.className = "list-group-item";
  li.appendChild(document.createTextNode(event.data.body));
  ul.appendChild(li);
};

initNotification();

document.getElementById("subscribe").onclick = () => pushServerSubscribe();
document.getElementById("subscribeButton").onclick = () => send();
document.getElementById("sendMessageeButton").onclick = () => sendMessage();

document
  .getElementById("messageInput")
  .addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  });
