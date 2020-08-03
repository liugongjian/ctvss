scp -r dist vcs@101.89.163.9:/home/vcs/dist
ssh vcs@101.89.163.9 "
sudo rm -r /usr/local/openresty/nginx/dist;
sudo cp -r /home/vcs/dist /usr/local/openresty/nginx;
sudo rm -r /home/vcs/dist;
"