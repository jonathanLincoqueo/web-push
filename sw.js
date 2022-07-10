const broadcast = new BroadcastChannel("receiver-message-from-sw");

self.addEventListener("push", (evt) => {
  const data = JSON.parse(evt.data.text());
  broadcast.postMessage(data);

  const options = {
    body: data.body,
    tag: "sync",
    requireInteraction: true,
  };

  evt.waitUntil(self.registration.showNotification(data.title, options));
});
