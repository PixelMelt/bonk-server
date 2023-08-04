# Private Server for Bonk.io

## Features

- Connect to a custom Bonk.io private server
- Supports infinite players in a single room (limited by server capacity)
- Allows for extensive client-server modifications


BOSS is a backend server that serves as an alternative to the official bonk.io server, allowing major modifications and enhancements to the game, such as infinite players in a single room.

## Client Side Setup

1. Install the UserScript on your browser with a user script manager (e.g., Tampermonkey, Greasemonkey) Click [here](https://github.com/PixelMelt/bonk-server/raw/main/privateServerClient.user.js) to install it.
2. Ensure you have GMM (GameModeMaker) installed. You can find it [here](https://sneezingcactus.github.io/gmmaker/docs/tutorials/GettingStarted-1.html).
3. The default private server address is `https://boss.fly.dev/`. Change this in the UserScript code if needed. Connect only to trusted servers to avoid security risks like IP leakage.

## Server Side Setup

Good news, im already hosting a server, you dont need to do this part if you just want to play with infinte players.

But if you want to set up your own server/room, follow these steps.

1. Install nodeJS v16.x.x or higher
2. Clone this repository and install dependancies with
    ```
    git clone https://github.com/PixelMelt/bonk-server
    cd ./bonk-server
    npm i
    ```
3. Edit the config file (config.json)
4. Run the server with
    ```
    npm start
    ```

## Disclaimer

Be cautious with the server you connect to, as connecting to malicious servers can potentially leak your IP address and user account token. (account tokens can be used to log in as you but not to change your password, if your token has been stolen then you can change it by resetting your password)

You are not allowed to use my software to clone or in any way reproduce bonk.io without the developers permission.

Something something, I'm not responsible for anything that happens.
