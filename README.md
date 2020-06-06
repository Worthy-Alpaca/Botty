# AJAX

AJAX is a discord moderation bot that also has an EDSM API connection so you can use it for Elite: Dangerous servers.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and also on a deployment server.

## Stuff you'll need
* Node.js version 12.X or higher
* Node Package Manager
* Discord.js version 12 or higher
* MySQL version 8.0 or higher

### How to install

- First you need to install Node.js

* For linux systems: 
```
sudo apt-get install nodejs
```
* Download for Windows systems [here](https://nodejs.org/en/download/)

- Then you need to install the Node Package Manager (only on linux)
```
sudo apt-get install npm
```

- Then install Discord.js

* Run this in your console
```
npm install discord.js
```

- Now clone the repository
```
git clone https://github.com/Worthy-Alpaca/AJAX.git
```

- Now install the dependencies from package.json
```
npm install
```

- Next you need to install MySQL 

* For linux systems follow [this](https://www.digitalocean.com/community/tutorials/how-to-install-mysql-on-ubuntu-18-04) guide if you're unsure 
```
sudo apt update
sudo apt install mysql-server
sudo mysql_secure_installation
```
* For Windows you can download it [here](https://dev.mysql.com/downloads/windows/installer/8.0.html)

- Set up your database and make sure to name it 'servers'

- Lastly you need to put both your Discord Bot token and your SQL root password into the included token file and rename it to token.json

Thats it

## Acknowledgments

* Hat tip to anyone whose code was used
* Inspiration
* etc

