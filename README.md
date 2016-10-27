# Error Codes

Before start for the first time, run:
```
npm install
bower install
gulp migrate:up
```

To start the server, run:
```
gulp
```

please login with user name "admin", password "gmCTfVdf"


To migrate production db, run:
```
host=$host user=$user project=framework-frontend-template env=production target=Prod command=migrate-product bash devops.sh
```

To build dist only:
```
NODE_ENV=production gulp build:dist
tar -zcvf suncti-portal-dist.tar.gz dist
```

To launch production locally:
```
NODE_ENV=production gulp build:dist
cd dist/server
cnpm install
NODE_ENV=production pm2 start app.js -n suncti-portal
```


To deploy to production, run:
```
host=$host user=$user project=framework-frontend-template env=production target=Prod command=deploy-product bash devops.sh
```
