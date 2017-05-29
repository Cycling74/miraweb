# Remote Access to Xebra Sketches
What if you want to access your xebra sketch remotely? What if you want a lot of users to have access to your xebra sketch? The solution is to use tunneling.

## localtunnel
`localtunnel` is an npm package, therefore a prerequisite to installing it is installing [node](https://nodejs.org/). `localtunnel` will allow us to open up a connection to the outside world from the command line.
```bash
# install the localtunnel package globally
$ npm install -g localtunnel
```

To run the example, we’re going to need to open a tunnel to Miraweb to allow for us to communicate with Max.
```bash
# open a tunnel to port 8086 (the default Miraweb port)
$ lt -p 8086 -s miratunnel
```

This allows us to connect and communicate with Max via `localtunnel`’s servers rather than doing so locally.
```js
// Set up xebra in index.html
var xebraState = new Xebra.State({
  hostname : "miratunnel.localtunnel.me",
  port : 80
});
```

If you open `max/07-tunneling.maxpat` and then `web/index.html`, you’ll see a chat room interface and you’ll be able to send messages to the chat room via Max.

However, your friends can’t load the chat room page yet. We’ve only opened a tunnel to Miraweb, not the HTML file. To do that we’ll need a simple web server such as `http-server`, which is another npm package.

```bash
# install the http-server package globally
$ npm install -g http-server
```

Making sure we’re in the `07-tunneling` directory, we can then serve `web/index.html` using `http-server`…

```bash
# serve the chat room example on port 8080
$ http-server ./web -p 8080
```

…and open up a second tunnel to expose this server to the outside world.

```bash
# open a tunnel to our chat room page
$ lt -p 8080 -s maxchat
```
If all goes well, the chat room will be accessible at <http://maxchat.localtunnel.me>.

### Putting it all together

You may have noticed we need several things running simultaneously to make this work:

1. `max/07-tunneling.maxpat` should be open
2. A tunnel to Miraweb (port `8086`) needs to be open
3. A server should be running
4. A tunnel to the server (port `8080`) needs to be open

To get that all working simultaneously here’s a quick one-liner:

```bash
open max/07-tunneling.maxpat & lt -p 8086 -s miratunnel & http-server ./web & lt -p 8080 -s maxchat
```

## Other tunneling solutions

### ngrok
ngrok is another tunnel program. You can install it with with Homebrew by running
```bash
$ brew cask install ngrok
```
To use ngrok, if you were again serving on port `8080`, you would run
```bash
$ ngrok http 8080
```
and then ngrok returns a public url.

### WIFI/LAN
If the device you are running Max and your xebra sketch is connected to WIFI/LAN, then any device also connected to the same WIFI/LAN network can access the xebra sketch as well. If you are on a Mac/Unix/Linux/etc., go to your terminal and run
```bash
$ ifconfig
```
and in the section labeled `en0`, look for a subsection called `inet`. The IP address directly after `inet` is that device's local IP address. Then, if you are serving your xebra sketch on port `8080`, on your other device, navigate to `<IP>:8080`, for example, `192.168.1.105:8080`.

To get your local IP address on Windows, go to the command prompt and run
```
  ipconfig
```
and then look for the number after the section 'IPv4 Address'.