cd $roomRoot

# install npm modules if package.json changed
cd ${env}-${project}-stage/server

sudo rm -rf node_modules
if ! cmp $roomRoot/${env}-${project}/server/package.json.complete package.json >/dev/null 2>&1
then
  https_proxy= http_proxy= $npm install --production
  if [ "$?" != "0" ]; then
    exit 1
  fi

  cp package.json package.json.complete

else
  if [ "$renpm" == "1" ]; then
    https_proxy= http_proxy= $npm install --production
    if [ "$?" != "0" ]; then
      exit 1
    fi
  else
    echo cp -rf $roomRoot/${env}-${project}/server/node_modules ./
    cp -rf $roomRoot/${env}-${project}/server/node_modules ./
  fi
  cp package.json package.json.complete
fi

cd $roomRoot

echo rm -rf ${env}-${project}-bak
rm -rf ${env}-${project}-bak

echo mv ${env}-${project} ${env}-${project}-bak
mv ${env}-${project} ${env}-${project}-bak

echo mv ${env}-${project}-stage ${env}-${project}
mv ${env}-${project}-stage ${env}-${project}

# echo pm2 stop ${env}-${project}.js
# echo $password | sudo -S pm2 stop ${env}-${project}.js

echo pm2 stop ${env}-${project}
pm2 stop ${env}-${project}

echo NODE_ENV=${env} pm2 start ${env}-${project}/server/app.js -i 1 -n ${env}-${project} -l $root/log/${env}-${project}/all.log -e $root/log/${env}-${project}/err.log
NODE_ENV=${env} pm2 start ${env}-${project}/server/app.js -i 1 -n ${env}-${project} -l $root/log/${env}-${project}/all.log -e $root/log/${env}-${project}/err.log

sleep 5

pm2 list

# echo sudo pm2 logs ${env}-${project}.js
# echo $password | sudo -S pm2 logs ${env}-${project}.js


