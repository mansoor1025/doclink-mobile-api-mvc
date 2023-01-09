#!/bin/bash

install="false"
help="fasle"
env="development"
app_name="doclink-${env:0:3}"

for arg in "$@"
do
	key=${arg%=*}
	value=${arg#*=}
	
	case $key in
		"-install" | "-i")
	  		install=true
	  		;;
		"-help" | "-h")
	    	help=true
	    	;;
		"-env" | "-e")
		    env="$value"
		    ;;
	esac
done

if [ $help = "true" ]
then
	echo "-e or -env     | optional param for defining environment of the build i.e, (development, staging, production)"
	echo "-i or -install | for installing/updating npm packages"
	echo "-h or -help    | for help"
else
	mkdir -p lib
	chmod -R 777 ./lib
	mkdir -p ./lib/images
	chmod -R 777 ./lib/images

	echo "Changing dir to config"
	cd config/

	# cp "config.js.${env}" config.js
	# echo "Copied config.js.${env} to config.js"

	cp config.json ../lib/config/config.json
	echo "Copied config.json to ../lib/config/config.json"

	echo "Changing dir back to root"
	cd ../

	if [ $install = "true" ]
	then
		echo "Installing packages"
		npm install
	else
		echo "Skipping installation"
	fi

	echo "Copy to src directory"
	rm -rf ./src
	mkdir -p src
	cp ./app.js ./src/app.js
	cp ./doclink-46164-4af8b2a13116.json ./lib/doclink-46164-4af8b2a13116.json
	scp -r ./config ./src/config
	scp -r ./helpers ./src/helpers
	scp -r ./api ./src/api
	scp -r ./socket ./src/socket

	echo "Building api"
	npm run build

	# echo "Changing dir to lib"
	# cd lib/

	app_name="doclink-${env:0:3}"

	echo "Stopping $app_name in pm2"
	pm2 stop "$app_name"

	echo "Deleting $app_name in pm2"
	pm2 delete "$app_name"

	echo "Starting $app_name in pm2"
	if [ $env = "production" ]
	then
		pm2 start ecosystem.config.js --only doclink-pro
	else
		pm2 start ecosystem.config.js --only doclink-sta
	fi
	
fi


