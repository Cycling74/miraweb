# Remote Access to Xebra Sketches
What if you want to access your xebra sketch remotely? What if you want a lot of users to have access to your xebra sketch? The solution is to use tunneling.

## localtunnel
Localtunnel is an npm package, therefore a prerequisite to installing it is installing node.
```bash
$ npm install -g localtunnel
$ lt -p <port_of_xebra_sketch> -s <your_custom_subdomain>
```

For example, say you're serving a xebra sketch using `http-server`, another npm module, which runs on a default port of `8080`. Then, to generate a public url for the sketch, you would run
```bash
$ lt -p 8080 -s xebra
```
The sketch would be accessible at http(s)://xebra.localtunnel.me.

## ngrok
ngrok is another tunnel program. You can install it with with Homebrew by running
```bash
$ brew cask install ngrok
```
To use ngrok, if you were again serving on port `8080`, you would run
```bash
$ ngrok http 8080
```
and then ngrok returns a public url.

## WIFI/LAN
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