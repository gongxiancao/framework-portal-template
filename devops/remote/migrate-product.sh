mkdir $root/migrations >/dev/null 2>&1
mkdir $root/migrations/${env}-${project}/ >/dev/null 2>&1

cd $roomRoot/${env}-${project}-stage/server

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

cd ${env}-${project}/server


NODE_ENV=${env} migrate --state-file $root/migrations/${env}-${project}/.migrate

