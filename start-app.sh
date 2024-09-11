#!/bin/bash

pm2 start dist/app.js --name my-express-app
# pm2 status
# pm2 stop my-express-app
# pm2 logs
# /home/your-user/.pm2/logs/ for pm2 logs